import { MasterListItem, VoltageMapping } from '@/types'

// CONFIGURATION - Just need the Sheet ID!
const GOOGLE_SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || process.env.GOOGLE_SHEET_ID || ''

/**
 * Fetch master list from PUBLIC Google Sheets (no authentication needed)
 * Sheet must be set to "Anyone with link can view"
 */
export async function fetchMasterList(): Promise<Record<string, MasterListItem>> {
  console.log('📚 Fetching master list from Google Sheets...')
  
  if (!GOOGLE_SHEET_ID) {
    throw new Error('GOOGLE_SHEET_ID not configured')
  }
  
  // Use Google Sheets CSV export (works for public sheets)
  const sheetName = 'MASTER_LIST'
  const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch master list: ${response.statusText}. Make sure sheet is public!`)
  }
  
  const csvText = await response.text()
  const rows = parseCSV(csvText)
  
  const masterData: Record<string, MasterListItem> = {}
  let currentMain: MasterListItem | null = null
  
  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    
    // Column mapping (adjust based on your sheet structure)
    const partNum = row[3]?.trim() // Column D
    const desc = row[5]?.trim()    // Column F
    
    if (!partNum) continue
    
    const isSubComponent = desc && desc.startsWith('-')
    
    if (!isSubComponent) {
      // Main item
      currentMain = {
        part_num: partNum,
        description: desc || '',
        hp: parseValue(row[6]),
        phase: parseValue(row[7]),
        volts: parseFloat(row[8]) || null,
        amps: parseFloat(row[9]) || null,
        cb: parseValue(row[10]),
        port: parseValue(row[11]),
        cold: parseValue(row[12]),
        hot: parseValue(row[13]),
        reclaim: parseValue(row[14]),
        gal_min: parseFloat(row[15]) || null,
        btuh: parseFloat(row[16]) || null,
        sub_components: []
      }
      masterData[partNum] = currentMain
    } else {
      // Sub-component
      if (currentMain) {
        currentMain.sub_components.push({
          part_num: partNum,
          description: desc,
          hp: parseValue(row[6]),
          phase: parseValue(row[7]),
          volts: parseFloat(row[8]) || null,
          amps: parseFloat(row[9]) || null,
          cb: parseValue(row[10]),
          port: parseValue(row[11]),
          cold: parseValue(row[12]),
          hot: parseValue(row[13]),
          reclaim: parseValue(row[14]),
          gal_min: parseFloat(row[15]) || null,
          btuh: parseFloat(row[16]) || null,
        })
      }
    }
  }
  
  console.log(`✓ Loaded ${Object.keys(masterData).length} items from Google Sheets`)
  
  return masterData
}

/**
 * Fetch exclusion list from PUBLIC Google Sheets
 */
export async function fetchExclusionList(): Promise<string[]> {
  console.log('🚫 Fetching exclusion list from Google Sheets...')
  
  if (!GOOGLE_SHEET_ID) {
    console.warn('⚠️  GOOGLE_SHEET_ID not configured, using default exclusions')
    return getDefaultExclusions()
  }
  
  try {
    const sheetName = 'EXCLUSIONS'
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.warn('⚠️  EXCLUSIONS sheet not found, using defaults')
      return getDefaultExclusions()
    }
    
    const csvText = await response.text()
    const rows = parseCSV(csvText)
    
    // Skip header row, get first column
    const exclusions = rows.slice(1).map(row => row[0]?.trim()).filter(Boolean)
    
    console.log(`✓ Loaded ${exclusions.length} exclusions`)
    
    return exclusions
  } catch (error) {
    console.warn('⚠️  Error fetching exclusions, using defaults:', error)
    return getDefaultExclusions()
  }
}

/**
 * Fetch voltage mappings from PUBLIC Google Sheets
 */
export async function fetchVoltageMappings(): Promise<Record<string, VoltageMapping>> {
  console.log('⚡ Fetching voltage mappings from Google Sheets...')
  
  if (!GOOGLE_SHEET_ID) {
    console.warn('⚠️  GOOGLE_SHEET_ID not configured, using defaults')
    return getDefaultVoltageMappings()
  }
  
  try {
    const sheetName = 'VOLTAGE_MAP'
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.warn('⚠️  VOLTAGE_MAP sheet not found, using defaults')
      return getDefaultVoltageMappings()
    }
    
    const csvText = await response.text()
    const rows = parseCSV(csvText)
    
    const mappings: Record<string, VoltageMapping> = {}
    
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const country = row[0]?.trim()
      if (country) {
        mappings[country] = {
          '3phase': parseInt(row[1]) || 460,
          '1phase': parseInt(row[2]) || 120,
        }
      }
    }
    
    console.log(`✓ Loaded voltage mappings for ${Object.keys(mappings).length} countries`)
    
    return mappings
  } catch (error) {
    console.warn('⚠️  Error fetching voltage mappings, using defaults:', error)
    return getDefaultVoltageMappings()
  }
}

/**
 * Simple CSV parser
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  const lines = text.split('\n')
  
  for (const line of lines) {
    if (!line.trim()) continue
    
    const row: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    row.push(current.trim())
    rows.push(row)
  }
  
  return rows
}

/**
 * Parse cell value (handle empty, -, null)
 * Returns string for text fields, keeps null for empty
 */
function parseValue(value: string | undefined): string | null {
  if (!value || value === '-' || value === '' || value.trim() === '') return null
  return value.trim()
}

/**
 * Default exclusions (fallback)
 */
function getDefaultExclusions(): string[] {
  return [
    'RC3DG-UHMW',
    'FGPIT-MOLD-K',
    'FGPIT-MOLD-K-4X12',
    'FGPIT-CLM-K',
    'WA2F-0318',
    'WA1M-72-510-5220-CORE',
    'WA1M-00-510-5220-SS-CL-BL',
    'RB1AMC-23-13',
    'RB1AMA-23-13',
    'TR1HB-82',
    'TR1-BUN-RED',
    'CB1AMA-50-13-S-CL',
    'CB1AMC-50-13',
    'CB1AMA-23-13-S-CL',
    'CB1AMC-23-13',
    'MC1E-12W79L-S-CL-AVW-BL',
    'MCC-460',
    'MCC-5-460-VFD',
    'DISPENSEIT-10-INJ-KIT',
    'COMP-FLTR-REG-3-4IN',
    'COMP-PRESS-GAUGE',
  ]
}

/**
 * Default voltage mappings (fallback)
 */
function getDefaultVoltageMappings(): Record<string, VoltageMapping> {
  return {
    'USA': { '3phase': 460, '1phase': 120 },
    'Canada': { '3phase': 575, '1phase': 120 },
    'Australia': { '3phase': 415, '1phase': 240 },
    'UK': { '3phase': 400, '1phase': 230 },
    'Mexico': { '3phase': 440, '1phase': 127 },
  }
}
