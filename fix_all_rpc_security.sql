-- ====================================================
-- SCRIPT DE CORREÇÃO DE SEGURANÇA (SECURITY DEFINER)
-- ====================================================
-- Este script garante que a API consegue ler TODAS as tabelas
-- (processed_records, audio_transcriptions, text_extractions)
-- mesmo que o RLS esteja ativado.

-- 1. Busca em Documentos Processados (PDFs antigos)
create or replace function match_processed_records (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  document_type text,
  summary text,
  similarity float
)
language plpgsql
security definer -- <--- PERMISSÃO MÁXIMA
as $$
begin
  return query
  select
    processed_records.id,
    processed_records.document_type,
    processed_records.summary,
    1 - (processed_records.embedding <=> query_embedding) as similarity
  from
    processed_records
  where
    1 - (processed_records.embedding <=> query_embedding) > match_threshold
  order by
    processed_records.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 2. Busca em Transcrições de Áudio
create or replace function match_audio_transcriptions (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  filename text,
  transcription_text text,
  similarity float
)
language plpgsql
security definer -- <--- PERMISSÃO MÁXIMA
as $$
begin
  return query
  select
    audio_transcriptions.id,
    audio_transcriptions.filename,
    audio_transcriptions.transcription_text,
    1 - (audio_transcriptions.embedding <=> query_embedding) as similarity
  from
    audio_transcriptions
  where
    1 - (audio_transcriptions.embedding <=> query_embedding) > match_threshold
  order by
    audio_transcriptions.embedding <=> query_embedding
  limit match_count;
end;
$$;
