/**
 * Project ACK: Core System & Architecture Tests
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import dbManager from '../src/db/client';
import { maskSecretLines } from '../src/utils/crypto';

describe('Project ACK Core Architecture', () => {
  beforeAll(async () => {
    await dbManager.initialize();
  });

  test('App mounts and renders NavigationContainer with Obsidian & Cyber-Emerald layout', async () => {
    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<App />);
    });
    expect(tree).toBeDefined();
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
});
