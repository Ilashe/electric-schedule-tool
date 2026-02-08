'use client'

interface GeneratedScheduleProps {
  data: {
    totalMotors: number
    totalAmps: number
    itemsGenerated: number
    notFoundItems: string[]
    excludedItems: string[]
    projectName: string
    quoteNumber: string
    country: string
  }
  excelData: Blob
  onReset: () => void
}

export default function GeneratedSchedule({ data, excelData, onReset }: GeneratedScheduleProps) {
  const handleDownload = () => {
    const url = window.URL.createObjectURL(excelData)
    const a = document.createElement('a')
    a.href = url
    a.download = `Quote_${data.quoteNumber}_ElectricalSchedule.xlsx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="card text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Schedule Generated Successfully! 🎉
        </h2>
        <p className="text-gray-600">
          {data.projectName} - Quote #{data.quoteNumber}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{data.itemsGenerated}</p>
          <p className="text-sm text-gray-600 mt-1">Schedule Items</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{data.totalMotors}</p>
          <p className="text-sm text-gray-600 mt-1">Total Motors</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{data.totalAmps.toFixed(2)}</p>
          <p className="text-sm text-gray-600 mt-1">Total Amps</p>
        </div>
      </div>

      {/* Download Button */}
      <div className="card text-center">
        <button
          onClick={handleDownload}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download Excel Schedule</span>
        </button>
        <p className="text-xs text-gray-500 mt-3">
          Country: {data.country} • Excel format ready for import
        </p>
      </div>

      {/* Not Found Items */}
      {data.notFoundItems.length > 0 && (
        <div className="card">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2">
                ⚠️ Items Not Found in Master List ({data.notFoundItems.length})
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                These items were in the quote but not in your Google Sheet master list. Add them to include in future schedules.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                <ul className="text-sm space-y-1">
                  {data.notFoundItems.map((item, index) => (
                    <li key={index} className="text-gray-700">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excluded Items */}
      {data.excludedItems.length > 0 && (
        <div className="card">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2">
                Non-Electrical Items Excluded ({data.excludedItems.length})
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                These items were automatically excluded (cores, brushes, grating, etc.)
              </p>
              <details className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                  Click to view excluded items
                </summary>
                <ul className="text-sm space-y-1 mt-2 max-h-48 overflow-y-auto">
                  {data.excludedItems.map((item, index) => (
                    <li key={index} className="text-gray-600">
                      • {item}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Generate Another */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="btn-secondary inline-flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Generate Another Schedule</span>
        </button>
      </div>
    </div>
  )
}
