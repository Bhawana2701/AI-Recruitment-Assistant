//UploadResume.jsx
import { useState } from "react";
import api from "../../api/api";

export default function UploadResume() {

  const [candidateName, setCandidateName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState(null);

  const [matchData, setMatchData] = useState(null);

  const handleSubmit = async (e) => {

    e.preventDefault();

    const formData = new FormData();

    formData.append(
      "candidate_name",
      candidateName
    );

    formData.append(
      "email",
      email
    );

    formData.append(
      "file",
      file
    );

    try {

      // Upload Resume

      const response =
        await api.post(
          "/upload-resume",
          formData
        );

      console.log(
        "UPLOAD RESPONSE:",
        response.data
      );

      const resumeId =
        response.data.resume_id;

      // Get Matches

      const matchResponse =
        await api.get(
          `/match-resume/${resumeId}`
        );

      console.log("MATCH RESPONSE:");
      console.log(JSON.stringify(matchResponse.data, null, 2));

      setMatchData(matchResponse.data);

      console.log(
        "TOP MATCHES:",
        matchResponse.data.top_matches
      );

    } catch (error) {

      console.log(error);

      alert(
        "Upload failed"
      );

    }
  };

  return (
    <div className="container">

      <div className="card">

        <h1>
          Find your best-fit roles
        </h1>

        <p>
          Upload your resume and we'll match you to open roles
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <input
              type="text"
              placeholder="Full Name"
              value={candidateName}
              onChange={(e) =>
                setCandidateName(
                  e.target.value
                )
              }
            />

          </div>

          <div className="form-group">

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />

          </div>

          <div className="form-group upload-box">

            <input
              type="file"
              onChange={(e) =>
                setFile(
                  e.target.files[0]
                )
              }
            />

          </div>

          <button type="submit">
            Find My Matches →
          </button>

        </form>

        {/* MATCH RESULTS */}

          {
            matchData?.matches.top_matches?.length > 0 && (

            <div className="results-section">

              <h2>
                Your Best Matches
              </h2>

              {
                matchData?.matches.top_matches?.map(
                  (match, index) => (

                    <div
                      key={match.jd_id}
                      className="match-card"
                    >

                      <div className="card-header">

                        <div>

                          <p className="match-number">
                            MATCH #{index + 1}
                          </p>

                          <h3>
                            Python Backend Developer
                          </h3>

                        </div>

                        <div className="score-box">
                          <span className="score-number">
                            {match.match_percentage}%
                          </span>
                          <span className="score-label">
                            Match Score
                          </span>
                        </div>

                      </div>

                      <div
                        className={`badge ${
                          match.match_percentage >= 70
                            ? "good"
                            : match.match_percentage >= 50
                            ? "average"
                            : "poor"
                        }`}
                      >
                        {
                          match.match_percentage >= 85
                            ? "Strong Hire"
                            : match.match_percentage >= 70
                            ? "Consider"
                            : match.match_percentage >= 50
                            ? "Moderate Fit"
                            : "Low Fit"
                        }
                      </div>

                      <p className="summary">
                        Candidate shows good alignment
                        with the role based on skills
                        and experience.
                      </p>

                      {/* MATCHED SKILLS */}

                      <h4>
                        Matched Skills
                      </h4>

                      <div className="skills">

                        {
                          match.matched_skills.map(
                            (skill, i) => (

                              <span
                                key={i}
                                className="skill-tag"
                              >
                                ✓ {skill}
                              </span>

                            )
                          )
                        }

                      </div>

                      {/* FEEDBACK */}

                      <details>

                        <summary>
                          View Full Feedback
                        </summary>

                        <div className="feedback">

                          <h4>
                            Missing Skills
                          </h4>

                          <ul>

                            {
                              match.missing_skills.map(
                                (skill, i) => (

                                  <li key={i}>
                                    {skill}
                                  </li>

                                )
                              )
                            }

                          </ul>

                          <h4>
                            Recruiter Insights
                          </h4>

                          <p>

                            {
                              match.feedback?.recruiter_summary ||
                              "Feedback unavailable"
                            }

                          </p>

                        </div>

                      </details>

                    </div>

                  )
                )
              }

            </div>

          )
        }

      </div>

    </div>
  );
}
// import { useState } from "react";
// import api from "../../services/api";

// export default function UploadResume() {
//   const [candidateName, setCandidateName] = useState("");
//   const [email, setEmail] = useState("");
//   const [file, setFile] = useState(null);
//   //const [matches, setMatches] = useState([]);
//   const [matchData, setMatchData] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const formData = new FormData();

//     formData.append("candidate_name", candidateName);
//     formData.append("email", email);
//     formData.append("file", file);

//     try {
//       const response = await api.post(
//         "/upload-resume",
//         formData
//       );
//       console.log("UPLOAD RESPONSE:");
//       console.log(response.data);

//       const resumeId = response.data.resume_id;
//       console.log("Resume ID:", resumeId);
//       const matchResponse =
//         await api.get(
//           `/match-resume/${resumeId}`
//         );
//       console.log("MATCH RESPONSE:");
//       console.log(matchResponse.data);
   
//       setMatchData(matchResponse.data);
      
//     } catch (error) {
//       console.log(error);
//       alert("Upload failed");
//     }
//   };

//   return (
//     <div className="container">
//       <div className="card">

//         <h1>Find your best-fit roles</h1>

//         <p>
//           Upload your resume and we'll match you to open roles
//         </p>

//         <form onSubmit={handleSubmit}>

//           <div className="form-group">
//             <input
//               type="text"
//               placeholder="Full Name"
//               value={candidateName}
//               onChange={(e) =>
//                 setCandidateName(e.target.value)
//               }
//             />
//           </div>

//           <div className="form-group">
//             <input
//               type="email"
//               placeholder="Email Address"
//               value={email}
//               onChange={(e) =>
//                 setEmail(e.target.value)
//               }
//             />
//           </div>

//           <div className="form-group upload-box">
//             <input
//               type="file"
//               onChange={(e) =>
//                 setFile(e.target.files[0])
//               }
//             />
//           </div>

//           <button type="submit">
//             Find My Matches →
//           </button>

//         </form>
//           {
//   matches.length > 0 && (

//     <div style={{ marginTop: "30px" }}>

//       <h2>
//         Your Matches
//       </h2>

//       {
//         matches.map((match) => (

//           <div
//             key={match.jd_id}
//             style={{
//               border: "1px solid #ddd",
//               padding: "15px",
//               marginTop: "10px",
//               borderRadius: "10px"
//             }}
//           >

//             <h3>
//               Job ID: {match.jd_id}
//             </h3>

//             <p>
//               Match Score:
//               {" "}
//               {match.match_percentage}%
//             </p>

//           </div>

//         ))
//       }

//     </div>

//   )
// }
//       </div>
//     </div>
//   );
// }