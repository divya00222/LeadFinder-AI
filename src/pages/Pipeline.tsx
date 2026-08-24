import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { 
  Plus, MoreHorizontal, MessageCircle, Mail, Facebook, Instagram, 
  Search, Filter, MapPin, Clock 
} from 'lucide-react';

type LeadStatus = 'New' | 'Contacted' | 'Replied' | 'Qualified' | 'Meeting' | 'Proposal' | 'Won' | 'Lost';

type CardData = {
  id: string;
  status: LeadStatus;
  company: string;
  contact: string;
  location: string;
  score: number;
  channel: 'whatsapp' | 'email' | 'instagram' | 'facebook';
  lastActivity: string;
  owner: { name: string; initials: string };
  amount: number;
};

const MOCK_CARDS: CardData[] = [
  { id: '1', status: 'New', company: 'Acme Corp', contact: 'John Smith', location: 'San Francisco, CA', score: 85, channel: 'email', lastActivity: '2h ago', owner: { name: 'Alice', initials: 'A' }, amount: 12000 },
  { id: '2', status: 'New', company: 'Pied Piper', contact: 'Richard H.', location: 'Palo Alto, CA', score: 42, channel: 'whatsapp', lastActivity: '4h ago', owner: { name: 'Bob', initials: 'B' }, amount: 8000 },
  { id: '3', status: 'Contacted', company: 'TechStart', contact: 'Sarah J.', location: 'New York, NY', score: 65, channel: 'whatsapp', lastActivity: '1d ago', owner: { name: 'Bob', initials: 'B' }, amount: 8500 },
  { id: '4', status: 'Replied', company: 'Global Solutions', contact: 'Mike Ross', location: 'London, UK', score: 72, channel: 'email', lastActivity: '2d ago', owner: { name: 'Alice', initials: 'A' }, amount: 15000 },
  { id: '5', status: 'Qualified', company: 'InnovateHub', contact: 'Emily Chen', location: 'Berlin, DE', score: 92, channel: 'instagram', lastActivity: '3d ago', owner: { name: 'Charlie', initials: 'C' }, amount: 24000 },
  { id: '6', status: 'Meeting', company: 'CloudScale', contact: 'David Lee', location: 'Austin, TX', score: 88, channel: 'email', lastActivity: '5d ago', owner: { name: 'Bob', initials: 'B' }, amount: 18500 },
  { id: '7', status: 'Proposal', company: 'NextGen', contact: 'Lisa Wong', location: 'Toronto, CA', score: 95, channel: 'facebook', lastActivity: '1w ago', owner: { name: 'Alice', initials: 'A' }, amount: 16000 },
  { id: '8', status: 'Won', company: 'Stripe', contact: 'Patrick C.', location: 'San Francisco, CA', score: 99, channel: 'email', lastActivity: '2w ago', owner: { name: 'Charlie', initials: 'C' }, amount: 45000 },
];

const COLUMNS: { id: LeadStatus; label: string }[] = [
  { id: 'New', label: 'New' },
  { id: 'Contacted', label: 'Contacted' },
  { id: 'Replied', label: 'Replied' },
  { id: 'Qualified', label: 'Qualified' },
  { id: 'Meeting', label: 'Meeting' },
  { id: 'Proposal', label: 'Proposal' },
  { id: 'Won', label: 'Won' },
  { id: 'Lost', label: 'Lost' },
];

export function Pipeline() {
  const [cards, setCards] = useState<CardData[]>(MOCK_CARDS);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCardId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag image to be captured before we might modify styles
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.classList.add('opacity-50');
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('opacity-50');
    }
    setDraggedCardId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    if (draggedCardId) {
      setCards(prev => prev.map(c => c.id === draggedCardId ? { ...c, status } : c));
    }
    setDraggedCardId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <MessageCircle size={14} className="text-[#25D366]" />;
      case 'facebook': return <Facebook size={14} className="text-[#1877F2]" />;
      case 'instagram': return <Instagram size={14} className="text-[#E4405F]" />;
      case 'email':
      default: return <Mail size={14} className="text-[#EA4335]" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-100';
    if (score >= 40) return 'text-amber-600 bg-amber-100';
    return 'text-blue-600 bg-blue-100';
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Pipeline</h1>
          <p className="text-sm text-brand-muted mt-1">Track your deals through the sales process.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              placeholder="Search deals..."
            />
          </div>
          <Select>
            <option>Sales Pipeline</option>
            <option>Partner Pipeline</option>
          </Select>
          <Button variant="outline" className="bg-white">
            <Filter size={16} className="mr-2" /> Filters
          </Button>
          <Button>
            <Plus size={16} className="mr-2" /> Add Deal
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-4 h-full min-w-max items-start">
          {COLUMNS.map((column) => {
            const columnCards = cards.filter(c => c.status === column.id);
            const totalAmount = columnCards.reduce((sum, c) => sum + c.amount, 0);

            return (
              <div 
                key={column.id} 
                className="w-[320px] flex flex-col max-h-full bg-gray-50/50 rounded-xl border border-gray-100"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-brand-text flex items-center gap-2">
                      {column.label}
                      <span className="bg-white border border-gray-200 text-brand-muted text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                        {columnCards.length}
                      </span>
                    </h3>
                    <button className="text-gray-400 hover:text-brand-text transition-colors p-1 rounded hover:bg-gray-200/50">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  <div className="text-xs font-medium text-brand-muted">
                    {formatCurrency(totalAmount)} potential
                  </div>
                </div>
                
                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {columnCards.map((card) => (
                    <Card 
                      key={card.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      onDragEnd={handleDragEnd}
                      className="cursor-grab active:cursor-grabbing border-gray-200 shadow-sm hover:border-brand-primary/40 hover:shadow-md transition-all bg-white"
                    >
                      <CardContent className="p-3.5">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <div>
                            <h4 className="font-bold text-brand-text text-sm leading-tight">{card.company}</h4>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">{card.contact}</p>
                          </div>
                          <Badge variant="success" className="bg-green-50 text-green-700 border-green-100 shrink-0">
                            {formatCurrency(card.amount)}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3 mb-4 text-xs text-brand-muted">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {card.location}
                          </span>
                          <span className="flex items-center gap-1">
                            {getChannelIcon(card.channel)} 
                            <span className="capitalize">{card.channel}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                          <div className="flex items-center gap-2">
                            <Avatar fallback={card.owner.initials} size="sm" className="bg-indigo-100 text-indigo-700 w-6 h-6 text-[10px]" />
                            <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                              <Clock size={12} /> {card.lastActivity}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getScoreColor(card.score)}`}>
                            {card.score}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add Card Button */}
                  <button className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-brand-muted hover:text-brand-primary hover:bg-white rounded-lg border border-dashed border-gray-300 transition-colors bg-gray-50">
                    <Plus size={16} /> Add deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #E5E7EB;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
