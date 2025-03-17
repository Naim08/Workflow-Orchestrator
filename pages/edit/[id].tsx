import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '../../components/Layout';
import RuleBuilder from '../../components/RuleBuilder/RuleBuilder';
import { Rule } from '../../types';

export default function EditRulePage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [rule, setRule] = useState<Rule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch the rule when the ID is available
  useEffect(() => {
    if (!id) return;
    
    const fetchRule = async () => {
      try {
        setLoading(true);
        const response = await axios.get<any>(`/api/rules/${id}`);
        console.log('Fetched rule:', response.data);
        setRule(response.data.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch rule:', err);
        setError(err.response?.data?.error || 'Failed to fetch rule');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRule();
  }, [id]);
  
  const handleUpdateSuccess = () => {
    router.push('/rules');
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit Rule</h1>
          <p className="text-gray-600">Modify your automation rule</p>
        </div>
        
        {loading ? (
          <div className="text-center py-8">Loading rule...</div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            Error: {error}
          </div>
        ) : rule ? (
          <RuleBuilder 
            initialRule={rule} 
            isEditing={true}
            onSuccess={handleUpdateSuccess}
          />
        ) : (
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
            Rule not found.
          </div>
        )}
      </div>
    </Layout>
  );
}