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
  const cleanId = chatId.toLowerCase();
  const my = (myUsername || '').toLowerCase().trim().replace(/^@/, '');

  if (!my) {
    const raw = cleanId.replace(/^dm_/, '');
    return { isParticipant: true, peerUsername: raw };
  }

  const prefix = `dm_${my}_`;
  const suffix = `_${my}`;

  if (cleanId.startsWith(prefix)) {
    const peer = cleanId.slice(prefix.length);
    return { isParticipant: true, peerUsername: peer };
  }
  if (cleanId.endsWith(suffix)) {
    const peer = cleanId.slice(3, cleanId.length - suffix.length);
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

  return { isParticipant: false, peerUsername: '' };
}
