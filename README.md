﻿# webHook-Whastapp


Sentencias

CREATE TABLE conversaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(255),
    ask TEXT,
    answer TEXT,
    type_ia VARCHAR (30)
);

Variables de entorno 
WEBHOOK_VERIFY_TOKEN=@apiprueba
GRAPH_API_TOKEN=
API_KEY_GPT=
URL_API_GPT=https://api.openai.com/v1/chat/completions
API_KEY_GEMINI=
DB_HOST=''
DB_USER =''
DB_PASSWORD=''
DB_NAME =''
CONTEXT_IA=
