'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MeuDesempenhoRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/pedido-patch') }, [router])
  return null
}
