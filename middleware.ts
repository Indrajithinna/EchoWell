export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/chat/:path*',
    '/music/:path*',
    '/mood/:path*',
    '/settings/:path*',
  ],
}
