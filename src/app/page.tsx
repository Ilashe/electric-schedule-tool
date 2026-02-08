'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import ProgressIndicator from '@/components/ProgressIndicator'
import GeneratedSchedule from '@/components/GeneratedSchedule'

type AppState = 'upload' | 'processing' | 'complete' | 'error'

interface ScheduleData {
  totalMotors: number
  totalAmps: number
  itemsGenerated: number
  notFoundItems: string[]
  excludedItems: string[]
  projectName: string
  quoteNumber: string
  country: string
}

export default function Home() {
  const [state, setState] = useState<AppState>('upload')
  const [currentStep, setCurrentStep] = useState(0)
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null)
  const [excelBlob, setExcelBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string>('')

  const steps = [
    'Reading PDF',
    'Fetching Master List',
    'Generating Schedule',
    'Creating Excel',
  ]

  const handleFileSelect = async (file: File) => {
    setState('processing')
    setCurrentStep(0)
    setError('')

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress steps
      const progressInterval = setInterval(() => {
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
      }, 1500)

      // Send to API
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setCurrentStep(steps.length - 1)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to generate schedule')
      }

      // Get metadata from headers
      const quoteNumber = response.headers.get('X-Quote-Number') || 'Unknown'
      const projectName = decodeURIComponent(response.headers.get('X-Project-Name') || 'Unknown Project')
      const totalMotors = parseInt(response.headers.get('X-Total-Motors') || '0')
      const totalAmps = parseFloat(response.headers.get('X-Total-Amps') || '0')
      const itemsGenerated = parseInt(response.headers.get('X-Items-Generated') || '0')
      const country = response.headers.get('X-Country') || 'USA'
      
      const notFoundItems = JSON.parse(
        decodeURIComponent(response.headers.get('X-Not-Found-Items') || '[]')
      )
      const excludedItems = JSON.parse(
        decodeURIComponent(response.headers.get('X-Excluded-Items') || '[]')
      )

      // Get Excel blob
      const blob = await response.blob()

      // Set data
      setScheduleData({
        quoteNumber,
        projectName,
        totalMotors,
        totalAmps,
        itemsGenerated,
        notFoundItems,
        excludedItems,
        country,
      })
      setExcelBlob(blob)
      setState('complete')
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setState('error')
    }
  }

  const handleReset = () => {
    setState('upload')
    setCurrentStep(0)
    setScheduleData(null)
    setExcelBlob(null)
    setError('')
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-full shadow-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-800">
                Electrical Schedule Generator
              </h1>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your sales quote PDF and generate a professional electrical schedule in seconds.
            Powered by real-time Google Sheets data.
          </p>
        </div>

        {/* Content */}
        <div className="mt-8">
          {state === 'upload' && (
            <FileUpload onFileSelect={handleFileSelect} isProcessing={false} />
          )}

          {state === 'processing' && (
            <ProgressIndicator currentStep={currentStep} steps={steps} />
          )}

          {state === 'complete' && scheduleData && excelBlob && (
            <GeneratedSchedule
              data={scheduleData}
              excelData={excelBlob}
              onReset={handleReset}
            />
          )}

          {state === 'error' && (
            <div className="w-full max-w-2xl mx-auto">
              <div className="card">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Error Generating Schedule
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {error}
                  </p>
                  <button onClick={handleReset} className="btn-primary">
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        {state === 'upload' && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Smart Detection</h3>
              <p className="text-sm text-gray-600">
                Auto-detects country, voltage, and equipment specifications
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Exact Matching</h3>
              <p className="text-sm text-gray-600">
                Only uses exact part numbers from your master list
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Real-Time Updates</h3>
              <p className="text-sm text-gray-600">
                Edit master list in Google Sheets, changes apply instantly
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>
            Powered by Google Sheets • Built with Next.js
          </p>
          {process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID ? (
            <p className="mt-2 text-xs text-green-600">
              ✓ Connected to master list
            </p>
          ) : (
            <p className="mt-2 text-xs text-red-600">
              ⚠️ Google Sheet ID not configured
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
