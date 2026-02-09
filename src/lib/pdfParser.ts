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
 * Extract items from PDF text - WORKS WITH AVW QUOTE FORMAT
 * 
 * Format:
 * Item Description Qty Unit Price Total
 * RC4 Roller Correlator... 1 5,385.00 5,385.00T
 * RC3DG-UHMW Roller Correlator Guide... 1 1,373.00 1,373.00T
 */
function extractItemsFromText(text: string): QuoteItem[] {
  const items: QuoteItem[] = []
  
  console.log('📋 Parsing items from quote...')
  
  // Find the items table - starts with "Item Description Qty Unit Price Total"
  const tableStartMatch = text.match(/Item\s+Description\s+Qty\s+Unit\s+Price\s+Total/i)
  if (!tableStartMatch || !tableStartMatch.index) {
    console.warn('⚠️  Could not find items table header')
    return items
  }
  
  console.log('✓ Found items table at position', tableStartMatch.index)
  
  // Get text after the table header
  let itemsText = text.substring(tableStartMatch.index + tableStartMatch[0].length)
  
  // Stop at "Subtotal" or page footer markers
  const endMarkers = [
    /Subtotal/i,
    /PRICE CHANGES:/i,
    /WARRANTY:/i,
    /Page \d+$/m
  ]
  
  for (const marker of endMarkers) {
    const endMatch = itemsText.match(marker)
    if (endMatch && endMatch.index) {
      itemsText = itemsText.substring(0, endMatch.index)
      console.log('✓ Stopping at marker:', endMatch[0])
      break
    }
  }
  
  console.log('Items section length:', itemsText.length, 'characters')
  
  // Split into lines and process
  const lines = itemsText.split('\n')
  console.log('Processing', lines.length, 'lines')
  
  let currentItem: Partial<QuoteItem> | null = null
  let lineBuffer = ''
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip empty lines
    if (!line) {
      if (currentItem && lineBuffer) {
        // End of current item
        currentItem = null
        lineBuffer = ''
      }
      continue
    }
    
    // Check if this line starts a new item (has part number pattern at start)
    // Part numbers start with letters/numbers and contain hyphens, dots, underscores
    const itemStartMatch = line.match(/^([A-Z0-9][\w\-\.]{1,30})\s+(.+)/)
    
    if (itemStartMatch) {
      // Save previous item if exists
      if (currentItem && currentItem.partNumber) {
        items.push(currentItem as QuoteItem)
      }
      
      const partNumber = itemStartMatch[1]
      const restOfLine = itemStartMatch[2]
      
      // Try to extract quantity and price from this line
      // Pattern: ...description... QTY UNIT_PRICE TOTALT
      const qtyMatch = restOfLine.match(/^(.+?)\s+(\d+)\s+([\d,]+\.[\d]{2})\s+([\d,]+\.[\d]{2})T?\s*$/)
      
      if (qtyMatch) {
        // Complete item on one line
        currentItem = {
          partNumber,
          description: qtyMatch[1].trim(),
          quantity: parseInt(qtyMatch[2])
        }
        items.push(currentItem as QuoteItem)
        currentItem = null
      } else {
        // Item continues on next line(s)
        currentItem = {
          partNumber,
          description: restOfLine.trim()
        }
        lineBuffer = restOfLine
      }
    } else if (currentItem) {
      // Continuation of previous item
      // Check if this line has the quantity/price
      const qtyMatch = line.match(/^(.+?)\s+(\d+)\s+([\d,]+\.[\d]{2})\s+([\d,]+\.[\d]{2})T?\s*$/)
      
      if (qtyMatch) {
        // Found the end of the item with quantity
        currentItem.description = (currentItem.description + ' ' + qtyMatch[1]).trim()
        currentItem.quantity = parseInt(qtyMatch[2])
        items.push(currentItem as QuoteItem)
        currentItem = null
        lineBuffer = ''
      } else {
        // Still part of description
        currentItem.description = (currentItem.description + ' ' + line).trim()
      }
    }
  }
  
  // Add last item if exists
  if (currentItem && currentItem.partNumber) {
    items.push(currentItem as QuoteItem)
  }
  
  // Filter out any invalid items
  const validItems = items.filter(item => 
    item.partNumber && 
    item.quantity && 
    item.quantity > 0 &&
    item.partNumber.length < 50 // Sanity check
  )
  
  console.log(`✓ Extracted ${validItems.length} valid items`)
  if (validItems.length > 0) {
    console.log('First 5 items:', validItems.slice(0, 5).map(i => i.partNumber))
  }
  
  return validItems
}
