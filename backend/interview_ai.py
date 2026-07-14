# interview_ai.py
from groq import Groq
import os
import json

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def ask_ai(question, answer, question_count):

    prompt = f"""
You are a professional HR interviewer.

You are conducting an interview.

Previous Question:
{question}

Candidate Answer:
{answer}

Evaluate the answer.

If this is approximately the 8th-10th question, end the interview.

Return ONLY JSON.

{{
    "score":85,
    "feedback":"Good answer",
    "next_question":"Describe a challenging project.",
    "interview_complete":false
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = response.choices[0].message.content

    content = content.replace("```json", "").replace("```", "").strip()

    return json.loads(content)