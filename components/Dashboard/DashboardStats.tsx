// components/Dashboard/DashboardStats.tsx
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface DashboardStatsProps {
  activeRules: number;
  executionsToday: number;
  successRate: string;
  recentActivity?: Array<{
    date: string;
    executions: number;
    successes: number;
  }>;
  dlq?: {
    total: number;
    resolved: number;
    pending: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  activeRules,
  executionsToday,
  successRate,
  recentActivity = [],
  dlq = { total: 0, resolved: 0, pending: 0 }
}) => {
  return (
    <div className="space-y-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-gray-800">{activeRules}</div>
          <div className="text-sm text-gray-500">Active Rules</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-gray-800">{executionsToday}</div>
          <div className="text-sm text-gray-500">Executions Today</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-gray-800">{successRate}</div>
          <div className="text-sm text-gray-500">Success Rate</div>
        </div>
      </div>
      
      {/* Dead Letter Queue Stats Card (if there are any items) */}
      {dlq.total > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-medium mb-4">Dead Letter Queue</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">{dlq.total}</div>
              <div className="text-sm text-gray-500">Total Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{dlq.resolved}</div>
              <div className="text-sm text-gray-500">Resolved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-500">{dlq.pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${dlq.total > 0 ? (dlq.resolved / dlq.total * 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Activity Chart */}
      {recentActivity.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Recent Execution Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={recentActivity}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="executions" fill="#4F46E5" name="Total Executions" />
                <Bar dataKey="successes" fill="#10B981" name="Successful Executions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;