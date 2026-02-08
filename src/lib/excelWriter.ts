import ExcelJS from 'exceljs'
import { GeneratedSchedule } from '@/types'

export async function createExcelFile(schedule: GeneratedSchedule): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Schedule')
  
  // Set column widths
  const widths = [5, 15, 5, 20, 5, 50, 8, 8, 8, 8, 8, 8, 8, 8, 10, 10, 10]
  widths.forEach((width, i) => {
    worksheet.getColumn(i + 1).width = width
  })
  
  // Title row
  worksheet.mergeCells('A1:Q1')
  const titleCell = worksheet.getCell('A1')
  titleCell.value = `${schedule.projectName.toUpperCase()} - SCHEDULE REV 0`
  titleCell.font = { bold: true, size: 14 }
  titleCell.alignment = { horizontal: 'left', vertical: 'center' }
  
  // Subtitle row (Row 3)
  worksheet.mergeCells('A3:F3')
  worksheet.getCell('A3').value = 'CAR  WASH  EQUIPMENT  LIST'
  worksheet.getCell('A3').font = { bold: true, size: 12 }
  
  worksheet.mergeCells('G3:Q3')
  const equipCell = worksheet.getCell('G3')
  equipCell.value = 'EQUIPMENT REQUIREMENTS'
  equipCell.font = { bold: true, size: 12 }
  equipCell.alignment = { horizontal: 'center' }
  
  // Row 5 headers
  worksheet.mergeCells('G5:K5')
  const elecCell = worksheet.getCell('G5')
  elecCell.value = 'ELECTRICAL'
  elecCell.font = { bold: true }
  elecCell.alignment = { horizontal: 'center' }
  elecCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } }
  
  worksheet.getCell('L5').value = 'AIR'
  worksheet.getCell('L5').font = { bold: true }
  worksheet.getCell('L5').alignment = { horizontal: 'center' }
  
  worksheet.mergeCells('M5:O5')
  worksheet.getCell('M5').value = 'WATER'
  worksheet.getCell('M5').font = { bold: true }
  worksheet.getCell('M5').alignment = { horizontal: 'center' }
  
  worksheet.getCell('Q5').value = 'GAS'
  worksheet.getCell('Q5').font = { bold: true }
  worksheet.getCell('Q5').alignment = { horizontal: 'center' }
  
  // Column headers (Row 6)
  const headers = ['', 'PROJECT ITEM #', '', 'PART #', '#', 'DESCRIPTION',
                   'HP', 'PHASE', 'VOLTS', 'AMPS', 'C.B.', 'PORT',
                   'COLD', 'HOT', 'RECLAIM', 'GAL/MIN', '(BTUH)']
  
  headers.forEach((header, i) => {
    const cell = worksheet.getCell(6, i + 1)
    cell.value = header
    cell.font = { bold: true }
    cell.alignment = { horizontal: 'center', vertical: 'center' }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  })
  
  // Add data rows
  let currentRow = 7
  let sequentialNumber = 1
  
  for (const item of schedule.items) {
    const row = worksheet.getRow(currentRow)
    
    row.getCell(1).value = sequentialNumber
    
    const projectItemMatch = item.itemNumber.match(/^\d+/)
    row.getCell(2).value = projectItemMatch ? parseInt(projectItemMatch[0]) : item.itemNumber
    
    const subItemMatch = item.itemNumber.match(/\d+(.+)/)
    row.getCell(3).value = subItemMatch ? subItemMatch[1] : ''
    
    row.getCell(4).value = item.partNumber
    
    if (item.motorLabel) {
      const motorNum = item.motorLabel.replace('M-', '')
      row.getCell(5).value = parseInt(motorNum)
    } else {
      row.getCell(5).value = item.quantity || 1
    }
    
    row.getCell(6).value = item.description
    row.getCell(7).value = item.hp
    row.getCell(8).value = item.phase
    row.getCell(9).value = item.volts
    row.getCell(10).value = item.amps
    row.getCell(11).value = item.cb
    row.getCell(12).value = item.port
    row.getCell(13).value = item.cold
    row.getCell(14).value = item.hot
    row.getCell(15).value = item.reclaim
    row.getCell(16).value = item.galMin
    row.getCell(17).value = item.btuh
    
    // Apply borders
    for (let col = 1; col <= 17; col++) {
      row.getCell(col).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      
      if (col !== 6) {
        row.getCell(col).alignment = { horizontal: 'center', vertical: 'center' }
      } else {
        row.getCell(col).alignment = { vertical: 'center' }
      }
    }
    
    if (!subItemMatch || !subItemMatch[1]) {
      row.font = { bold: true }
    }
    
    currentRow++
    sequentialNumber++
  }
  
  // Add totals
  const totalRow = worksheet.getRow(currentRow + 2)
  totalRow.getCell(6).value = 'TOTAL'
  totalRow.getCell(6).font = { bold: true }
  totalRow.getCell(10).value = `Σ ${schedule.totalAmps}`
  totalRow.getCell(10).font = { bold: true }
  
  // Add notes
  const notesRow = currentRow + 5
  worksheet.getCell(notesRow, 2).value = `Total Motors: ${schedule.totalMotors}`
  worksheet.getCell(notesRow + 1, 2).value = `Country: ${schedule.country}`
  worksheet.getCell(notesRow + 2, 2).value = `Voltage: ${schedule.voltage['3phase']}V (3Ø) / ${schedule.voltage['1phase']}V (1Ø)`
  worksheet.getCell(notesRow + 3, 2).value = `Generated: ${new Date().toLocaleDateString()}`
  
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
