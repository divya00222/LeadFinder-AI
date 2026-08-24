import { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { MessageCircle, Mail, Send, Sparkles, Wand2, Calendar, Paperclip, CheckCircle } from 'lucide-react';

const CONVERSATIONS = [
  { id: 1, lead: 'Jane Doe', company: 'Acme Corp', channel: 'Gmail', last: 'Thanks for the demo!', time: '10m ago', unread: 1 },
  { id: 2, lead: 'Sarah Jenkins', company: 'TechStart', channel: 'WhatsApp', last: 'Are you available tomorrow?', time: '2h ago', unread: 0 },
];

const TIMELINE = [
  { id: 1, type: 'inbound', text: 'Hi, I saw your product demo.', time: '10:00 AM' },
  { id: 2, type: 'ai-draft', text: 'Hi Jane, glad you liked it! Can we schedule a follow-up?', time: '10:05 AM', status: 'pending_approval' },
];

export function Messages() {
  const [activeConv, setActiveConv] = useState(CONVERSATIONS[0]);
  const [draft, setDraft] = useState('');

  return (
    <div className="h-[calc(100vh-8rem)] grid grid-cols-12 gap-6">
      {/* Left: List */}
      <Card className="col-span-3 overflow-hidden flex flex-col">
        <div className="p-4 border-b font-semibold">Conversations</div>
        <div className="flex-1 overflow-y-auto">
          {CONVERSATIONS.map(c => (
            <div key={c.id} className="p-4 border-b cursor-pointer hover:bg-gray-50" onClick={() => setActiveConv(c)}>
              <div className="flex justify-between">
                <span className="font-semibold">{c.lead}</span>
                <span className="text-xs text-gray-400">{c.time}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">{c.company} • {c.last}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Center: Timeline & Composer */}
      <Card className="col-span-6 flex flex-col">
        <div className="p-4 border-b font-semibold">{activeConv.lead} ({activeConv.company})</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {TIMELINE.map(m => (
            <div key={m.id} className={`p-3 rounded-lg max-w-[80%] ${m.type === 'inbound' ? 'bg-gray-100' : 'bg-brand-primary/10 ml-auto'}`}>
              <p className="text-sm">{m.text}</p>
              {m.type === 'ai-draft' && (
                <div className="mt-2 flex items-center justify-between text-xs border-t pt-2 border-brand-primary/20">
                  <Badge variant="warning">AI Draft - Approval Required</Badge>
                  <Button size="sm" variant="outline">Approve & Send</Button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 border-t space-y-2">
          <textarea className="w-full p-2 border rounded-md text-sm" placeholder="Write message..." value={draft} onChange={e => setDraft(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Sparkles size={16} className="mr-1"/> AI Generate</Button>
            <Button variant="outline" size="sm"><Wand2 size={16} className="mr-1"/> AI Improve</Button>
            <Button variant="outline" size="sm"><Paperclip size={16}/></Button>
            <Button variant="outline" size="sm"><Calendar size={16}/></Button>
            <Button size="sm" className="ml-auto"><Send size={16} className="mr-2"/> Request Approval</Button>
          </div>
        </div>
      </Card>

      {/* Right: Lead Info */}
      <Card className="col-span-3">
        <div className="p-4 border-b font-semibold">Lead Info</div>
        <div className="p-4 space-y-4 text-sm">
          <div><p className="text-gray-500">Lead Score</p><p className="font-semibold">85</p></div>
          <div><p className="text-gray-500">Company</p><p className="font-semibold">{activeConv.company}</p></div>
          <div><p className="text-gray-500">AI Insights</p><p className="text-xs">High intent, recent Series C funding.</p></div>
        </div>
      </Card>
    </div>
  );
}
