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
      console.error('❌ No file uploaded')
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }
    
    if (file.type !== 'application/pdf') {
      console.error('❌ File is not PDF:', file.type)
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }
    
    console.log('✓ PDF file received:', file.name, file.size, 'bytes')
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log('✓ Converted to buffer:', buffer.length, 'bytes')
    
    // Step 1: Extract quote data from PDF
    console.log('📄 Extracting quote data...')
    const quoteData = await extractQuoteFromPDF(buffer)
    console.log('✓ Quote data extracted:', {
      quoteNumber: quoteData.quoteNumber,
      projectName: quoteData.projectName,
      country: quoteData.country,
      itemCount: quoteData.items.length
    })
    console.log('First 5 items:', quoteData.items.slice(0, 5))
    
    // Step 2: Fetch master list from Google Sheets
    console.log('📚 Fetching master list from Google Sheets...')
    console.log('Sheet ID:', process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || 'NOT SET')
    
    const masterList = await fetchMasterList()
    const masterListCount = Object.keys(masterList).length
    console.log('✓ Master list loaded:', masterListCount, 'items')
    console.log('First 5 master list items:', Object.keys(masterList).slice(0, 5))
    
    const exclusionList = await fetchExclusionList()
    console.log('✓ Exclusions loaded:', exclusionList.length, 'items')
    
    const voltageMap = await fetchVoltageMappings()
    console.log('✓ Voltage map loaded:', Object.keys(voltageMap))
    
    // Step 3: Generate schedule
    console.log('⚙️  Generating schedule...')
    const schedule = await generateSchedule(
      quoteData,
      masterList,
      exclusionList,
      voltageMap
    )
    console.log('✓ Schedule generated:', {
      items: schedule.items.length,
      motors: schedule.totalMotors,
      amps: schedule.totalAmps,
      notFound: schedule.notFoundItems.length,
      excluded: schedule.excludedItems.length
    })
    
    if (schedule.items.length === 0) {
      console.error('⚠️  WARNING: No items generated!')
      console.error('Not found items:', schedule.notFoundItems)
      console.error('Excluded items:', schedule.excludedItems)
    }
    
    // Step 4: Create Excel file
    console.log('📝 Creating Excel file...')
    const excelBuffer = await createExcelFile(schedule)
    console.log('✓ Excel created:', excelBuffer.length, 'bytes')
    
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
    
    console.log('✅ Success! Returning Excel file')
    
    return new NextResponse(excelBuffer as any, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('❌ Error generating schedule:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate schedule',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
