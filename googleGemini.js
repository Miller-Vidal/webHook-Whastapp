import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY_GEMINI);

export async function getGoogleGenerativeAICompletion(history, model = "gemini-pro") {
    // Obtener el modelo generativo
    const generativeModel = genAI.getGenerativeModel({ model: model });

    // Iniciar el chat con el historial de mensajes
    const chat = generativeModel.startChat({
        history: history,
        generationConfig: {
            maxOutputTokens: 100,
        },
    });

    // Obtener el mensaje a enviar (el último en el historial de mensajes)
    const lastMessage = history[history.length - 1].parts[0].text;

    // Enviar el mensaje y obtener la respuesta
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = await response.text();

    return text;
}
