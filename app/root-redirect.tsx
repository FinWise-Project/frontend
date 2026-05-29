'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

export default function RootRedirect() {
  const { user } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (user) router.push('/dashboard')
    else router.push('/login')
  }, [user, router])
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--bg)'}}>
      <div style={{fontFamily:"'Syne',sans-serif",color:'var(--purple2)',fontSize:'18px'}}>FinWise...</div>
    </div>
  )
}
