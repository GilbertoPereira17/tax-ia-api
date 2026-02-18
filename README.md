# TaxIA API (Part 4)

This Node.js API provides the Intelligence endpoints (RAG and KAG) required for the technical assessment.

## Features

*   **RAG (Retrieval-Augmented Generation)**: Semantic search across multiple document types (PDFs, Audio, Emails) using `pgvector`.
*   **KAG (Knowledge-Augmented Generation)**: Fast text classification using AI models.
*   **Authentication**: Secured endpoints.

## Installation

1.  Clone this repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

1.  Rename `.env.example` to `.env`.
2.  Add your credentials:
    *   `SUPABASE_URL`
    *   `SUPABASE_SERVICE_ROLE_KEY`
    *   `OPENAI_API_KEY`

## Database Setup

The database schema and RPC functions required for vector search are documented in the main submission package (`ENTREGAVEIS_FINAIS/SQL/PRODUCTION_SNAPSHOT.sql`).

## Running the API

```bash
npm run dev
```

The API will run at `http://localhost:3000`.

## API Documentation

*   **POST /rag/search**:
    *   Searches for similar documents based on semantic meaning.
    *   Payload: `{ "query": "your question here" }`
*   **POST /kag/classify**:
    *   Classifies unstructured text into categories.
    *   Payload: `{ "text": "content to classify" }`