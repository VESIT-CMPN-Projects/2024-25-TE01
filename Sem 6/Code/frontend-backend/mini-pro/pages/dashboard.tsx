import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import clientPromise from '@/lib/mongodb';
import { Search, Shield, Activity, Network, AlertTriangle, Clock, Filter } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Chart, ArcElement, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';
import Layout from '@/components/Layout';

// Register the required elements
Chart.register(ArcElement, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

// Dynamically import Chart.js to render charts
const Pie = dynamic(() => import('react-chartjs-2').then((mod) => mod.Pie), { ssr: false });
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), { ssr: false });

interface FilterState {
  startDate: string;
  endDate: string;
  protocol: string;
  sourceIp: string;
}

interface TimeSeriesLog {
  timestamp: string;
  metadata: {
    destination_ip: string;
    protocol: string;
    source_ip: string;
  };
  flow_bytes_per_second: number;
  flow_packets_per_second: number;
}

interface LogEntry {
  _id: string;
  source_ip: string;
  destination_ip: string;
  protocol: string;
  timestamp: string;
  flow_duration: number;
  flow_bytes_per_second: number;
  flow_packets_per_second: number;
}

interface DashboardProps {
  totalLogs: number;
  mostRecentLog: string;
  protocolDistribution: Record<string, number>;
  timeSeriesData: {
    timestamps: string[];
    flowPacketsPerSecond: number[];
  };
  logEntries: LogEntry[];
}

function Dashboard({ totalLogs, mostRecentLog, protocolDistribution, timeSeriesData, logEntries }: DashboardProps) {
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    protocol: '',
    sourceIp: '',
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const stats = {
    totalAlerts: 1234,
    activeThreats: 23,
    avgResponseTime: '1.2s',
    threatLevel: 'Medium',
  };

  const protocolLabels = Object.keys(protocolDistribution);
  const protocolCounts = Object.values(protocolDistribution);

  const pieData = {
    labels: protocolLabels,
    datasets: [
      {
        data: protocolCounts,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  const lineData = {
    labels: timeSeriesData.timestamps.slice(0, 20),
    datasets: [
      {
        label: 'Flow Packets Per Second',
        data: timeSeriesData.flowPacketsPerSecond.slice(0, 20),
        borderColor: '#36A2EB',
        fill: false,
      },
    ],
  };

  return (
    <Layout>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Network Security Dashboard</h1>
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white shadow-md p-4 mb-6 max-w-7xl mx-auto mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="datetime-local"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="datetime-local"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Protocol</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={filters.protocol}
                onChange={(e) => setFilters({ ...filters, protocol: e.target.value })}
              >
                <option value="">All Protocols</option>
                <option value="UDP">UDP</option>
                <option value="TCP">TCP</option>
                <option value="IMAP">IMAP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Source IP</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter IP address"
                value={filters.sourceIp}
                onChange={(e) => setFilters({ ...filters, sourceIp: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAlerts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Threats</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeThreats}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.avgResponseTime}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Network className="h-8 w-8 text-indigo-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Threat Level</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.threatLevel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Network Traffic Analysis</h3>
            <Line data={lineData} />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Protocol Distribution</h3>
            <Pie data={pieData} />
          </div>
        </div>

        {/* Recent Logs Table */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Network Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source IP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination IP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protocol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flow Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logEntries.slice(0, 8).map((log) => (
                  <tr key={log._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.source_ip}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.destination_ip}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.protocol}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.flow_bytes_per_second} B/s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const client = await clientPromise;
  const db = client.db('test');

  // Fetch all log entries
  const logEntries = await db.collection('log_entries').find({}).toArray();

  // Convert ObjectId to string
  const serializedLogEntries = logEntries.map((log) => ({
    ...log,
    _id: log._id.toString(),
  }));

  // Quick stats
  const totalLogs = logEntries.length;
  const mostRecentLog = logEntries
    .map((log) => new Date(log.timestamp))
    .sort((a, b) => b.getTime() - a.getTime())[0]
    ?.toISOString() || '';

  // Protocols distribution
  const protocolDistribution = logEntries.reduce((acc: Record<string, number>, log) => {
    const protocol = log.protocol || 'Unknown';
    acc[protocol] = (acc[protocol] || 0) + 1;
    return acc;
  }, {});

  // Prepare time series data for the line chart
  const timeSeriesLogs = await db.collection('time_series_logs').find({}).toArray();
  const timeSeriesData = {
    timestamps: timeSeriesLogs.map((log) => new Date(log.timestamp).toISOString()).slice(0, 20),
    flowPacketsPerSecond: timeSeriesLogs
      .map((log) => log.flow_packets_per_second ?? 0) // Replace undefined with 0
      .slice(0, 20),
  };

  return {
    props: {
      totalLogs,
      mostRecentLog,
      protocolDistribution,
      timeSeriesData,
      logEntries: serializedLogEntries,
    },
  };
};

export default Dashboard;