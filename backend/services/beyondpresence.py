import os

AGENT_ID = os.getenv("BEY_AGENT_ID")

def create_call():

    return {
        "meeting_link":
        f"https://bey.chat/{AGENT_ID}"
    }