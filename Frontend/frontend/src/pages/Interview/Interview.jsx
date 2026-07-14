// Interview.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import Layout from "../../components/Layout";

export default function Interview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [interviewDate, setInterviewDate] = useState("");
    const [meetingLink, setMeetingLink] = useState("");
    const [interviewerEmail, setInterviewerEmail] = useState("");

    const scheduleInterview = async (e) => {
        e.preventDefault();

        if (!meetingLink.startsWith("https://")) {
            alert("Please enter a valid meeting link.");
            return;
        }

        setLoading(true);

        try {
            const res = await api.post("/schedule-interview", {
                application_id: Number(id),
                interview_date: interviewDate,
                meeting_link: meetingLink,
                interviewer_email: interviewerEmail.trim(),
            });

            alert(res.data.message);
            navigate("/interviews");
        } catch (err) {
            console.log(err);
            alert("Failed to schedule interview");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <h1>Schedule Interview</h1>

            <form
                className="upload-form"
                onSubmit={scheduleInterview}
            >
                <input
                    type="datetime-local"
                    value={interviewDate}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) =>
                        setInterviewDate(e.target.value)
                    }
                    required
                />

                <input
                    type="url"
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={meetingLink}
                    onChange={(e) =>
                        setMeetingLink(e.target.value)
                    }
                    required
                />

                <input
                    type="email"
                    placeholder="Interviewer Email"
                    value={interviewerEmail}
                    onChange={(e) =>
                        setInterviewerEmail(e.target.value)
                    }
                    required
                />

               <button type="submit" disabled={loading}>
                    {loading ? "Scheduling..." : "Schedule Interview"}
                </button>
            </form>
        </Layout>
    );
}