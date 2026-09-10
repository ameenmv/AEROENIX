export interface GuestDetails {
  name: string
  phone: string | null
  email: string | null
}

export interface RoomDetails {
  id: number
  name: string
  rooms_count: number
  guests_count: number
}

export interface PaymentDetails {
  method: string
}

export interface IdCardDetails {
  number: string | null
  url: string | null
  has_file: boolean
}

export interface BookingActions {
  can_confirm: boolean
  can_reject: boolean
}

export interface Booking {
  id: number
  booking_reference: string
  hotel_id: number
  hotel_name: string | null
  
  guest: GuestDetails
  room: RoomDetails
  
  check_in: string
  check_in_date: string | null
  check_out: string
  check_out_date: string | null
  nights_count: number
  
  price: string
  total_price: number
  currency: string
  
  status: 'pending' | 'confirmed' | 'rejected'
  status_label: string
  
  payment: PaymentDetails
  id_card: IdCardDetails
  
  special_requests: string | null
  rejection_reason: string | null
  
  confirmed_at: string | null
  rejected_at: string | null
  
  actions: BookingActions
  
  created_at: string | null
  updated_at: string | null
}

export interface BookingUpdatePayload {
  check_in_date?: string
  check_out_date?: string
  rooms_count?: number
  guests_count?: number
  special_requests?: string
}

export interface BookingRejectPayload {
  reason: string
}
