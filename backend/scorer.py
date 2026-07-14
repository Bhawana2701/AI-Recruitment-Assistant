# scorer.py
from sentence_transformers import SentenceTransformer
from database import conn, cursor
from sklearn.metrics.pairwise import cosine_similarity
import json
from skill_matcher import analyze_skills
# from feedback import generate_feedback
# from ollama_feedback import generate_ai_feedback
from groq_feedback import generate_ai_feedback
from llm_ranker import rank_candidate
from email_service import (
    send_candidate_email,
    send_recruiter_email
)
import uuid
from datetime import datetime, timedelta
import json
from sklearn.metrics.pairwise import cosine_similarity
# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")



def create_embedding(text):
    return model.encode(text).tolist()


def store_jd_embedding(
    jd_text,
    job_title,
    company_name,
    location
):

    embedding = create_embedding(jd_text)

    cursor.execute(
        """
        INSERT INTO job_descriptions
        (
            jd_text,
            embedding,
            job_title,
            company_name,
            location
        )
        VALUES (%s,%s,%s,%s,%s)
        RETURNING id
        """,
        (
            jd_text,
            json.dumps(embedding),
            job_title,
            company_name,
            location
        )
    )

    jd_id = cursor.fetchone()[0]

    conn.commit()

    return jd_id



def get_resume_by_id(resume_id):

    cursor.execute(
        """
        SELECT resume_text, embedding
        FROM resumes
        WHERE id = %s
        """,
        (resume_id,)
    )

    return cursor.fetchone()


def store_resume_embedding(
    resume_text,
    candidate_name,
    email,
    resume_file
):

    embedding = create_embedding(resume_text)

    cursor.execute("""
        INSERT INTO resumes
        (
            candidate_name,
            email,
            resume_text,
            embedding,
            resume_file
        )
        VALUES
        (
            %s,
            %s,
            %s,
            %s,
            %s
        )
        RETURNING id
    """,
    (
        candidate_name,
        email,
        resume_text,
        json.dumps(embedding),
        resume_file
    ))

    resume_id = cursor.fetchone()[0]

    conn.commit()

    return resume_id


def calculate_similarity(
    embedding,
    jd_embedding
):
    return cosine_similarity(
        [embedding],
        [jd_embedding]
    )[0][0]

def semantic_search(resume_text):

    embedding = create_embedding(
        resume_text
    )

    cursor.execute("""
        SELECT id, jd_text, embedding
        FROM job_descriptions
    """)

    rows = cursor.fetchall()

    results = []

    for row in rows:

        jd_embedding = json.loads(
            row[2]
        )

        score = calculate_similarity(
            embedding,
            jd_embedding
        )

        results.append({
            "jd_id": row[0],
            "jd_text": row[1],
            "match_percentage": round(
                score * 100,
                2
            )
        })
    
    results.sort(
        key=lambda x: x["match_percentage"],
        reverse=True
    )

    return results[:5]



def semantic_search_by_resume_id(
    resume_id
):

    resume = get_resume_by_id(
        resume_id
    )

    embedding = json.loads(
        resume[1]
    )

    cursor.execute(
        """
        SELECT id, jd_text, embedding
        FROM job_descriptions
        """
    )

    jds = cursor.fetchall()

    results = []

    resume_text = resume[0]

    for jd in jds:

        jd_text = jd[1]

        jd_embedding = json.loads(
            jd[2]
        )

        score = cosine_similarity(
            [embedding],
            [jd_embedding]
        )[0][0]

        skills = analyze_skills(
            resume_text,
            jd_text
        )

        llm_score = rank_candidate(
            round(score * 100, 2),
            skills["matched_skills"],
            skills["missing_skills"]
        )

        total_skills = (
            len(skills["matched_skills"]) +
            len(skills["missing_skills"])
        )

        if total_skills > 0:
            skill_score = round(
                len(skills["matched_skills"])
                / total_skills * 100,
                 2
            )
        else:
            skill_score = 0


        try:
            feedback = generate_ai_feedback(
                resume_text,
                jd_text,
                round(score * 100, 2),
                skills["matched_skills"],
                skills["missing_skills"]
            )

        except Exception as e:

            print("Groq Error:", e)

            feedback = {
                "status": "unavailable",
                "recruiter_summary": "AI feedback temporarily unavailable.",

                "candidate_review": f"""
        Overall Match Score : {round(score*100,2)}%

        Matched Skills:
        {", ".join(skills["matched_skills"])}

        Missing Skills:
        {", ".join(skills["missing_skills"])}
                """,

                "strengths": skills["matched_skills"],

                "improvements": skills["missing_skills"]
            }


        results.append({
            "jd_id": jd[0],
            "match_percentage": round(score * 100, 2),
            "jd_text": jd_text,
            "skill_score": skill_score,
            "matched_skills": skills["matched_skills"],
            "missing_skills": skills["missing_skills"],
            "feedback": feedback
        })

    results.sort(
    key=lambda x: x["match_percentage"],
    reverse=True
    )

    top_matches = results[:5]

    best_match = top_matches[0]

    match_score = float(
        best_match["match_percentage"]
    )

    cursor.execute(
        """
        INSERT INTO applications
        (
            resume_id,
            jd_id,
            match_score
        )
        VALUES (%s, %s, %s)
        RETURNING id
        """,
        (
            resume_id,
            best_match["jd_id"],
            match_score
        )
    )

    application_id = cursor.fetchone()[0]
    
    cursor.execute("""
    UPDATE applications
    SET llm_feedback=%s
    WHERE id=%s
    """,
    (
        json.dumps(best_match.get("feedback", {})),
        application_id
    ))
    
    cursor.execute("""
        SELECT candidate_name, email
        FROM resumes
        WHERE id = %s
    """, (resume_id,))

    candidate = cursor.fetchone()

    candidate_name = candidate[0]
    candidate_email = candidate[1]
    
    if match_score >= 70:

        interview_date = (
            datetime.now()
            .replace(hour=10, minute=0, second=0, microsecond=0)
            + timedelta(days=1)
        )
        interview_token = uuid.uuid4().hex

        meeting_link = (
            f"http://localhost:5174/ai-interview/{interview_token}"
        )

        cursor.execute("""
            UPDATE applications
            SET status = 'INTERVIEW_SCHEDULED'
            WHERE id = %s
        """, (application_id,))

        cursor.execute("""
            INSERT INTO interviews
            (
                application_id,
                interview_date,
                meeting_link,
                interviewer_email,
                interview_token
            )
            VALUES (%s,%s,%s,%s,%s)
        """,
        (
            application_id,
            interview_date,
            meeting_link,
            "AI HR",
            interview_token
        ))
        conn.commit()  

        try:
            send_candidate_email(
                candidate_email,
                candidate_name,
                interview_date.strftime("%d %B %Y, %I:%M %p"),
                meeting_link
            )
        except Exception as e:
            print("Candidate email error:", e)

        try:
            send_recruiter_email(
                recruiter_email="kandoibhawana27@gmail.com",
                candidate_name=candidate_name,
                match_score=match_score,
                feedback=best_match["feedback"],
                interview_date=interview_date.strftime("%d %B %Y, %I:%M %p"),
                meeting_link=meeting_link
            )
        except Exception as e:
            print("Recruiter email error:", e)
    else:
        cursor.execute("""
            UPDATE applications
            SET status='REJECTED'
            WHERE id=%s
        """, (application_id,))

        conn.commit()
    
    conn.commit()
    return {
        "application_id": application_id,
        "top_matches": top_matches,
        "best_match": best_match,
        "llm_feedback": best_match["feedback"]
    }

def get_jd_by_id(jd_id):

    cursor.execute(
        """
        SELECT jd_text, embedding
        FROM job_descriptions
        WHERE id = %s
        """,
        (jd_id,)
    )

    return cursor.fetchone()



def compare_resume_with_jd(
    resume_id,
    jd_id
):

    resume = get_resume_by_id(
        resume_id
    )

    jd = get_jd_by_id(
        jd_id
    )

    embedding = json.loads(
        resume[1]
    )

    jd_embedding = json.loads(
        jd[1]
    )

    score = cosine_similarity(
        [embedding],
        [jd_embedding]
    )[0][0]

    return round(
        score * 100,
        2
    )


def count_jds():

    cursor.execute(
        "SELECT COUNT(*) FROM job_descriptions"
    )

    return cursor.fetchone()[0]