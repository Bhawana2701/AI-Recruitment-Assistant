import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import api from "../../api/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Reports() {

  const [report, setReport] = useState({
    status_data: [],
    average_score: 0,
    highest_score: 0,
    lowest_score: 0
  });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await api.get(
        "/reports"
      );

      setReport(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  const colors = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6"
  ];

  return (
    <Layout>

      <h1>Recruitment Reports</h1>

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Average Score</h3>
          <h2>{report.average_score}%</h2>
        </div>

        <div className="stat-card">
          <h3>Highest Score</h3>
          <h2>{report.highest_score}%</h2>
        </div>

        <div className="stat-card">
          <h3>Lowest Score</h3>
          <h2>{report.lowest_score}%</h2>
        </div>

      </div>

      <div className="chart-card">

        <h3>Resumes by Status</h3>

        <ResponsiveContainer width="100%" height={350}>

          <PieChart>

            <Pie
              data={report.status_data}
              dataKey="count"
              nameKey="status"
              outerRadius={120}
              label
            >

              {report.status_data.map((entry, index) => (

                <Cell
                  key={index}
                  fill={colors[index % colors.length]}
                />

              ))}

            </Pie>

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </Layout>
  );
}