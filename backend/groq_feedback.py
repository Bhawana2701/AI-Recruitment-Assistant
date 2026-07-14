from groq import Groq
import json
import os
from dotenv import load_dotenv

load_dotenv()

print("API KEY:", os.getenv("GROQ_API_KEY"))
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def generate_ai_feedback(
    resume_text,
    jd_text,
    match_score,
    matched_skills,
    missing_skills
):

    prompt = f"""
        You are a Senior Technical Recruiter with 10+ years of experience.

        Your task is to evaluate a candidate against a job description exactly as a recruiter would during resume screening.

        CANDIDATE RESUME:
        {resume_text}

        JOB DESCRIPTION:
        {jd_text}

        SEMANTIC MATCH SCORE:
        {match_score}%

        MATCHED SKILLS:
        {matched_skills}

        MISSING SKILLS:
        {missing_skills}

        Evaluate the candidate on:

        1. Technical Skill Match
        2. Relevant Project Experience
        3. Education & Certifications
        4. Missing Requirements
        5. Overall Job Fit

        Return ONLY valid JSON in the following format:

        {{
            "candidate_name": "",
            "overall_match_score": 0,
            "technical_fit": "Excellent | Good | Moderate | Poor",
            "strengths": [
                ""
            ],
            "skill_gaps": [
                ""
            ],
            "project_relevance": [
                ""
            ],
            "interview_questions": [
                ""
            ],
            "recruiter_summary": "",
            "hiring_recommendation": "Strong Hire | Hire | Consider | Reject"
        }}

        Rules:
        - Be objective.
        - Do not invent skills not present in the resume.
        - Focus on evidence from resume and JD.
        - If experience is missing, mention it clearly.
        - Hiring recommendation must be justified.
        - Return JSON only.
        """
    
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )

    content = response.choices[0].message.content

    return json.loads(content)