-- ==============================================================================
-- SCRIPT FINAL DE CORREÇÃO DE PERMISSÕES (SECURITY DEFINER)
-- ==============================================================================
-- Este script atualiza TODAS as 3 funções de busca para garantir que a API
-- consiga ler os dados, independente das regras de RLS (Row Level Security).
--
-- Tabelas afetadas:
-- 1. processed_records (PDFs, Imagens, Currículos)
-- 2. audio_transcriptions (Áudios do WhatsApp/N8N)
-- 3. text_extractions (E-mails, Textos copiados)

-- ------------------------------------------------------------------------------
-- 1. Busca em Documentos Processados (processed_records)
-- ------------------------------------------------------------------------------
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
security definer -- <--- O "CRACHÁ VIP" DE LEITURA
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

-- ------------------------------------------------------------------------------
-- 2. Busca em Transcrições de Áudio (audio_transcriptions)
-- ------------------------------------------------------------------------------
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
security definer -- <--- O "CRACHÁ VIP" DE LEITURA
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

-- ------------------------------------------------------------------------------
-- 3. Busca em Extrações de Texto (text_extractions)
-- ------------------------------------------------------------------------------
create or replace function match_text_extractions (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  source text,
  content text,
  summary text,
  similarity float
)
language plpgsql
security definer -- <--- O "CRACHÁ VIP" DE LEITURA
as $$
begin
  return query
  select
    text_extractions.id,
    text_extractions.source,
    text_extractions.raw_text as content,
    text_extractions.summary,
    1 - (text_extractions.embedding <=> query_embedding) as similarity
  from
    text_extractions
  where
    1 - (text_extractions.embedding <=> query_embedding) > match_threshold
  order by
    text_extractions.embedding <=> query_embedding
  limit match_count;
end;
$$;
