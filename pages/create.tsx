import React from 'react';
import { NextPage } from 'next';
import Layout from '../components/Layout';
import RuleBuilder from '../components/RuleBuilder/RuleBuilder';

const CreateRule: NextPage = () => {
  return (
    <Layout title="Create Rule">
      <RuleBuilder />
    </Layout>
  );
};

export default CreateRule;