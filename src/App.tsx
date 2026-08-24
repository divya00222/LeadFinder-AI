/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Campaigns } from './pages/Campaigns';
import { AIMessageGenerator } from './pages/AIMessageGenerator';
import { AIApprovalQueue } from './pages/AIApprovalQueue';
import { LeadFinder } from './pages/LeadFinder';
import { Pipeline } from './pages/Pipeline';
import { Leads } from './pages/Leads';
import { LeadDetail } from './pages/LeadDetail';
import { Messages } from './pages/Messages';
import { AutomationBuilder } from './pages/AutomationBuilder';
import { Reports } from './pages/Reports';
import { Tasks } from './pages/Tasks';
import { Calendar } from './pages/Calendar';
import { Integrations } from './pages/Integrations';
import { Team } from './pages/Team';
import { Settings } from './pages/Settings';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <h1 className="text-2xl font-bold text-brand-text mb-2">{title}</h1>
      <p className="text-brand-muted">This module is currently under development.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lead-finder" element={<LeadFinder />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/ai-generator" element={<AIMessageGenerator />} />
          <Route path="/ai-approval" element={<AIApprovalQueue />} />
          <Route path="/automation" element={<AutomationBuilder />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/team" element={<Team />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
