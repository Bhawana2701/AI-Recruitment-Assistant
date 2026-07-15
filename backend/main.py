# main.py
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid 
from resume_parser import extract_text
from skill_matcher import analyze_skills
from scorer import create_embedding, store_resume_embedding, store_jd_embedding
from scorer import count_jds
from scorer import semantic_search
from scorer import semantic_search_by_resume_id
from scorer import compare_resume_with_jd
from database import conn, cursor
from email_service import (
    send_candidate_email,
    send_recruiter_email
)
from dotenv import load_dotenv 
from pydantic import BaseModel, EmailStr
import re
from fastapi.staticfiles import StaticFiles
from services.beyondpresence import create_call 
import json
from interview_ai import ask_ai
from routes.proctoring import router as proctor_router
from speech_to_text import transcribe
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


load_dotenv()

app = FastAPI()
app.include_router(proctor_router)

# print("========== ROUTES ==========")

# for route in app.routes:
#     print(route.path)

# print("============================")

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

class InterviewRequest(BaseModel):
    application_id: int
    interview_date: str
    meeting_link: str
    interviewer_email: str

class UpdateJD(BaseModel):
    job_title: str
    company_name: str
    location: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "AI Recruitment Assistant Running"
    }

@app.post("/upload-resume")
async def upload_resume(
    candidate_name: str = Form(...),
    email: EmailStr = Form(...),
    file: UploadFile = File(...)
):     
    candidate_name = candidate_name.strip()

    if len(candidate_name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid full name."
        )
    

        # Allowed email providers
    allowed_domains = [
        "gmail.com",
        "outlook.com",
        "yahoo.com",
        "hotmail.com"
    ]

    domain = str(email).split("@")[1].lower()

    if domain not in allowed_domains:
        raise HTTPException(
            status_code=400,
            detail="Only Gmail, Outlook, Yahoo, and Hotmail email addresses are allowed."
        )

    allowed_extensions = (".pdf", ".docx")

    if not file.filename.lower().endswith(allowed_extensions):
        return {
            "error": "Only PDF and DOCX files are allowed."
        }
    os.makedirs("uploads/resumes", exist_ok=True)

    filename = f"{uuid.uuid4()}_{file.filename}"

    path = os.path.join(
        "uploads",
        "resumes",
        filename
    )

    with open(path, "wb") as f:
        f.write(await file.read())

    resume_text = extract_text(path)

    resume_id = store_resume_embedding(
        resume_text,
        candidate_name,
        email,
        filename
    )

    return {
        "resume_id": resume_id,
        "candidate_name": candidate_name,
        "email": email,
        "message": "Resume stored successfully"
    }

@app.post("/upload-jd")
async def upload_jd(
    job_title: str = Form(...),
    company_name: str = Form(...),
    location: str = Form(...),
    file: UploadFile = File(...)
):

    allowed_extensions = (".pdf", ".docx")

    if not file.filename.lower().endswith(allowed_extensions):
        return {
            "error": "Only PDF and DOCX files are allowed."
        }
    path = f"temp_{uuid.uuid4()}_{file.filename}"

    with open(path, "wb") as f:
        f.write(await file.read())

    jd_text = extract_text(path)

    os.remove(path)

    jd_id = store_jd_embedding(
    jd_text,
    job_title,
    company_name,
    location
)

    return {
        "jd_id": jd_id,
        "message": "JD stored successfully"
    }

@app.get("/count-jds")
def count_jd():
    return {
        "total_jds": count_jds()
    }

@app.post("/match-resume")
async def match_resume(
    file: UploadFile = File(...)
):

    allowed_extensions = (".pdf", ".docx")

    if not file.filename.lower().endswith(allowed_extensions):
        return {
            "error": "Only PDF and DOCX files are allowed."
        }
    path = f"temp_{uuid.uuid4()}_{file.filename}"

    with open(path, "wb") as f:
        f.write(await file.read())

    resume_text = extract_text(path)

    os.remove(path)

    results = semantic_search(
        resume_text
    )

    return {
        "matches": results
    }



@app.get("/match-resume/{resume_id}")
def match_resume(resume_id: int):

    matches = semantic_search_by_resume_id(
        resume_id
    )

    return {
        "resume_id": resume_id,
        "matches": matches
    }


@app.get("/compare/{resume_id}/{jd_id}")
def compare(
    resume_id: int,
    jd_id: int
):

    score = compare_resume_with_jd(
        resume_id,
        jd_id
    )

    return {
        "resume_id": resume_id,
        "jd_id": jd_id,
        "match_score": score
    }

@app.post("/shortlist/{application_id}")
def shortlist_candidate(application_id: int):

    cursor.execute(
        """
        SELECT match_score
        FROM applications
        WHERE id = %s
        """,
        (application_id,)
    )

    row = cursor.fetchone()

    if not row:
        return {"error": "Application not found"}

    score = row[0]

    if score < 70:
        return {
            "message": "Candidate cannot be shortlisted. Minimum score is 70%"
        }

    cursor.execute(
        """
        UPDATE applications
        SET status = 'SHORTLISTED'
        WHERE id = %s
        """,
        (application_id,)
    )

    conn.commit()

    return {
        "message": "Candidate shortlisted successfully"
    }

@app.post("/schedule-interview")
def schedule_interview(data: InterviewRequest):

    cursor.execute(
        """
        INSERT INTO interviews
        (
            application_id,
            interview_date,
            meeting_link,
            interviewer_email
        )
        VALUES (%s, %s, %s, %s)
        """,
        (
            data.application_id,
            data.interview_date,
            data.meeting_link,
            data.interviewer_email
        )
    )
    cursor.execute("""
        UPDATE applications
        SET status = 'INTERVIEW_SCHEDULED'
        WHERE id = %s
    """, (data.application_id,))

    cursor.execute("""
        SELECT
            r.email,
            r.candidate_name
        FROM applications a
        JOIN resumes r
        ON a.resume_id = r.id
        WHERE a.id = %s
        """, (data.application_id,))
    
    candidate = cursor.fetchone()

    candidate_email = candidate[0]
    candidate_name = candidate[1]

    conn.commit()
    send_candidate_email(
        candidate_email,
        candidate_name,
        data.interview_date,
        data.meeting_link
    )
    send_recruiter_email(
        recruiter_email=data.interviewer_email,
        candidate_name=candidate_name,
        match_score=0,
        feedback="Interview Scheduled",
        interview_date=data.interview_date,
        meeting_link=data.meeting_link
    )

    return {
        "message": "Interview saved successfully"
    }

@app.get("/dashboard-stats")
def dashboard_stats():
    try:
        cursor.execute("SELECT COUNT(*) FROM applications")
        applications = cursor.fetchone()

        print(applications)

        cursor.execute("SELECT COUNT(*) FROM job_descriptions")
        total_jds = cursor.fetchone()

        cursor.execute("""
            SELECT COUNT(*)
            FROM applications
            WHERE status='SHORTLISTED'
        """)
        shortlisted = cursor.fetchone()

        cursor.execute("""
            SELECT AVG(match_score)
            FROM applications
        """)
        avg_score = cursor.fetchone()

        return {
            "applications": applications[0],
            "total_jds": total_jds[0],
            "shortlisted": shortlisted[0],
            "avg_score": round(avg_score[0] or 0, 2)
        }

    except Exception as e:
        conn.rollback()
        print("Dashboard Error:", e)
        return {"error": str(e)}

@app.get("/dashboard-chart")
def dashboard_chart():
    try:
        cursor.execute("""
            SELECT
                r.candidate_name,
                COALESCE(a.match_score,0)
            FROM applications a
            JOIN resumes r
                ON a.resume_id = r.id
            ORDER BY a.match_score DESC
            LIMIT 10
        """)

        rows = cursor.fetchall()

        return [
            {
                "name": row[0],
                "score": float(row[1])
            }
            for row in rows
        ]

    except Exception as e:
        conn.rollback()
        print("Dashboard Chart Error:", e)
        return {"error": str(e)}

@app.get("/applications")
def get_applications():

    cursor.execute("""
    SELECT
        a.id,
        r.candidate_name,
        r.email,
        a.match_score,
        a.status,
        r.resume_file
    FROM applications a
    JOIN resumes r
    ON a.resume_id = r.id
    ORDER BY a.id DESC
    """)

    rows = cursor.fetchall()

    applications = []

    for row in rows:

        applications.append({
            "application_id": row[0],
            "candidate_name": row[1],
            "email": row[2],
            "match_score": row[3],
            "status": row[4],
            "resume_file": f"http://127.0.0.1:8000/uploads/resumes/{row[5]}"
        })

    return applications

@app.get("/application/{application_id}")
def get_application_details(
    application_id: int
):

    cursor.execute("""
    SELECT
        a.id,
        r.candidate_name,
        r.email,
        a.match_score,
        a.status,
        a.llm_feedback,
        r.resume_text,
        r.resume_file,
        j.jd_text
    FROM applications a
    JOIN resumes r
    ON a.resume_id=r.id
    JOIN job_descriptions j
    ON a.jd_id=j.id
    WHERE a.id=%s
    """,(application_id,))

    row = cursor.fetchone()

    if not row:
        return {
            "error": "Application not found"
        }

    from skill_matcher import analyze_skills

    skills = analyze_skills(
        row[6],
        row[8]
    )

    return {
        "application_id": row[0],
        "candidate_name": row[1],
        "email": row[2],
        "match_score": row[3],
        "status": row[4],
        "llm_feedback": json.loads(row[5]) if row[5] else {},
        "matched_skills": skills["matched_skills"],
        "missing_skills": skills["missing_skills"],
        "resume_text": row[6],
        "resume_file": f"http://127.0.0.1:8000/uploads/resumes/{row[7]}"
    }

@app.get("/interview_result/{application_id}")

def interview_result(application_id:int):

    cursor.execute("""

    SELECT

    score,

    feedback,

    conversation

    FROM interview_results

    WHERE application_id=%s

    """,(application_id,))

    row=cursor.fetchone()

    if not row:

        return {"error":"Interview not found"}

    return{

        "score":row[0],

        "feedback":row[1],

        "conversation":json.loads(row[2])

    }

@app.get("/interviews")
def get_interviews():

    cursor.execute("""
        SELECT
        i.id,
        i.application_id,
        r.candidate_name,
        r.email,
        i.interview_date,
        i.meeting_link,
        i.interviewer_email
        FROM interviews i
        JOIN applications a
            ON i.application_id = a.id
        JOIN resumes r
            ON a.resume_id = r.id
        ORDER BY i.interview_date DESC
    """)

    rows = cursor.fetchall()

    interviews = []

    for row in rows:
        
        interviews.append({
            "id": row[0],
            "application_id": row[1],
            "candidate_name": row[2],
            "candidate_email": row[3],
            "interview_date": row[4],
            "meeting_link": row[5],
            "interviewer_email": row[6]
        })

    return interviews


@app.get("/shortlisted")
def shortlisted_candidates():

    cursor.execute("""
    SELECT
        a.id,
        r.candidate_name,
        r.email,
        a.match_score,
        a.status,
        r.resume_file
    FROM applications a
    JOIN resumes r
    ON a.resume_id = r.id
    WHERE a.status IN ('SHORTLISTED','INTERVIEW_SCHEDULED')
    ORDER BY a.match_score DESC
    """)

    rows = cursor.fetchall()

    data = []

    for row in rows:
        
       data.append({
            "application_id": row[0],
            "candidate_name": row[1],
            "email": row[2],
            "match_score": row[3],
            "status": row[4],
            "resume_file": f"http://127.0.0.1:8000/uploads/resumes/{row[5]}"
        })

    return data

@app.get("/job-descriptions")
def get_job_descriptions():

    cursor.execute("""
        SELECT
            j.id,
            j.job_title,
            j.company_name,
            j.location,
            COUNT(a.id) AS applications
        FROM job_descriptions j
        LEFT JOIN applications a
            ON j.id = a.jd_id
        GROUP BY
            j.id,
            j.job_title,
            j.company_name,
            j.location
        ORDER BY j.id DESC
    """)

    rows = cursor.fetchall()

    jobs = []

    for row in rows:
        jobs.append({
            "id": row[0],
            "job_title": row[1],
            "company_name": row[2],
            "location": row[3],
            "applications": row[4]
        })

    return jobs

@app.get("/reports")
def reports():
    try:
        cursor.execute("""
            SELECT status, COUNT(*)
            FROM applications
            GROUP BY status
        """)

        status_rows = cursor.fetchall()

        status_data = []

        for row in status_rows:
            status_data.append({
                "status": row[0],
                "count": row[1]
            })

        cursor.execute("""
            SELECT
                AVG(match_score),
                MAX(match_score),
                MIN(match_score)
            FROM applications
        """)

        stats = cursor.fetchone()

        return {
            "status_data": status_data,
            "average_score": round(stats[0] or 0, 2),
            "highest_score": round(stats[1] or 0, 2),
            "lowest_score": round(stats[2] or 0, 2)
        }

    except Exception as e:
        conn.rollback()
        print("REPORT ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/job-description/{jd_id}")
def get_job_description(jd_id: int):

    cursor.execute("""
        SELECT
            id,
            job_title,
            company_name,
            location,
            jd_text
        FROM job_descriptions
        WHERE id = %s
    """, (jd_id,))

    row = cursor.fetchone()

    if not row:
        return {"error": "Job Description not found"}

    return {
        "id": row[0],
        "job_title": row[1],
        "company_name": row[2],
        "location": row[3],
        "jd_text": row[4]
    }

@app.delete("/job-description/{jd_id}")
def delete_job_description(jd_id: int):

    cursor.execute("""
        DELETE FROM job_descriptions
        WHERE id = %s
    """, (jd_id,))

    conn.commit()

    return {
        "message": "Job Description deleted successfully"
    }

@app.put("/job-description/{jd_id}")
def update_job_description(
    jd_id: int,
    data: UpdateJD
):

    cursor.execute("""
        UPDATE job_descriptions
        SET
            job_title=%s,
            company_name=%s,
            location=%s
        WHERE id=%s
    """,
    (
        data.job_title,
        data.company_name,
        data.location,
        jd_id
    ))

    conn.commit()

    return {
        "message": "Job Description updated successfully"
    }

@app.get("/dashboard")
def dashboard():
    try:
        # Stats
        cursor.execute("SELECT COUNT(*) FROM applications")
        applications = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM job_descriptions")
        total_jds = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM applications
            WHERE status='SHORTLISTED'
        """)
        shortlisted = cursor.fetchone()[0]

        cursor.execute("""
            SELECT AVG(match_score)
            FROM applications
        """)
        avg_score = float(cursor.fetchone()[0] or 0)

        # Line Chart
        cursor.execute("""
            SELECT
                r.candidate_name,
                COALESCE(a.match_score, 0)
            FROM applications a
            JOIN resumes r
            ON a.resume_id = r.id
            ORDER BY a.match_score DESC
            LIMIT 10
        """)

        chartData = [
            {
                "name": row[0],
                "score": float(row[1])
            }
            for row in cursor.fetchall()
        ]

        # Pie Chart
        cursor.execute("""
            SELECT status, COUNT(*)
            FROM applications
            GROUP BY status
        """)

        pieData = [
            {
                "name": row[0],
                "value": row[1]
            }
            for row in cursor.fetchall()
        ]

        return {
            "stats": {
                "applications": applications,
                "total_jds": total_jds,
                "shortlisted": shortlisted,
                "avg_score": round(avg_score, 2)
            },
            "chartData": chartData,
            "pieData": pieData
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/verify-interview/{token}")
def verify_interview(token: str):

    cursor.execute("""
        SELECT
            application_id,
            interview_date
        FROM interviews
        WHERE interview_token=%s
    """,(token,))

    interview = cursor.fetchone()

    print("TOKEN =", token)
    print("INTERVIEW =", interview)

    if not interview:
        return {"valid": False}

    return {
        "valid": True,
        "application_id": interview[0],
        "date": interview[1]
    }

@app.post("/interview-question")
def interview(data: dict):

    result = ask_ai(
        data["question"],
        data["answer"],
        data["count"]

    )

    return result

@app.post("/submit-interview")
def submit_interview(data: dict):

    cursor.execute("""
        INSERT INTO interview_results
        (
            application_id,
            score,
            feedback,
            conversation
        )
        VALUES (%s,%s,%s,%s)
    """,(
        data["application_id"],
        data["score"],
        data["feedback"],
        json.dumps(data["conversation"])
    ))

    conn.commit()

    return {"message":"Interview Saved"}

@app.post("/create-ai-interview")
def create_ai_interview():

    return create_call()
    

@app.post("/upload-interview-video")
def upload_interview_video(

    application_id: int = Form(...),

    video: UploadFile = File(...)

):

    os.makedirs("uploads/interviews", exist_ok=True)

    filename = f"{application_id}.webm"

    filepath = os.path.join(

        "uploads",

        "interviews",

        filename

    )

    with open(filepath,"wb") as buffer:

        shutil.copyfileobj(video.file, buffer)
    
    transcript = transcribe(filepath)

    logger.info("Transcript: %s", transcript)

    cursor.execute("""
        UPDATE applications
        SET interview_video = %s
        WHERE id = %s
    """, (filename, application_id))

    cursor.execute("""
    UPDATE interview_results
    SET transcript=%s
    WHERE application_id=%s
    """, (transcript, application_id))

    cursor.execute("""
        UPDATE applications
        SET interview_transcript = %s
        WHERE id = %s
        """, (transcript, application_id))
    print("Rows updated:", cursor.rowcount)

    conn.commit()

    return {
        "message": "Video uploaded",
        "filename": filename,
        "transcript": transcript
    }

@app.get("/interview-transcript/{application_id}")
def get_interview(application_id: int):

    print("Searching application:", application_id)

    cursor.execute("""
        SELECT interview_transcript
        FROM applications
        WHERE id = %s
    """, (application_id,))

    row = cursor.fetchone()

    print("Database row:", row)

    if row is None:
        raise HTTPException(status_code=404, detail="Interview not found")

    return {
        "transcript": row[0]
    }

@app.get("/proctor-events/{application_id}")
def get_proctor_events(application_id: int):

    cursor.execute("""
        SELECT
            event_type,
            severity,
            description,
            created_at
        FROM proctoring_events
        WHERE application_id=%s
        ORDER BY created_at
    """, (application_id,))

    rows = cursor.fetchall()

    events = []

    for row in rows:
        events.append({
            "event_type": row[0],
            "severity": row[1],
            "description": row[2],
            "time": row[3]
        })

    return events