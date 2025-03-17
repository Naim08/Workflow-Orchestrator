import React, { ReactNode } from 'react';
import Head from 'next/head';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Workflow Orchestrator' }) => {
  return (
    <>
      <Head>
        <title>{title} | Workflow Orchestrator</title>
        <meta name="description" content="A minimal workflow orchestration tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        
        <footer className="bg-gray-100 border-t border-gray-200 py-4">
          <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
            <p>Workflow Orchestrator by SuiteOp &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;