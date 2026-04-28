# AI-Powered Document Retrieval System (RAG Pipeline)

An AI-powered **retrieval and reasoning system** for unstructured documents, built using semantic embeddings and Retrieval-Augmented Generation (RAG). The system transforms raw document collections into a queryable knowledge space where users can retrieve and reason over information using natural language.

**Demo:** https://doc-search-app-gray.vercel.app/


---

## System Overview

This project implements a full **end-to-end RAG pipeline**:

- Documents are ingested and processed into semantic chunks  
- Each chunk is embedded into a high-dimensional vector space  
- Vectors are stored and indexed for similarity search  
- Queries are embedded and matched using semantic similarity  
- Retrieved context is used by an LLM to generate grounded responses  

The result is a system that enables **context-aware information retrieval and AI-assisted reasoning over private document collections**.

---

## Architecture

- **Frontend:** Next.js (document upload, search interface, results visualization)
- **Backend:** Next.js API routes (ingestion, retrieval, query orchestration)
- **Database:** Supabase PostgreSQL with pgvector (vector similarity search)
- **Storage:** Supabase Storage (raw document persistence)
- **AI Layer:** OpenAI embeddings + LLM for response generation

---

## Core Capabilities

- Document ingestion and structured chunking pipeline  
- Semantic search using vector embeddings  
- Approximate nearest-neighbor retrieval via cosine similarity  
- Context-grounded answer generation (RAG)  
- Unified interface for upload, retrieval, and interaction  

---

## Key Idea

Instead of keyword-based search, the system operates in a **semantic vector space**, enabling retrieval based on meaning rather than exact text matching.

This allows:
- retrieval across paraphrases and implicit meaning  
- improved robustness over traditional search systems  
- integration of retrieval with generative AI models  

---

## Technologies

- Next.js  
- TypeScript  
- OpenAI API (Embeddings + LLM)  
- Supabase (PostgreSQL + Storage)  
- pgvector extension  
- Tailwind CSS  

---

## Credits

This project was inspired by and partially built using:  
https://www.freecodecamp.org/news/how-to-build-an-ai-powered-rag-search-application-with-nextjs-supabase-and-openai/
