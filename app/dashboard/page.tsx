'use client'
import { ToastProvider } from '@/components/Toast'
import DashboardLayout from '@/components/DashboardLayout'

export default function DashboardRoute() {
  return (
    <ToastProvider>
      <DashboardLayout />
    </ToastProvider>
  )
}