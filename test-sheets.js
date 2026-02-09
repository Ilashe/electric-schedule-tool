// TEST SCRIPT - Run this to test Google Sheets connection
// Save as test-sheets.js in your project root

const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || 'YOUR_SHEET_ID_HERE'

async function testGoogleSheets() {
  console.log('Testing Google Sheets connection...')
  console.log('Sheet ID:', SHEET_ID)
  
  if (!SHEET_ID || SHEET_ID === 'YOUR_SHEET_ID_HERE') {
    console.error('❌ ERROR: GOOGLE_SHEET_ID not set!')
    console.log('\nTo fix:')
    console.log('1. Create .env.local file in project root')
    console.log('2. Add: NEXT_PUBLIC_GOOGLE_SHEET_ID=your_actual_sheet_id')
    console.log('3. Restart: npm run dev')
    return
  }
  
  // Test MASTER_LIST
  const masterUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=MASTER_LIST`
  console.log('\nTesting MASTER_LIST...')
  console.log('URL:', masterUrl)
  
  try {
    const response = await fetch(masterUrl)
    console.log('Status:', response.status)
    
    if (!response.ok) {
      console.error('❌ Failed to fetch MASTER_LIST')
      console.log('\nPossible issues:')
      console.log('1. Sheet is not public ("Anyone with link can view")')
      console.log('2. Sheet ID is wrong')
      console.log('3. Sheet does not have a tab named "MASTER_LIST"')
      return
    }
    
    const text = await response.text()
    const lines = text.split('\n').length
    console.log('✅ SUCCESS! Fetched', lines, 'lines from MASTER_LIST')
    console.log('First 200 characters:', text.substring(0, 200))
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
  
  // Test EXCLUSIONS
  const excludeUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=EXCLUSIONS`
  console.log('\nTesting EXCLUSIONS...')
  
  try {
    const response = await fetch(excludeUrl)
    if (response.ok) {
      const text = await response.text()
      console.log('✅ EXCLUSIONS found:', text.split('\n').length, 'lines')
    } else {
      console.log('⚠️  EXCLUSIONS not found (will use defaults)')
    }
  } catch (error) {
    console.log('⚠️  EXCLUSIONS error (will use defaults):', error.message)
  }
  
  // Test VOLTAGE_MAP
  const voltageUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=VOLTAGE_MAP`
  console.log('\nTesting VOLTAGE_MAP...')
  
  try {
    const response = await fetch(voltageUrl)
    if (response.ok) {
      const text = await response.text()
      console.log('✅ VOLTAGE_MAP found:', text.split('\n').length, 'lines')
    } else {
      console.log('⚠️  VOLTAGE_MAP not found (will use defaults)')
    }
  } catch (error) {
    console.log('⚠️  VOLTAGE_MAP error (will use defaults):', error.message)
  }
}

testGoogleSheets()