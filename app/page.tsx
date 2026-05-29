'use client'
import { AuthProvider } from '@/lib/AuthContext'
import { ToastProvider } from '@/components/Toast'
import RootRedirect from './root-redirect'

export default function HomePage() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RootRedirect/>
      </ToastProvider>
    </AuthProvider>
  )
}
