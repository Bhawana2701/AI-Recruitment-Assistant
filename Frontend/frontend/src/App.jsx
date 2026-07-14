//App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Recruiter/Dashboard";
import Interviews from "./pages/Recruiter/Interviews";
import Shortlisted from "./pages/Recruiter/Shortlisted";

import About from "./pages/Recruiter/About";
import UploadResume from "./pages/Candidate/UploadResume";
import UploadJD from "./pages/UploadJD/UploadJD";
import Resumes from "./pages/Resumes/Resumes";
import ResumeReview from "./pages/ResumeReview/ResumeReview";
import Interview from "./pages/Interview/Interview";
import Reports from "./pages/Reports/Reports";
import JobDescription from "./pages/JobDescription/JobDescription";
import Jobs from "./pages/Recruiter/Jobs";
import AIInterview from "./pages/AIInterview/AIInterview";
import InterviewReport from "./pages/InterviewReport/InterviewReport";


export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/apply"
          element={<UploadResume />}
        />

        <Route 
          path="/" 
          element={<Dashboard />} 
        />
        
        <Route 
          path="/interviews" 
          element={<Interviews />} 
        />
        
        <Route 
          path="/shortlisted" 
          element={<Shortlisted />} 
        />

        <Route 
          path="/upload-jd" 
          element={<UploadJD />} 
        />
        
        <Route 
          path="/about" 
          element={<About />} 
        />

        <Route
            path="/resumes"
            element={<Resumes />}
        />

        <Route
            path="/review/:id"
            element={<ResumeReview />}
        />

        <Route
            path="/interview/:id"
            element={<Interview />}
        />

        <Route 
            path="/reports" 
            element={<Reports />} 
        />

        <Route
          path="/job-description/:id"
          element={<JobDescription />}
        />
        
        <Route 
            path="/jobs" 
            element={<Jobs />} 
        />

        <Route
            path="/ai-interview/:token"
            element={<AIInterview />}
        />

        <Route
            path="/interview-report/:applicationId"
            element={<InterviewReport />}
        />
                
      </Routes>
    </BrowserRouter>
  );
}
