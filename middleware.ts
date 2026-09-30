import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // On récupère le cookie que nous allons créer lors du login
  const authToken = request.cookies.get('admin-auth-token')?.value;

  // Si on essaie d'accéder à l'admin (sauf la page login elle-même)
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    
    // Si pas de session active trouvée dans les cookies
    if (!authToken) {
      // Redirection immédiate vers la page de login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Sinon, on laisse passer la requête normalement
  return NextResponse.next();
}

// Spécifier sur quelles routes ce middleware doit s'exécuter
export const config = {
  matcher: ['/admin/:path*'],
};
