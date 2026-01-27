'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

// Dynamically import CldUploadWidget to avoid SSR issues
const CldUploadWidget = dynamic(
  () => import('next-cloudinary').then((mod) => mod.CldUploadWidget),
  { ssr: false }
)

interface FileUploadProps {
  onUpload: (url: string) => void
  label: string
  required?: boolean
}

export default function FileUpload({ onUpload, label, required }: FileUploadProps) {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  // If Cloudinary is not configured, show a placeholder
  if (!cloudName || !uploadPreset) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-charcoal">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="flex flex-col items-center gap-2 text-text-muted">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm">File upload coming soon</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-charcoal">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <CldUploadWidget
        uploadPreset={uploadPreset}
        options={{
          maxFiles: 1,
          resourceType: 'auto',
          folder: 'macoc/proof-of-age',
        }}
        onSuccess={(result) => {
          if (typeof result.info === 'object' && result.info !== null) {
            const info = result.info as { secure_url: string; original_filename: string }
            setUploadedUrl(info.secure_url)
            setFileName(info.original_filename)
            onUpload(info.secure_url)
          }
        }}
      >
        {({ open }) => (
          <div>
            {uploadedUrl ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-green-800 flex-1 truncate">{fileName}</span>
                <button
                  type="button"
                  onClick={() => open()}
                  className="text-sm text-green-600 hover:text-green-800 underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => open()}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gold hover:bg-gold/5 transition-colors"
              >
                <div className="flex flex-col items-center gap-2 text-text-muted">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm">Click to upload or drag and drop</span>
                  <span className="text-xs">PDF, JPG, PNG (max 10MB)</span>
                </div>
              </button>
            )}
          </div>
        )}
      </CldUploadWidget>

      {required && !uploadedUrl && (
        <input type="hidden" name="proofOfAge" required />
      )}
    </div>
  )
}
