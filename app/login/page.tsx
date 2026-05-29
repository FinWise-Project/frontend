'use client'
import { ToastProvider } from '@/components/Toast'
import LoginContent from './page-content'

export default function LoginRoute() {
  return (
    <ToastProvider>
      <LoginContent />
    </ToastProvider>
  )
}