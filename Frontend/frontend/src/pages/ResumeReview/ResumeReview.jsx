//ResumeReview.jsx
import Layout from "../../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/api";

export default function ResumeReview() {
  
  const navigate = useNavigate();
  const { id } = useParams();

  const [resume, setResume] = useState(null);

    useEffect(() => {
        fetchResume();
    }, []);

  const fetchResume = async () => {

    const res = await api.get(
      `/application/${id}`
    );

    setResume(res.data);

  };

  if (!resume)
    return <Layout>Loading...</Layout>;

  return (

    <Layout>

      <h1>Candidate Review</h1>

      <div className="review-card">

        <h2>{resume.candidate_name}</h2>

        <p>{resume.email}</p>

        <h3>
          Match Score :
          {resume.match_score}%
        </h3>

        <p>
            Status:
            <span className={`status ${resume.status}`}>
                {resume.status}
            </span>
        </p>
        <hr />

        <h3>Matched Skills</h3>

        <ul>

          {resume.matched_skills.map((skill) => (

            <li key={skill}>
              {skill}
            </li>

          ))}

        </ul>

        <h3>Missing Skills</h3>

        <ul>

          {resume.missing_skills.map((skill) => (

            <li key={skill}>
              {skill}
            </li>

          ))}

        </ul>

      </div>

    </Layout>

  );

}