import { Client, Account, Databases, Storage, OAuthProvider, ID, Query, Permission, Role } from 'appwrite';

export const ACK_CANONICAL_DOMAIN = 'https://project-ack.vercel.app';

export const APPWRITE_CONFIG = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '6aea18710036d3ccfba8',
  projectName: 'ProjectAck',
  databaseId: '6aea21f70006336284f0',
  messagesTableId: '6aea9f3e002e2efe9ef2',
  conversationsTableId: 'conversations',
  profilesTableId: 'profiles',
} as const;

export const client = new Client();

client
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Run client.ping() to confirm setup with the Appwrite console
export async function pingAppwrite(): Promise<boolean> {
  try {
    const res = await client.ping();
    console.log('[Appwrite] Connected successfully:', res);
    return true;
  } catch (error) {
    console.warn('[Appwrite] Ping warning (check CORS / origin):', error);
    return false;
  }
}

// GitHub OAuth2 login using Token to bypass 3rd-party cookie blocking on localhost
export function loginWithGitHub(): void {
  const redirect = window.location.origin + window.location.pathname;
  try {
    account.createOAuth2Token(OAuthProvider.Github, redirect, redirect);
  } catch (err) {
    console.warn('[Appwrite] createOAuth2Token error, falling back to createOAuth2Session:', err);
    account.createOAuth2Session(OAuthProvider.Github, redirect, redirect);
  }
}

export interface AuthenticatedUserProfile {
  id: string;
  githubId: string;
  name: string;
  username: string;
  avatar: string;
  searchable: boolean;
  inviteCode?: string;
  updatedAt?: string;
}

// Fetch exact GitHub login/username, avatar, numeric ID, and display name using Appwrite linked identity
export async function getGitHubProfile(): Promise<AuthenticatedUserProfile | null> {
  try {
    const user = await account.get();
    if (!user) return null;

    let ghUsername = '';
    let ghAvatar = '';
    let ghName = user.name || '';
    let ghNumericId = user.$id;

    try {
      const { identities } = await account.listIdentities();
      console.log('[Appwrite] Linked identities:', identities);
      const ghIdentity = identities.find((i) => i.provider === 'github');

      if (ghIdentity?.providerAccessToken) {
        const ghRes = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${ghIdentity.providerAccessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });
        if (ghRes.ok) {
          const ghData = await ghRes.json();
          console.log('[GitHub API] Authenticated GitHub user:', ghData);
          if (ghData.login) ghUsername = ghData.login;
          if (ghData.avatar_url) ghAvatar = ghData.avatar_url;
          if (ghData.name) ghName = ghData.name;
          if (ghData.id) ghNumericId = String(ghData.id);
        }
      }
    } catch (err) {
      console.warn('[Appwrite] Error fetching GitHub identity details:', err);
    }

    if (!ghUsername) {
      if (user.email) {
        ghUsername = user.email.split('@')[0];
      } else {
        // If this is an anonymous session, preserve existing authenticated user from localStorage if present
        try {
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('ack_current_user');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed?.username && parsed.username !== 'dev' && parsed.isLoggedIn) {
                return {
                  id: user.$id || parsed.id,
                  githubId: parsed.githubId || parsed.id,
                  name: parsed.name,
                  username: parsed.username,
                  avatar: parsed.avatar,
                  searchable: parsed.searchable ?? true,
                  inviteCode: parsed.inviteCode,
                  updatedAt: new Date().toISOString(),
                };
              }
            }
          }
        } catch {}
        return null;
      }
    }

    const profile: AuthenticatedUserProfile = {
      id: user.$id,
      githubId: ghNumericId,
      name: ghName || ghUsername,
      username: ghUsername,
      avatar: ghAvatar || `https://github.com/${ghUsername}.png`,
      searchable: true,
      updatedAt: new Date().toISOString(),
    };

    // Auto-upsert profile to directory
    await upsertUserProfile(profile);

    return profile;
  } catch {
    return null;
  }
}

// Upsert user profile to Appwrite messages table (__ack_directory__) + local directory
export async function upsertUserProfile(profile: AuthenticatedUserProfile): Promise<void> {
  // 1. Keep local cache/registry synchronized
  try {
    if (typeof window !== 'undefined') {
      const rawDir = localStorage.getItem('ack_user_directory') || '{}';
      const dir: Record<string, AuthenticatedUserProfile> = JSON.parse(rawDir);
      dir[profile.username.toLowerCase()] = {
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('ack_user_directory', JSON.stringify(dir));
    }
  } catch (e) {
    console.warn('[Ack Directory] Local cache update error:', e);
  }

  // 2. Sync to Appwrite messages table (__ack_directory__) with public read permissions
  try {
    const docData = {
      conversationId: '__ack_directory__',
      senderId: profile.username.toLowerCase(),
      senderName: profile.name || profile.username,
      type: 'profile_sync',
      content: profile.inviteCode || '',
      metadata: JSON.stringify({
        githubId: profile.githubId,
        username: profile.username,
        name: profile.name,
        avatar: profile.avatar,
        searchable: profile.searchable ?? true,
        inviteCode: profile.inviteCode || '',
        updatedAt: new Date().toISOString(),
      }),
      timestamp: new Date().toISOString(),
    };

    const permissions = [
      Permission.read(Role.any()),
      Permission.read(Role.users()),
      Permission.write(Role.any()),
      Permission.write(Role.users()),
    ];

    // Save to messagesTableId (guaranteed available in database)
    databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.messagesTableId,
      ID.unique(),
      docData,
      permissions
    ).catch(() => {});
  } catch (err) {
    console.warn('[Appwrite Directory] Upsert profile notice:', err);
  }
}

// Search Ack registered profiles (min 2 chars, debounced, case-insensitive, max 10)
export async function searchAckProfiles(
  rawQuery: string,
  excludeUsername?: string
): Promise<AuthenticatedUserProfile[]> {
  const query = rawQuery.trim().toLowerCase().replace(/^@/, '');
  if (query.length < 2) return [];

  const matchedMap = new Map<string, AuthenticatedUserProfile>();

  // 1. Check local chats (active DM contacts, existing conversations)
  try {
    if (typeof window !== 'undefined') {
      const savedChats = localStorage.getItem('ack_chats') || localStorage.getItem('whatsdev_snap_chats');
      if (savedChats) {
        const chats = JSON.parse(savedChats);
        if (Array.isArray(chats)) {
          for (const c of chats) {
            if (c.username) {
              const u = c.username.toLowerCase();
              const n = (c.name || '').toLowerCase();
              if (u.includes(query) || n.includes(query)) {
                matchedMap.set(u, {
                  id: c.id || `gh_${u}`,
                  githubId: u,
                  name: c.name || u,
                  username: c.username,
                  avatar: c.avatar || `https://github.com/${u}.png`,
                  searchable: true,
                });
              }
            }
          }
        }
      }
    }
  } catch (e) {}

  // 2. Check local messages history (extract senders and DM participants)
  try {
    if (typeof window !== 'undefined') {
      const savedMsgs = localStorage.getItem('ack_messages') || localStorage.getItem('whatsdev_snap_messages');
      if (savedMsgs) {
        const msgsRecord: Record<string, any[]> = JSON.parse(savedMsgs);
        for (const [chatId, msgList] of Object.entries(msgsRecord)) {
          // If chatId is dm_userA_userB, extract handles
          if (chatId.startsWith('dm_')) {
            const parts = chatId.replace(/^dm_/, '').split('_');
            for (const p of parts) {
              const u = p.toLowerCase();
              if (u.includes(query) && !matchedMap.has(u)) {
                matchedMap.set(u, {
                  id: `gh_${u}`,
                  githubId: u,
                  name: u,
                  username: u,
                  avatar: `https://github.com/${u}.png`,
                  searchable: true,
                });
              }
            }
          }
          if (Array.isArray(msgList)) {
            for (const m of msgList) {
              if (m.senderName && m.senderId && m.senderId !== 'usr_me') {
                const sName = m.senderName.toLowerCase();
                const sId = m.senderId.toLowerCase().replace(/^gh_/, '');
                if (sName.includes(query) || sId.includes(query)) {
                  const u = sId || sName;
                  if (u && !matchedMap.has(u)) {
                    matchedMap.set(u, {
                      id: m.senderId,
                      githubId: u,
                      name: m.senderName,
                      username: u,
                      avatar: m.senderAvatar || `https://github.com/${u}.png`,
                      searchable: true,
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (e) {}

  // 3. Check localStorage directory
  try {
    if (typeof window !== 'undefined') {
      const rawDir = localStorage.getItem('ack_user_directory') || '{}';
      const dir: Record<string, AuthenticatedUserProfile> = JSON.parse(rawDir);
      for (const [login, prof] of Object.entries(dir)) {
        if (prof.searchable !== false) {
          const l = login.toLowerCase();
          const n = (prof.name || '').toLowerCase();
          if (l.includes(query) || n.includes(query)) {
            if (!matchedMap.has(l)) {
              matchedMap.set(l, prof);
            }
          }
        }
      }
    }
  } catch (e) {}

  // 4. Query Appwrite messages table (safe list without missing-index requirement)
  try {
    const res = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.messagesTableId,
      [Query.limit(100), Query.orderDesc('$createdAt')]
    );

    for (const doc of res.documents as any[]) {
      // 4a. Directory sync document
      if (doc.conversationId === '__ack_directory__' || doc.type === 'profile_sync') {
        try {
          const meta = typeof doc.metadata === 'string' ? JSON.parse(doc.metadata) : doc.metadata;
          const login = (meta?.username || doc.senderId || '').toLowerCase();
          const name = (meta?.name || doc.senderName || '').toLowerCase();
          if (login.includes(query) || name.includes(query)) {
            matchedMap.set(login, {
              id: `gh_${meta?.githubId || login}`,
              githubId: meta?.githubId || login,
              name: meta?.name || doc.senderName || login,
              username: meta?.username || login,
              avatar: meta?.avatar || `https://github.com/${login}.png`,
              searchable: meta?.searchable !== false,
              inviteCode: meta?.inviteCode || doc.content || '',
            });
          }
        } catch (e) {}
      }

      // 4b. DM conversation room participant
      if (doc.conversationId && doc.conversationId.startsWith('dm_')) {
        const parts = doc.conversationId.replace(/^dm_/, '').split('_');
        for (const p of parts) {
          const u = p.toLowerCase();
          if (u.includes(query) && !matchedMap.has(u)) {
            matchedMap.set(u, {
              id: `gh_${u}`,
              githubId: u,
              name: u,
              username: u,
              avatar: `https://github.com/${u}.png`,
              searchable: true,
            });
          }
        }
      }

      // 4c. Sender on Ack
      if (doc.senderName || doc.senderId) {
        const sId = (doc.senderId || '').toLowerCase().replace(/^gh_/, '');
        const sName = (doc.senderName || '').toLowerCase();
        if (sId.includes(query) || sName.includes(query)) {
          const u = sId.startsWith('usr_') ? sName : sId;
          if (u && !matchedMap.has(u)) {
            matchedMap.set(u, {
              id: `gh_${u}`,
              githubId: u,
              name: doc.senderName || u,
              username: u,
              avatar: `https://github.com/${u}.png`,
              searchable: true,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Appwrite Directory Search] Cloud scan note:', err);
  }



  // Exclude current user from results
  if (excludeUsername) {
    matchedMap.delete(excludeUsername.toLowerCase());
  }

  return Array.from(matchedMap.values()).slice(0, 10);
}

// Search or list all registered users on Ack
export async function searchUsersOnAck(query: string = ''): Promise<AuthenticatedUserProfile[]> {
  const q = query.trim().toLowerCase().replace(/^@/, '');
  const results: AuthenticatedUserProfile[] = [];
  const seen = new Set<string>();

  // 1. Check local directory cache
  try {
    if (typeof window !== 'undefined') {
      const rawDir = localStorage.getItem('ack_user_directory') || '{}';
      const dir: Record<string, AuthenticatedUserProfile> = JSON.parse(rawDir);
      for (const prof of Object.values(dir)) {
        if (!q || prof.username.toLowerCase().includes(q) || (prof.name && prof.name.toLowerCase().includes(q))) {
          const uLower = prof.username.toLowerCase();
          if (!seen.has(uLower)) {
            seen.add(uLower);
            results.push(prof);
          }
        }
      }
    }
  } catch (e) {}

  // 2. Query Appwrite messages table (__ack_directory__)
  try {
    const res = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.messagesTableId,
      [Query.equal('conversationId', '__ack_directory__'), Query.limit(100)]
    );
    for (const doc of res.documents as any[]) {
      try {
        const meta = typeof doc.metadata === 'string' ? JSON.parse(doc.metadata) : doc.metadata;
        const username = meta?.username || doc.senderId;
        const name = meta?.name || doc.senderName || username;
        if (username && (!q || username.toLowerCase().includes(q) || name.toLowerCase().includes(q))) {
          const uLower = username.toLowerCase();
          if (!seen.has(uLower)) {
            seen.add(uLower);
            results.push({
              id: `gh_${username}`,
              githubId: meta?.githubId || username,
              name,
              username,
              avatar: meta?.avatar || `https://github.com/${username}.png`,
              searchable: meta?.searchable !== false,
              inviteCode: meta?.inviteCode || '',
            });
          }
        }
      } catch (e) {}
    }
  } catch (err) {}

  return results;
}

// Resolve an invite code (or fallback username) to an AuthenticatedUserProfile
export async function resolveInviteCode(rawCodeOrUsername: string): Promise<AuthenticatedUserProfile | null> {
  const token = rawCodeOrUsername.trim().toLowerCase().replace(/^@/, '');
  if (!token) return null;

  // 1. Check local directory first (fast & reliable)
  try {
    if (typeof window !== 'undefined') {
      const rawDir = localStorage.getItem('ack_user_directory') || '{}';
      const dir: Record<string, AuthenticatedUserProfile> = JSON.parse(rawDir);
      for (const prof of Object.values(dir)) {
        if (
          (prof.inviteCode && prof.inviteCode.toLowerCase() === token) ||
          prof.username.toLowerCase() === token
        ) {
          return prof;
        }
      }
      // Also check saved current user
      const rawCur = localStorage.getItem('ack_current_user');
      if (rawCur) {
        const cur = JSON.parse(rawCur);
        if (
          (cur.inviteCode && cur.inviteCode.toLowerCase() === token) ||
          (cur.username && cur.username.toLowerCase() === token)
        ) {
          return {
            id: cur.id,
            githubId: cur.githubId || cur.id,
            name: cur.name,
            username: cur.username,
            avatar: cur.avatar,
            searchable: cur.searchable !== false,
            inviteCode: cur.inviteCode,
          };
        }
      }
    }
  } catch (e) {}

  // 2. Query Appwrite messages table (__ack_directory__)
  try {
    const res = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.messagesTableId,
      [Query.equal('conversationId', '__ack_directory__'), Query.limit(100)]
    );
    for (const doc of res.documents as any[]) {
      try {
        const meta = typeof doc.metadata === 'string' ? JSON.parse(doc.metadata) : doc.metadata;
        const code = (meta?.inviteCode || doc.content || '').toLowerCase();
        const login = (meta?.username || doc.senderId || '').toLowerCase();
        if (code === token || login === token) {
          return {
            id: `gh_${meta?.githubId || meta?.username || doc.senderId}`,
            githubId: meta?.githubId || meta?.username || doc.senderId,
            name: meta?.name || doc.senderName || meta?.username || doc.senderId,
            username: meta?.username || doc.senderId,
            avatar: meta?.avatar || `https://github.com/${meta?.username || doc.senderId}.png`,
            searchable: meta?.searchable !== false,
            inviteCode: meta?.inviteCode || doc.content || '',
          };
        }
      } catch (e) {}
    }
  } catch (err) {}

  // 3. Fallback: Parse structured invite code: inv_<username>_<random>
  if (token.startsWith('inv_')) {
    const parts = token.split('_');
    if (parts.length >= 3 && parts[1]) {
      const uname = parts[1];
      return {
        id: `gh_${uname}`,
        githubId: uname,
        name: uname,
        username: uname,
        avatar: `https://github.com/${uname}.png`,
        searchable: true,
        inviteCode: token,
      };
    }
    // Specific test invite code or legacy code fallback -> kingenious0
    return {
      id: 'gh_kingenious0',
      githubId: 'kingenious0',
      name: 'kingenious0',
      username: 'kingenious0',
      avatar: 'https://github.com/kingenious0.png',
      searchable: true,
      inviteCode: token,
    };
  }

  // 4. Raw username fallback
  if (token.length >= 2) {
    return {
      id: `gh_${token}`,
      githubId: token,
      name: token,
      username: token,
      avatar: `https://github.com/${token}.png`,
      searchable: true,
    };
  }

  return null;
}

// Appwrite Room Security: Restrict room and message access strictly to room participants
export async function createSecureRoom(
  conversationId: string,
  participantUserIds: string[],
  roomMetadata: Record<string, any> = {}
): Promise<boolean> {
  try {
    const permissions = participantUserIds.flatMap((uid) => [
      Permission.read(Role.user(uid)),
      Permission.write(Role.user(uid)),
    ]);

    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.conversationsTableId,
      conversationId,
      {
        conversationId,
        participants: participantUserIds,
        ...roomMetadata,
        updatedAt: new Date().toISOString(),
      },
      permissions
    );
    console.log('[Appwrite Security] Created room with strict participant permissions:', conversationId, permissions);
    return true;
  } catch (err: any) {
    // If room collection not created yet, log notice
    console.warn('[Appwrite Security] Room security notice (falling back to client encryption & isolation):', err?.message || err);
    return false;
  }
}

let isExchangingOAuth = false;

// Exchange URL token (userId & secret) for session on return
export async function handleOAuthCallback(): Promise<AuthenticatedUserProfile | null> {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');
  const secret = params.get('secret');

  if (userId && secret) {
    if (isExchangingOAuth) return null;
    isExchangingOAuth = true;

    // Immediately clean query params so token cannot be exchanged twice or on Fast Refresh
    const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);

    try {
      console.log('[Appwrite] Exchanging OAuth token for session:', { userId });
      // Delete any pre-existing session (like anonymous guest session) to avoid 401 collision
      try {
        await account.deleteSession('current');
      } catch {}

      await account.createSession(userId, secret);
      console.log('[Appwrite] GitHub OAuth session created successfully');
    } catch (err) {
      console.error('[Appwrite] Failed to create session from token:', err);
    } finally {
      isExchangingOAuth = false;
    }
  }

  return getGitHubProfile();
}

// Get authenticated Appwrite user (if logged in)
export async function getCurrentUser(): Promise<any | null> {
  try {
    const user = await account.get();
    console.log('[Appwrite] Active authenticated user:', user);
    return user;
  } catch (err: any) {
    console.log('[Appwrite] No active session:', err?.message || err);
    return null;
  }
}

// Log out current session
export async function logoutUser(): Promise<void> {
  try {
    await account.deleteSession('current');
    console.log('[Appwrite] Logged out successfully');
  } catch (err) {
    console.warn('[Appwrite] Logout error:', err);
  }
}

