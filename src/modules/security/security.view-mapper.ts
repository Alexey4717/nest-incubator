import { SessionViewModel } from '@/modules/session/models/session-view.model';

import { SecurityDeviceViewModel } from './types/view-models';

export function toSecurityDeviceViewModel(session: SessionViewModel): SecurityDeviceViewModel {
  return {
    ip: session.ip,
    title: session.title,
    lastActiveDate: session.lastActiveDate,
    deviceId: session.deviceId,
  };
}

export function toSecurityDeviceViewModels(
  sessions: SessionViewModel[],
): SecurityDeviceViewModel[] {
  return sessions.map(toSecurityDeviceViewModel);
}
