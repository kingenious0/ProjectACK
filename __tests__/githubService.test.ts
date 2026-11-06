import {
  githubService,
  parseRepoSlug,
  parsePatchToLines,
} from '../src/services/githubService';

describe('githubService', () => {
  beforeEach(() => {
    githubService.clearMemoryCache();
    jest.restoreAllMocks();
  });

  describe('parseRepoSlug', () => {
    it('parses owner/repo slug format', () => {
      const parsed = parseRepoSlug('facebook/react');
      expect(parsed).toEqual({ owner: 'facebook', repo: 'react' });
    });

    it('parses full GitHub URL', () => {
      const parsed = parseRepoSlug('https://github.com/facebook/react');
      expect(parsed).toEqual({ owner: 'facebook', repo: 'react' });
    });

    it('handles trailing slashes and hashes', () => {
      const parsed = parseRepoSlug('https://github.com/facebook/react/#readme');
      expect(parsed).toEqual({ owner: 'facebook', repo: 'react' });
    });

    it('returns null for invalid inputs', () => {
      expect(parseRepoSlug('')).toBeNull();
      expect(parseRepoSlug('justarepo')).toBeNull();
      expect(parseRepoSlug(null as any)).toBeNull();
    });
  });

  describe('parsePatchToLines', () => {
    it('correctly maps unified diff patch into hunk header, add, del, and normal lines', () => {
      const patch = [
        '@@ -1,3 +1,4 @@',
        ' line 1',
        '-old line 2',
        '+new line 2',
        '+new line 2.5',
        ' line 3',
      ].join('\n');

      const lines = parsePatchToLines(patch);
      expect(lines.length).toBe(6);

      expect(lines[0].type).toBe('normal');
      expect(lines[0].content).toBe('@@ -1,3 +1,4 @@');

      expect(lines[1].type).toBe('normal');
      expect(lines[1].content).toBe('line 1');
      expect(lines[1].oldNo).toBe(1);
      expect(lines[1].newNo).toBe(1);

      expect(lines[2].type).toBe('del');
      expect(lines[2].content).toBe('old line 2');
      expect(lines[2].oldNo).toBe(2);

      expect(lines[3].type).toBe('add');
      expect(lines[3].content).toBe('new line 2');
      expect(lines[3].newNo).toBe(2);

      expect(lines[4].type).toBe('add');
      expect(lines[4].content).toBe('new line 2.5');
      expect(lines[4].newNo).toBe(3);

      expect(lines[5].type).toBe('normal');
      expect(lines[5].content).toBe('line 3');
      expect(lines[5].oldNo).toBe(3);
      expect(lines[5].newNo).toBe(4);
    });

    it('returns empty array when patch is missing or empty', () => {
      expect(parsePatchToLines(undefined)).toEqual([]);
      expect(parsePatchToLines('')).toEqual([]);
    });
  });

  describe('fetchPullRequests', () => {
    it('returns rate_limited state on 403 or 429 with reset time', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        headers: {
          get: (header: string) => {
            if (header.toLowerCase() === 'x-ratelimit-reset') return '1700000000';
            return null;
          },
        },
        json: async () => ({ message: 'API rate limit exceeded' }),
      });
      global.fetch = mockFetch as any;

      const res = await githubService.fetchPullRequests('owner', 'repo', 'open');
      expect(res.state).toBe('rate_limited');
      expect(res.prs).toEqual([]);
      expect(res.rateLimitReset).toBeDefined();
    });

    it('returns not_found_or_private on 404', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: { get: () => null },
        json: async () => ({ message: 'Not Found' }),
      });
      global.fetch = mockFetch as any;

      const res = await githubService.fetchPullRequests('private-org', 'private-repo');
      expect(res.state).toBe('not_found_or_private');
      expect(res.prs).toEqual([]);
    });

    it('returns token_revoked on 401', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: { get: () => null },
        json: async () => ({ message: 'Bad credentials' }),
      });
      global.fetch = mockFetch as any;

      const res = await githubService.fetchPullRequests('owner', 'repo');
      expect(res.state).toBe('token_revoked');
    });

    it('fetches PRs successfully and maps fields', async () => {
      const mockPrs = [
        {
          id: 101,
          number: 12,
          title: 'Add dark mode support',
          head: { ref: 'feat/dark-mode' },
          base: { ref: 'main' },
          state: 'open',
          user: { login: 'octocat', avatar_url: 'https://github.com/octocat.png' },
          created_at: '2026-11-01T12:00:00Z',
          updated_at: '2026-11-01T12:00:00Z',
          html_url: 'https://github.com/owner/repo/pull/12',
        },
      ];

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (h: string) => (h.toLowerCase() === 'etag' ? '"etag-pr-list-1"' : null),
        },
        json: async () => mockPrs,
      });
      global.fetch = mockFetch as any;

      const res = await githubService.fetchPullRequests('owner', 'repo');
      expect(res.state).toBe('success');
      expect(res.prs.length).toBe(1);
      expect(res.prs[0].number).toBe(12);
      expect(res.prs[0].title).toBe('Add dark mode support');
      expect(res.prs[0].branch).toBe('feat/dark-mode');
    });
  });

  describe('fetchPullRequestFiles and Diff with Large / Binary Files', () => {
    it('flags files without patch as hasNoPatch and largeOrBinary', async () => {
      const mockFiles = [
        {
          filename: 'src/App.tsx',
          status: 'modified',
          additions: 10,
          deletions: 2,
          changes: 12,
          patch: '@@ -1,1 +1,2 @@\n-old\n+new',
          blob_url: 'https://github.com/owner/repo/blob/abc/src/App.tsx',
        },
        {
          filename: 'assets/hero.png',
          status: 'added',
          additions: 0,
          deletions: 0,
          changes: 0,
          patch: undefined, // binary file has no patch!
          blob_url: 'https://github.com/owner/repo/blob/abc/assets/hero.png',
        },
      ];

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (h: string) => (h.toLowerCase() === 'etag' ? '"etag-files-1"' : null),
        },
        json: async () => mockFiles,
      });
      global.fetch = mockFetch as any;

      const res = await githubService.fetchPullRequestFiles('owner', 'repo', 5);
      expect(res.state).toBe('success');
      expect(res.files.length).toBe(2);

      const normalFile = res.files[0];
      expect(normalFile.filename).toBe('src/App.tsx');
      expect(normalFile.hasNoPatch).toBe(false);
      expect(normalFile.lines?.length).toBeGreaterThan(0);

      const binaryFile = res.files[1];
      expect(binaryFile.filename).toBe('assets/hero.png');
      expect(binaryFile.hasNoPatch).toBe(true);
      expect(binaryFile.largeOrBinary).toBe(true);
    });

    it('uses ETag conditional requests on subsequent calls', async () => {
      const mockFiles = [
        {
          filename: 'README.md',
          status: 'modified',
          additions: 1,
          deletions: 0,
          changes: 1,
          patch: '@@ -1,1 +1,2 @@\n+docs',
        },
      ];

      const mockFetch = jest
        .fn()
        // First request returns 200 with ETag
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: {
            get: (h: string) => (h.toLowerCase() === 'etag' ? '"etag-readme-123"' : null),
          },
          json: async () => mockFiles,
        })
        // Second request returns 304 Not Modified
        .mockResolvedValueOnce({
          ok: true,
          status: 304,
          headers: {
            get: (h: string) => (h.toLowerCase() === 'etag' ? '"etag-readme-123"' : null),
          },
        });
      global.fetch = mockFetch as any;

      // Call 1
      const res1 = await githubService.fetchPullRequestFiles('owner', 'repo', 1);
      expect(res1.state).toBe('success');
      expect(res1.files[0].filename).toBe('README.md');

      // Call 2 with 304 Not Modified: should serve cached content!
      const res2 = await githubService.fetchPullRequestFiles('owner', 'repo', 1);
      expect(res2.state).toBe('success');
      expect(res2.files[0].filename).toBe('README.md');

      // Check that second request passed If-None-Match header
      const secondCallHeaders = mockFetch.mock.calls[1][1].headers;
      expect(secondCallHeaders['If-None-Match']).toBe('"etag-readme-123"');
    });
  });
});
