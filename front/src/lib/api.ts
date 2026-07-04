export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const MEDIA_BASE = `${BASE_URL}/media`;

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        credentials: 'include',
        ...options,
    });
    if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new ApiError(res.status, json?.msg || String(res.status));
    }
    const json = await res.json();
    return json.data as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
    return apiFetch<T>(path, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
    return apiFetch<T>(path, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
}

export async function apiDelete(path: string): Promise<void> {
    await apiFetch<void>(path, {method: 'DELETE'});
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
    return apiFetch<T>(path, {
        method: 'POST',
        body: formData,
    });
}
