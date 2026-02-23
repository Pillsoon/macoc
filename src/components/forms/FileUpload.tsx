'use client'

import { useRef, useState } from 'react'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/heic', 'image/heif']
const ACCEPTED_TYPES = [...IMAGE_TYPES, 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

interface FileUploadProps {
  onUpload: (url: string) => void
  label: string
  required?: boolean
}

export default function FileUpload({ onUpload, label, required }: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isImage, setIsImage] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  const handleFile = async (file: File) => {
    setError(null)

    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(heic|heif)$/i)) {
      setError('Please upload a JPG, PNG, or PDF file.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('File is too large. Maximum size is 10MB.')
      return
    }

    // Show local preview immediately
    setFileName(file.name)
    const imageFile = IMAGE_TYPES.includes(file.type) || file.name.match(/\.(heic|heif)$/i)
    setIsImage(!!imageFile)
    if (imageFile) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }

    // Upload to Cloudinary
    if (!cloudName || !uploadPreset) {
      setError('File upload is not configured yet. Please contact us.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      formData.append('folder', 'macoc/proof-of-age')

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error?.message || 'Upload failed')
      }

      const data = await res.json()
      setUploaded(true)
      onUpload(data.secure_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setPreviewUrl(null)
      setFileName(null)
    } finally {
      setUploading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const reset = () => {
    setPreviewUrl(null)
    setFileName(null)
    setUploaded(false)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-charcoal">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.heic,.heif,.pdf"
        onChange={handleChange}
        className="hidden"
      />

      {fileName ? (
        <div className={`p-4 rounded-lg space-y-3 border-2 ${
          uploading ? 'bg-blue-50 border-blue-300' :
          uploaded ? 'bg-green-50 border-green-400' :
          'bg-gray-50 border-gray-300'
        }`}>
          {/* Status banner */}
          <div className={`flex items-center gap-2 rounded-md px-3 py-2 ${
            uploading ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            {uploading ? (
              <>
                <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-blue-800 font-medium text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-800 font-semibold">File Uploaded Successfully</span>
              </>
            )}
          </div>

          {/* Preview */}
          {isImage && previewUrl && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Uploaded document"
                className="max-h-48 rounded border border-gray-200 object-contain"
              />
            </div>
          )}
          {!isImage && (
            <div className="flex items-center justify-center gap-2 py-3 text-text-muted">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">PDF Document</span>
            </div>
          )}

          {/* File name + change */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary flex-1 truncate">{fileName}</span>
            <button
              type="button"
              onClick={() => { reset(); inputRef.current?.click() }}
              className="text-sm font-medium underline text-navy hover:text-gold"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gold hover:bg-gold/5 transition-colors"
        >
          <div className="flex flex-col items-center gap-2 text-text-muted">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm">Click to upload or drag and drop</span>
            <span className="text-xs">JPG, PNG, PDF, HEIC (max 10MB)</span>
          </div>
        </button>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {required && !uploaded && (
        <input type="hidden" name="proofOfAge" required />
      )}
    </div>
  )
}
