import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, isValidAuthToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const authorized = await isValidAuthToken(token);

  if (!authorized) {
    const loginUrl = new URL("/entrar", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Tudo, exceto a própria tela de login, a rota de autenticação e os
    // arquivos estáticos internos do Next.
    "/((?!entrar|api/login|_next/static|_next/image|favicon.ico).*)",
  ],
};
