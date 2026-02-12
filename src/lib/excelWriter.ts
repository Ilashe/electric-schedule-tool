import ExcelJS from 'exceljs'
import { GeneratedSchedule } from '@/types'

/**
 * Create Excel file with proper structure matching reference format
 */
export async function createExcelFile(schedule: GeneratedSchedule): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Schedule')
  
  // Set column widths to match reference
  worksheet.columns = [
    { width: 8.3 },   // A: Line Item
    { width: 9.9 },   // B: Project Item #
    { width: 17.9 },  // C: Sub-letter
    { width: 49.7 },  // D: Part #
    { width: 124.3 }, // E: Description (WIDE!)
    { width: 15.7 },  // F: HP
    { width: 10.6 },  // G: Phase
    { width: 13.0 },  // H: Volts
    { width: 23.0 },  // I: Amps (WIDE!)
    { width: 10.3 },  // J: CB
    { width: 14.1 },  // K: Air Port
    { width: 9.7 },   // L: Cold
    { width: 10.3 },  // M: Hot
    { width: 11.7 },  // N: Reclaim
    { width: 11.6 },  // O: (empty)
    { width: 10.1 },  // P: Gas (BTUH)
    { width: 13.3 }   // Q: Supplier
  ]
  
  // Row 1: Title (merged A1:P1)
  worksheet.mergeCells('A1:P1')
  const titleCell = worksheet.getCell('A1')
  titleCell.value = `CAR WASH TECHNOLOGIES - ${schedule.projectName.toUpperCase()} - SCHEDULE`
  titleCell.font = { bold: true, size: 14 }
  titleCell.alignment = { horizontal: 'left', vertical: 'middle' }
  
  // Row 2: Empty
  
  // Row 3: Section headers
  worksheet.mergeCells('A3:E3')
  const equipListCell = worksheet.getCell('A3')
  equipListCell.value = 'CAR  WASH  EQUIPMENT  LIST'
  equipListCell.font = { bold: true, size: 11 }
  equipListCell.alignment = { horizontal: 'center', vertical: 'middle' }
  
  worksheet.mergeCells('F3:P3')
  const equipReqCell = worksheet.getCell('F3')
  equipReqCell.value = 'EQUIPMENT REQUIREMENTS '
  equipReqCell.font = { bold: true, size: 11 }
  equipReqCell.alignment = { horizontal: 'center', vertical: 'middle' }
  
  worksheet.mergeCells('Q3:Q3')
  const workDistCell = worksheet.getCell('Q3')
  workDistCell.value = 'WORK DISTRIBUTION'
  workDistCell.font = { bold: true, size: 10 }
  workDistCell.alignment = { horizontal: 'center', vertical: 'middle' }
  
  // Row 4: Empty
  
  // Row 5: Category headers (merged with Row 6)
  worksheet.mergeCells('A5:A6')
  const lineItemHeader = worksheet.getCell('A5')
  lineItemHeader.value = 'LINE\nITEM'
  lineItemHeader.font = { bold: true, size: 9 }
  lineItemHeader.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  
  worksheet.mergeCells('B5:C6')
  const projItemHeader = worksheet.getCell('B5')
  projItemHeader.value = 'PROJECT ITEM #'
  projItemHeader.font = { bold: true, size: 9 }
  projItemHeader.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  
  worksheet.mergeCells('D5:D6')
  const partNumHeader = worksheet.getCell('D5')
  partNumHeader.value = 'PART #'
  partNumHeader.font = { bold: true, size: 9 }
  partNumHeader.alignment = { horizontal: 'center', vertical: 'middle' }
  
  worksheet.mergeCells('E5:E6')
  const descHeader = worksheet.getCell('E5')
  descHeader.value = 'DESCRIPTION'
  descHeader.font = { bold: true, size: 9 }
  descHeader.alignment = { horizontal: 'center', vertical: 'middle' }
  
  // ELECTRICAL category (F5:J5)
  worksheet.mergeCells('F5:J5')
  const elecHeader = worksheet.getCell('F5')
  elecHeader.value = 'ELECTRICAL'
  elecHeader.font = { bold: true, size: 9 }
  elecHeader.alignment = { horizontal: 'center', vertical: 'middle' }
  
  // ELECTRICAL sub-headers (Row 6)
  const elecSubHeaders = [
    { col: 'F', value: 'HP' },
    { col: 'G', value: 'PHASE' },
    { col: 'H', value: 'VOLTS' },
    { col: 'I', value: 'AMPS' },
    { col: 'J', value: 'C.B.' }
  ]
  
  for (const header of elecSubHeaders) {
    const cell = worksheet.getCell(`${header.col}6`)
    cell.value = header.value
    cell.font = { bold: true, size: 9 }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
  }
  
  // AIR PORT (K5:K6)
  worksheet.mergeCells('K5:K6')
  const airPortHeader = worksheet.getCell('K5')
  airPortHeader.value = 'AIR\nPORT'
  airPortHeader.font = { bold: true, size: 9 }
  airPortHeader.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  
  // WATER category (L5:N5)
  worksheet.mergeCells('L5:N5')
  const waterHeader = worksheet.getCell('L5')
  waterHeader.value = 'WATER'
  waterHeader.font = { bold: true, size: 9 }
  waterHeader.alignment = { horizontal: 'center', vertical: 'middle' }
  
  // WATER sub-headers (Row 6)
  const waterSubHeaders = [
    { col: 'L', value: 'COLD' },
    { col: 'M', value: 'HOT' },
    { col: 'N', value: 'RECLAIM' }
  ]
  
  for (const header of waterSubHeaders) {
    const cell = worksheet.getCell(`${header.col}6`)
    cell.value = header.value
    cell.font = { bold: true, size: 9 }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
  }
  
  // Column O is empty
  
  // GAS (BTUH) (P5:P6)
  worksheet.mergeCells('P5:P6')
  const gasHeader = worksheet.getCell('P5')
  gasHeader.value = 'GAS\n(BTUH)'
  gasHeader.font = { bold: true, size: 9 }
  gasHeader.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  
  // SUPPLIER (Q5:Q6)
  worksheet.mergeCells('Q5:Q6')
  const supplierHeader = worksheet.getCell('Q5')
  supplierHeader.value = 'SUPPLIER'
  supplierHeader.font = { bold: true, size: 9 }
  supplierHeader.alignment = { horizontal: 'center', vertical: 'middle' }
  
  // Add data rows starting at Row 7
  let currentRow = 7
  let sequentialNumber = 1
  
  for (const item of schedule.items) {
    const row = worksheet.getRow(currentRow)
    
    // Col A: Line Item (sequential)
    row.getCell(1).value = sequentialNumber
    
    // Col B: Project Item #
    const projectItemMatch = item.itemNumber.match(/^\d+/)
    row.getCell(2).value = projectItemMatch ? parseInt(projectItemMatch[0]) : item.itemNumber
    
    // Col C: Sub-letter
    const subItemMatch = item.itemNumber.match(/\d+(.+)/)
    row.getCell(3).value = subItemMatch ? subItemMatch[1] : ''
    
    // Col D: Part #
    row.getCell(4).value = item.partNumber
    
    // Col E: Description (MOVED HERE - no more Qty column!)
    row.getCell(5).value = item.description
    
    // Col F-J: Electrical data
    row.getCell(6).value = item.hp || '-'
    row.getCell(7).value = item.phase || '-'
    row.getCell(8).value = item.volts || '-'
    row.getCell(9).value = item.amps || '-'
    row.getCell(10).value = item.cb || '-'
    
    // Col K: Air Port
    row.getCell(11).value = item.port || '-'
    
    // Col L-N: Water
    row.getCell(12).value = item.cold || '-'
    row.getCell(13).value = item.hot || '-'
    row.getCell(14).value = item.reclaim || '-'
    
    // Col O: (empty)
    row.getCell(15).value = ''
    
    // Col P: Gas (BTUH)
    row.getCell(16).value = item.btuh || '-'
    
    // Col Q: Supplier (empty for now)
    row.getCell(17).value = ''
    
    // Apply borders and alignment
    for (let col = 1; col <= 17; col++) {
      row.getCell(col).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      
      // Column B: RIGHT aligned
      if (col === 2) {
        row.getCell(col).alignment = { horizontal: 'right', vertical: 'middle' }
      }
      // Column C: LEFT aligned
      else if (col === 3) {
        row.getCell(col).alignment = { horizontal: 'left', vertical: 'middle' }
      }
      // Column E (Description): LEFT aligned
      else if (col === 5) {
        row.getCell(col).alignment = { horizontal: 'left', vertical: 'middle' }
      }
      // All others: CENTER aligned
      else {
        row.getCell(col).alignment = { horizontal: 'center', vertical: 'middle' }
      }
    }
    
    // Bold main items (no sub-letter)
    if (!subItemMatch || !subItemMatch[1]) {
      row.font = { bold: true }
    }
    
    currentRow++
    sequentialNumber++
  }
  
  // Add totals row
  const totalRow = worksheet.getRow(currentRow + 2)
  totalRow.getCell(5).value = 'TOTAL' // Description column
  totalRow.getCell(5).font = { bold: true }
  totalRow.getCell(9).value = `Σ ${schedule.totalAmps}` // Amps column
  totalRow.getCell(9).font = { bold: true }
  
  // Add notes
  const notesRow = currentRow + 5
  worksheet.getCell(notesRow, 2).value = `Total Motors: ${schedule.totalMotors}`
  worksheet.getCell(notesRow + 1, 2).value = `Country: ${schedule.country}`
  worksheet.getCell(notesRow + 2, 2).value = `Voltage: ${schedule.voltage['3phase']}V (3Ø) / ${schedule.voltage['1phase']}V (1Ø)`
  worksheet.getCell(notesRow + 3, 2).value = `Generated: ${new Date().toLocaleDateString()}`
  
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
