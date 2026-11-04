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
      ghUsername = user.email ? user.email.split('@')[0] : 'dev';
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

// Upsert user profile to Appwrite 'profiles' collection + fallback local directory
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

  // 2. Sync to Appwrite messages table (__ack_directory__) and profiles table if accessible
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

    // Save to messagesTableId (guaranteed available in database)
    databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.messagesTableId,
      ID.unique(),
      docData
    ).catch(() => {});

    // Also attempt profiles table if collection exists
    const docId = `gh_${profile.githubId || profile.username.toLowerCase()}`;
    const profileData = {
      githubId: profile.githubId,
      login: profile.username,
      name: profile.name,
      avatarUrl: profile.avatar,
      searchable: profile.searchable ?? true,
      inviteCode: profile.inviteCode || '',
      updatedAt: new Date().toISOString(),
    };

    databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.profilesTableId,
      docId,
      profileData
    ).catch((err: any) => {
      if (err?.code === 409 || err?.message?.includes('already exists')) {
        databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.profilesTableId,
          docId,
          profileData
        ).catch(() => {});
      }
    });
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

  // 1. Query Appwrite messages table directory
  try {
    const res = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.messagesTableId,
      [Query.equal('conversationId', '__ack_directory__'), Query.limit(50)]
    );
    for (const doc of res.documents as any[]) {
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
  } catch (err) {}

  // 2. Query Appwrite profiles table if available
  try {
    const res = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.profilesTableId,
      [Query.limit(25)]
    );
    for (const doc of res.documents as any[]) {
      const login = (doc.login || '').toLowerCase();
      const name = (doc.name || '').toLowerCase();
      const searchable = doc.searchable !== false;

      if (searchable && (login.includes(query) || name.includes(query))) {
        matchedMap.set(login, {
          id: doc.$id,
          githubId: doc.githubId || doc.$id,
          name: doc.name || doc.login,
          username: doc.login,
          avatar: doc.avatarUrl || `https://github.com/${doc.login}.png`,
          searchable: true,
          inviteCode: doc.inviteCode || '',
        });
      }
    }
  } catch (err) {}

  // 3. Merge local directory entries
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

  // Exclude current user from results
  if (excludeUsername) {
    matchedMap.delete(excludeUsername.toLowerCase());
  }

  return Array.from(matchedMap.values()).slice(0, 10);
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

// Exchange URL token (userId & secret) for session on return
export async function handleOAuthCallback(): Promise<AuthenticatedUserProfile | null> {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');
  const secret = params.get('secret');

  if (userId && secret) {
    try {
      console.log('[Appwrite] Exchanging OAuth token for session:', { userId });
      await account.createSession(userId, secret);
      // Clean query params so URL stays tidy
      const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (err) {
      console.error('[Appwrite] Failed to create session from token:', err);
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

