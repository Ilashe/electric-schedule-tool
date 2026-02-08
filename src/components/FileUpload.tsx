'use client'

import { useState, useCallback } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  isProcessing: boolean
}

export default function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file')
      return
    }
    setSelectedFile(file)
    onFileSelect(file)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          {selectedFile ? (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-700">
                📄 {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-700">
                Drop your quote PDF here
              </p>
              <p className="text-sm text-gray-500">
                or click to browse
              </p>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Supported format: PDF only
          </p>
        </div>
      </div>

      {selectedFile && !isProcessing && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setSelectedFile(null)
              const input = document.querySelector('input[type="file"]') as HTMLInputElement
              if (input) input.value = ''
            }}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Choose different file
          </button>
        </div>
      )}
    </div>
  )
}
