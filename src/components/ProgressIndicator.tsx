'use client'

interface ProgressIndicatorProps {
  currentStep: number
  steps: string[]
}

export default function ProgressIndicator({ currentStep, steps }: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div key={index} className="flex-1 text-center">
                <div className={`text-xs font-medium ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                  {step}
                </div>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Spinner */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-700 font-medium">
            {steps[currentStep]}...
          </p>
        </div>

        {/* Step Details */}
        <div className="mt-6 space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3">
              {index < currentStep ? (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : index === currentStep ? (
                <div className="w-5 h-5 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              )}
              <span className={`text-sm ${index <= currentStep ? 'text-gray-700' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
