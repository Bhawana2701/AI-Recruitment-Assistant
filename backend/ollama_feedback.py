import requests


def generate_ai_feedback(
    resume_text,
    jd_text,
    match_score,
    matched_skills,
    missing_skills
):

    prompt = f"""
You are a senior technical recruiter.

Resume:
{resume_text}ollama serve

Job Description:
{jd_text}

Match Score:
{match_score}%

Matched Skills:
{', '.join(matched_skills)}

Missing Skills:
{', '.join(missing_skills)}

Provide:

1. Candidate strengths
2. Skill gaps
3. Interview recommendation
4. Hiring recommendation

Keep response professional.
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )

    return response.json()["response"]