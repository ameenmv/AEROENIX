export interface Room {
  id: number
  hotel_id: number
  name: string
  description?: string
  price: number
  capacity: number
  status: 'available' | 'unavailable' | 'maintenance'
  created_at: string
  updated_at: string
}

export interface RoomCreatePayload {
  name: string
  description?: string
  price: number
  capacity: number
  status: 'available' | 'unavailable' | 'maintenance'
}

export interface RoomUpdatePayload extends Partial<RoomCreatePayload> {}
