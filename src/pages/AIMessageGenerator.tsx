import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { BrainCircuit, Send, AlertTriangle, Sparkles } from 'lucide-react';

export function AIMessageGenerator() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [draft, setDraft] = useState<any>(null);

  const mockLead = {
    company: 'Acme Corp',
    contact: 'Jane Doe',
    industry: 'Software',
    website: 'acme.com',
    score: 85,
    painPoints: ['Manual lead routing', 'Low response rates'],
    recommendedService: 'AI CRM Bundle'
  };

  const generateDraft = () => {
    setDraft({
      id: 'd1',
      status: 'pending_approval',
      content: "Hi Jane, noticed Acme Corp is expanding! Our AI CRM solution could help automate your lead routing and boost those outbound response rates significantly.",
      confidence: '94%',
      why: 'Based on recent series C funding and expansion news.',
      personalization: ['Mentions funding', 'Addresses specific pain points']
    });
  };

  const handleApprove = () => {
    setIsConfirmOpen(false);
    console.log("Mock Service: Sending message...", draft.content);
    setDraft(null); // Clear
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Input */}
      <Card className="lg:col-span-1">
        <CardHeader><CardTitle>Lead Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
             <p className="text-xs text-brand-muted">Company</p>
             <p className="font-medium text-sm">{mockLead.company}</p>
          </div>
          {/* ... Add other fields ... */}
          <div className="space-y-3 pt-4 border-t">
            <Select label="Channel"><option>WhatsApp</option><option>Gmail</option></Select>
            <Select label="Tone"><option>Professional</option></Select>
            <Select label="Language"><option>English</option></Select>
            <Select label="Length"><option>Short</option></Select>
            <Button className="w-full mt-2" onClick={generateDraft}><Sparkles className="mr-2" size={16}/> Generate Draft</Button>
          </div>
        </CardContent>
      </Card>

      {/* Right: Output */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Generated Message</CardTitle></CardHeader>
        <CardContent>
          {!draft ? (
            <div className="h-64 flex items-center justify-center text-brand-muted border-2 border-dashed rounded-lg">Generate a draft to see it here</div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border text-sm">{draft.content}</div>
              <div className="flex gap-2">
                <Badge>Confidence: {draft.confidence}</Badge>
                <Badge variant="neutral">{draft.why}</Badge>
              </div>
              <div className="p-4 bg-amber-50 text-amber-800 text-sm rounded-lg flex items-center gap-2 border border-amber-100">
                <AlertTriangle size={16} /> This message will NOT be sent until you approve it.
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline">Edit</Button>
                <Button variant="danger" onClick={() => setDraft(null)}>Reject</Button>
                <Button onClick={() => setIsConfirmOpen(true)}><Send className="mr-2" size={16}/> Approve & Send</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Confirm Send" footer={<><Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button><Button onClick={handleApprove}>Confirm & Send</Button></>}>
        <p>Are you sure you want to send this message?</p>
      </Modal>
    </div>
  );
}
