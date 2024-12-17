import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


export const geminiLLM = async(prompt,conversation) => {
    const model = genAI.getGenerativeModel({model: 'models/gemini-2.0-flash-exp'});
    const chat = model.startChat({
        history: conversation,
        generationConfig: {
            maxOutputTokens: 150
        }
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = await response.text();
    return text;
}

