-- Função de DEBUG para ver a similaridade real (sem filtro)
create or replace function match_text_debug (
  query_embedding vector(1536),
  match_count int
)
returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
 as $$
begin
  return query
  select
    text_extractions.id,
    text_extractions.raw_text as content,
    1 - (text_extractions.embedding <=> query_embedding) as similarity
  from
    text_extractions
  order by
    text_extractions.embedding <=> query_embedding
  limit match_count;
end;
$$;
