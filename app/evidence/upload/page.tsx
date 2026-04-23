'use client'

import { Suspense } from 'react'
import UploadEvidencePage from './UploadEvidencePage'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading upload page...</div>}>
      <UploadEvidencePage />
    </Suspense>
  )
}