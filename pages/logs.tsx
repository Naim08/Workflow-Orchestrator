import React from 'react';
import { NextPage } from 'next';
import Layout from '../components/Layout';
import LogsViewer from '../components/Logger/LogsViewer';

const Logs: NextPage = () => {
  return (
    <Layout title="Logs">
      <LogsViewer />
    </Layout>
  );
};

export default Logs;