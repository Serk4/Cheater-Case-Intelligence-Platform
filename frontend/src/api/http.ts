export async function http<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('ccip_token');

  const headers: HeadersInit = {
    ...(options?.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers ?? {}),
  };

  const res = await fetch(url, { ...options, headers });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (res.status === 401) {
    localStorage.removeItem('ccip_token');
    localStorage.removeItem('ccip_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const errBody = body as { message?: string; error?: string } | null;
    const message = errBody?.message || errBody?.error || res.statusText;
    throw new Error(message);
  }

  return body as T;
}
