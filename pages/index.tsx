import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { NextPage } from 'next';

interface Stat {
  label: string;
  value: number | string;
}

const Home: NextPage = () => {
  // Example statistics
  const stats: Stat[] = [
    { label: 'Active Rules', value: 0 },
    { label: 'Executions Today', value: 0 },
    { label: 'Success Rate', value: '100%' },
  ];

  return (
    <Layout title="Home">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Workflow Orchestrator</h1>
          <p className="text-xl text-gray-600">
            Create powerful automation workflows with a simple trigger-action interface
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="card text-center">
              <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
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