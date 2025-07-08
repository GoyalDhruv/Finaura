'use server'

import { genAI } from "@/lib/genAi";

export async function scanReceipt(file) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const arrayBuffer = await file.arrayBuffer();
        const base64String = Buffer.from(arrayBuffer).toString('base64');

        const prompt = `
            Analyze this receipt image and extract the following information in JSON format:
            - Total amount (just the number)
            - Date (in ISO format)
            - Description or items purchased (brief summary)
            - Merchant/store name
            - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
            
            Only respond with valid JSON in this exact format:
            {
                "amount": number,
                "date": "ISO date string",
                "description": "string",
                "merchantName": "string",
                "category": "string"
            }

            If its not a recipt, return an empty object
        `;

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64String,
                    mimeType: file.type
                },
            },
            prompt
        ])

        const text = result.response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        try {
            const data = JSON.parse(cleanedText);
            return {
                amount: parseFloat(data.amount),
                date: data.date ? new Date(data.date) : new Date(),
                description: data.description,
                merchantName: data.merchantName,
                category: data.category
            }
        } catch (error) {
            console.error(error);
            throw new Error("Invalid respnose JSON format from generative model");
        }

    } catch (error) {
        console.error(error);
        throw new Error("Failed to scan receipt");
    }
}