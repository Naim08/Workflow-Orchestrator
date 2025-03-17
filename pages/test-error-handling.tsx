import React, { useState } from 'react';
import { NextPage } from 'next';
import Layout from '../components/Layout';
import axios from 'axios';

const TestErrorHandlingPage: NextPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [selectedTest, setSelectedTest] = useState<string>('end-to-end');
  const [ruleId, setRuleId] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');
  
  const runTest = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const params: any = { scenario: selectedTest };
      
      if (selectedTest === 'trigger-failing-rule' && ruleId) {
        params.ruleId = ruleId;
      }
      
      if (selectedTest === 'retry-dlq-item' && itemId) {
        params.itemId = itemId;
      }
      
      const response = await axios.post('/api/test/error-handling', params);
      setResult(response.data);
    } catch (error: any) {
      setResult({
        error: true,
        message: error.response?.data?.error || error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout title="Test Error Handling">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Error Handling & DLQ</h1>
        
        <div className="card mb-6">
          <h2 className="text-lg font-medium mb-4">Run Tests</h2>
          
          <div className="mb-4">
            <label className="label">Select Test</label>
            <select 
              value={selectedTest} 
              onChange={(e) => setSelectedTest(e.target.value)}
              className="select"
            >
              <option value="end-to-end">End-to-End Test</option>
              <option value="create-failing-rule">Create Failing Rule</option>
              <option value="trigger-failing-rule">Trigger Failing Rule</option>
              <option value="list-dlq">List DLQ Items</option>
              <option value="process-dlq">Process All DLQ Items</option>
              <option value="retry-dlq-item">Retry Specific DLQ Item</option>
            </select>
          </div>
          
          {selectedTest === 'trigger-failing-rule' && (
            <div className="mb-4">
              <label className="label">Rule ID</label>
              <input 
                type="text" 
                value={ruleId} 
                onChange={(e) => setRuleId(e.target.value)}
                className="input" 
                placeholder="Enter rule ID" 
              />
            </div>
          )}
          
          {selectedTest === 'retry-dlq-item' && (
            <div className="mb-4">
              <label className="label">DLQ Item ID</label>
              <input 
                type="text" 
                value={itemId} 
                onChange={(e) => setItemId(e.target.value)}
                className="input" 
                placeholder="Enter DLQ item ID" 
              />
            </div>
          )}
          
          <button 
            className="btn btn-primary" 
            onClick={runTest}
            disabled={loading}
          >
            {loading ? 'Running Test...' : 'Run Test'}
          </button>
        </div>
        
        {result && (
          <div className="card">
            <h2 className="text-lg font-medium mb-4">Test Results</h2>
            
            {result.error ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-md">
                <h3 className="font-medium">Error:</h3>
                <p>{result.message}</p>
              </div>
            ) : (
              <div>
                <div className="p-4 bg-green-50 text-green-700 rounded-md mb-4">
                  <h3 className="font-medium">Success!</h3>
                  {result.message && <p>{result.message}</p>}
                  {result.completedSuccessfully !== undefined && (
                    <p>
                      End-to-end test: 
                      {result.completedSuccessfully 
                        ? ' Completed successfully!' 
                        : ' Failed to complete successfully'}
                    </p>
                  )}
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Raw Result:</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-xs">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TestErrorHandlingPage;