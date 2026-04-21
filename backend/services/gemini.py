"""Gemini LLM client wrapper and prompt construction utilities."""

import json
import os

import google.generativeai as genai

# Configure the Gemini SDK with the API key from the environment.
# This runs at import time; main.py already validates the key is present.
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

_MODEL_NAME = "gemini-2.5-flash-lite"

_QUESTION_SYSTEM_PROMPT = (
    "You are an expert technical interviewer. "
    "Given a job description, generate exactly 5 interview questions following this specific format:\n"
    "1. The Icebreaker: Ask about relevant project experience\n"
    "2. The Core Concept: Test JD-specific technical knowledge\n"
    "3. The System Design: Ask them to architect a feature from the JD\n"
    "4. The Behavioral: Explore handling disagreements or failed deadlines\n"
    "5. The Production Fire: Present a live incident response scenario\n\n"
    "Each question should be tailored to the job description provided. "
    'Return a JSON object with a single key "questions" containing an array of exactly 5 strings.'
)

_FOLLOWUP_SYSTEM_PROMPT = (
    "You are an expert interviewer. "
    "Given an interview question and the candidate's answer, evaluate if the answer is complete and clear. "
    "Only generate a follow-up question if the answer lacks detail, clarity, or doesn't fully address the question. "
    "If a follow-up is needed, explain what the answer is missing and ask a targeted follow-up question. "
    "If the answer is sufficient, return null for the followup. "
    'Return JSON: {"needs_followup": <boolean>, "missing": "<what the answer lacks, or null>", "followup": "<follow-up question, or null>"}.'
)

_ACKNOWLEDGMENT_SYSTEM_PROMPT = (
    "You are an expert interviewer transitioning between questions. "
    "Given the candidate's answer (either to a main question or follow-up), generate a brief, natural acknowledgment. "
    "Vary your phrasing based on answer quality:\n"
    "- For good answers: 'Makes sense,' 'Got it,' 'That's a solid approach.'\n"
    "- For okay answers: 'Fair enough,' 'Alright, moving on,' 'Understood.'\n"
    "Keep it conversational and under 10 words. "
    'Return JSON: {"acknowledgment": "<brief phrase>"}.'
)

_DEBRIEF_SYSTEM_PROMPT = (
    "You are an expert interview coach. "
    "Evaluate the candidate's performance across all interview questions. "
    "Return a JSON object matching this schema: "
    '{"overall_score": <0-100>, "summary": "<string>", '
    '"feedback": [{"question": "<string>", "score": <0-10>, '
    '"strengths": ["<string>"], "improvements": ["<string>"]}]}'
)


def build_question_prompt(job_description: str) -> str:
    """Return the combined system+user prompt string for question generation."""
    return f"{_QUESTION_SYSTEM_PROMPT}\n\n{job_description}"


def build_followup_prompt(question: str, answer: str) -> str:
    """Return the combined system+user prompt string for follow-up generation."""
    user_content = f"Question: {question}\nAnswer: {answer}"
    return f"{_FOLLOWUP_SYSTEM_PROMPT}\n\n{user_content}"


def build_debrief_prompt(job_description: str, qa_pairs: list) -> str:
    """Return the combined system+user prompt string for debrief generation.

    Args:
        job_description: The original job description.
        qa_pairs: List of dicts with keys: question, answer, followup (optional), followup_answer (optional).
    """
    # Format qa_pairs as a readable string
    formatted_pairs = []
    for i, pair in enumerate(qa_pairs, start=1):
        formatted = f"{i}. Question: {pair['question']}\n   Answer: {pair['answer']}"
        if pair.get("followup"):
            formatted += f"\n   Follow-up: {pair['followup']}"
        if pair.get("followup_answer"):
            formatted += f"\n   Follow-up Answer: {pair['followup_answer']}"
        formatted_pairs.append(formatted)

    qa_text = "\n\n".join(formatted_pairs)
    user_content = f"Job Description: {job_description}\n\nInterview Q&A:\n{qa_text}"
    return f"{_DEBRIEF_SYSTEM_PROMPT}\n\n{user_content}"


def build_acknowledgment_prompt(answer: str) -> str:
    """Return the combined system+user prompt string for acknowledgment generation."""
    return f"{_ACKNOWLEDGMENT_SYSTEM_PROMPT}\n\nCandidate's answer: {answer}"


def call_gemini(prompt: str) -> dict:
    """Call gemini-1.5-flash with JSON response mode and return the parsed dict.

    Raises:
        Exception: propagates any Gemini SDK / network error to the caller.
        ValueError: if the response cannot be parsed as JSON.
    """
    model = genai.GenerativeModel(
        model_name=_MODEL_NAME,
        system_instruction=None,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
        ),
    )
    response = model.generate_content(prompt)
    raw_text = response.text
    return json.loads(raw_text)
