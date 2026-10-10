/**
 * Browser-side Supabase Auth transport for the dedicated Creator Lab project.
 * No admin/service-role API, no demo-data imports. Supabase is the sole
 * authority for signatures, sessions, email confirmation and account status.
 *
 * Session tokens are scoped to this browser TAB (sessionStorage), not the
 * existing local demo AppState. A maintained Auth SDK can replace this thin
 * transport after the locked-dependency/CI gate is restored.
 */
const PROJECT = 'aoyrijspyygqoyeajxpf.supabase.co';
const SESSION_KEY = 'creator-lab:cloud-auth:v1';
const UUID = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
  email: string;
};

type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: { id?: string; email?: string; is_anonymous?: boolean };
};

export type AuthIdentity = { id: string; email: string };
export type SignupResult = 'confirmation-required' | 'signed-in';

export class CreatorAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CreatorAuthError';
  }
}

export function validateCreatorAuthSettings(urlString: string, publishableKey: string) {
  const url = new URL(urlString);
  if (url.protocol !== 'https:' || url.hostname !== PROJECT ||
      url.pathname !== '/' || url.port || url.username || url.password ||
      url.search || url.hash) {
    throw new CreatorAuthError('Invalid Creator Lab cloud configuration');
  }
  if (!publishableKey.startsWith('sb_publishable_')) {
    throw new CreatorAuthError('A browser-safe Supabase publishable key is required');
  }
  return url.origin;
}

function checkUserJwt(token: string, id: string) {
  try {
    const payload = token.split('.')[1];
    const raw = Uint8Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
      (character) => character.charCodeAt(0));
    const claims = JSON.parse(new TextDecoder().decode(raw)) as {
      role?: string; sub?: string; is_anonymous?: boolean;
    };
    if (claims.role !== 'authenticated' || claims.sub !== id ||
        claims.is_anonymous === true || !UUID.test(id)) throw new Error('Invalid claims');
  } catch {
    throw new CreatorAuthError('Invalid user session; please sign in again');
  }
}

export function createCreatorAuth(options: {
  url: string;
  publishableKey: string;
  storage?: StorageLike;
  fetchImpl?: typeof fetch;
  now?: () => number;
}) {
  const origin = validateCreatorAuthSettings(options.url, options.publishableKey);
  const storage = options.storage ??
    (typeof window !== 'undefined' ? window.sessionStorage : undefined);
  const send = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  let session: SessionTokens | null = null;
  let refreshPending: Promise<string | null> | null = null;
  const listeners = new Set<(identity: AuthIdentity | null) => void>();

  function identity(): AuthIdentity | null {
    return session ? { id: session.userId, email: session.email } : null;
  }
  function announce() {
    for (const listener of listeners) listener(identity());
  }
  function setSession(next: SessionTokens | null) {
    session = next;
    try {
      if (storage) {
        if (next) storage.setItem(SESSION_KEY, JSON.stringify(next));
        else storage.removeItem(SESSION_KEY);
      }
    } catch {
      // Session is usable in memory even when storage is blocked.
    }
    announce();
  }

  async function call<T>(
    path: string, method: 'GET' | 'POST' | 'PUT', body?: unknown, bearer?: string,
  ): Promise<T> {
    let response: Response;
    try {
      response = await send(origin + path, {
        method,
        headers: {
          apikey: options.publishableKey,
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...(bearer ? { Authorization: 'Bearer ' + bearer } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(20000),
      });
    } catch {
      throw new CreatorAuthError('Authentication service is unavailable');
    }
    if (!response.ok) {
      // Never surface raw HTTP response bodies, credentials or account-existence clues.
      if (response.status === 429) throw new CreatorAuthError('Too many attempts. Try again later.');
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        throw new CreatorAuthError('Authentication failed. Check your details or email confirmation.');
      }
      throw new CreatorAuthError('Authentication service is temporarily unavailable');
    }
    try {
      return await response.json() as T;
    } catch {
      throw new CreatorAuthError('Unexpected authentication response');
    }
  }

  async function acceptTokens(data: AuthResponse): Promise<AuthIdentity> {
    const token = data.access_token;
    const refresh = data.refresh_token;
    const seconds = data.expires_in;
    if (!token || !refresh || !Number.isFinite(seconds) || (seconds ?? 0) <= 0 ||
        !data.user?.id || data.user.is_anonymous === true) {
      throw new CreatorAuthError('Authentication response did not include a valid user session');
    }
    checkUserJwt(token, data.user.id);
    // Verify against Supabase Auth itself; decoding a JWT is NOT signature verification.
    const verified = await call<{ id: string; email?: string; is_anonymous?: boolean }>(
      '/auth/v1/user', 'GET', undefined, token,
    );
    if (verified.id !== data.user.id || verified.is_anonymous === true) {
      throw new CreatorAuthError('Authenticated user identity could not be verified');
    }
    setSession({
      accessToken: token,
      refreshToken: refresh,
      expiresAt: now() + (seconds as number) * 1000,
      userId: verified.id,
      email: verified.email ?? data.user.email ?? '',
    });
    return identity()!;
  }

  async function refresh(): Promise<string | null> {
    if (!session) return null;
    if (refreshPending) return refreshPending;
    const oldSession = session;
    const pending = (async () => {
      try {
        const response = await call<AuthResponse>('/auth/v1/token?grant_type=refresh_token',
          'POST', { refresh_token: oldSession.refreshToken });
        if (!response.user) response.user = { id: oldSession.userId, email: oldSession.email };
        await acceptTokens(response);
        return session?.accessToken ?? null;
      } catch {
        if (session === oldSession) setSession(null);
        return null;
      }
    })();
    refreshPending = pending;
    try {
      return await pending;
    } finally {
      if (refreshPending === pending) refreshPending = null;
    }
  }

  async function getAccessToken(): Promise<string | null> {
    if (!session) return null;
    if (session.expiresAt < now() + 60000) return refresh();
    return session.accessToken;
  }

  async function restore(): Promise<AuthIdentity | null> {
    if (session) return identity();
    let saved: SessionTokens | null = null;
    try {
      saved = storage ? JSON.parse(storage.getItem(SESSION_KEY) || 'null') : null;
    } catch { /* malformed or blocked storage */ }
    if (!saved || typeof saved.accessToken !== 'string' ||
        typeof saved.refreshToken !== 'string' ||
        typeof saved.userId !== 'string' ||
        typeof saved.expiresAt !== 'number') {
      setSession(null);
      return null;
    }
    try {
      checkUserJwt(saved.accessToken, saved.userId);
      session = saved;
      if (saved.expiresAt < now() + 60000) {
        const renewed = await refresh();
        return renewed ? identity() : null;
      }
      const user = await call<{ id: string; email?: string; is_anonymous?: boolean }>(
        '/auth/v1/user', 'GET', undefined, saved.accessToken,
      );
      if (user.id !== saved.userId || user.is_anonymous === true) throw new Error('Mismatch');
      session.email = user.email ?? '';
      announce();
      return identity();
    } catch {
      setSession(null);
      return null;
    }
  }

  async function signIn(email: string, password: string): Promise<AuthIdentity> {
    const data = await call<AuthResponse>('/auth/v1/token?grant_type=password',
      'POST', { email: email.trim(), password });
    return acceptTokens(data);
  }

  async function signUp(email: string, password: string, redirectTo: string): Promise<SignupResult> {
    const data = await call<AuthResponse>('/auth/v1/signup?redirect_to=' +
      encodeURIComponent(redirectTo), 'POST', { email: email.trim(), password });
    if (data.access_token) {
      await acceptTokens(data);
      return 'signed-in';
    }
    return 'confirmation-required';
  }

  async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
    await call('/auth/v1/recover?redirect_to=' + encodeURIComponent(redirectTo),
      'POST', { email: email.trim() });
  }

  async function changePassword(password: string): Promise<void> {
    const token = await getAccessToken();
    if (!token) throw new CreatorAuthError('Please sign in again before changing your password');
    await call('/auth/v1/user', 'PUT', { password }, token);
  }

  async function acceptRedirect(hash: string): Promise<'recovery' | 'signup' | null> {
    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (!access_token && !refresh_token) return null;
    if (!access_token || !refresh_token) throw new CreatorAuthError('Incomplete confirmation link');
    const expires_in = Number(params.get('expires_in') ?? '3600');
    const user = await call<{ id: string; email?: string; is_anonymous?: boolean }>(
      '/auth/v1/user', 'GET', undefined, access_token);
    await acceptTokens({ access_token, refresh_token, expires_in, user });
    return params.get('type') === 'recovery' ? 'recovery' : 'signup';
  }

  async function signOut(): Promise<void> {
    const token = session?.accessToken;
    setSession(null); // No stale cloud access, even if the network fails.
    if (!token) return;
    try {
      await call('/auth/v1/logout', 'POST', {}, token);
    } catch {
      // Locally signed out; remote revocation must be confirmed in E2E gate.
    }
  }

  return {
    identity,
    subscribe(listener: (value: AuthIdentity | null) => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    signIn, signUp, requestPasswordReset, changePassword, acceptRedirect,
    getAccessToken, restore, signOut,
  };
}
