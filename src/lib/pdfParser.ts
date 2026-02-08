import { QuoteData, QuoteItem } from '@/types'
import pdf from 'pdf-parse'

/**
 * Extract quote data from PDF buffer
 */
export async function extractQuoteFromPDF(pdfBuffer: Buffer): Promise<QuoteData> {
  console.log('📄 Extracting data from PDF...')
  
  const data = await pdf(pdfBuffer)
  const text = data.text
  
  console.log(`   Extracted ${text.length} characters`)
  
  // Extract quote number
  const quoteMatch = text.match(/(?:Quote|Acknowledgment)\s+Number:\s*(\d+)/i)
  const quoteNumber = quoteMatch ? quoteMatch[1] : 'Unknown'
  
  // Extract ship to / project name
  const shipMatch = text.match(/Ship\s+To\s+([^\n]+)/i)
  let projectName = 'Unknown Project'
  if (shipMatch) {
    projectName = shipMatch[1].trim()
  }
  
  // Extract shipping address for country detection
  const addressMatch = text.match(/Ship\s+To([\s\S]{1,500}?)(?:Terms|FOB|Phone)/i)
  const shippingAddress = addressMatch ? addressMatch[1].trim() : ''
  
  // Detect country
  const country = detectCountry(text, shippingAddress)
  
  // Extract items
  const items = extractItemsFromText(text)
  
  console.log(`   Quote: ${quoteNumber}`)
  console.log(`   Project: ${projectName}`)
  console.log(`   Country: ${country}`)
  console.log(`   Items: ${items.length}`)
  
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
 * Extract items from PDF text
 */
function extractItemsFromText(text: string): QuoteItem[] {
  const items: QuoteItem[] = []
  
  // Find items section
  const startMatch = text.match(/Item\s+Description\s+Qty\s+Unit\s+Price\s+Total/i)
  if (!startMatch) {
    console.warn('   ⚠️  Could not find item section')
    return items
  }
  
  let itemsSection = text.substring(startMatch.index! + startMatch[0].length)
  
  // Stop at Subtotal
  const subtotalMatch = itemsSection.match(/Subtotal/i)
  if (subtotalMatch) {
    itemsSection = itemsSection.substring(0, subtotalMatch.index)
  }
  
  // Pattern: PART_NUMBER Description... QTY PRICE TOTALT
  const pattern = /\b([A-Z0-9]+[A-Z0-9\-\._]*)\s+(.+?)\s+(\d+)\s+([\d,]+\.[\d]+)\s+([\d,]+\.[\d]+)T/g
  
  const excludeWords = ['ACKNOWLEDGEMENT', 'TOTAL', 'SUBTOTAL', 'PAGE', 'ITEM', 'DESCRIPTION', 'QTY', 'PRICE', 'UNIT']
  
  let match
  while ((match = pattern.exec(itemsSection)) !== null) {
    const partNumber = match[1]
    const description = match[2].trim()
    const quantity = parseInt(match[3])
    
    // Skip header words
    if (excludeWords.includes(partNumber.toUpperCase())) {
      continue
    }
    
    // Skip if part number is too long (likely not a part number)
    if (partNumber.length > 50) {
      continue
    }
    
    items.push({
      partNumber,
      description,
      quantity
    })
  }
  
  return items
}
