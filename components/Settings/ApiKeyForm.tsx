import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';

interface ApiKeyStatusResponse {
  hasKey: boolean;
}

const ApiKeyForm: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [hasSavedKey, setHasSavedKey] = useState<boolean>(false);

  // Check if an API key is already saved
  useEffect(() => {
    const checkApiKey = async (): Promise<void> => {
      try {
        const response = await axios.get<ApiKeyStatusResponse>('/api/settings/apiKey');
        setHasSavedKey(response.data.hasKey);
        // We don't retrieve the actual key value for security reasons
      } catch (err) {
        console.error('Error checking API key status:', err);
      }
    };

    checkApiKey();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.post('/api/settings/apiKey', { apiKey });
      setSuccess(true);
      setHasSavedKey(true);
      // Clear the form after successful save
      setApiKey('');
      setShowKey(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to save API key');
      } else {
        setError('An unexpected error occurred');
        console.error(err);
      }
    } finally {
      setLoading(false);
      
      // Clear success message after 3 seconds
      if (success) {
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    }
  };

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setApiKey(e.target.value);
  };

  // Toggle show/hide API key
  const toggleShowKey = (): void => {
    setShowKey(!showKey);
  };

  return (
    <div className="card">
      <h2 className="text-lg font-medium mb-4">OpenAI API Key</h2>
      
      <p className="text-gray-600 mb-6">
        To use the AI-powered rule creation feature, you need to provide your OpenAI API key. 
        Your key is stored securely and is only used for parsing natural language into automation rules.
      </p>
      
      {hasSavedKey && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200 text-blue-700">
          An API key is already saved. You can enter a new key below to update it.
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="apiKey" className="label">
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              id="apiKey"
              value={apiKey}
              onChange={handleInputChange}
              className="input pr-10"
              placeholder="sk-..."
            />
            <button
              type="button"
              onClick={toggleShowKey}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showKey ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Get your API key from the{' '}
            <a
              href="https://platform.openai.com/account/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              OpenAI dashboard
            </a>
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 rounded-md border border-red-200 text-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 rounded-md border border-green-200 text-green-700">
            API key saved successfully!
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Saving...' : 'Save API Key'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApiKeyForm;