import React from 'react';
import { NextPage } from 'next';
import Layout from '../components/Layout';
import ApiKeyForm from '../components/Settings/ApiKeyForm';

const Settings: NextPage = () => {
  return (
    <Layout title="Settings">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          <ApiKeyForm />
          
          <div className="card">
            <h2 className="text-lg font-medium mb-4">About</h2>
            <p className="text-gray-600 mb-3">
              Workflow Orchestrator is a minimal tool for creating and managing automation rules by SuiteOp.
            </p>
            <p className="text-sm text-gray-500">
              Version 0.1.5
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;