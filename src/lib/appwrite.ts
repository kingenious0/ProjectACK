import { Client, Account, Databases, Storage } from 'appwrite';

export const APPWRITE_CONFIG = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '6aea18710036d3ccfba8',
  projectName: 'ProjectAck',
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
