export async function http<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message = body?.message || body?.error || res.statusText;
    throw new Error(message);
  }

  return body as T;
}
