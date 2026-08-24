
import React from 'react';
import { ChannelAvailability as ChannelAvailabilityType } from '../../lib/channelUtils';
import { ChannelStatus } from './ChannelStatus';
import { MessageCircle, Facebook, Instagram, Mail } from 'lucide-react';

export const ChannelAvailability: React.FC<{ availabilities: ChannelAvailabilityType[] }> = ({ availabilities }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageCircle size={16} className="text-[#25D366]" />;
      case 'facebook': return <Facebook size={16} className="text-[#1877F2]" />;
      case 'instagram': return <Instagram size={16} className="text-[#E4405F]" />;
      case 'gmail': return <Mail size={16} className="text-[#EA4335]" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-3">
      {availabilities.map(av => (
        <div key={av.type} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon(av.type)}
            <span className="text-sm font-medium capitalize">{av.type}</span>
          </div>
          <ChannelStatus state={av.state} />
        </div>
      ))}
    </div>
  );
};
