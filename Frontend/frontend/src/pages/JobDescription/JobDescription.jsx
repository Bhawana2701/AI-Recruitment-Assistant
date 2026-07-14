//JobDescription.jsx
import Layout from "../../components/Layout";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/api";

export default function JobDescription() {

  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
      try {

          const res = await api.get(`/job-description/${id}`);

          if (res.data.error) {
              setError(res.data.error);
              return;
          }

          setJob(res.data);

      } catch (err) {

          console.error(err);
          setError("Failed to load job description.");

      } finally {

          setLoading(false);

      }
  };

  if (loading) {
      return (
          <Layout>
              <h2>Loading...</h2>
          </Layout>
      );
  }

  if (error) {
      return (
          <Layout>
              <h2 style={{ color: "red" }}>
                  {error}
              </h2>
          </Layout>
      );
  }

  return (
    <Layout>

      <div className="review-card">

        <h1>{job.job_title}</h1>

        <h3>{job.company_name}</h3>

        <p>{job.location}</p>

        <hr />

        <h3>Job Description</h3>

        <div
          style={{
            whiteSpace: "pre-wrap",
            lineHeight: "1.8"
          }}
        >
          {job.jd_text}
        </div>

      </div>

    </Layout>
  );
}