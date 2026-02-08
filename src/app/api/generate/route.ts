import { NextRequest, NextResponse } from 'next/server'
import { extractQuoteFromPDF } from '@/lib/pdfParser'
import { fetchMasterList, fetchExclusionList, fetchVoltageMappings } from '@/lib/googleSheets'
import { generateSchedule } from '@/lib/scheduleGenerator'
import { createExcelFile } from '@/lib/excelWriter'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received schedule generation request')
    
    // Get PDF file from form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }
    
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Step 1: Extract quote data from PDF
    console.log('📄 Extracting quote data...')
    const quoteData = await extractQuoteFromPDF(buffer)
    
    // Step 2: Fetch master list from Google Sheets
    console.log('📚 Fetching master list from Google Sheets...')
    const masterList = await fetchMasterList()
    const exclusionList = await fetchExclusionList()
    const voltageMap = await fetchVoltageMappings()
    
    // Step 3: Generate schedule
    console.log('⚙️  Generating schedule...')
    const schedule = await generateSchedule(
      quoteData,
      masterList,
      exclusionList,
      voltageMap
    )
    
    // Step 4: Create Excel file
    console.log('📝 Creating Excel file...')
    const excelBuffer = await createExcelFile(schedule)
    
    // Return Excel file with metadata
    const headers = new Headers()
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    headers.set('Content-Disposition', `attachment; filename="Quote_${schedule.quoteNumber}_ElectricalSchedule.xlsx"`)
    headers.set('X-Quote-Number', schedule.quoteNumber)
    headers.set('X-Project-Name', encodeURIComponent(schedule.projectName))
    headers.set('X-Total-Motors', schedule.totalMotors.toString())
    headers.set('X-Total-Amps', schedule.totalAmps.toString())
    headers.set('X-Items-Generated', schedule.items.length.toString())
    headers.set('X-Not-Found-Count', schedule.notFoundItems.length.toString())
    headers.set('X-Not-Found-Items', encodeURIComponent(JSON.stringify(schedule.notFoundItems)))
    headers.set('X-Excluded-Count', schedule.excludedItems.length.toString())
    headers.set('X-Excluded-Items', encodeURIComponent(JSON.stringify(schedule.excludedItems)))
    headers.set('X-Country', schedule.country)
    
    return new NextResponse(excelBuffer as any, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('❌ Error generating schedule:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate schedule',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
