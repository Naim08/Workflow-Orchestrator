import React from 'react';
import { NextPage } from 'next';
import Layout from '../components/Layout';
import DeadLetterQueueViewer from '../components/DeadLetterQueue/DeadLetterQueueViewer';
import AsyncErrorBoundary from '../components/AsyncErrorBoundary';

const DeadLetterQueuePage: NextPage = () => {
  return (
    <Layout title="Dead Letter Queue">
      <AsyncErrorBoundary>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Dead Letter Queue</h1>
          
          <div className="mb-6">
            <p className="text-gray-600">
              The dead letter queue contains failed actions that could not be executed. 
              You can retry these actions manually or delete them if they are no longer needed.
            </p>
          </div>
          
          <div className="card">
            <DeadLetterQueueViewer />
          </div>
        </div>
      </AsyncErrorBoundary>
    </Layout>
  );
};

export default DeadLetterQueuePage;