
'use client'

import { Suspense } from 'react'
import LoginPageContent from './LoginPageContent'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading login...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}