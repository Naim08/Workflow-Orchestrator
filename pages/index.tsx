// pages/index.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import DashboardStats from '../components/Dashboard/DashboardStats';
import axios from 'axios';
import { NextPage } from 'next';

interface DashboardStatsData {
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

const Home: NextPage = () => {
  const [statsData, setStatsData] = useState<DashboardStatsData>({
    activeRules: 0,
    executionsToday: 0,
    successRate: '0%',
    recentActivity: [],
    dlq: {
      total: 0,
      resolved: 0,
      pending: 0
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get<DashboardStatsData>('/api/dashboard/stats');
        setStatsData(response.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout title="Home">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Workflow Orchestrator</h1>
          <p className="text-xl text-gray-600">
            Create powerful automation workflows with a simple trigger-action interface
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="mb-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="card">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="card p-4 text-center">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-blue-500 underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <DashboardStats 
              activeRules={statsData.activeRules} 
              executionsToday={statsData.executionsToday} 
              successRate={statsData.successRate}
              recentActivity={statsData.recentActivity}
              dlq={statsData.dlq}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="card">
            <h2 className="text-xl font-bold mb-3">Create New Workflow</h2>
            <p className="text-gray-600 mb-4">
              Define automation rules with triggers and actions to streamline your processes.
            </p>
            <Link href="/create" className="btn btn-primary w-full">
              + Create Rule
            </Link>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-bold mb-3">Simulate Triggers</h2>
            <p className="text-gray-600 mb-4">
              Test your automation rules by simulating trigger events.
            </p>
            <Link href="/simulate" className="btn btn-outline w-full">
              Go to Simulator
            </Link>
          </div>
        </div>

        <div className="card mb-12">
          <h2 className="text-xl font-bold mb-3">Getting Started</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-md bg-gray-50 border border-gray-200">
              <h3 className="font-medium mb-2">1. Create a rule</h3>
              <p className="text-gray-600">
                Define a trigger event, an action to perform, and optionally set a delay.
              </p>
            </div>
            
            <div className="p-4 rounded-md bg-gray-50 border border-gray-200">
              <h3 className="font-medium mb-2">2. Use AI to help</h3>
              <p className="text-gray-600">
                Describe what you want to automate in plain English, and our AI will help create the rule.
              </p>
            </div>
            
            <div className="p-4 rounded-md bg-gray-50 border border-gray-200">
              <h3 className="font-medium mb-2">3. Test your workflows</h3>
              <p className="text-gray-600">
                Use the simulator to verify that your rules work as expected before deploying.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;