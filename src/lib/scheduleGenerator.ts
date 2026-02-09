import { QuoteData, MasterListItem, ScheduleItem, GeneratedSchedule, VoltageMapping, SubComponent } from '@/types'

/**
 * Generate electrical schedule from quote data
 */
export async function generateSchedule(
  quoteData: QuoteData,
  masterList: Record<string, MasterListItem>,
  exclusionList: string[],
  voltageMap: Record<string, VoltageMapping>
): Promise<GeneratedSchedule> {
  console.log('⚙️  Generating schedule...')
  
  const voltage = voltageMap[quoteData.country] || voltageMap['USA']
  const scheduleItems: ScheduleItem[] = []
  const notFoundItems: string[] = []
  const excludedItems: string[] = []
  const partOccurrences: Record<string, number> = {}
  let motorCount = 0
  let projectItemNumber = 1
  
  for (const quoteItem of quoteData.items) {
    const partNumber = quoteItem.partNumber
    
    console.log(`   Processing: ${partNumber}`)
    
    // Check if excluded
    if (shouldExclude(partNumber, exclusionList)) {
      console.log(`      ❌ Excluded`)
      excludedItems.push(`${partNumber} - ${quoteItem.description}`)
      continue
    }
    
    // Lookup in master list - EXACT MATCH ONLY
    const masterItem = masterList[partNumber]
    
    if (!masterItem) {
      console.log(`      ⚠️  Not found`)
      notFoundItems.push(`${partNumber} - ${quoteItem.description}`)
      continue
    }
    
    console.log(`      ✓ Found`)
    
    // Track occurrence
    if (!partOccurrences[partNumber]) {
      partOccurrences[partNumber] = 0
    }
    partOccurrences[partNumber]++
    const occurrence = partOccurrences[partNumber]
    
    // Add main item
    const mainItem = createScheduleItem(
      masterItem,
      projectItemNumber.toString(),
      '',
      occurrence,
      voltage,
      false
    )
    scheduleItems.push(mainItem)
    
    if (isMotor(mainItem)) {
      motorCount++
      mainItem.motorLabel = `M-${motorCount}`
      mainItem.quantity = motorCount
    }
    
    // Process sub-components with smart nesting
    processSubComponentsWithNesting(
      masterItem.sub_components,
      projectItemNumber,
      voltage,
      scheduleItems,
      (motor) => {
        motorCount++
        motor.motorLabel = `M-${motorCount}`
        motor.quantity = motorCount
        return motorCount
      }
    )
    
    projectItemNumber++
  }
  
  const totalAmps = scheduleItems.reduce((sum, item) => {
    const amps = parseFloat(String(item.amps))
    return sum + (isNaN(amps) ? 0 : amps)
  }, 0)
  
  console.log(`   ✓ Generated ${scheduleItems.length} rows`)
  console.log(`   ✓ ${motorCount} motors`)
  console.log(`   ✓ ${totalAmps.toFixed(2)} total amps`)
  console.log(`   ⚠️  ${notFoundItems.length} not found`)
  console.log(`   ❌ ${excludedItems.length} excluded`)
  
  return {
    items: scheduleItems,
    totalMotors: motorCount,
    totalAmps: parseFloat(totalAmps.toFixed(2)),
    notFoundItems,
    excludedItems,
    projectName: quoteData.projectName,
    quoteNumber: quoteData.quoteNumber,
    country: quoteData.country,
    voltage
  }
}

/**
 * Check if item should be excluded
 */
function shouldExclude(partNumber: string, exclusionList: string[]): boolean {
  return exclusionList.some(excluded => partNumber.includes(excluded))
}

/**
 * Process sub-components with smart nesting
 * Uses proper nesting format: A, B, BA, BAA, BAAA (parent + A's)
 */
function processSubComponentsWithNesting(
  subItems: SubComponent[],
  projectItemNum: number,
  voltage: VoltageMapping,
  scheduleItems: ScheduleItem[],
  registerMotor: (item: ScheduleItem) => number
): void {
  let currentLetter = 'A'
  let i = 0
  
  while (i < subItems.length) {
    const item = subItems[i]
    const nextItems = subItems.slice(i + 1, Math.min(i + 10, subItems.length))
    
    // Detect children
    const children = detectChildren(item, nextItems)
    
    if (children.length > 0) {
      // Add parent
      const parentItem = createScheduleItem(
        item,
        projectItemNum.toString(),
        currentLetter,
        1,
        voltage,
        true
      )
      scheduleItems.push(parentItem)
      
      if (isMotor(parentItem)) {
        registerMotor(parentItem)
      }
      
      // Add children with nested letters using proper format
      // Parent is 'B', first child is 'BA', second child is 'BAA', third is 'BAAA'
      let childLetter = currentLetter + 'A' // B → BA
      for (const child of children) {
        const childItem = createScheduleItem(
          child,
          projectItemNum.toString(),
          childLetter,
          '',
          voltage,
          true
        )
        scheduleItems.push(childItem)
        
        if (isMotor(childItem)) {
          registerMotor(childItem)
        }
        
        // Increment: BA → BAA → BAAA → BAAAA
        childLetter = childLetter + 'A'
      }
      
      i += 1 + children.length
    } else {
      // Standalone item
      const standaloneItem = createScheduleItem(
        item,
        projectItemNum.toString(),
        currentLetter,
        1,
        voltage,
        true
      )
      scheduleItems.push(standaloneItem)
      
      if (isMotor(standaloneItem)) {
        registerMotor(standaloneItem)
      }
      
      i++
    }
    
    // Move to next letter: A → B → C → D
    currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1)
  }
}

/**
 * Detect parent-child relationships
 */
function detectChildren(parent: SubComponent, nextItems: SubComponent[]): SubComponent[] {
  const children: SubComponent[] = []
  const parentDesc = String(parent.description).toUpperCase()
  const parentPart = String(parent.part_num).toUpperCase()
  
  // RULE 1: BLOWER + MOTOR
  if (parentDesc.includes('BLOWER') || parentPart.includes('BL0')) {
    if (nextItems[0] && isMotorItem(nextItems[0])) {
      children.push(nextItems[0])
    }
    return children
  }
  
  // RULE 2: PANEL + SOLENOID(s)
  if (parentDesc.includes('PANEL') || parentDesc.includes('CONTROL') || parentPart.includes('WA1P')) {
    for (const next of nextItems) {
      if (isSolenoid(next)) {
        children.push(next)
      } else {
        break
      }
    }
    return children
  }
  
  // RULE 3: ELECTRIC + MOTOR(s)
  if (parentDesc.includes('-EL') || parentDesc.includes('ELECTRIC') || parentPart.includes('-EL')) {
    for (const next of nextItems) {
      if (isMotorItem(next)) {
        children.push(next)
      } else {
        break
      }
    }
    return children
  }
  
  return children
}

/**
 * Increment nested letter
 */
function incrementNestedLetter(letter: string): string {
  const lastChar = letter[letter.length - 1]
  const prefix = letter.slice(0, -1)
  
  if (lastChar === 'Z') {
    return prefix + 'AA'
  }
  
  return prefix + String.fromCharCode(lastChar.charCodeAt(0) + 1)
}

/**
 * Create schedule item
 */
function createScheduleItem(
  masterData: SubComponent | MasterListItem,
  projectItemNum: string,
  subLetter: string,
  quantity: string | number,
  voltage: VoltageMapping,
  isSubComponent: boolean
): ScheduleItem {
  let volts = masterData.volts
  let amps = masterData.amps
  
  if (masterData.phase === 3 || masterData.phase === '3') {
    volts = voltage['3phase']
  } else if (masterData.phase === 1 || masterData.phase === '1') {
    volts = voltage['1phase']
  }
  
  if (masterData.volts && amps && volts && volts !== masterData.volts) {
    const power = masterData.volts * amps
    amps = parseFloat((power / volts).toFixed(2))
  }
  
  return {
    itemNumber: subLetter ? `${projectItemNum}${subLetter}` : projectItemNum,
    partNumber: masterData.part_num,
    quantity: quantity || 1,
    description: masterData.description,
    hp: masterData.hp || '-',
    phase: masterData.phase || '-',
    volts: volts || '-',
    amps: amps || '-',
    cb: masterData.cb || '-',
    port: masterData.port,
    cold: masterData.cold,
    hot: masterData.hot,
    reclaim: masterData.reclaim,
    galMin: masterData.gal_min,
    btuh: masterData.btuh,
    isSubComponent
  }
}

/**
 * Check if item is a motor
 */
function isMotor(item: ScheduleItem): boolean {
  return isMotorItem({ description: item.description, hp: item.hp, part_num: item.partNumber })
}

/**
 * Check if sub-component is a motor
 */
function isMotorItem(item: SubComponent | { description: string; hp: any; part_num: string }): boolean {
  const desc = String(item.description).toUpperCase()
  const hasMotorKeyword = desc.includes('MOTOR') || desc.includes('GEARMOTOR')
  const hasHP = item.hp && item.hp !== '-' && !isNaN(parseFloat(String(item.hp)))
  
  return hasMotorKeyword || hasHP
}

/**
 * Check if item is a solenoid
 */
function isSolenoid(item: SubComponent): boolean {
  const part = String(item.part_num).toUpperCase()
  const desc = String(item.description).toUpperCase()
  
  return part === 'SOL' || desc.includes('SOLENOID')
}
