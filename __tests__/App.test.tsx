/**
 * Project ACK: Core System & Architecture Tests
 */

import React from 'react';
import dbManager from '../src/db/client';
import { maskSecretLines } from '../src/utils/crypto';
import appwriteSync from '../src/lib/appwriteSync';

describe('Project ACK Core Architecture', () => {
  beforeAll(async () => {
    await dbManager.initialize();
  });

  afterAll(() => {
    appwriteSync.unsubscribeAll();
  });

  test('Database manager executes DDL schema and seeds initial developer chats', async () => {
    const chats = await dbManager.getChats();
    expect(chats.length).toBeGreaterThan(0);

    const firstChat = chats[0];
    const messages = await dbManager.getMessages(firstChat.id);
    expect(messages.length).toBeGreaterThan(0);
  });

  test('Optimistic UI message creation creates pending message and triggers ACK progression', async () => {
    const newMsg = await dbManager.sendMessage({
      chatId: 'chat_dm_dan',
      senderId: 'usr_current_dev',
      content: 'Testing zero-latency message pipeline',
      messageType: 'text',
    });

    expect(newMsg.status).toBe('pending');
    expect(newMsg.content).toBe('Testing zero-latency message pipeline');
  });

  test('Burn-after-reading secret masking replaces keys with asterisks', () => {
    const input = 'API_SECRET_KEY=sk_live_1234567890\nDATABASE_URL=postgres://ack:pass@localhost:5432/db';
    const masked = maskSecretLines(input);

    expect(masked).toContain('API_SECRET_KEY=**************************************** [BURNED]');
    expect(masked).not.toContain('sk_live_1234567890');
    expect(masked).not.toContain('postgres://ack:pass');
  });

  test('parseDmParticipants strictly isolates DMs between users and blocks third parties/guests', () => {
    const { parseDmParticipants } = require('../src/utils/dm');

    // Participant in the conversation
    const resultNious = parseDmParticipants('dm_niouspark_rawlingsjunior', 'niouspark');
    expect(resultNious.isParticipant).toBe(true);
    expect(resultNious.peerUsername).toBe('rawlingsjunior');

    const resultRawlings = parseDmParticipants('dm_niouspark_rawlingsjunior', 'rawlingsjunior');
    expect(resultRawlings.isParticipant).toBe(true);
    expect(resultRawlings.peerUsername).toBe('niouspark');

    // Third party user MUST NOT be a participant
    const resultKingenious = parseDmParticipants('dm_niouspark_rawlingsjunior', 'kingenious0');
    expect(resultKingenious.isParticipant).toBe(false);

    // Guest or unauthenticated users MUST NOT be participants
    expect(parseDmParticipants('dm_niouspark_rawlingsjunior', '').isParticipant).toBe(false);
    expect(parseDmParticipants('dm_niouspark_rawlingsjunior', 'guest_abc123').isParticipant).toBe(false);
    expect(parseDmParticipants('dm_niouspark_rawlingsjunior', 'dev_guest').isParticipant).toBe(false);
  });

  test('Group creation and messages strictly isolate non-members and retain linked repo', () => {
    const { webStore, setCurrentUser } = require('../src/web-db/store');

    // Set current user as niouspark
    setCurrentUser({
      id: 'usr_niouspark',
      name: 'Nious Park',
      username: 'niouspark',
      isLoggedIn: true,
    });

    const group = webStore.createGroup(
      'Sprint 14',
      [
        {
          id: 'usr_rawlings',
          name: 'Rawlings Junior Asomani',
          username: 'rawlingsjunior',
          avatar: '',
          tag: 'Dev',
          mutualCount: 1,
          isOnline: true,
        },
      ],
      'https://github.com/kingenious0/ACK'
    );

    expect(group.name).toBe('Sprint 14');
    expect(group.linkedRepo).toBe('https://github.com/kingenious0/ACK');
    expect(group.members.some((m: any) => m.username === 'niouspark')).toBe(true);
    expect(group.members.some((m: any) => m.username === 'rawlingsjunior')).toBe(true);

    // Send a message in the group
    const msg = webStore.sendMessage(group.id, 'Hello group members!');
    expect(msg.metadata.groupName).toBe('Sprint 14');
    expect(msg.metadata.linkedRepo).toBe('https://github.com/kingenious0/ACK');
    expect(msg.metadata.members.length).toBe(2);

    // Group messages are visible to niouspark
    const niousparkMsgs = webStore.getMessages(group.id);
    expect(niousparkMsgs.length).toBeGreaterThan(0);

    // Switch user to rawlingsjunior (invited member)
    setCurrentUser({
      id: 'usr_rawlings',
      name: 'Rawlings Junior Asomani',
      username: 'rawlingsjunior',
      isLoggedIn: true,
    });

    // Simulate remote realtime message broadcast reaching rawlingsjunior
    webStore.receiveRemoteMessage(
      {
        id: 'msg_remote_1',
        chat_id: group.id,
        sender_id: 'usr_niouspark',
        senderName: 'Nious Park',
        content: 'Hello group members!',
        message_type: 'text',
        metadata: {
          groupName: 'Sprint 14',
          linkedRepo: 'https://github.com/kingenious0/ACK',
          members: group.members,
        },
      },
      false
    );

    // Rawlings Junior Asomani sees the group instantiated with linkedRepo and messages
    const rawlingsChats = webStore.getChats();
    const rawlingsGroup = rawlingsChats.find((c: any) => c.id === group.id);
    expect(rawlingsGroup).toBeDefined();
    expect(rawlingsGroup?.linkedRepo).toBe('https://github.com/kingenious0/ACK');
    const rawlingsMsgs = webStore.getMessages(group.id);
    expect(rawlingsMsgs.length).toBeGreaterThan(0);

    // Switch user to kingenious0 (not a member)
    setCurrentUser({
      id: 'usr_kingenious0',
      name: 'Kingenious',
      username: 'kingenious0',
      isLoggedIn: true,
    });

    // Remote message arrives while kingenious0 is active
    webStore.receiveRemoteMessage(
      {
        id: 'msg_remote_2',
        chat_id: group.id,
        sender_id: 'usr_niouspark',
        senderName: 'Nious Park',
        content: 'Secret project discussion',
        message_type: 'text',
        metadata: {
          groupName: 'Sprint 14',
          linkedRepo: 'https://github.com/kingenious0/ACK',
          members: group.members,
        },
      },
      false
    );

    // Kingenious MUST drop it and not have it in chats or messages
    expect(webStore.getChats().some((c: any) => c.id === group.id)).toBe(false);
    expect(webStore.getMessages(group.id)).toEqual([]);
  });
});
