import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.warn("⚠️  Aviso: OPENAI_API_KEY não definido no arquivo .env");
}

export const openai = new OpenAI({
    apiKey: apiKey,
});
