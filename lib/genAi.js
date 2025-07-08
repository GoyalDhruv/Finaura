const { GoogleGenerativeAI } = require("@google/generative-ai");

export const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY)