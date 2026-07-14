# proctoring.py
from fastapi import APIRouter
from pydantic import BaseModel
from database import conn, cursor
from typing import Optional

router = APIRouter()

class ProctorEvent(BaseModel):
    application_id: int
    event_type: str
    severity: str
    description: Optional[str] = None


@router.post("/proctor/log")
def log_event(event: ProctorEvent):

    try:

        print(event)

        cursor.execute(
            """
            SELECT id
            FROM applications
            WHERE id=%s
            """,
            (event.application_id,)
        )

        row = cursor.fetchone()

        if row is None:
            return {
                "success": False,
                "message": "Application not found"
            }

        cursor.execute(
            """
            INSERT INTO proctoring_events
            (
                application_id,
                event_type,
                severity,
                description
            )
            VALUES (%s,%s,%s,%s)
            RETURNING id
            """,
            (
                event.application_id,
                event.event_type,
                event.severity,
                event.description
            )
        )

        log_id = cursor.fetchone()[0]

        conn.commit()

        return {
            "success": True,
            "log_id": log_id
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }
    
@router.get("/proctor-events/{application_id}")
def get_events(application_id: int):

    cursor.execute("""
        SELECT
                event_type,
                severity,
                description,
                timestamp
            FROM proctoring_events
            WHERE application_id=%s
            ORDER BY timestamp DESC
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