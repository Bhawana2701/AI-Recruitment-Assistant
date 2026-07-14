// //Dashboard.jsx

import Layout from "../../components/Layout";
import StatsCard from "../../components/StatsCard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import api from "../../api/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Briefcase,
  Users,
  UserCheck,
  TrendingUp
} from "lucide-react";
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
  fetchDashboard();
}, []);

const fetchDashboard = async () => {
  try {
    const res = await api.get("/dashboard");

    setStats(res.data.stats);
    setChartData(res.data.chartData);
    setPieData(res.data.pieData);

  } catch (err) {
    console.error(err);
    setError("Failed to load dashboard.");
  } finally {
    setLoading(false);
  }
};
  const COLORS = [
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#f59e0b", // Orange
  "#8b5cf6", // Purple
];


  return (
    <Layout>

      <div className="dashboard-header">
        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "15px"
            }}
          >
            {error}
          </div>
        )}
        <h1>Welcome back, Recruiter 👋</h1>
        <p>Here's what's happening with your recruitment process today.</p>
      </div>

      <div className="top-actions">

        <input
          type="date"
          className="date-picker"
        />

        <button
          className="upload-jd-btn"
          onClick={() => navigate("/upload-jd")}
        >
          + Upload JD
        </button>

      </div>

      <div className="stats-grid">

        <StatsCard
          title="Open Roles"
          value={stats.total_jds || 0}
          icon={<Briefcase />}
        />

        <StatsCard
          title="Applications"
          value={stats.applications || 0}
          icon={<Users />}
        />

        <StatsCard
          title="Shortlisted"
          value={stats.shortlisted || 0}
          icon={<UserCheck />}
        />

        <StatsCard
          title="Avg Match"
          value={`${stats.avg_score || 0}%`}
          icon={<TrendingUp />}
        />

      </div>

      <div className="charts-grid">

          <div className="chart-card">
            <h3>Top Resume Match Scores</h3>

            {loading ? (
              <p>Loading chart...</p>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>Loading...</p>
            )}
          </div>

        <div className="status-wrapper">
                <h3>Resumes by Status</h3>

                {loading ? (
                  <p>Loading chart...</p>
                ) : pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p>Loading Status...</p>
                )}

                <div className="status-list">
                  {pieData.map((item, index) => (
                      <div
                        key={item.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "10px"
                        }}
                      >
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                      <span>
                        {item.name} ({item.value})
                      </span>
                  </div>
                  ))}
                </div>
</div>
</div>
    </Layout>
  );
}











