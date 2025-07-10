import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "finaura",
    name: "Finaura",
    retryFunction: async (event) => ({
        delay: Math.pow(2, event) * 1000,
        maxAttempts: 2,
    })
});
