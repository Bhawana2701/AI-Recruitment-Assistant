// //Sidebar.jsx
import {
  FaHome,
  FaChartBar,
  FaUsers,
  FaCalendarAlt,
  FaUpload,
  FaInfoCircle
} from "react-icons/fa";


// import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { FaFileAlt } from "react-icons/fa";
export default function Sidebar() {
  return (
    <aside className="sidebar">

      <h2 className="logo">
        AI Recruiter
      </h2>

      <nav>

        <NavLink to="/">
          <FaHome />
          Dashboard
        </NavLink>

        <NavLink to="/upload-jd">
          <FaUpload />
          Upload JD
        </NavLink>

        <NavLink to="/jobs">
            <FaChartBar />
            Jobs
        </NavLink>

        <NavLink to="/shortlisted">
          <FaUsers />
          Shortlisted
        </NavLink>

        <NavLink to="/interviews">
          <FaCalendarAlt />
          Interviews
        </NavLink>

        <NavLink to="/resumes">
            <FaFileAlt />
            Resumes
        </NavLink>

        <NavLink to="/reports">
        📊 Reports
        </NavLink>

        <NavLink to="/settings">
        ⚙️ Settings
        </NavLink>

        <NavLink to="/about">
          <FaInfoCircle />
          About
        </NavLink>

      </nav>

    </aside>
  );
}