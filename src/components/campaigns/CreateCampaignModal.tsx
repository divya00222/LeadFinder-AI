import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export function CreateCampaignModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Campaign">
      <div className="space-y-4">
        <Input label="Campaign Name" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Target Audience" />
          <Input label="Industry" />
        </div>
        <Select label="Channel">
          <option>Email</option>
          <option>WhatsApp</option>
        </Select>
        <div className="space-y-2">
            <label className="text-sm font-medium">Message Sequence</label>
            <Input placeholder="Step 1: Initial Outreach" />
            <Input placeholder="Step 2: Follow-up" />
            <Input placeholder="Step 3: Final Follow-up" />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button>Create Campaign</Button>
        </div>
      </div>
    </Modal>
  );
}
