from app.services.local_llm import run_local_llm

def get_ai_response(message: str, language: str = "en", location: str = None):

    message_lower = message.lower()

    if "wheat" in message_lower:
        return {
            "reply": (
                "For wheat cultivation:\n"
                "- Use well-drained loamy soil\n"
                "- Best sowing time: Oct-Dec\n"
                "- Moderate irrigation is required\n"
                "- Ideal temperature: 10-25°C"
            ),
            "confidence": 0.9
        }

    elif "rice" in message_lower:
        return {
            "reply": (
                "Rice cultivation tips:\n"
                "- Requires clayey soil\n"
                "- Needs standing water\n"
                "- Ideal temperature: 20 – 35°C\n"
                "- Common in Kharif season"
            ),
            "confidence": 0.9
        }

    # fallback to LLM
    return run_local_llm(message, language, location)
