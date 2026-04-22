from app.services.local_llm import run_local_llm

# 1️⃣ Define dangerous keywords
DANGEROUS_KEYWORDS = [
    "poison",
    "kill",
    "bomb",
    "acid",
    "toxic",
    "illegal pesticide",
    "explosive",
    "harm"
]

# 2️⃣ Input safety check function
def is_safe_query(message: str) -> bool:
    lowered = message.lower()
    return not any(word in lowered for word in DANGEROUS_KEYWORDS)


# 3️⃣ ChatService
class ChatService:
    @staticmethod
    def get_reply(message: str, language: str = "en") -> dict:
        # ⚠️ Layer 2: Input guard
        if not is_safe_query(message):
            return {
                "reply": (
                    "I can’t help with harmful or illegal activities. "
                    "I can suggest safe and legal alternatives."
                ),
                "confidence": 0.9
            }

        # Layer 1 + 3: Run local LLM safely
        return run_local_llm(message, language)
