-- Remove functions if they already exist
drop function if exists match_processed_records;
drop function if exists match_audio_transcriptions;

-- Função para buscar documentos similares em 'processed_records'
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

-- Função para buscar áudios similares em 'audio_transcriptions'
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
