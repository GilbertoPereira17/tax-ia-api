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
        if (!supabase) {
            return res.status(500).json({ error: "Supabase credentials not configured in server" });
        }

        // Busca em Documentos Processados (PDFs/Imagens antigos)
        const { data: documents, error: docError } = await supabase.rpc("match_processed_records", {
            query_embedding: embedding,
            match_threshold: 0.4,
            match_count: 5,
        });

        // Busca em Transcrições de Áudio
        const { data: audioDocs, error: audioError } = await supabase.rpc("match_audio_transcriptions", {
            query_embedding: embedding,
            match_threshold: 0.4,
            match_count: 5,
        });

        // NOVA BUSCA: Busca em Extrações de Texto (Emails/Textos do WeWeb)
        const { data: textDocs, error: textError } = await supabase.rpc("match_text_extractions", {
            query_embedding: embedding,
            match_threshold: 0.4,
            match_count: 5,
        });

        // DEBUG: Busca sem threshold para ver quanto está dando a similaridade
        const { data: debugDocs } = await supabase.rpc("match_text_debug", {
            query_embedding: embedding,
            match_count: 3,
        });

        console.log("DEBUG BUSCA [VERSION_DEBUG_V2]:", {
            textDocsLength: textDocs?.length || 0,
            textError: textError,
            debugDocs: debugDocs,
            docDocsLength: documents?.length || 0,
            audioDocsLength: audioDocs?.length || 0
        });

        if (docError && audioError && textError) {
            console.error("Erro na busca TOTAL:", { docError, audioError, textError });
            return res.status(500).json({ error: "Erro ao buscar em todas as fontes." });
        }

        // Combinar resultados
        const allResults = [
            ...(documents || []).map((d: any) => ({ ...d, type: 'document' })), // Já tem document_type do banco
            ...(audioDocs || []).map((d: any) => ({
                ...d,
                type: 'audio',
                document_type: 'Audio Transcription', // Preenche document_type para áudios
                content: d.transcription_text // Normaliza content
            })),
            ...(textDocs || []).map((d: any) => ({
                ...d,
                type: 'text',
                document_type: d.source || 'Email/Text', // Usa 'source' como document_type
                content: d.content // Já vem como content ou raw_text (verificar SQL)
            }))
        ];

        // Se não achar nada
        if (allResults.length === 0) {
            return res.json({
                results: [],
                // message: "Nenhum documento encontrado com threshold 0.4", // REMOVIDO DUPLICADO
                message: "Nenhum documento encontrado com threshold 0.35",
                debug_similarities: debugDocs,
                debug_info: {
                    text_docs_count: textDocs?.length,
                    errors: {
                        docError: docError?.message,
                        audioError: audioError?.message,
                        textError: textError?.message // AQUI VAI APARECER O ERRO REAL
                    }
                }
            });
        }

        return res.json({ results: allResults, count: allResults.length });

    } catch (error: any) {
        console.error("Erro interno:", error);
        res.status(500).json({ error: "Erro interno do servidor", details: error.message });
    }
});

export default router;
