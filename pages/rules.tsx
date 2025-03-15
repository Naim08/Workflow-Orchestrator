import React from 'react';
import { NextPage } from 'next';
import Layout from '../components/Layout';
import RulesList from '../components/RulesList/RulesList';

const Rules: NextPage = () => {
  return (
    <Layout title="Rules">
      <RulesList />
    </Layout>
  );
};

export default Rules;