'use client'
import { AuthProvider } from '@/lib/AuthContext'
import { ToastProvider } from '@/components/Toast'
import RegisterContent from './page-content'

export default function RegisterRoute() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RegisterContent/>
      </ToastProvider>
    </AuthProvider>
  )
}
