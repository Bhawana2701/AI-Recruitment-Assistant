 //Shortlisted.jsx
import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function Shortlisted() {

  const [candidates, setCandidates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await api.get("/shortlisted");

      console.log(res.data);

      setCandidates(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Layout>

      <h1>Shortlisted Candidates</h1>

      <table className="resumes-table">

        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Match Score</th>
            <th>Status</th>
            <th>Resume</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {candidates.map((candidate) => (

            <tr key={candidate.application_id}>

              <td>{candidate.candidate_name}</td>

              <td>{candidate.email}</td>

              <td>{candidate.match_score}%</td>

              <td>{candidate.status}</td>

              <td>
                  <a
                      href={candidate.resume_file}
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                      View Resume
                  </a>
              </td>
              
              <td>

                <button
                  onClick={() =>
                    navigate(`/review/${candidate.application_id}`)
                  }
                >
                  Review
                </button>

               <button
                  onClick={() =>
                      window.location.href = `mailto:${candidate.email}`
                  }
              >
                  Email Candidate
              </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </Layout>
  );
}