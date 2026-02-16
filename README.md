# TaxIA API (Part 4)

Esta API Node.js fornece os endpoints de Inteligência (RAG e KAG) exigidos no teste.

## Instalação

1.  Certifique-se de estar na pasta `api`:
    ```bash
    cd api
    ```
2.  Instale as dependências (se ainda não fez):
    ```bash
    npm install
    ```

## Configuração (IMPORTANTE)

1.  Renomeie o arquivo `.env.example` para `.env`:
    ```bash
    cp .env.example .env
    # ou manualmente no Explorer
    ```
2.  **Edite o arquivo `.env`** e coloque suas chaves:
    *   `SUPABASE_URL`: A URL do seu projeto Supabase.
    *   `SUPABASE_SERVICE_ROLE_KEY`: A chave secreta (service_role) do Supabase (NÃO a anon key).
    *   `OPENAI_API_KEY`: Sua chave da OpenAI.

## Banco de Dados (Supabase)

Antes de rodar, você precisa criar as funções de busca no Supabase.
1.  Copie o conteúdo do arquivo `create_rpc_functions.sql`.
2.  Vá no **SQL Editor** do Supabase.
3.  Cole e execute.

## Rodando a API

Para iniciar o servidor:

```bash
npm run dev
```

A API rodará em `http://localhost:3000`.

## Endpoints

*   **POST /rag/search**: Busca documentos similares.
    *   Body: `{ "query": "gastos com viagens" }`
*   **POST /kag/classify**: Classifica documentos.
    *   Body: `{ "text": "conteúdo do doc..." }`
