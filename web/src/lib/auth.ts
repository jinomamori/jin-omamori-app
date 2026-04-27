export interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
}

export function saveToken(token: string): void {
  localStorage.setItem('jwt_token', token);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jwt_token');
}

export function removeToken(): void {
  localStorage.removeItem('jwt_token');
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function logout(): void {
  removeToken();
  window.location.href = '/login';
}

export function parseJwt(token: string): AuthUser | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload) as AuthUser;
  } catch {
    return null;
  }
}

export function getCurrentUser(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  return parseJwt(token);
}
