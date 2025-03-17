import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Header: React.FC = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [dlqCount, setDlqCount] = useState<number>(0);

  useEffect(() => {
    const fetchDlqCount = async () => {
      try {
        const response = await fetch('/api/dead-letter-queue?status=pending&limit=1');
        const data = await response.json();
        setDlqCount(data.count || 0);
      } catch (error) {
        console.error('Error fetching DLQ count:', error);
      }
    };
    
    fetchDlqCount();
    
    // Set up a timer to periodically check for new DLQ items
    const timer = setInterval(fetchDlqCount, 60000); // Check every minute
    
    return () => clearInterval(timer);
  }, []);
  const toggleMenu = (): void => {
    setMenuOpen(!menuOpen);
  };
  
  const isActive = (path: string): string => {
    return router.pathname === path ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-blue-600 hover:text-white';
  };
  
  return (
    <nav className="bg-blue-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-white font-bold text-xl">Workflow Orchestrator</span>
            </Link>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}>
                  Home
                </Link>
                <Link href="/create" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/create')}`}>
                  Create Rule
                </Link>
                <Link href="/rules" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/rules')}`}>
                  Rules
                </Link>
                <Link href="/logs" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/logs')}`}>
                  Logs
                </Link>
                <Link href="/simulate" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/simulate')}`}>
                  Simulate
                </Link>
                <Link href="/settings" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/settings')}`}>
                  Settings
                </Link>
                <Link href="/dead-letter-queue" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dead-letter-queue')}`}>
  DLQ {dlqCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{dlqCount}</span>}
</Link>
              </div>
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 focus:text-white"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {menuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')}`}>
              Home
            </Link>
            <Link href="/create" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/create')}`}>
              Create Rule
            </Link>
            <Link href="/rules" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/rules')}`}>
              Rules
            </Link>
            <Link href="/logs" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/logs')}`}>
              Logs
            </Link>
            <Link href="/simulate" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/simulate')}`}>
              Simulate
            </Link>
            <Link href="/settings" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/settings')}`}>
              Settings
            </Link>
            <Link href="/dead-letter-queue" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dead-letter-queue')}`}>
  DLQ {dlqCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{dlqCount}</span>}
</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;