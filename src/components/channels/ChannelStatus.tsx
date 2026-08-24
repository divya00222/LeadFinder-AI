
import React from 'react';
import { Badge } from '../ui/Badge';
import { ChannelState, ChannelType } from '../../lib/channelUtils';

export const ChannelStatus: React.FC<{ state: ChannelState }> = ({ state }) => {
  const getBadgeVariant = (state: ChannelState) => {
    switch (state) {
      case 'connected': return 'success';
      case 'available': return 'primary';
      case 'permission_required': return 'warning';
      case 'unavailable': return 'neutral';
      case 'failed': return 'danger';
      default: return 'neutral';
    }
  };

  return <Badge variant={getBadgeVariant(state)}>{state.replace('_', ' ')}</Badge>;
};
