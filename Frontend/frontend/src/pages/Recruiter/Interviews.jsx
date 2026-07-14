//Interviews.jsx
import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import api from "../../api/api";

export default function Interviews() {

   const [interviews, setInterviews] = useState([]);
    const [candidate, setCandidate] = useState("");
    const [transcript, setTranscript] = useState("");
    const [email, setEmail] = useState("");
    const [interviewDate, setInterviewDate] = useState("");
    const [recruiter, setRecruiter] = useState("");
    const [showTranscript, setShowTranscript] = useState(false);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        const res = await api.get("/interviews");
        setInterviews(res.data);
    };

   const loadTranscript = async (
        applicationId,
        candidateName,
        candidateEmail,
        date,
        interviewer
    ) => {

        const transcriptRes = await api.get(
            `/interview-transcript/${applicationId}`
        );

        const eventsRes = await api.get(
            `/proctor-events/${applicationId}`
        );

        setCandidate(candidateName);
        setEmail(candidateEmail);
        setInterviewDate(date);
        setRecruiter(interviewer);
        setTranscript(transcriptRes.data.transcript);
        setEvents(eventsRes.data);

        setShowTranscript(true);
    };

    return (
        <Layout>

            <table className="resumes-table">

              <thead>
                  <tr>
                      <th>Candidate</th>
                      <th>Email</th>
                      <th>Interview Date</th>
                      <th>Recruiter</th>
                      <th>Action</th>
                  </tr>
              </thead>

              <tbody>

                  {interviews.map((interview) => (

                     <tr key={interview.id}>

                          <td>{interview.candidate_name}</td>

                          <td>{interview.candidate_email}</td>

                          <td>
                              {new Date(interview.interview_date).toLocaleString()}
                          </td>

                          <td>{interview.interviewer_email}</td>

                          <td>
                              <button
                                  onClick={() =>
                                      loadTranscript(
                                          interview.application_id,
                                          interview.candidate_name,
                                          interview.candidate_email,
                                          interview.interview_date,
                                          interview.interviewer_email
                                      )
                                  }
                              >
                                  View Transcript
                              </button>
                          </td>

                      </tr>
                  ))}

              </tbody>

          </table>

          {showTranscript && (

          <div className="modal-overlay">

              <div className="modal">

                  <h2>AI Interview Report</h2>
                  <p style={{ color: "#6b7280", marginBottom: "20px" }}>
                      Candidate: <strong>{candidate}</strong>
                  </p>

                  <div className="candidate-info">

                      <p>
                          <strong>Email:</strong> {email}
                      </p>

                      <p>
                          <strong>Interview Date:</strong>{" "}
                          {new Date(interviewDate).toLocaleString()}
                      </p>

                      <p>
                          <strong>Recruiter:</strong> {recruiter}
                      </p>

                  </div>

                  <h3>Transcript</h3>

                  <p style={{ marginBottom: "10px" }}>
                      <strong>Transcript Length:</strong> {transcript.length} characters
                  </p>

                  <textarea
                      value={transcript}
                      readOnly
                      rows={14}
                      style={{
                          width: "100%",
                          marginTop: "10px",
                          padding: "12px",
                          fontSize: "15px",
                          lineHeight: "1.6"
                      }}
                  />

                  <h3 style={{marginTop:"25px"}}>
                      Proctoring Events
                  </h3>

                  <table className="resumes-table">

                      <thead>
                          <tr>
                              <th>Time</th>
                              <th>Event</th>
                              <th>Severity</th>
                              <th>Description</th>
                          </tr>
                      </thead>

                      <tbody>

                        {events.length === 0 ? (

                        <tr>
                            <td colSpan="4" style={{ textAlign: "center" }}>
                                No proctoring events recorded.
                            </td>
                        </tr>

                        ) : (

                        events.map((event,index)=>(

                        <tr key={index}>

                            <td>{new Date(event.time).toLocaleString()}</td>

                            <td>{event.event_type}</td>

                            <td>
                                <span className={`severity ${event.severity.toLowerCase()}`}>
                                    {event.severity}
                                </span>
                            </td>

                            <td>{event.description}</td>

                        </tr>

                        ))

                        )}

                        </tbody>

                  </table>

                  <button
                      className="close-btn"
                      onClick={() => setShowTranscript(false)}
                  >
                      Close
                  </button>

              </div>

          </div>

          )}

        </Layout>
    );
}