from groq import AsyncGroq
from backend.config import settings
from backend.core.logger import get_logger

logger = get_logger(__name__)

_client: AsyncGroq | None = None


def get_groq_client() -> AsyncGroq:
    global _client
    if _client is None:
        _client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    return _client


async def generate_message(
    prompt: str,
    tone: str = "professional",
    goal: str = "book-meeting",
    lead_name: str | None = None,
    company: str | None = None,
    industry: str | None = None,
) -> str:
    """Call Groq Llama model to generate a personalised outreach message."""
    tone_map = {
        "friendly": "warm, conversational, and approachable",
        "professional": "formal, polished, and business-like",
        "persuasive": "compelling, value-driven, and action-oriented",
    }
    goal_map = {
        "book-meeting": "book a 15-minute introductory call",
        "product-intro": "introduce our product and its key benefits",
        "demo": "schedule a product demo",
    }

    context_parts = []
    if lead_name:
        context_parts.append(f"The recipient's name is {lead_name}.")
    if company:
        context_parts.append(f"They work at {company}.")
    if industry:
        context_parts.append(f"The industry is {industry}.")

    context = " ".join(context_parts)
    tone_desc = tone_map.get(tone, tone)
    goal_desc = goal_map.get(goal, goal)

    system_prompt = (
        "You are an expert B2B sales copywriter. "
        "Write concise, personalised cold outreach emails that feel human and get replies. "
        "Never use generic templates. Keep it under 150 words. "
        "Only output the email body — no subject line, no labels."
    )

    user_prompt = (
        f"Write a {tone_desc} cold outreach email to {goal_desc}. "
        f"{context} "
        f"Additional context from user: {prompt}"
    )

    client = get_groq_client()
    logger.info("Calling Groq API for message generation")
    response = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=300,
    )
    return response.choices[0].message.content.strip()
