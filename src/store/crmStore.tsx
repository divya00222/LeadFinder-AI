
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lead, Message, ApprovalRequest, Note, TaskItem, ActivityItem, Campaign, Meeting } from './crmTypes';
import { getFullCRMData, saveFullCRMData } from '../lib/storage';

interface CRMContextType {
  leads: Lead[];
  messages: Message[];
  approvals: ApprovalRequest[];
  campaigns: Campaign[];
  tasks: TaskItem[];
  meetings: Meeting[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'tasks' | 'activities'>) => void;
  updateLead: (id: string, leadData: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  importLeads: (newLeads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'tasks' | 'activities'>[]) => void;
  updateLeadStatus: (id: string, status: Lead['status']) => void;
  addNote: (leadId: string, content: string) => void;
  updateNote: (leadId: string, noteId: string, content: string) => void;
  deleteNote: (leadId: string, noteId: string) => void;
  addGlobalTask: (task: Omit<TaskItem, 'id' | 'completed'>) => void;
  updateGlobalTask: (id: string, taskData: Partial<TaskItem>) => void;
  toggleGlobalTaskComplete: (id: string) => void;
  deleteGlobalTask: (id: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => string; // returns messageId
  updateMessageBody: (id: string, body: string) => void;
  updateMessageStatus: (id: string, status: Message['status'], approvalStatus?: Message['approvalStatus']) => void;
  createApproval: (approval: Omit<ApprovalRequest, 'id' | 'createdAt'>) => string; // returns approvalId
  approveMessage: (messageId: string, approvalId: string) => void;
  rejectMessage: (messageId: string, approvalId: string) => void;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt'>) => void;
  updateCampaign: (id: string, campaignData: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  duplicateCampaign: (id: string) => void;
  pauseCampaign: (id: string) => void;
  resumeCampaign: (id: string) => void;
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  updateMeeting: (id: string, meetingData: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const initialData = getFullCRMData();

  const [leads, setLeads] = useState<Lead[]>(initialData.leads || []);
  const [messages, setMessages] = useState<Message[]>(initialData.messages || []);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(initialData.approvals || []);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialData.campaigns || []);
  const [tasks, setTasks] = useState<TaskItem[]>(initialData.tasks || []);
  const [meetings, setMeetings] = useState<Meeting[]>(initialData.meetings || []);

  useEffect(() => {
    saveFullCRMData({
      leads,
      messages,
      approvals,
      campaigns,
      tasks,
      meetings
    });
  }, [leads, messages, approvals, campaigns, tasks, meetings]);


  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'tasks' | 'activities'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const nowStr = new Date().toLocaleString();
    const newLead: Lead = {
      ...leadData,
      id: newId,
      notes: [],
      tasks: [{ id: 't1', title: 'Initial outreach review', dueDate: 'Tomorrow', completed: false }],
      activities: [
        { id: 'act1', title: 'Lead created', desc: `Lead added via ${leadData.source || 'Manual'}`, date: nowStr, type: 'create' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeads([...leads, newLead]);
  };

  const updateLeadStatus = (id: string, status: Lead['status']) => {
    const nowStr = new Date().toLocaleString();
    setLeads(leads.map(lead => {
      if (lead.id === id) {
        const newActivities: ActivityItem[] = [
          { id: Math.random().toString(36).substr(2, 9), title: 'Status changed', desc: `Status updated to ${status.toUpperCase()}`, date: nowStr, type: 'status' },
          ...(lead.activities || [])
        ];
        return { ...lead, status, activities: newActivities, updatedAt: new Date().toISOString() };
      }
      return lead;
    }));
  };

  const updateLead = (id: string, leadData: Partial<Lead>) => {
    const nowStr = new Date().toLocaleString();
    setLeads(leads.map(lead => {
      if (lead.id === id) {
        const newActivities: ActivityItem[] = [
          { id: Math.random().toString(36).substr(2, 9), title: 'Lead updated', desc: 'Lead profile details were updated', date: nowStr, type: 'update' },
          ...(lead.activities || [])
        ];
        return { ...lead, ...leadData, activities: newActivities, updatedAt: new Date().toISOString() };
      }
      return lead;
    }));
  };

  const deleteLead = (id: string) => {
    setLeads(leads.filter(lead => lead.id !== id));
  };

  const importLeads = (newLeadsData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'tasks' | 'activities'>[]) => {
    const nowStr = new Date().toLocaleString();
    const createdLeads: Lead[] = newLeadsData.map(l => ({
      ...l,
      id: Math.random().toString(36).substr(2, 9),
      notes: [],
      tasks: [],
      activities: [
        { id: Math.random().toString(36).substr(2, 9), title: 'Lead created', desc: 'Imported via CSV', date: nowStr, type: 'create' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    setLeads([...leads, ...createdLeads]);
  };

  const addNote = (leadId: string, content: string) => {
    const nowStr = new Date().toLocaleString();
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        const newNote: Note = {
          id: Math.random().toString(36).substr(2, 9),
          content,
          createdAt: nowStr,
          author: 'Admin'
        };
        const newActivities: ActivityItem[] = [
          { id: Math.random().toString(36).substr(2, 9), title: 'Note added', desc: content.substring(0, 60) + (content.length > 60 ? '...' : ''), date: nowStr, type: 'note' },
          ...(lead.activities || [])
        ];
        return {
          ...lead,
          notes: [newNote, ...(lead.notes || [])],
          activities: newActivities,
          updatedAt: new Date().toISOString()
        };
      }
      return lead;
    }));
  };

  const updateNote = (leadId: string, noteId: string, content: string) => {
    const nowStr = new Date().toLocaleString();
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        const updatedNotes = (lead.notes || []).map(n => n.id === noteId ? { ...n, content } : n);
        const newActivities: ActivityItem[] = [
          { id: Math.random().toString(36).substr(2, 9), title: 'Note updated', desc: 'A note was modified', date: nowStr, type: 'note' },
          ...(lead.activities || [])
        ];
        return {
          ...lead,
          notes: updatedNotes,
          activities: newActivities,
          updatedAt: new Date().toISOString()
        };
      }
      return lead;
    }));
  };

  const deleteNote = (leadId: string, noteId: string) => {
    const nowStr = new Date().toLocaleString();
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        const updatedNotes = (lead.notes || []).filter(n => n.id !== noteId);
        const newActivities: ActivityItem[] = [
          { id: Math.random().toString(36).substr(2, 9), title: 'Note deleted', desc: 'A note was removed', date: nowStr, type: 'note' },
          ...(lead.activities || [])
        ];
        return {
          ...lead,
          notes: updatedNotes,
          activities: newActivities,
          updatedAt: new Date().toISOString()
        };
      }
      return lead;
    }));
  };

  const addTask = (leadId: string, title: string, dueDate: string) => {
    const nowStr = new Date().toLocaleString();
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        const newTask: TaskItem = {
          id: Math.random().toString(36).substr(2, 9),
          title,
          dueDate: dueDate || 'Today',
          completed: false
        };
        const newActivities: ActivityItem[] = [
          { id: Math.random().toString(36).substr(2, 9), title: 'Task added', desc: title, date: nowStr, type: 'task' },
          ...(lead.activities || [])
        ];
        return {
          ...lead,
          tasks: [newTask, ...(lead.tasks || [])],
          activities: newActivities,
          updatedAt: new Date().toISOString()
        };
      }
      return lead;
    }));
  };

  const toggleTask = (leadId: string, taskId: string) => {
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        const updatedTasks = (lead.tasks || []).map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        return {
          ...lead,
          tasks: updatedTasks,
          updatedAt: new Date().toISOString()
        };
      }
      return lead;
    }));
  };

  const deleteTask = (leadId: string, taskId: string) => {
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        const updatedTasks = (lead.tasks || []).filter(t => t.id !== taskId);
        return {
          ...lead,
          tasks: updatedTasks,
          updatedAt: new Date().toISOString()
        };
      }
      return lead;
    }));
  };

  const addMessage = (messageData: Omit<Message, 'id' | 'createdAt'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newMessage: Message = {
      ...messageData,
      id,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
    return id;
  };

  const updateMessageBody = (id: string, body: string) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, body } : msg));
  };

  const updateMessageStatus = (id: string, status: Message['status'], approvalStatus?: Message['approvalStatus']) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, status, ...(approvalStatus ? { approvalStatus } : {}) } : msg));
  };

  const createApproval = (approvalData: Omit<ApprovalRequest, 'id' | 'createdAt'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newApproval: ApprovalRequest = {
      ...approvalData,
      id,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setApprovals(prev => [...prev, newApproval]);
    return id;
  };

  const approveMessage = (messageId: string, approvalId: string) => {
    updateMessageStatus(messageId, 'approved', 'approved');
    setApprovals(prev => prev.map(app => app.id === approvalId ? { ...app, status: 'approved', reviewedAt: new Date().toISOString() } : app));
  };

  const rejectMessage = (messageId: string, approvalId: string) => {
    updateMessageStatus(messageId, 'rejected', 'rejected');
    setApprovals(prev => prev.map(app => app.id === approvalId ? { ...app, status: 'rejected', reviewedAt: new Date().toISOString() } : app));
  };

  const addCampaign = (campaignData: Omit<Campaign, 'id' | 'createdAt'>) => {
    const campaignId = Math.random().toString(36).substr(2, 9);
    const newCampaign: Campaign = {
      ...campaignData,
      id: campaignId,
      createdAt: new Date().toISOString()
    };
    setCampaigns(prev => [...prev, newCampaign]);

    // Campaign messages must enter pending_approval and cannot automatically send
    if (campaignData.leadIds && campaignData.leadIds.length > 0) {
      const channelKey = campaignData.channel.toLowerCase() as 'whatsapp' | 'instagram' | 'facebook' | 'gmail';
      campaignData.leadIds.forEach(leadId => {
        const msgId = addMessage({
          leadId,
          channel: channelKey,
          body: `Automated campaign outreach ("${campaignData.name}"): Hello! We noticed great potential at your company and wanted to connect regarding our solutions.`,
          direction: 'outbound',
          status: 'pending_approval',
          approvalStatus: 'pending'
        });
        createApproval({
          messageId: msgId,
          leadId,
          channel: campaignData.channel,
          status: 'pending'
        });
      });
    }
  };

  const updateCampaign = (id: string, campaignData: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...campaignData } : c));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const duplicateCampaign = (id: string) => {
    const target = campaigns.find(c => c.id === id);
    if (!target) return;
    const duplicated: Campaign = {
      ...target,
      id: Math.random().toString(36).substr(2, 9),
      name: `${target.name} (Copy)`,
      createdAt: new Date().toISOString()
    };
    setCampaigns(prev => [...prev, duplicated]);
  };

  const pauseCampaign = (id: string) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'Paused' } : c));
  };

  const resumeCampaign = (id: string) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'Active' } : c));
  };

  const addGlobalTask = (taskData: Omit<TaskItem, 'id' | 'completed'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 9),
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateGlobalTask = (id: string, taskData: Partial<TaskItem>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...taskData } : t));
  };

  const toggleGlobalTaskComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed, status: !t.completed ? 'Completed' : 'Todo' } : t));
  };

  const deleteGlobalTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addMeeting = (meetingData: Omit<Meeting, 'id'>) => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setMeetings(prev => [...prev, newMeeting]);
  };

  const updateMeeting = (id: string, meetingData: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...meetingData } : m));
  };

  const deleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  return (
    <CRMContext.Provider value={{ 
      leads, messages, approvals, campaigns, tasks, meetings, addLead, updateLead, deleteLead, importLeads, 
      updateLeadStatus, addNote, updateNote, deleteNote, addGlobalTask, updateGlobalTask, toggleGlobalTaskComplete, deleteGlobalTask, 
      addMessage, updateMessageBody, updateMessageStatus, createApproval, approveMessage, rejectMessage,
      addCampaign, updateCampaign, deleteCampaign, duplicateCampaign, pauseCampaign, resumeCampaign,
      addMeeting, updateMeeting, deleteMeeting 
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within a CRMProvider');
  return context;
};
