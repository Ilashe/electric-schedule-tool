import { QuoteData, QuoteItem } from '@/types'
import pdf from 'pdf-parse'

/**
 * Extract quote data from PDF buffer
 */
export async function extractQuoteFromPDF(pdfBuffer: Buffer): Promise<QuoteData> {
  console.log('📄 Extracting data from PDF...')
  
  const data = await pdf(pdfBuffer)
  const text = data.text
  
  console.log(`Extracted ${text.length} characters`)
  
  // Extract quote number
  const quoteMatch = text.match(/Quote Number:\s*(\d+)/i)
  const quoteNumber = quoteMatch ? quoteMatch[1] : 'Unknown'
  
  // Extract ship to / project name
  const shipMatch = text.match(/Ship To\s+([^\n]+)/i)
  let projectName = 'Unknown Project'
  if (shipMatch) {
    projectName = shipMatch[1].trim()
  }
  
  // Extract shipping address for country detection
  const addressMatch = text.match(/Ship To([\s\S]{1,500}?)(?:Terms|Rep|FOB)/i)
  const shippingAddress = addressMatch ? addressMatch[1].trim() : ''
  
  // Detect country
  const country = detectCountry(text, shippingAddress)
  
  // Extract items
  const items = extractItemsFromText(text)
  
  console.log(`Quote: ${quoteNumber}`)
  console.log(`Project: ${projectName}`)
  console.log(`Country: ${country}`)
  console.log(`Items: ${items.length}`)
  
  return {
    quoteNumber,
    projectName,
    shippingAddress,
    country,
    items
  }
}

/**
 * Detect country from text
 */
function detectCountry(text: string, address: string): string {
  const fullText = (text + ' ' + address).toUpperCase()
  
  if (fullText.includes('CANADA') || fullText.includes('ONTARIO') || fullText.includes('QUEBEC')) {
    return 'Canada'
  }
  if (fullText.includes('AUSTRALIA') || fullText.includes('SYDNEY') || fullText.includes('MELBOURNE')) {
    return 'Australia'
  }
  if (fullText.includes('UNITED KINGDOM') || fullText.includes('UK') || fullText.includes('ENGLAND')) {
    return 'UK'
  }
  if (fullText.includes('MEXICO') || fullText.includes('CIUDAD')) {
    return 'Mexico'
  }
  
  return 'USA'
}

/**
 * Extract items from PDF text - HANDLES pdf-parse removing spaces
 * 
 * pdf-parse often removes spaces, so "Item Description Qty" becomes "ItemDescriptionQty"
 * and "RC4 Roller..." becomes "RC4Roller..."
 */
function extractItemsFromText(text: string): QuoteItem[] {
  const items: QuoteItem[] = []
  
  console.log('📋 Parsing items from quote...')
  
  // pdf-parse removes spaces, so look for these patterns:
  // "ItemDescriptionQty" or "Item Description" with various spacing
  const headerPatterns = [
    /ItemDescriptionQty/i,
    /Item\s*Description\s*Qty/i,
    /Description\s*Qty\s*Unit/i,
  ]
  
  let itemsText = text
  let foundHeader = false
  
  for (const pattern of headerPatterns) {
    const match = text.match(pattern)
    if (match && match.index !== undefined) {
      itemsText = text.substring(match.index + match[0].length)
      foundHeader = true
      console.log('✓ Found items header at position', match.index)
      break
    }
  }
  
  if (!foundHeader) {
    console.warn('⚠️  Header not found, looking for first part number...')
    // Look for common AVW part numbers
    const firstItemMatch = text.match(/\b(RC\d|BCN\d|PHE\d|CTA\d|OT\d|RB\d|TR\d|WGM\d|PSH\d)/i)
    if (firstItemMatch && firstItemMatch.index) {
      itemsText = text.substring(firstItemMatch.index)
      console.log('✓ Starting from:', firstItemMatch[0])
    }
  }
  
  // Stop at Subtotal
  const endMatch = itemsText.match(/Subtotal/i)
  if (endMatch && endMatch.index) {
    itemsText = itemsText.substring(0, endMatch.index)
    console.log('✓ Stopping at Subtotal')
  }
  
  console.log('Items text length:', itemsText.length)
  console.log('First 300 chars:', itemsText.substring(0, 300))
  
  // Now extract items using a pattern that handles missing spaces
  // Pattern: PARTNUMBER (letters/numbers/hyphens) followed by description, then QTY PRICE.PRICET
  // Example: "RC4 Roller Correlator... 1 5,385.00 5,385.00T"
  // But with pdf-parse it might be: "RC4Roller Correlator... 15,385.005,385.00T"
  
  // More flexible regex that handles various spacing issues
  const itemPattern = /\b([A-Z]{2,}[\w\-\.]{0,30})\s*([^0-9]{10,400}?)\s*(\d{1,3})\s*([\d,]+\.[\d]{2})\s*([\d,]+\.[\d]{2})T?/gi
  
  let match
  let foundCount = 0
  
  while ((match = itemPattern.exec(itemsText)) !== null) {
    const partNumber = match[1].trim()
    let description = match[2].trim()
    const quantity = parseInt(match[3])
    
    // Clean up description
    description = description.replace(/\s+/g, ' ').trim()
    
    // Skip if part number looks invalid
    if (partNumber.length < 2 || partNumber.length > 40) {
      continue
    }
    
    // Skip common header words
    const skipWords = ['ITEM', 'DESCRIPTION', 'QTY', 'UNIT', 'PRICE', 'TOTAL', 'PAGE']
    if (skipWords.includes(partNumber.toUpperCase())) {
      continue
    }
    
    // Skip if description is too short
    if (description.length < 5) {
      continue
    }
    
    items.push({
      partNumber,
      description: description.substring(0, 500),
      quantity
    })
    
    foundCount++
    if (foundCount <= 10) {
      console.log(`   Item ${foundCount}: ${partNumber} - ${description.substring(0, 50)}... (qty: ${quantity})`)
    }
  }
  
  console.log(`✓ Extracted ${items.length} items total`)
  
  if (items.length === 0) {
    console.warn('⚠️  Still no items! Trying alternative pattern...')
    
    // Alternative: split by newlines and look for lines starting with part numbers
    const lines = itemsText.split(/[\r\n]+/)
    console.log(`Trying line-by-line parsing of ${lines.length} lines`)
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length < 10) continue
      
      // Look for pattern: PARTNUMBER followed by text and ending with numbers
      const lineMatch = trimmed.match(/^([A-Z0-9][\w\-\.]{1,30})\s*(.+?)\s*(\d+)\s*([\d,]+\.[\d]{2})\s*([\d,]+\.[\d]{2})T?/)
      
      if (lineMatch) {
        const partNumber = lineMatch[1]
        const description = lineMatch[2].trim().substring(0, 500)
        const quantity = parseInt(lineMatch[3])
        
        if (quantity > 0 && description.length > 5) {
          items.push({ partNumber, description, quantity })
          if (items.length <= 5) {
            console.log(`   Line match: ${partNumber} (qty: ${quantity})`)
          }
        }
      }
    }
  }
  
  console.log(`✓ Final count: ${items.length} items`)
  if (items.length > 0) {
    console.log('First 5 part numbers:', items.slice(0, 5).map(i => i.partNumber))
  }
  
  return items
}
