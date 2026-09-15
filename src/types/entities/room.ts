export interface Room {
  id: number
  hotel_id: number
  name: string
  description?: string
  price: number
  capacity: number
  status: 'available' | 'unavailable' | 'maintenance'
  check_in?: string
  check_out?: string
  created_at: string
  updated_at: string
}

export interface RoomCreatePayload {
  name: string
  description?: string
  price: number
  capacity: number
  status: 'available' | 'unavailable' | 'maintenance'
  check_in?: string
  check_out?: string
}

export interface RoomUpdatePayload extends Partial<RoomCreatePayload> {}
