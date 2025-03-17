// components/DeadLetterQueue/DeadLetterQueueViewer.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ErrorBoundary from '../ErrorBoundary';
import { DLQItem } from '../../types';

const DeadLetterQueueViewer: React.FC = () => {
  const [items, setItems] = useState<DLQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [processingItems, setProcessingItems] = useState<Record<string, boolean>>({});
  
  // Fetch items
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/dead-letter-queue', {
        params: {
          status: 'pending',
          limit: 50,
          order: 'timestamp.desc'
        }
      });
      
      setItems(response.data.data);
    } catch (err) {
      setError('Failed to fetch dead letter queue items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchItems();
  }, []);
  
  // Handle item selection
  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };
  
  // Handle select all
  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };
  
  // Retry a single item
  const retryItem = async (id: string) => {
    setProcessingItems(prev => ({ ...prev, [id]: true }));
    
    try {
      await axios.post(`/api/dead-letter-queue/${id}/retry`);
      await fetchItems(); // Refresh the list
    } catch (err: any) {
      setError(`Failed to retry item: ${err.response?.data?.error || err.message}`);
      console.error(err);
    } finally {
      setProcessingItems(prev => ({ ...prev, [id]: false }));
    }
  };
  
  // Retry selected items
  const retrySelected = async () => {
    if (selectedItems.length === 0) return;
    
    selectedItems.forEach(id => {
      setProcessingItems(prev => ({ ...prev, [id]: true }));
    });
    
    try {
      await axios.post('/api/dead-letter-queue', {
        items: selectedItems
      });
      
      await fetchItems(); // Refresh the list
      setSelectedItems([]); // Clear selection
    } catch (err: any) {
      setError(`Failed to retry items: ${err.response?.data?.error || err.message}`);
      console.error(err);
    } finally {
      const newProcessingItems = { ...processingItems };
      selectedItems.forEach(id => {
        newProcessingItems[id] = false;
      });
      setProcessingItems(newProcessingItems);
    }
  };
  
  // Delete selected items
  const deleteSelected = async () => {
    if (selectedItems.length === 0 || !confirm('Are you sure you want to delete these items?')) {
      return;
    }
    
    try {
      await axios.delete('/api/dead-letter-queue', {
        data: { ids: selectedItems }
      });
      
      await fetchItems(); // Refresh the list
      setSelectedItems([]); // Clear selection
    } catch (err: any) {
      setError(`Failed to delete items: ${err.response?.data?.error || err.message}`);
      console.error(err);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Dead Letter Queue</h2>
          <div className="space-x-2">
            <button
              onClick={fetchItems}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <button
              onClick={retrySelected}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
              disabled={selectedItems.length === 0}
            >
              Retry Selected ({selectedItems.length})
            </button>
            
            <button
              onClick={deleteSelected}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
              disabled={selectedItems.length === 0}
            >
              Delete Selected
            </button>
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending items in the queue
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === items.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="py-2 px-4 border-b text-left">Rule</th>
                  <th className="py-2 px-4 border-b text-left">Error</th>
                  <th className="py-2 px-4 border-b text-left">Timestamp</th>
                  <th className="py-2 px-4 border-b text-left">Attempts</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div>{item.ruleName}</div>
                      <div className="text-xs text-gray-500">
                        Action: {item.actionId.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="max-w-xs truncate">{item.error}</div>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {formatDate(item.timestamp)}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {item.retryAttempts}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => retryItem(item.id)}
                        disabled={processingItems[item.id]}
                        className="px-2 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs"
                      >
                        {processingItems[item.id] ? 'Retrying...' : 'Retry'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default DeadLetterQueueViewer;