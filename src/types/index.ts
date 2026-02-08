export interface QuoteItem {
  partNumber: string
  description: string
  quantity: number
}

export interface QuoteData {
  quoteNumber: string
  projectName: string
  shippingAddress: string
  country: string
  items: QuoteItem[]
}

export interface MasterListItem {
  part_num: string
  description: string
  hp: string | number | null
  phase: string | number | null
  volts: number | null
  amps: number | null
  cb: string | null
  port: string | null
  cold: string | null
  hot: string | null
  reclaim: string | null
  gal_min: number | null
  btuh: number | null
  sub_components: SubComponent[]
}

export interface SubComponent {
  part_num: string
  description: string
  hp: string | number | null
  phase: string | number | null
  volts: number | null
  amps: number | null
  cb: string | null
  port: string | null
  cold: string | null
  hot: string | null
  reclaim: string | null
  gal_min: number | null
  btuh: number | null
}

export interface ScheduleItem {
  itemNumber: string
  partNumber: string
  quantity: string | number
  description: string
  hp: any
  phase: any
  volts: any
  amps: any
  cb: any
  port: any
  cold: any
  hot: any
  reclaim: any
  galMin: any
  btuh: any
  isSubComponent: boolean
  motorLabel?: string
}

export interface GeneratedSchedule {
  items: ScheduleItem[]
  totalMotors: number
  totalAmps: number
  notFoundItems: string[]
  excludedItems: string[]
  projectName: string
  quoteNumber: string
  country: string
  voltage: {
    '3phase': number
    '1phase': number
  }
}

export interface VoltageMapping {
  '3phase': number
  '1phase': number
}
