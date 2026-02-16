import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "../utils/supabase";
import { openai } from "../utils/openai";

const router = express.Router();

// Rota para Busca RAG
router.post("/search", async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: "Query de busca é obrigatória" });
        }

        // 1. Gerar Embedding da Query usando OpenAI
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: query,
        });

        const embedding = embeddingResponse.data[0].embedding;

        // 2. Buscar no Supabase usando RPC (match_documents)
        // Assumindo que você já tem uma função RPC chamada 'match_documents' ou similar.
        // Se não tiver, precisaremos criar. Vou assumir 'match_processed_records' baseada na sua tabela 'processed_records'.
        if (!supabase) {
            return res.status(500).json({ error: "Supabase credentials not configured in server" });
        }

        const { data: documents, error } = await supabase.rpc("match_processed_records", {
            query_embedding: embedding,
            match_threshold: 0.7, // Ajuste conforme necessário
            match_count: 5,
        });

        if (error) {
            // Fallback: Tentar buscar em 'audio_transcriptions' se a primeira falhar ou retornar vazio?
            // Por enquanto, vamos retornar o erro ou tentar a outra tabela.
            console.error("Erro na busca de documentos:", error);
            const { data: audioDocs, error: audioError } = await supabase.rpc("match_audio_transcriptions", {
                query_embedding: embedding,
                match_threshold: 0.7,
                match_count: 5,
            });

            if (audioError) {
                return res.status(500).json({ error: "Erro ao buscar documentos e áudios", details: audioError });
            }
            return res.json({ results: audioDocs, source: "audio" });
        }

        // Se achou documentos, retorna. Se não, tenta áudio.
        if (!documents || documents.length === 0) {
            const { data: audioDocs, error: audioError } = await supabase.rpc("match_audio_transcriptions", {
                query_embedding: embedding,
                match_threshold: 0.7,
                match_count: 5,
            });

            if (audioError) {
                return res.json({ results: [], message: "Nenhum documento encontrado." });
            }
            return res.json({ results: audioDocs, source: "audio" });
        }

        res.json({ results: documents, source: "documents" });

    } catch (error: any) {
        console.error("Erro interno:", error);
        res.status(500).json({ error: "Erro interno do servidor", details: error.message });
    }
});

export default router;
