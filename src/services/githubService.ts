/**
 * Project ACK - GitHub Live Integration Service
 * Read-only GitHub REST API client with ETag conditional requests,
 * in-memory caching, pagination, and robust error state handling.
 *
 * Security & Privacy constraints:
 * - Read-only requests using user's GitHub sign-in token (NO "repo" scope requested)
 * - Never copies or stores diff content in Appwrite; fetches on-demand on viewer client
 * - Distinguishes public vs. private repos, rate limits, token revocations, and offline states
 */

import { getGitHubAccessToken } from '../lib/appwrite';
import type { DiffFile, DiffLine } from '../web-db/store';

export type GitHubApiState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'rate_limited'
  | 'not_found_or_private'
  | 'token_revoked'
  | 'offline'
  | 'error';

export interface GitHubPullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed';
  author: {
    login: string;
    avatarUrl?: string;
  };
  branch: string;
  baseBranch: string;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  additions?: number;
  deletions?: number;
  changedFiles?: number;
  body?: string;
}

export interface GitHubDiffFile extends DiffFile {
  status: 'added' | 'removed' | 'modified' | 'renamed' | string;
  rawUrl?: string;
  blobUrl?: string;
  htmlUrl?: string;
  hasNoPatch?: boolean;
  largeOrBinary?: boolean;
}

export interface GitHubDiffResult {
  state: GitHubApiState;
  pr?: GitHubPullRequest;
  files?: GitHubDiffFile[];
  totalAdditions?: number;
  totalDeletions?: number;
  totalFiles?: number;
  rateLimitReset?: string;
  errorMessage?: string;
  isSampleData?: boolean;
}

export interface GitHubPrListResult {
  state: GitHubApiState;
  prs: GitHubPullRequest[];
  rateLimitReset?: string;
  errorMessage?: string;
}

interface CacheEntry {
  etag?: string;
  data: any;
  headers: Record<string, string>;
  timestamp: number;
}

// In-memory cache for ETag conditional requests
const memoryCache = new Map<string, CacheEntry>();

/** Clear in-memory ETag cache (useful for testing or manual refresh) */
export function clearMemoryCache(): void {
  memoryCache.clear();
}

/** Parse repository slug into { owner, repo } from full URL or "owner/repo" */
export function parseRepoSlug(repoInput?: string | null): { owner: string; repo: string } | null {
  if (!repoInput) return null;
  const clean = repoInput
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+|\/+$/g, '');
  const parts = clean.split('/');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1] };
  }
  return null;
}

/** Formats a Unix reset timestamp into human-readable minutes/time */
function formatResetTime(resetUnixHeader?: string | null): string {
  if (!resetUnixHeader) return 'soon';
  const resetMs = parseInt(resetUnixHeader, 10) * 1000;
  if (isNaN(resetMs)) return 'soon';
  const diffMinutes = Math.max(1, Math.round((resetMs - Date.now()) / 60000));
  const timeStr = new Date(resetMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `in ${diffMinutes} min (at ${timeStr})`;
}

/**
 * Parses unified diff patch text into structured line-by-line DiffLine items
 */
export function parsePatchToLines(patchText?: string): DiffLine[] {
  if (!patchText) return [];
  const rawLines = patchText.split('\n');
  const lines: DiffLine[] = [];
  let oldLineNo = 1;
  let newLineNo = 1;

  for (const rawLine of rawLines) {
    if (rawLine.startsWith('@@')) {
      const match = rawLine.match(/@@\s+-(\d+)(?:,\d+)?\s+\+(\d+)(?:,\d+)?\s+@@/);
      if (match) {
        oldLineNo = parseInt(match[1], 10);
        newLineNo = parseInt(match[2], 10);
      }
      lines.push({
        type: 'normal',
        content: rawLine,
      });
    } else if (rawLine.startsWith('+')) {
      lines.push({
        type: 'add',
        content: rawLine.slice(1),
        newNo: newLineNo++,
      });
    } else if (rawLine.startsWith('-')) {
      lines.push({
        type: 'del',
        content: rawLine.slice(1),
        oldNo: oldLineNo++,
      });
    } else {
      const content = rawLine.startsWith(' ') ? rawLine.slice(1) : rawLine;
      lines.push({
        type: 'normal',
        content,
        oldNo: oldLineNo++,
        newNo: newLineNo++,
      });
    }
  }
  return lines;
}

/**
 * Performs a GitHub API GET request with:
 * - User OAuth token (read-only, no repo scope)
 * - ETag (If-None-Match) conditional caching
 * - Rate limit detection and status triage
 */
async function githubFetch(url: string): Promise<{
  ok: boolean;
  status: number;
  data: any;
  headers: Headers;
  state: GitHubApiState;
  rateLimitReset?: string;
  errorMessage?: string;
}> {
  // 1. Offline detection
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return {
      ok: false,
      status: 0,
      data: null,
      headers: new Headers(),
      state: 'offline',
      errorMessage: 'You are currently offline. Check your internet connection.',
    };
  }

  const token = await getGitHubAccessToken();
  const requestHeaders: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  // Check ETag cache
  const cached = memoryCache.get(url);
  if (cached?.etag) {
    requestHeaders['If-None-Match'] = cached.etag;
  }

  try {
    const res = await fetch(url, { headers: requestHeaders });

    // 304 Not Modified -> return cached data
    if (res.status === 304 && cached) {
      return {
        ok: true,
        status: 200,
        data: cached.data,
        headers: res.headers,
        state: 'success',
      };
    }

    const resetHeader = res.headers.get('x-ratelimit-reset');
    const remainingHeader = res.headers.get('x-ratelimit-remaining');

    // 401 Unauthorized -> Token revoked or expired
    if (res.status === 401) {
      return {
        ok: false,
        status: 401,
        data: null,
        headers: res.headers,
        state: 'token_revoked',
        errorMessage: 'GitHub session expired or token revoked. Please sign in with GitHub again.',
      };
    }

    // 403 / 429 Rate limited
    if (res.status === 429 || (res.status === 403 && (remainingHeader === '0' || Boolean(resetHeader)))) {
      const resetMsg = formatResetTime(resetHeader);
      return {
        ok: false,
        status: res.status,
        data: null,
        headers: res.headers,
        state: 'rate_limited',
        rateLimitReset: resetMsg,
        errorMessage: `GitHub API rate limit exceeded. Resets ${resetMsg}. Sign in with GitHub for higher limits.`,
      };
    }

    // 404 / 403 Forbidden -> Not found or private repository
    if (res.status === 404 || res.status === 403) {
      return {
        ok: false,
        status: res.status,
        data: null,
        headers: res.headers,
        state: 'not_found_or_private',
        errorMessage: 'Private repo: connect access (GitHub App comes later)',
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        headers: res.headers,
        state: 'error',
        errorMessage: `GitHub API responded with status ${res.status}`,
      };
    }

    const json = await res.json();
    const etag = res.headers.get('etag') || undefined;

    // Cache successful response
    memoryCache.set(url, {
      etag,
      data: json,
      headers: {},
      timestamp: Date.now(),
    });

    return {
      ok: true,
      status: 200,
      data: json,
      headers: res.headers,
      state: 'success',
    };
  } catch (err: any) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        ok: false,
        status: 0,
        data: null,
        headers: new Headers(),
        state: 'offline',
        errorMessage: 'Network connection lost. You are currently offline.',
      };
    }
    return {
      ok: false,
      status: 0,
      data: null,
      headers: new Headers(),
      state: 'error',
      errorMessage: err?.message || 'Failed to connect to GitHub API',
    };
  }
}

/**
 * Fetch pull requests for a repository (open & closed)
 */
export async function fetchPullRequests(
  owner: string,
  repo: string,
  stateFilter: 'open' | 'closed' | 'all' = 'all'
): Promise<GitHubPrListResult> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=${stateFilter}&per_page=20`;
  const res = await githubFetch(url);

  if (!res.ok || !Array.isArray(res.data)) {
    return {
      state: res.state,
      prs: [],
      rateLimitReset: res.rateLimitReset,
      errorMessage: res.errorMessage,
    };
  }

  const prs: GitHubPullRequest[] = res.data.map((p: any) => ({
    number: p.number,
    title: p.title,
    state: p.state === 'closed' ? 'closed' : 'open',
    author: {
      login: p.user?.login || 'unknown',
      avatarUrl: p.user?.avatar_url,
    },
    branch: p.head?.ref || 'feature',
    baseBranch: p.base?.ref || 'main',
    htmlUrl: p.html_url,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    body: p.body || '',
  }));

  return {
    state: 'success',
    prs,
  };
}

/**
 * Fetch all files and patch diffs for a specific Pull Request
 * Handles pagination for up to 200 files.
 * If a file has no patch (large diff or binary), marks `hasNoPatch: true`
 */
export async function fetchPullRequestFiles(
  owner: string,
  repo: string,
  pullNumber: number
): Promise<{
  state: GitHubApiState;
  files: GitHubDiffFile[];
  rateLimitReset?: string;
  errorMessage?: string;
}> {
  const allFiles: GitHubDiffFile[] = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore && page <= 2) {
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}/files?per_page=${perPage}&page=${page}`;
    const res = await githubFetch(url);

    if (!res.ok || !Array.isArray(res.data)) {
      if (allFiles.length > 0) break; // Return what we got if subsequent page failed
      return {
        state: res.state,
        files: [],
        rateLimitReset: res.rateLimitReset,
        errorMessage: res.errorMessage,
      };
    }

    const items = res.data;
    for (const item of items) {
      const hasPatch = typeof item.patch === 'string' && item.patch.length > 0;
      const parsedLines = hasPatch ? parsePatchToLines(item.patch) : [];

      allFiles.push({
        filename: item.filename,
        oldPath: item.previous_filename || item.filename,
        newPath: item.filename,
        status: item.status || 'modified',
        additions: item.additions || 0,
        deletions: item.deletions || 0,
        rawUrl: item.raw_url,
        blobUrl: item.blob_url,
        htmlUrl: item.html_url || `https://github.com/${owner}/${repo}/pull/${pullNumber}/files`,
        hasNoPatch: !hasPatch,
        largeOrBinary: !hasPatch,
        lines: parsedLines,
      });
    }

    if (items.length < perPage) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return {
    state: 'success',
    files: allFiles,
  };
}

/**
 * High-level method: Fetch PR metadata + files + diffs in one call
 */
export async function fetchPullRequestDiff(
  owner: string,
  repo: string,
  pullNumber: number
): Promise<GitHubDiffResult> {
  // 1. Fetch PR details
  const prUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}`;
  const prRes = await githubFetch(prUrl);

  if (!prRes.ok || !prRes.data) {
    return {
      state: prRes.state,
      rateLimitReset: prRes.rateLimitReset,
      errorMessage: prRes.errorMessage,
    };
  }

  const p = prRes.data;
  const pr: GitHubPullRequest = {
    number: p.number,
    title: p.title,
    state: p.state === 'closed' ? 'closed' : 'open',
    author: {
      login: p.user?.login || 'unknown',
      avatarUrl: p.user?.avatar_url,
    },
    branch: p.head?.ref || 'feature',
    baseBranch: p.base?.ref || 'main',
    htmlUrl: p.html_url,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    additions: p.additions,
    deletions: p.deletions,
    changedFiles: p.changed_files,
    body: p.body || '',
  };

  // 2. Fetch changed files with diff patches
  const filesRes = await fetchPullRequestFiles(owner, repo, pullNumber);
  if (filesRes.state !== 'success') {
    return {
      state: filesRes.state,
      pr,
      rateLimitReset: filesRes.rateLimitReset,
      errorMessage: filesRes.errorMessage,
    };
  }

  const totalAdd = pr.additions ?? filesRes.files.reduce((sum, f) => sum + f.additions, 0);
  const totalDel = pr.deletions ?? filesRes.files.reduce((sum, f) => sum + f.deletions, 0);
  const totalFiles = pr.changedFiles ?? filesRes.files.length;

  return {
    state: 'success',
    pr,
    files: filesRes.files,
    totalAdditions: totalAdd,
    totalDeletions: totalDel,
    totalFiles,
    isSampleData: false,
  };
}

export const githubService = {
  parseRepoSlug,
  parsePatchToLines,
  fetchPullRequests,
  fetchPullRequestFiles,
  fetchPullRequestDiff,
  clearMemoryCache,
};

export default githubService;
