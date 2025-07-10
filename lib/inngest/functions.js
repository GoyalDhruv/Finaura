import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { calculateNextRecurringDate, generateFinancialInsights, getMonthyStats, isNewMonth, isTransactionDue } from "@/lib/helper";
import { sendEmail } from "@/actions/sendEmail";
import EmailTemplate from "@/emails/template";

export const checkBadgetAlert = inngest.createFunction(
  { name: "Check Badget Alerts" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-Budget", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true
                }
              }
            }
          }
        }
      })
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue;

      await step.run(`check-budget-${budget.id}`, async () => {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: "EXPENSE",
            date: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          },
          _sum: {
            amount: true
          }
        })

        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = budget.amount;
        const budgetUsed = (totalExpenses / budgetAmount) * 100;

        if (budgetUsed >= 80 && (!budget.lastAlertSend || isNewMonth(new Date(budget.lastAlertSend), new Date()))) {

          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert",
              data: {
                percentageUsed: budgetUsed,
                budgetAmount: parseInt(budgetAmount).toFixed(1),
                totalExpenses: parseInt(totalExpenses).toFixed(1),
                accountName: defaultAccount.name
              }
            })
          });

          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSend: new Date() }
          })
        }
      })
    }
  },
);

export const triggerRecurringTransactions = inngest.createFunction(
  {
    name: "Trigger Recurring Transactions",
    id: "trigger-recurring-transactions",
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null },
              { nextRecurringDate: { lte: new Date() } }
            ]
          }
        })
      }
    )

    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: {
          transactionId: transaction.id,
          userId: transaction.userId,
        },
      }));

      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length };
  }
);

export const processRecurringTransactions = inngest.createFunction(
  {
    // name: "Process Recurring Transactions",
    id: "process-recurring-transactions",
    // throttle: {
    //   limit: 10,
    //   period: '1m',
    //   key: 'event.data.userId'
    // }
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    const transactionId = event.data.transactionId;
    const userId = event.data.userId;

    if (!transactionId || !userId) return { error: "Invalid transaction id or user id" };

    await step.run('process-transaction', async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: transactionId,
          userId
        },
        include: {
          account: true
        }
      })

      if (!transaction || !isTransactionDue(transaction)) return;

      await db.$transaction(async (tx) => {

        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          }
        })

        const balanceChange = transaction.type === "EXPENSE" ? -transaction.amount : transaction.amount;
        await tx.account.update({
          where: {
            id: transaction.accountId
          },
          data: {
            balance: {
              increment: balanceChange
            }
          }
        })

        await tx.transaction.update({
          where: {
            id: transactionId
          },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(transaction.recurringInterval, new Date())
          }
        })
      })
    })
  }
)

export const generateMonthlyReports = inngest.createFunction(
  {
    name: "Generate Monthly Reports",
    id: "generate-monthly-reports",
  },
  { cron: "0 0 1 * *" },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({
        include: { accounts: true }
      })
    });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthyStats(user.id, lastMonth);
        const monthName = lastMonth.toLocaleString('default', { month: 'long' });
        const insights = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Your Finaura Report for ${monthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data: {
              stats,
              month: monthName,
              insights,
            }
          })
        });
      })
    }

    return { processed: users.length };
  }
)