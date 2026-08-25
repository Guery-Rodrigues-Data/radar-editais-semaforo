// Gate de senha simples (não é sistema de contas de usuário — é só uma
// senha compartilhada pra restringir o link antes de virar público de verdade).
// Usa Web Crypto (compatível com o runtime Edge do proxy do Next.js).

export const AUTH_COOKIE = "radar_auth";

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET não configurado (.env.local ou env da Vercel).");
  }
  return secret;
}

export async function checkPassword(candidate: string): Promise<boolean> {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) {
    throw new Error("SITE_PASSWORD não configurado (.env.local ou env da Vercel).");
  }
  return candidate === expected;
}

export async function makeAuthToken(): Promise<string> {
  return hmac(getSecret(), "autorizado");
}

export async function isValidAuthToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await makeAuthToken();
  return token === expected;
}
