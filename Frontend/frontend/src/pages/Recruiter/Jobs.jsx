import Layout from "../../components/Layout";
import api from "../../api/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Jobs() {

  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/job-descriptions");
      setJobs(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteJD = async (id) => {

    if (!window.confirm("Delete this Job Description?"))
      return;

    try {

      await api.delete(`/job-description/${id}`);

      fetchJobs();

    } catch (err) {

      console.log(err);
      alert("Delete failed");

    }

  };

  const editJD = async (job) => {

    const jobTitle = prompt(
      "Job Title",
      job.job_title
    );

    if (!jobTitle) return;

    const company = prompt(
      "Company Name",
      job.company_name
    );

    if (!company) return;

    const location = prompt(
      "Location",
      job.location
    );

    if (!location) return;

    try {

      await api.put(`/job-description/${job.id}`, {
        job_title: jobTitle,
        company_name: company,
        location: location,
      });

      fetchJobs();

    } catch (err) {

      console.log(err);
      alert("Update failed");

    }

  };

  return (

    <Layout>

      <div className="page-header">

        <div>

          <h1>Job Descriptions</h1>

          <p>
            Manage all uploaded job descriptions.
          </p>

        </div>

        <button
          className="upload-jd-btn"
          onClick={() => navigate("/upload-jd")}
        >
          + Upload New Job
        </button>

      </div>

      <table className="resumes-table">

        <thead>

          <tr>

            <th>Job Title</th>

            <th>Company</th>

            <th>Location</th>

            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {jobs.map((job) => (

            <tr key={job.id}>

              <td>{job.job_title}</td>

              <td>{job.company_name}</td>

              <td>{job.location}</td>

              <td>

                <button
                  onClick={() =>
                    navigate(`/job-description/${job.id}`)
                  }
                >
                  View
                </button>

                <button
                  style={{
                    marginLeft: 10,
                    background: "#f59e0b",
                  }}
                  onClick={() => editJD(job)}
                >
                  Edit
                </button>

                <button
                  style={{
                    marginLeft: 10,
                    background: "#ef4444",
                  }}
                  onClick={() => deleteJD(job.id)}
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </Layout>

  );

}