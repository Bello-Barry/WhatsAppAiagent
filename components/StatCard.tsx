import React from 'react';
import { AgentStats } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  stats: AgentStats[];
}

const StatCard: React.FC<StatCardProps> = ({ stats }) => {
  const summary = stats.reduce(
    (acc, day) => {
      acc.totalSent += day.messages_sent;
      acc.totalReceived += day.messages_received;
      acc.totalResponseTime += day.avg_response_time_ms * day.messages_sent;
      return acc;
    },
    { totalSent: 0, totalReceived: 0, totalResponseTime: 0 }
  );

  const avgResponseTime = summary.totalSent > 0 ? (summary.totalResponseTime / summary.totalSent / 1000).toFixed(2) : 'N/A';
  
  const chartData = stats.map(s => ({
      name: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Sent: s.messages_sent,
      Received: s.messages_received,
  }));

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Usage Statistics (Last 7 Days)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 text-center">
        <div className="bg-gray-900 p-4 rounded-lg">
          <p className="text-sm text-dark-text-secondary">Messages Sent</p>
          <p className="text-2xl font-bold text-brand-primary">{summary.totalSent}</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <p className="text-sm text-dark-text-secondary">Messages Received</p>
          <p className="text-2xl font-bold text-blue-400">{summary.totalReceived}</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <p className="text-sm text-dark-text-secondary">Avg. Response Time</p>
          <p className="text-2xl font-bold text-yellow-400">{avgResponseTime}s</p>
        </div>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }}/>
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Line type="monotone" dataKey="Sent" stroke="#25D366" strokeWidth={2} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="Received" stroke="#60A5FA" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatCard;