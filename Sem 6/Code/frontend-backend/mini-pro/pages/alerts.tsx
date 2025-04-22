import clientPromise from "../lib/mongodb";
import { GetServerSideProps } from "next";
import { useState, useMemo } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import Navbar from '../components/Navbar';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface Alert {
  _id: string;
  timestamp: string;
  status: string;
}

interface AlertsProps {
  alerts: Alert[];
}

// Status color mapping function
const getStatusColor = (status: string) => {
  switch (status) {
    case "received":
      return { label: "Received", color: "bg-green-500" };
    case "sent":
      return { label: "Sent", color: "bg-blue-500" };
    case "blocked":
      return { label: "Blocked", color: "bg-red-500" };
    default:
      return { label: "Unknown", color: "bg-gray-500" };
  }
};

const AlertsPage: React.FC<AlertsProps> = ({ alerts }) => {
  const [filter, setFilter] = useState<string>("all");

  // Filtered alerts based on the selected filter option
  const filteredAlerts = useMemo(() => {
    if (filter === "all") return alerts;
    return alerts.filter((alert) => alert.status === filter);
  }, [filter, alerts]);

  // Data for the Pie Chart
  const statusCounts = alerts.reduce(
    (acc, alert) => {
      acc[alert.status] = (acc[alert.status] || 0) + 1;
      return acc;
    },
    {} as { [key: string]: number }
  );

  const pieData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: ["#34D399", "#3B82F6", "#EF4444", "#9CA3AF"],
      },
    ],
  };

  return (
    <>
    <div>
      <Navbar />
    </div>
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl font-extrabold text-center mb-6 text-teal-400">
        Threat Alert
      </h1>
      

      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        {["all", "received", "sent", "blocked", "unknown"].map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filter === status ? "bg-teal-500" : "bg-gray-700"
            } hover:bg-teal-600 transition`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Alert Cards */}
        <div>
          <h2 className="text-2xl font-bold text-teal-400 mb-4">
            Filtered Alerts
          </h2>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const { label, color } = getStatusColor(alert.status);
              return (
                <div
                  key={alert._id}
                  className="p-6 bg-gray-800 rounded-lg shadow-lg hover:scale-105 transform transition duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold text-white ${color}`}
                    >
                      {label}
                    </span>
                    <span className="text-sm text-gray-400">
                      {alert.timestamp}
                    </span>
                  </div>
                  <p className="text-lg text-white font-semibold">
                    Threat ID: {alert._id}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-teal-400 mb-4 text-center">
            Alert Status Distribution
          </h2>
          <Pie data={pieData} />
        </div>
      </div>
    </div>
    </>
  );
};

export default AlertsPage;

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const client = await clientPromise;
    const db = client.db("sample_mflix");

    const alerts = await db
      .collection("alerts")
      .find({})
      .sort({ metacritic: -1 })
      .limit(20)
      .toArray();

    return {
      props: { alerts: JSON.parse(JSON.stringify(alerts)) },
    };
  } catch (e) {
    console.error(e);
    return { props: { alerts: [] } };
  }
};
