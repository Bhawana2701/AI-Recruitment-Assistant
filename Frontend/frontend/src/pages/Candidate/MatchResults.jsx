//MatchResults.jsx
import { useState } from "react";
import api from "../../api/api";

function MatchResume() {
  const [resumeId, setResumeId] = useState("");
  const [matches, setMatches] = useState([]);

  const handleMatch = async () => {
    try {
      const res = await api.get(
        `/match-resume/${resumeId}`
      );

      setMatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Match Resume</h2>

      <input
        type="number"
        placeholder="Enter Resume ID"
        value={resumeId}
        onChange={(e) => setResumeId(e.target.value)}
      />

      <button onClick={handleMatch}>
        Find Matches
      </button>

      {matches.length > 0 && (
        <div>
          Results Loaded
        </div>
      )}
    </div>
  );
}

export default MatchResume;