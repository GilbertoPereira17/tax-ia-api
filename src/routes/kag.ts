import express from "express";
import { openai } from "../utils/openai";

const router = express.Router();

// Rota para Classificação KAG
router.post("/classify", async (req, res) => {
    try {
        const { text, file_name } = req.body;

        if (!text && !file_name) {
            return res.status(400).json({ error: "Texto ou nome do arquivo é obrigatório" });
        }

        const contentToClassify = text || `Nome do arquivo: ${file_name}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Modelo rápido e barato
            messages: [
                {
                    role: "system",
                    content: `Você é um assistente de classificação fiscal. Classifique o input nas seguintes categorias: 
          - Invoice
          - Receipt
          - W-2
          - 1099
          - Bank Statement
          - Contract
          - Other
          
          Responda APENAS com a categoria.`
                },
                {
                    role: "user",
                    content: contentToClassify
                }
            ],
            temperature: 0,
        });

        const category = completion.choices[0].message.content?.trim();

        res.json({ category, confidence: "high" }); // GPT não retorna score de confiança nativo fácil, assumimos high para esse prompt simples.

    } catch (error: any) {
        console.error("Erro na classificação:", error);
        res.status(500).json({ error: "Erro interno do servidor", details: error.message });
    }
});

export default router;
