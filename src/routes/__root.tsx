import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'

import appCss from '../styles.css?url'
import { Topbar } from '@/components/layout/Topbar'
import { Toaster } from '@/components/ui/sonner'
import { Dialog } from '@/components/ui/dialog'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Notify',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Topbar />
        <Dialog>
          {children}
        </Dialog>
        <Scripts />
        <Toaster />
      </body>
    </html>
  )
}
