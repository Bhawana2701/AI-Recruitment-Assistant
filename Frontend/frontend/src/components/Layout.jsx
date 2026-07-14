//Layout.jsx
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="layout">

      <Sidebar />

      <div className="main-content">
        <Navbar />
        {children}

      </div>

    </div>
  );
}