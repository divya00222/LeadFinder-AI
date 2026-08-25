import React, { useState } from 'react';
import { useCRM } from '../store/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Toast, useToast } from '../components/ui/Toast';
import { 
  Workflow, Play, Plus, Trash2, Copy, Settings, CheckCircle2, 
  Clock, ShieldAlert, Cpu, Send, Zap, Activity, Filter, ArrowRight, RefreshCw, AlertCircle
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  category: 'trigger' | 'ai_action' | 'action' | 'approval' | 'wait' | 'condition';
  label: string;
  config?: string;
}

interface ExecutionLogEntry {
  id: string;
  workflowName: string;
  leadName: string;
  stepName: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Running';
  time: string;
  result: string;
}

const TRIGGER_TYPES = [
  'New Google Maps Lead',
  'Lead Score Changed',
  'Lead Qualified',
  'Message Approved',
  'Message Sent',
  'Reply Received',
  'No Reply',
  'Task Due',
  'Meeting Created'
];

const AI_ACTION_TYPES = [
  'AI Analyze Lead',
  'AI Research Company',
  'AI Score Lead',
  'AI Select Channel',
  'AI Generate Message',
  'AI Classify Reply',
  'AI Recommend Next Action'
];

const NORMAL_ACTION_TYPES = [
  'Create Task',
  'Move Lead',
  'Notify User',
  'Request Approval',
  'Wait',
  'Send Approved Message',
  'Condition',
  'Stop'
];

export function AutomationBuilder() {
  const { leads } = useCRM();
  const { toasts, toast, removeToast } = useToast();

  const [activeTab, setActiveTab] = useState<'builder' | 'logs'>('builder');
  const [workflowName, setWorkflowName] = useState('Google Maps Lead AI Outreach & Approval');
  const [isEnabled, setIsEnabled] = useState(true);

  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: 'n1', category: 'trigger', label: 'New Google Maps Lead' },
    { id: 'n2', category: 'ai_action', label: 'AI Analyze Lead' },
    { id: 'n3', category: 'ai_action', label: 'AI Research Company' },
    { id: 'n4', category: 'ai_action', label: 'AI Score Lead' },
    { id: 'n5', category: 'ai_action', label: 'AI Generate Message' },
    { id: 'n6', category: 'approval', label: 'Request Approval (Human Gate)' },
    { id: 'n7', category: 'action', label: 'Send Approved Message' },
  ]);

  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  
  const [executionLogs, setExecutionLogs] = useState<ExecutionLogEntry[]>([
    { id: 'l1', workflowName: 'Google Maps Lead AI Outreach & Approval', leadName: 'Apex Tech Solutions', stepName: 'AI Research', status: 'Completed', time: '2 mins ago', result: 'Found SaaS B2B profile, rating 4.8' },
    { id: 'l2', workflowName: 'Google Maps Lead AI Outreach & Approval', leadName: 'Apex Tech Solutions', stepName: 'AI Score', status: 'Completed', time: '2 mins ago', result: 'Score assigned: 91/100 (Hot Lead)' },
    { id: 'l3', workflowName: 'Google Maps Lead AI Outreach & Approval', leadName: 'Apex Tech Solutions', stepName: 'Message Generated', status: 'Completed', time: '1 min ago', result: 'WhatsApp draft prepared successfully' },
    { id: 'l4', workflowName: 'Google Maps Lead AI Outreach & Approval', leadName: 'Apex Tech Solutions', stepName: 'Human Approval', status: 'Pending', time: 'Just now', result: 'Waiting in Pending Approval queue (GENERATE != SEND)' },
  ]);

  const addNode = (category: WorkflowNode['category'], label: string) => {
    const newNode: WorkflowNode = {
      id: Math.random().toString(36).substr(2, 9),
      category,
      label
    };
    setNodes([...nodes, newNode]);
    toast(`Added "${label}" to workflow`, 'success');
  };

  const removeNode = (id: string) => {
    if (nodes.length <= 1) {
      toast('Workflow must have at least one node', 'error');
      return;
    }
    setNodes(nodes.filter(n => n.id !== id));
    toast('Node removed', 'info');
  };

  const duplicateNode = (index: number) => {
    const target = nodes[index];
    const duplicated: WorkflowNode = {
      ...target,
      id: Math.random().toString(36).substr(2, 9),
      label: `${target.label} (Copy)`
    };
    const updated = [...nodes];
    updated.splice(index + 1, 0, duplicated);
    setNodes(updated);
    toast('Node duplicated', 'success');
  };

  const handleSave = () => {
    toast('Workflow saved successfully! Changes active for new events.', 'success');
  };

  const handleRunTest = () => {
    const lead = leads.find(l => l.id === selectedLeadId) || leads[0];
    if (!lead) {
      toast('Please select a lead for testing', 'error');
      return;
    }

    setTestModalOpen(true);
    setIsTestRunning(true);

    setTimeout(() => {
      const now = new Date().toLocaleTimeString();
      const newLogs: ExecutionLogEntry[] = [
        { id: Math.random().toString(36).substr(2, 9), workflowName, leadName: lead.companyName, stepName: 'Trigger: New Lead', status: 'Completed', time: now, result: `Lead detected: ${lead.companyName}` },
        { id: Math.random().toString(36).substr(2, 9), workflowName, leadName: lead.companyName, stepName: 'AI Analyze & Research', status: 'Completed', time: now, result: 'Industry category verified, website crawled' },
        { id: Math.random().toString(36).substr(2, 9), workflowName, leadName: lead.companyName, stepName: 'AI Score', status: 'Completed', time: now, result: 'Score: 92/100 (Qualified)' },
        { id: Math.random().toString(36).substr(2, 9), workflowName, leadName: lead.companyName, stepName: 'AI Generate Message', status: 'Completed', time: now, result: 'WhatsApp Outreach Draft Generated' },
        { id: Math.random().toString(36).substr(2, 9), workflowName, leadName: lead.companyName, stepName: 'Human Approval Gate', status: 'Pending', time: now, result: 'STOPPED: AI cannot bypass Human Approval (GENERATE != SEND)' },
      ];
      setExecutionLogs(prev => [...newLogs, ...prev]);
      setIsTestRunning(false);
      toast(`Test completed safely with lead "${lead.companyName}" (Sandbox mode: no real messages sent)`, 'success');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">AI Automation Engine & Workflow Builder</h1>
          <p className="text-sm text-brand-muted mt-1">Design autonomous multi-step CRM workflows with strict AI intelligence and mandatory Human Approval gates.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-xs font-bold text-brand-muted">Status:</span>
            <button 
              onClick={() => setIsEnabled(!isEnabled)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
            >
              {isEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <Button variant="outline" onClick={() => setTestModalOpen(true)} className="gap-2">
            <Play size={16} /> Test Workflow
          </Button>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            Save Workflow
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('builder')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'builder' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-brand-muted hover:text-brand-text'}`}
        >
          <Workflow size={16} /> Visual Workflow Builder
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'logs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-brand-muted hover:text-brand-text'}`}
        >
          <Activity size={16} /> Execution Logs ({executionLogs.length})
        </button>
      </div>

      {activeTab === 'builder' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: Blocks Palette */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Zap size={16} className="text-indigo-600" /> Triggers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-1.5 max-h-48 overflow-y-auto">
                {TRIGGER_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => addNode('trigger', t)}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-brand-text flex items-center justify-between group transition-colors border border-transparent hover:border-indigo-100"
                  >
                    <span>{t}</span>
                    <Plus size={14} className="opacity-0 group-hover:opacity-100 text-indigo-600" />
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Cpu size={16} className="text-indigo-600" /> AI Intelligence Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-1.5 max-h-56 overflow-y-auto">
                {AI_ACTION_TYPES.map(act => (
                  <button
                    key={act}
                    onClick={() => addNode('ai_action', act)}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-brand-text flex items-center justify-between group transition-colors border border-transparent hover:border-indigo-100"
                  >
                    <span>{act}</span>
                    <Plus size={14} className="opacity-0 group-hover:opacity-100 text-indigo-600" />
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Normal Actions & Gates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-1.5 max-h-56 overflow-y-auto">
                {NORMAL_ACTION_TYPES.map(nact => (
                  <button
                    key={nact}
                    onClick={() => {
                      const category = nact.includes('Approval') ? 'approval' : nact.includes('Wait') ? 'wait' : nact.includes('Condition') ? 'condition' : 'action';
                      addNode(category, nact);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-emerald-50 hover:text-emerald-700 text-brand-text flex items-center justify-between group transition-colors border border-transparent hover:border-emerald-100"
                  >
                    <span>{nact}</span>
                    <Plus size={14} className="opacity-0 group-hover:opacity-100 text-emerald-600" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Workflow Canvas */}
          <Card className="lg:col-span-8 bg-white border border-gray-100 shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
              <div className="space-y-1">
                <input
                  type="text"
                  value={workflowName}
                  onChange={e => setWorkflowName(e.target.value)}
                  className="text-base font-bold text-brand-text border-b border-transparent hover:border-gray-300 focus:border-indigo-600 focus:outline-none bg-transparent w-full"
                />
                <p className="text-xs text-brand-muted">Sequence of autonomous triggers, AI actions, and mandatory human approval gates.</p>
              </div>
              <Badge className="bg-indigo-100 text-indigo-700 font-bold text-xs uppercase">
                {nodes.length} Steps
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4 pt-6 flex-1">
              {/* Critical Safety Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
                <ShieldAlert size={20} className="text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold">MANDATORY RULE:</span> AI cannot bypass Human Approval. Any automated send action must follow a verified Human Approval gate (`approvalStatus === 'approved'`).
                </div>
              </div>

              {/* Node Chain */}
              <div className="space-y-3 relative before:absolute before:inset-y-4 before:left-6 before:w-0.5 before:bg-indigo-100">
                {nodes.map((node, index) => {
                  const isTrigger = node.category === 'trigger';
                  const isAI = node.category === 'ai_action';
                  const isApproval = node.category === 'approval';
                  const isSend = node.label.includes('Send Approved Message');

                  return (
                    <div key={node.id} className="relative flex items-center gap-4 group">
                      <div className={`z-10 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                        isTrigger ? 'bg-indigo-600 text-white' :
                        isAI ? 'bg-purple-600 text-white' :
                        isApproval ? 'bg-amber-500 text-white' :
                        isSend ? 'bg-emerald-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {index + 1}
                      </div>

                      <div className={`flex-1 p-4 rounded-xl border flex items-center justify-between transition-all ${
                        isApproval ? 'bg-amber-50/60 border-amber-200' :
                        isAI ? 'bg-purple-50/40 border-purple-100' :
                        isTrigger ? 'bg-indigo-50/50 border-indigo-100' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                              {node.category.replace('_', ' ')}
                            </span>
                            {isApproval && <Badge className="bg-amber-100 text-amber-800 text-[10px]">Human Gate</Badge>}
                            {isSend && <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Verifies Approval</Badge>}
                          </div>
                          <h4 className="text-sm font-bold text-brand-text">{node.label}</h4>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" onClick={() => duplicateNode(index)} title="Duplicate node">
                            <Copy size={13} />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => removeNode(node.id)} className="text-red-600 hover:bg-red-50" title="Delete node">
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-center">
                <Button variant="outline" onClick={() => addNode('ai_action', 'AI Recommend Next Action')} className="gap-2 border-dashed border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                  <Plus size={16} /> Add Workflow Step
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Execution Logs Tab */
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity size={18} className="text-indigo-600" /> Automation Execution Logs
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setExecutionLogs([])} className="text-xs text-red-600">
              Clear Logs
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-brand-muted text-xs uppercase border-b border-gray-100 font-bold">
                    <th className="p-4">Workflow</th>
                    <th className="p-4">Lead</th>
                    <th className="p-4">Step / Action</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Time</th>
                    <th className="p-4">Result / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {executionLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50/50">
                      <td className="p-4 font-semibold text-brand-text">{log.workflowName}</td>
                      <td className="p-4 font-medium text-indigo-600">{log.leadName}</td>
                      <td className="p-4 text-brand-text font-medium">{log.stepName}</td>
                      <td className="p-4">
                        <Badge className={`text-xs font-bold uppercase ${
                          log.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          log.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          log.status === 'Running' ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {log.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-brand-muted text-xs">{log.time}</td>
                      <td className="p-4 text-gray-600 text-xs font-mono">{log.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Mode Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-white max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                <Play size={18} className="text-indigo-600" /> Test Workflow Sandbox
              </h3>
              <button onClick={() => setTestModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">&times;</button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-brand-muted">
                Test this workflow with <strong>ONE lead</strong> in sandbox mode. Never sends real messages during test.
              </p>

              <div>
                <label className="block text-xs font-bold text-brand-text mb-1.5">Select Test Lead</label>
                <select
                  value={selectedLeadId}
                  onChange={e => setSelectedLeadId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.companyName} ({l.location})</option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 bg-indigo-50 rounded-lg text-xs space-y-2 border border-indigo-100">
                <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-indigo-600" /> Sandbox Safety Guarantee
                </p>
                <p className="text-indigo-950 leading-relaxed">
                  Executing this test will simulate the full automation pipeline (AI Analysis, Research, Scoring, Draft Generation) and pause safely at the Human Approval Gate without dispatching any real network messages.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setTestModalOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleRunTest} 
                disabled={isTestRunning}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                {isTestRunning ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
                {isTestRunning ? 'Running Test Simulation...' : 'Run Test Workflow'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
