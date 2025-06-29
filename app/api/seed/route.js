import { seedTransactions } from "@/actions/seed";

export async function GET(req, res) {
    try {
        const result = await seedTransactions();
        return Response.json({ success: true, data: result })
    } catch (error) {
        return Response.json({ success: false, error: error.message })
    }
}