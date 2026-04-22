import ollama

from app.prompts.agriculture_prompt import get_agriculture_system_prompt
from app.services.translation_service import (
    translate_to_english,
    translate_from_english
)
from app.rag.retriever import retrieve_context


def run_local_llm(message: str, language: str = "en") -> dict:
    """
    Runs local Mistral LLM with:
    - Translation layer
    - Maharashtra-specific RAG context
    """

    # 1. Translate user query to English
    english_message = translate_to_english(message, language)

    # 2. Retrieve Maharashtra-specific context from FAISS
    rag_context = retrieve_context(english_message)

    # 3. Build system prompt
    system_prompt = get_agriculture_system_prompt()

    # 4. Combine RAG context + user query
    final_user_prompt = f"""
Use the following Maharashtra-specific agriculture information
to answer the user's question accurately and practically.

Context:
{rag_context}

User Question:
{english_message}
"""

    # 5. Call local LLM (Ollama + Gemma 2B)
    response = ollama.chat(
        model="gemma:2b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": final_user_prompt}
        ]
    )

    english_reply = response["message"]["content"]

    # 6. Translate response back to user language
    final_reply = translate_from_english(english_reply, language)

    return {
        "reply": final_reply,
        "confidence": 0.85
    }
