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
 * Extract items from PDF text - WORKS WITH pdf-parse text extraction
 * 
 * pdf-parse often extracts PDFs with inconsistent spacing/newlines
 * We need to be more flexible in finding the items
 */
function extractItemsFromText(text: string): QuoteItem[] {
  const items: QuoteItem[] = []
  
  console.log('📋 Parsing items from quote...')
  
  // Try multiple header patterns (pdf-parse might break spacing)
  const headerPatterns = [
    /Item\s+Description\s+Qty\s+Unit\s+Price\s+Total/i,
    /Item\s+Description\s+Qty/i,
    /Description\s+Qty\s+Unit/i,
    // Sometimes the table starts right at first part number
    /^([A-Z]{2,}[\w\-\.]*)\s+[A-Z][a-z]/m
  ]
  
  let itemsText = text
  let foundHeader = false
  
  for (const pattern of headerPatterns) {
    const match = text.match(pattern)
    if (match && match.index !== undefined) {
      itemsText = text.substring(match.index + match[0].length)
      foundHeader = true
      console.log('✓ Found items section with pattern:', pattern.source.substring(0, 50))
      break
    }
  }
  
  if (!foundHeader) {
    console.warn('⚠️  Could not find items table header, trying to find first item...')
    // Look for common first items in AVW quotes
    const firstItemPatterns = [/\b(RC\d|PHE\d|BCN\d|CTA\d|OT\d)/]
    for (const pattern of firstItemPatterns) {
      const match = text.match(pattern)
      if (match && match.index) {
        itemsText = text.substring(match.index)
        console.log('✓ Starting from first detected item:', match[0])
        break
      }
    }
  }
  
  // Stop at common end markers
  const endMarkers = [/Subtotal/i, /PRICE CHANGES/i, /WARRANTY/i]
  for (const marker of endMarkers) {
    const endMatch = itemsText.match(marker)
    if (endMatch && endMatch.index) {
      itemsText = itemsText.substring(0, endMatch.index)
      console.log('✓ Stopping at:', endMatch[0])
      break
    }
  }
  
  console.log('Items section length:', itemsText.length, 'characters')
  
  // More aggressive line-by-line parsing
  const lines = itemsText.split(/\r?\n/)
  console.log('Processing', lines.length, 'lines')
  
  let currentPart: string | null = null
  let currentDesc: string[] = []
  let foundCount = 0
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.length < 3) continue
    
    // Check if line starts with a part number
    // Part numbers: RC4, BCN3-1020-063, PHE2-0315, OT2-AA1, etc.
    const partMatch = trimmed.match(/^([A-Z0-9][\w\-\.]{1,40})\s+(.+)/)
    
    if (partMatch) {
      // Save previous item if we have one
      if (currentPart && currentDesc.length > 0) {
        const fullDesc = currentDesc.join(' ').trim()
        // Extract quantity from description
        const qtyMatch = fullDesc.match(/\s+(\d+)\s+[\d,]+\.[\d]{2}\s+[\d,]+\.[\d]{2}T?\s*$/)
        if (qtyMatch) {
          const quantity = parseInt(qtyMatch[1])
          const description = fullDesc.substring(0, qtyMatch.index).trim()
          
          items.push({
            partNumber: currentPart,
            description: description.substring(0, 500), // Limit length
            quantity
          })
          foundCount++
          if (foundCount <= 5) {
            console.log(`   Item ${foundCount}: ${currentPart} (qty: ${quantity})`)
          }
        }
      }
      
      // Start new item
      currentPart = partMatch[1]
      currentDesc = [partMatch[2]]
    } else if (currentPart) {
      // Continue description from previous line
      currentDesc.push(trimmed)
    }
  }
  
  // Don't forget the last item
  if (currentPart && currentDesc.length > 0) {
    const fullDesc = currentDesc.join(' ').trim()
    const qtyMatch = fullDesc.match(/\s+(\d+)\s+[\d,]+\.[\d]{2}\s+[\d,]+\.[\d]{2}T?\s*$/)
    if (qtyMatch) {
      items.push({
        partNumber: currentPart,
        description: fullDesc.substring(0, qtyMatch.index).trim(),
        quantity: parseInt(qtyMatch[1])
      })
    }
  }
  
  console.log(`✓ Extracted ${items.length} items total`)
  if (items.length > 0) {
    console.log('First 5 part numbers:', items.slice(0, 5).map(i => i.partNumber))
  } else {
    console.warn('⚠️  No items extracted! Dumping first 500 chars of items section:')
    console.warn(itemsText.substring(0, 500))
  }
  
  return items
}
