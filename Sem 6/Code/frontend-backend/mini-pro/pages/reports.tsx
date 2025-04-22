import clientPromise from "../lib/mongodb";
import { GetServerSideProps } from 'next';
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Navbar from "../components/Navbar";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Report {
  _id: string;
  generated_on: string;
  report_type: string;
  total_threats: number;
  high_severity_count: number;
  resolved_count: number;
}

interface ReportsProps {
  reports: Report[];
}

const Reports: React.FC<ReportsProps> = ({ reports }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReports, setFilteredReports] = useState(reports);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Security Reports", 14, 16);
    autoTable(doc, {
      head: [
        [
          "Generated On",
          "Report Type",
          "Total Threats",
          "High Severity Count",
          "Resolved Count",
        ],
      ],
      body: filteredReports.map((report) => [
        format(new Date(report.generated_on), "yyyy-MM-dd"),
        report.report_type,
        report.total_threats,
        report.high_severity_count,
        report.resolved_count,
      ]),
      startY: 20,
    });
    doc.save("reports.pdf");
  };

  // Handle search and filtering
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const filtered = reports.filter((report) =>
      report.report_type.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredReports(filtered);
  };

  // Group similar report types together for better visualization
  const groupedReports = filteredReports.reduce((acc, report) => {
    const existing = acc.find((r) => r.report_type === report.report_type);
    if (existing) {
      existing.total_threats += report.total_threats;
    } else {
      acc.push({ ...report });
    }
    return acc;
  }, [] as Report[]);

  const data = {
    labels: groupedReports.map((report) => report.report_type),
    datasets: [
      {
        label: "Total Threats",
        data: groupedReports.map((report) => report.total_threats),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Threats Overview',
      },
    },
  };

  return (
    <>
    <div>
      <Navbar />
      </div>
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl font-extrabold mb-4 text-center text-teal-400">
        Security Reports
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        <small>(Latest 20 Reports)</small>
      </p>

      {/* Search and Download Button */}
      <div className="flex justify-between items-center mb-8">
        <input
          type="text"
          placeholder="Search by report type..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 rounded bg-gray-700 text-white border border-gray-500 focus:outline-none"
        />
        <button
          onClick={downloadPDF}
          className="px-4 py-2 rounded-md bg-teal-500 text-white font-bold hover:bg-teal-400 transition-all duration-300"
        >
          Download PDF
        </button>
      </div>

      {/* Chart Section */}
      <div className="mb-8 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl text-center font-semibold mb-4 text-teal-400">
          Threats Overview
        </h2>
        <div className="flex justify-center">
          <Bar data={data} options={options} />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div
            key={report._id}
            className="p-6 bg-gray-800 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
          >
            <h2 className="text-xl font-semibold mb-2 text-teal-400">
              Generated On: {format(new Date(report.generated_on), "PPP")}
            </h2>
            <h3 className="text-lg text-gray-300 mb-4">
              Type: {report.report_type}
            </h3>
            <p className="text-gray-500">Total Threats: {report.total_threats}</p>
            <p className="text-gray-500">
              High Severity Count: {report.high_severity_count}
            </p>
            <p className="text-gray-500">Resolved Count: {report.resolved_count}</p>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default Reports;

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const client = await clientPromise;
    const db = client.db("sample_mflix");
    const reports = await db
      .collection("reports")
      .find({})
      .sort({ metacritic: -1 })
      .limit(20)
      .toArray();
    return {
      props: { reports: JSON.parse(JSON.stringify(reports)) },
    };
  } catch (e) {
    console.error(e);
    return { props: { reports: [] } };
  }
};