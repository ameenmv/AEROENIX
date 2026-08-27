export interface Hotel {
  id: number
  name: string
  status: string
  created_at?: string
  updated_at?: string
}

export interface HotelCreatePayload {
  name: string
  admin_email: string
  admin_permissions: number[]
}
