import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LogItem from './LogItem';
import { format } from 'date-fns';
import { Log } from '../../types';
import { any } from 'zod';

type LogFilter = 'all' | 'trigger' | 'action' | 'system' | 'error';

interface GroupedLogs {
  [date: string]: Log[];
}

const LogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LogFilter>('all');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const logsPerPage = 20;

  // Fetch logs from the API
  useEffect(() => {
    const fetchLogs = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await axios.get<Log[]>('/api/logs', {
          params: {
            filter,
            page,
            limit: logsPerPage
          }
        });
        
        if (page === 1) {
            
          setLogs(Object.values(response.data));
        } else {
          setLogs(prevLogs => [...prevLogs, ...response.data]);
        }
        
        setHasMore(response.data.length === logsPerPage);
      } catch (err) {
        setError('Failed to fetch logs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [filter, page]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter]);

  // Handle filter change
  const handleFilterChange = (newFilter: LogFilter): void => {
    setFilter(newFilter);
  };

  // Handle load more
  const handleLoadMore = (): void => {
    setPage(prevPage => prevPage + 1);
  };

  // Group logs by date
  const logsArr = logs[0];

  console.log(logsArr);
  console.log(logs);
  const groupedLogs: GroupedLogs = Array.isArray(logsArr) 
  ? logsArr.reduce((groups: GroupedLogs, log) => {
    console.log(log);
    const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {})
  : {};

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-xl font-bold">System Logs</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('trigger')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'trigger'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            Triggers
          </button>
          <button
            onClick={() => handleFilterChange('action')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'action'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            Actions
          </button>
        </div>
      </div>

      <div className="card">
        {loading && page === 1 ? (
          <div className="text-center py-8">Loading logs...</div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            Error: {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No logs found
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map(date => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-500 mb-4 sticky top-0 bg-white z-10 py-2 border-b">
                  {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                </h3>
                <div className="space-y-3">
                  {groupedLogs[date].map(log => (
                    <LogItem key={log.id} log={log} />
                  ))}
                </div>
              </div>
            ))}
            
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="btn btn-outline"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsViewer;