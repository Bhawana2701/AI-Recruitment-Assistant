// // UploadJD.jsx
import api from "../../api/api";
import Layout from "../../components/Layout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadJD() {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);

  const uploadJD = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("job_title", jobTitle);
    formData.append("company_name", companyName);
    formData.append("location", location);
    formData.append("file", file);

    try {
      await api.post("/upload-jd", formData);

      alert("Job Description uploaded successfully!");

      setJobTitle("");
      setCompanyName("");
      setLocation("");
      setFile(null);

      document.getElementById("jdFile").value = "";
    } catch (err) {
      console.log(err);
      alert("Upload failed");
    }
  };

  return (
    <Layout>

      <div className="dashboard-header">
        <h1>Upload Job Description</h1>
        <p>Create a new job description for candidates.</p>
      </div>

      <div className="upload-container">

        <form onSubmit={uploadJD} className="upload-form">

          <input
            type="text"
            placeholder="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <input
            id="jdFile"
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />

          <button type="submit">
            Upload JD
          </button>

        </form>

      </div>

    </Layout>
  );
}
// import api from "../../api/api";
// import Layout from "../../components/Layout";
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// export default function UploadJD() {

//   const navigate = useNavigate();
//   const [jobTitle, setJobTitle] = useState("");
//   const [companyName, setCompanyName] = useState("");
//   const [location, setLocation] = useState("");
//   const [file, setFile] = useState(null);
//   const [jobs, setJobs] = useState([]);

//   useEffect(() => {
//       fetchJobs();
//     }, []);

//     const deleteJD = async (id) => {

//       if (!window.confirm("Delete this Job Description?"))
//         return;

//       try {

//         await api.delete(
//           `/job-description/${id}`
//         );

//         fetchJobs();

//       } catch (err) {

//         console.log(err);
//         alert("Delete failed");

//       }
//     };

//   const fetchJobs = async () => {
//     try {
//       const res = await api.get("/job-descriptions");

//       console.log("Response:", res);
//       console.log("Status:", res.status);
//       console.log("Data:", res.data);

//       setJobs(res.data);

//     } catch (err) {
//       console.log("ERROR:", err);

//       if (err.response) {
//         console.log(err.response.data);
//       }
//     }
//   };
//   const uploadJD = async (e) => {
//     e.preventDefault();

//     const formData = new FormData();

//     formData.append("job_title", jobTitle);
//     formData.append("company_name", companyName);
//     formData.append("location", location);
//     formData.append("file", file);

//     try {
//       await api.post(
//         "/upload-jd",
//         formData
//       );

//       alert("Job Description uploaded successfully!");

//       fetchJobs();
//       setJobTitle("");
//       setCompanyName("");
//       setLocation("");
//       setFile(null);
      

//     } catch (err) {
//       console.log(err);
//       alert("Upload failed");
//     }

    
//   };
//   const editJD = async (job) => {

//     const jobTitle = prompt(
//       "Job Title",
//       job.job_title
//     );

//     if (!jobTitle) return;

//     const company = prompt(
//       "Company Name",
//       job.company_name
//     );

//     if (!company) return;

//     const location = prompt(
//       "Location",
//       job.location
//     );

//     if (!location) return;

//     try {

//       await api.put(
//         `/job-description/${job.id}`,
//         {
//           job_title: jobTitle,
//           company_name: company,
//           location: location
//         }
//       );

//       fetchJobs();

//     } catch (err) {

//       console.log(err);
//       alert("Update failed");

//     }
//   };

//   return (
//     <Layout>

//       <h1>Upload Job Description</h1>

//       <form onSubmit={uploadJD} className="upload-form">

//         <input
//           type="text"
//           placeholder="Job Title"
//           value={jobTitle}
//           onChange={(e)=>setJobTitle(e.target.value)}
//           required
//         />

//         <input
//           type="text"
//           placeholder="Company Name"
//           value={companyName}
//           onChange={(e)=>setCompanyName(e.target.value)}
//           required
//         />

//         <input
//           type="text"
//           placeholder="Location"
//           value={location}
//           onChange={(e)=>setLocation(e.target.value)}
//           required
//         />

//         <input
//           type="file"
//           onChange={(e)=>setFile(e.target.files[0])}
//           required
//         />

//         <button type="submit">
//           Upload JD
//         </button>

//       </form>

//       <hr style={{ margin: "40px 0" }} />

//         <h2>Uploaded Job Descriptions</h2>

//         <table className="resumes-table">
//           <thead>
//             <tr>
//               <th>Job Title</th>
//               <th>Company</th>
//               <th>Location</th>
//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {jobs.map((job) => (
//               <tr key={job.id}>
//                 <td>{job.job_title}</td>
//                 <td>{job.company_name}</td>
//                 <td>{job.location}</td>

//                 <td>
//                   <button
//                     onClick={() => navigate(`/job-description/${job.id}`)}
//                   >
//                     View
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//     </Layout>
//   );
// }