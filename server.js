import express from "express";
import axios from "axios";
import fetch, { Headers, Request, Response } from "node-fetch";
import { testConnection } from './db.js';
import { getPreviousConversations, saveConversation } from './queries.js';
import { getOpenAICompletion } from './openIA.js';
import { getGoogleGenerativeAICompletion } from './googleGemini.js';

// Configura fetch y objetos relacionados globalmente
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}

const app = express();
app.use(express.json());

const {
  WEBHOOK_VERIFY_TOKEN,
  GRAPH_API_TOKEN,
  PORT,
} = process.env;

// Función para consultar IA (OpenAI o Google Gemini)
const queryAI = async (phone, promptText, aiType = 'openai') => {
  const previousConversations = await getPreviousConversations(phone, aiType);

  // Añadir el mensaje actual del usuario
  if (aiType === 'gemini') {
    previousConversations.push({ role: "user", parts: [{ text: promptText }] });
  } else {
    previousConversations.push({ role: "user", content: promptText });
  }

  let feedback;
  if (aiType === 'gemini') {
    feedback = await getGoogleGenerativeAICompletion(previousConversations, 'gemini-pro');
  } else {
    feedback = await getOpenAICompletion(previousConversations, 'gpt-4o');
  }

  await saveConversation(phone, promptText, feedback, aiType);
  return feedback;
};

// Endpoint para recibir webhooks de WhatsApp
app.post("/webhook", async (req, res) => {
  console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

  const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];

  if (message?.type === "text") {
    const business_phone_number_id = req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;
    const messageText = message.text.body;
    const phoneNumber = message.from;

    try {
      // Cambia 'gemini' a 'openai' según el tipo de IA que quieras usar
      const aiResponse = await queryAI(phoneNumber, messageText, 'openai');
      console.log("Respuesta de la IA:", aiResponse);

      // Enviar la respuesta de la IA al usuario de WhatsApp
      await axios.post(
        `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
        {
          messaging_product: "whatsapp",
          to: message.from,
          text: { body: aiResponse },
          context: {
            message_id: message.id,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          },
        }
      );

      res.sendStatus(200);
    } catch (error) {
      console.error("Error processing message:", error);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(200); // Si el mensaje no es de texto, simplemente responde OK
  }
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    console.log("Webhook verificado con éxito!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.get("/", (req, res) => {
  res.send(`<pre>Nada que ver aquí. Consulta el README.md para empezar.</pre>`);
});

testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
  });
});
