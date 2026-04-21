"""ElevenLabs TTS and STT client wrapper."""

import os

import httpx


def synthesize_speech(text: str, voice_id: str) -> bytes:
    """Call ElevenLabs TTS API and return raw audio bytes.

    Args:
        text: The text to synthesize
        voice_id: The ElevenLabs voice ID to use

    Returns:
        Raw audio bytes (audio/mpeg stream)

    Raises:
        httpx.HTTPStatusError: If the ElevenLabs API returns an error status
        httpx.RequestError: If the request fails (network error, timeout, etc.)
    """
    api_key = os.environ["ELEVENLABS_API_KEY"]
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
    }

    body = {
        "text": text,
        "model_id": "eleven_flash_v2_5",
    }

    response = httpx.post(url, headers=headers, json=body, timeout=30.0)
    response.raise_for_status()

    return response.content


def transcribe_audio(audio_bytes: bytes, filename: str) -> str:
    """Call ElevenLabs STT API and return transcript text.

    Args:
        audio_bytes: The audio data to transcribe
        filename: The filename to use for the audio file in the multipart upload

    Returns:
        Transcript text string

    Raises:
        httpx.HTTPStatusError: If the ElevenLabs API returns an error status
        httpx.RequestError: If the request fails (network error, timeout, etc.)
    """
    api_key = os.environ["ELEVENLABS_API_KEY"]
    url = "https://api.elevenlabs.io/v1/speech-to-text"

    headers = {
        "xi-api-key": api_key,
    }

    # Prepare multipart/form-data
    files = {
        "file": (filename, audio_bytes),
    }
    data = {
        "model_id": "scribe_v2",
    }

    response = httpx.post(url, headers=headers, files=files, data=data, timeout=30.0)
    response.raise_for_status()

    # Parse JSON response and extract the "text" field
    result = response.json()
    return result["text"]
