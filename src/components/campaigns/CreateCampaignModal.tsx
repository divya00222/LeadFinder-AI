import React, { useState, useEffect } from 'react';
import { useCRM } from '../../store/crmStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Campaign } from '../../store/crmTypes';
import { useToast, Toast } from '../ui/Toast';
import { CheckSquare, Square, Users, Megaphone } from 'lucide-react';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  editCampaign?: Campaign | null;
}

export function CreateCampaignModal({ isOpen, onClose, editCampaign }: CreateCampaignModalProps) {
  const { leads, addCampaign, updateCampaign } = useCRM();
  const { toasts, toast, removeToast } = useToast();

  const [name, setName] = useState('');
  const [audience, setAudience] = useState('');
  const [channel, setChannel] = useState<'Gmail' | 'WhatsApp' | 'Instagram' | 'Facebook'>('Gmail');
  const [description, setDescription] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  useEffect(() => {
    if (editCampaign) {
      setName(editCampaign.name);
      setAudience(editCampaign.audience);
      setChannel(editCampaign.channel);
      setDescription(editCampaign.description);
      setSelectedLeadIds(editCampaign.leadIds || []);
    } else {
      setName('');
      setAudience('');
      setChannel('Gmail');
      setDescription('');
      setSelectedLeadIds(leads.map(l => l.id)); // Default select all or none
    }
  }, [editCampaign, isOpen, leads]);

  const toggleLeadSelection = (leadId: string) => {
    if (selectedLeadIds.includes(leadId)) {
      setSelectedLeadIds(selectedLeadIds.filter(id => id !== leadId));
    } else {
      setSelectedLeadIds([...selectedLeadIds, leadId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map(l => l.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Campaign name is required', 'error');
      return;
    }

    if (editCampaign) {
      updateCampaign(editCampaign.id, {
        name,
        audience,
        channel,
        description,
        leadIds: selectedLeadIds
      });
      toast('Campaign updated successfully', 'success');
    } else {
      addCampaign({
        name,
        audience,
        channel,
        description,
        leadIds: selectedLeadIds,
        status: 'Active'
      });
      toast('Campaign created and approval messages queued', 'success');
    }

    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editCampaign ? 'Edit Campaign' : 'Create New Campaign'}
      maxWidth="xl"
    >
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Campaign Name *</label>
            <input 
              type="text" 
              required
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Q3 Outbound Growth"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Target Audience</label>
            <input 
              type="text" 
              value={audience} 
              onChange={e => setAudience(e.target.value)}
              placeholder="e.g. CTOs & VPs of Engineering"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Channel</label>
            <select
              value={channel}
              onChange={e => setChannel(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
              <option value="Gmail">Gmail</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1">Description</label>
            <input 
              type="text" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Campaign objective..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
        </div>

        {/* Lead Selection */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-brand-text uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} /> Select Leads ({selectedLeadIds.length} selected)
            </label>
            <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedLeadIds.length === leads.length ? 'Deselect All' : 'Select All Leads'}
            </Button>
          </div>

          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 bg-gray-50/50">
            {leads.map(lead => {
              const isSelected = selectedLeadIds.includes(lead.id);
              return (
                <div 
                  key={lead.id}
                  onClick={() => toggleLeadSelection(lead.id)}
                  className={`flex items-center justify-between p-2.5 cursor-pointer text-xs transition-colors ${isSelected ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-gray-100'}`}
                >
                  <div className="flex items-center gap-2">
                    {isSelected ? <CheckSquare size={16} className="text-brand-primary" /> : <Square size={16} className="text-gray-400" />}
                    <span>{lead.companyName} ({lead.contactName})</span>
                  </div>
                  <Badge variant="neutral" className="text-[10px]">{lead.industry}</Badge>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 italic">
            Note: Selecting leads will automatically generate pending outreach messages in approval queue (human approval required).
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">{editCampaign ? 'Save Changes' : 'Create Campaign'}</Button>
        </div>
      </form>
    </Modal>
  );
}
