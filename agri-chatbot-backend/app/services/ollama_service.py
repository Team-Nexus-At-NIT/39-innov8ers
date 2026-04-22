import requests
from app.prompts.agriculture_prompt import get_agriculture_system_prompt

OLLAMA_URL = "http://localhost:11434/api/generate"


def generate_response(prompt: str, language: str = "en") -> dict:

    print("Ollama Service → Preparing prompt")

    system_prompt = get_agriculture_system_prompt(language)

    full_prompt = (
        f"SYSTEM:\n{system_prompt}\n\n"
        f"USER:\n{prompt}"
    )

    payload = {
        "model": "mistral:latest",
        "prompt": full_prompt,
        "stream": False
    }

    try:
        print("Ollama Service → Sending request")

        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=(10, 300)
        )

        response.raise_for_status()

        print("Ollama Service → Received response")

        data = response.json()

        return {
            "reply": data.get("response", "No response generated"),
            "confidence": 0.75
        }

    except requests.exceptions.Timeout:
        return {
            "reply": "Ollama took too long to respond. Try shorter query.",
            "confidence": 0.0
        }

    except requests.exceptions.ConnectionError:
        return {
            "reply": "Cannot reach Ollama. Start it using: ollama serve",
            "confidence": 0.0
        }

    except Exception as e:
        return {
            "reply": f"Ollama error: {str(e)}",
            "confidence": 0.0
        }
