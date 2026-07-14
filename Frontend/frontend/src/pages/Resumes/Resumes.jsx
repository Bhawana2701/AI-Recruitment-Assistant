//Resumes.jsxF
import { useEffect, useState } from "react";
import api from "../../api/api";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";


export default function Resumes() {

  const [resumes, setResumes] = useState([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {

    const res = await api.get(
      "/applications"
    );

    setResumes(res.data);
  };

  return (
    <Layout>

      <h1>Resumes</h1>

      <table className="resumes-table">

        <thead>

          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Match</th>
            <th>Status</th>
            <th>Resume</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          {resumes.map((resume) => (

            <tr key={resume.application_id}>

              <td>{resume.candidate_name}</td>

              <td>{resume.email}</td>

              <td>{resume.match_score}%</td>

              <td>{resume.status}</td>

              <td>
                <a
                    href={resume.resume_file}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View Resume
                </a>
              </td>

              <td>

                <button
                    onClick={() =>
                        navigate(`/review/${resume.application_id}`)
                    }
                >
                    Review
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </Layout>
  );
}