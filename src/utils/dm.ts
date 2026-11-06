/**
 * Utility to reliably parse DM conversation IDs and participants.
 * Handles usernames with underscores (e.g., "dev_ack", "kinge_dev") without
 * corrupting them via naive string splitting.
 */

export interface DmParticipantsResult {
  isParticipant: boolean;
  peerUsername: string;
}

export function parseDmParticipants(
  chatId: string,
  myUsername?: string
): DmParticipantsResult {
  if (!chatId || !chatId.startsWith('dm_')) {
    return { isParticipant: true, peerUsername: '' };
  }
  const cleanId = chatId.toLowerCase().trim();
  const my = (myUsername || '').toLowerCase().trim().replace(/^@/, '');

  if (!my || my.startsWith('guest_') || my === 'dev_guest') {
    return { isParticipant: false, peerUsername: '' };
  }

  const prefix = `dm_${my}_`;
  const suffix = `_${my}`;

  if (cleanId.startsWith(prefix)) {
    const peer = cleanId.slice(prefix.length).replace(/^_+|_+$/g, '');
    return { isParticipant: true, peerUsername: peer };
  }
  if (cleanId.endsWith(suffix)) {
    const peer = cleanId.slice(3, cleanId.length - suffix.length).replace(/^_+|_+$/g, '');
    return { isParticipant: true, peerUsername: peer };
  }
  if (cleanId === `dm_${my}`) {
    return { isParticipant: true, peerUsername: '' };
  }

  // Handle case where handle might be surrounded by underscores
  const infix = `_${my}_`;
  if (cleanId.includes(infix)) {
    const raw = cleanId.replace(/^dm_/, '');
    const peer = raw.replace(my, '').replace(/^_+|_+$/g, '');
    return { isParticipant: true, peerUsername: peer };
  }

  // Split on single underscore after dm_
  const parts = cleanId.replace(/^dm_/, '').split('_');
  if (parts.length === 2) {
    if (parts[0] === my) return { isParticipant: true, peerUsername: parts[1] };
    if (parts[1] === my) return { isParticipant: true, peerUsername: parts[0] };
  }

  return { isParticipant: false, peerUsername: '' };
}
