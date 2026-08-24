

import { Lead } from '../store/crmTypes';

export type Channel = 'whatsapp' | 'instagram' | 'facebook' | 'gmail';

// Keep legacy types/exports for compatibility
export type ChannelType = Channel;
export type ChannelState = 'connected' | 'available' | 'unavailable' | 'permission_required' | 'failed';

export interface ChannelAvailability {
  type: ChannelType;
  state: ChannelState;
}

export const DEFAULT_PRIORITY: ChannelType[] = ['whatsapp', 'instagram', 'facebook', 'gmail'];

export const getAvailableChannels = (lead: Lead): Channel[] => {
  const channels: Channel[] = [];
  if (lead.whatsapp) channels.push('whatsapp');
  if (lead.instagram) channels.push('instagram');
  if (lead.facebook) channels.push('facebook');
  if (lead.email) channels.push('gmail');
  return channels;
};

export const getBestAvailableChannel = (lead: Lead): Channel | null => {
  const available = getAvailableChannels(lead);
  if (available.includes('whatsapp')) return 'whatsapp';
  if (available.includes('instagram')) return 'instagram';
  if (available.includes('facebook')) return 'facebook';
  if (available.includes('gmail')) return 'gmail';
  return null;
};

// Mock function for legacy compatibility - now uses deterministic logic
export const getChannelAvailability = (lead: Lead): ChannelAvailability[] => {
  const available = getAvailableChannels(lead);
  return DEFAULT_PRIORITY.map(type => ({
    type,
    state: available.includes(type) ? 'available' : 'unavailable'
  }));
};

export const getRecommendation = (lead: Lead) => {
  const channel = getBestAvailableChannel(lead);
  if (channel) {
    return { type: channel, reason: `${channel.charAt(0).toUpperCase() + channel.slice(1)} is active and ready.` };
  }
  return { type: null, reason: 'No channels available. Please use Manual Contact.' };
};
