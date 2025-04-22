import React, { useState } from 'react';
import { FileText, Eye, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface AnalyzedLog {
  id: string;
  dateAnalyzed: string;
  analysis: string;
  logData: string;
  details: {
    status: string;
    message: string;
    anomalies_detected: boolean;
    anomalies: string;
    recommendations: string;
  };
}

function LogAnalysis() {
  const [logData, setLogData] = useState<string>('');
  const [analyzedLogs, setAnalyzedLogs] = useState<AnalyzedLog[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AnalyzedLog | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeLogWithAI = async (logData: string) => {
    try {
      const response = await fetch('/api/analyze-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logData }),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (data.status) {
        return data;
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error analyzing log:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError(null);

    try {
      console.log('Analyzing log:', logData);
      const analysisData = await analyzeLogWithAI(logData);
      console.log("Analysis", analysisData);
      const newLog: AnalyzedLog = {
        id: Math.random().toString(36).substr(2, 9),
        dateAnalyzed: new Date().toISOString(),
        analysis: analysisData.message,
        logData,
        details: analysisData
      };

      setAnalyzedLogs(prev => [newLog, ...prev]);
      
      // Reset log data
      setLogData('');
    } catch (error) {
      setError('Error processing log. Please try again.');
      console.error('Error processing log:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLogData(e.target.value);
  };

  const downloadPDF = (log: AnalyzedLog) => {
    const doc = new jsPDF();
    doc.text('Log Analysis Report', 14, 16);
    doc.autoTable({
      startY: 20,
      head: [['Field', 'Value']],
      body: [
        ['Log Data', log.logData],
        ['Date Analyzed', new Date(log.dateAnalyzed).toLocaleString()],
        ['Status', log.details.status],
        ['Message', log.details.message],
        ['Anomalies Detected', log.details.anomalies_detected ? 'Yes' : 'No'],
        ['Anomalies', log.details.anomalies],
        ['Recommendations', log.details.recommendations]
      ],
    });
    doc.save(`log-analysis-${log.id}.pdf`);
  };

  return (
    <Layout>
      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Log Analysis</h1>
          
          {/* Log Entry Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Submit Log Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Log Data</label>
                <textarea
                  name="logData"
                  value={logData}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={6}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Log'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Analysis Result */}
        {analyzedLogs.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Analysis Result</h2>
            <div className="mb-4">
              <h3 className="text-md font-medium text-gray-700">Status: <span className={`text-${analyzedLogs[0].details.status === 'success' ? 'green' : 'red'}-600`}>{analyzedLogs[0].details.status}</span></h3>
              <p className="text-sm text-gray-600">{analyzedLogs[0].details.message}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-md font-medium text-gray-700">Anomalies Detected: <span className={`text-${analyzedLogs[0].details.anomalies_detected ? 'red' : 'green'}-600`}>{analyzedLogs[0].details.anomalies_detected ? 'Yes' : 'No'}</span></h3>
              {analyzedLogs[0].details.anomalies_detected && (
                <p className="text-sm text-gray-600">{analyzedLogs[0].details.anomalies}</p>
              )}
            </div>
            <div className="mb-4">
              <h3 className="text-md font-medium text-gray-700">Recommendations:</h3>
              <p className="text-sm text-gray-600">{analyzedLogs[0].details.recommendations}</p>
            </div>
            <button
              onClick={() => downloadPDF(analyzedLogs[0])}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Download PDF
            </button>
          </div>
        )}

        {/* Recent Logs Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden mt-8">
          <div className="px-4 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Analyses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Log Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Analyzed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyzedLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{log.logData}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.dateAnalyzed).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analysis Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Analysis Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Log Data</h4>
                  <p className="mt-1">{selectedLog.logData}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">AI Analysis</h4>
                  <ReactMarkdown className="mt-1 text-sm text-gray-600">{selectedLog.analysis}</ReactMarkdown>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Analyzed On</h4>
                  <p className="mt-1">{new Date(selectedLog.dateAnalyzed).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Anomalies Detected</h4>
                  {selectedLog.details.anomalies_detected ? (
                    <p className="text-sm text-gray-600">{selectedLog.details.anomalies}</p>
                  ) : (
                    <p className="text-sm text-gray-600">No anomalies detected.</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Recommendations</h4>
                  <p className="text-sm text-gray-600">{selectedLog.details.recommendations}</p>
                </div>
                <button
                  onClick={() => downloadPDF(selectedLog)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default LogAnalysis;