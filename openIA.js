import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.API_KEY_GPT });

export async function getOpenAICompletion(messages, model) {
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: model,
    });
    return completion.choices[0].message.content;
}
