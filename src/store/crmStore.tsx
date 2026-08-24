
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lead, Message, ApprovalRequest } from './crmTypes';
import { initialLeads, initialMessages, initialApprovals } from './seedData';

interface CRMContextType {
  leads: Lead[];
  messages: Message[];
  approvals: ApprovalRequest[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLeadStatus: (id: string, status: Lead['status']) => void;
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  updateMessageStatus: (id: string, status: Message['status'], approvalStatus?: Message['approvalStatus']) => void;
  createApproval: (approval: Omit<ApprovalRequest, 'id' | 'createdAt'>) => void;
  approveMessage: (messageId: string, approvalId: string) => void;
  rejectMessage: (messageId: string, approvalId: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('leadfinder_ai_crm_leads');
    return saved ? JSON.parse(saved) : initialLeads;
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('leadfinder_ai_crm_messages');
    return saved ? JSON.parse(saved) : initialMessages;
  });
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(() => {
    const saved = localStorage.getItem('leadfinder_ai_crm_approvals');
    return saved ? JSON.parse(saved) : initialApprovals;
  });

  useEffect(() => {
    localStorage.setItem('leadfinder_ai_crm_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('leadfinder_ai_crm_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('leadfinder_ai_crm_approvals', JSON.stringify(approvals));
  }, [approvals]);

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeads([...leads, newLead]);
  };

  const updateLeadStatus = (id: string, status: Lead['status']) => {
    setLeads(leads.map(lead => lead.id === id ? { ...lead, status, updatedAt: new Date().toISOString() } : lead));
  };

  const addMessage = (messageData: Omit<Message, 'id' | 'createdAt'>) => {
    const newMessage: Message = {
      ...messageData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setMessages([...messages, newMessage]);
  };

  const updateMessageStatus = (id: string, status: Message['status'], approvalStatus?: Message['approvalStatus']) => {
    setMessages(messages.map(msg => msg.id === id ? { ...msg, status, ...(approvalStatus ? { approvalStatus } : {}) } : msg));
  };

  const createApproval = (approvalData: Omit<ApprovalRequest, 'id' | 'createdAt'>) => {
    const newApproval: ApprovalRequest = {
      ...approvalData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setApprovals([...approvals, newApproval]);
  };

  const approveMessage = (messageId: string, approvalId: string) => {
    updateMessageStatus(messageId, 'approved', 'approved');
    setApprovals(approvals.map(app => app.id === approvalId ? { ...app, status: 'approved', reviewedAt: new Date().toISOString() } : app));
  };

  const rejectMessage = (messageId: string, approvalId: string) => {
    updateMessageStatus(messageId, 'rejected', 'rejected');
    setApprovals(approvals.map(app => app.id === approvalId ? { ...app, status: 'rejected', reviewedAt: new Date().toISOString() } : app));
  };

  return (
    <CRMContext.Provider value={{ leads, messages, approvals, addLead, updateLeadStatus, addMessage, updateMessageStatus, createApproval, approveMessage, rejectMessage }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within a CRMProvider');
  return context;
};
