# email_service.py

import os
import resend

print("RESEND KEY:", os.getenv("RESEND_API_KEY"))

resend.api_key = os.getenv("RESEND_API_KEY")

def send_candidate_email(
    candidate_email,
    candidate_name,
    interview_date,
    meeting_link
):

    resend.Emails.send({
        "from": "Recruitment <onboarding@resend.dev>",
        "to": candidate_email,
        "subject": "Interview Scheduled",
        "html": f"""
        <h2>Hello {candidate_name}</h2>

        <p>Congratulations! You have been shortlisted.</p>

        <p>Your interview has been scheduled.</p>

        <p><b>Date:</b> {interview_date}</p>

        <p>
            <a href="{meeting_link}">
                Join Interview
            </a>
        </p>
        """
    })



def send_recruiter_email(
    recruiter_email,
    candidate_name,
    match_score,
    feedback,
    interview_date,
    meeting_link
):

    resend.Emails.send({
        "from": "Recruitment <onboarding@resend.dev>",
        "to": recruiter_email,
        "subject": f"Interview Scheduled - {candidate_name}",
        "html": f"""
        <h2>Interview Scheduled Successfully</h2>

        <p><b>Candidate:</b> {candidate_name}</p>

        <p><b>Match Score:</b> {match_score}%</p>

        <p><b>Interview Date:</b> {interview_date}</p>

        <p>
            <a href="{meeting_link}">
                Join Meeting
            </a>
        </p>

        <h3>AI Feedback</h3>

        <pre>{feedback}</pre>
        """
    })