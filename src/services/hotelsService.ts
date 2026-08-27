import type { Hotel } from '@/types/hotel'
import { createService } from './createService'

export const hotelsService = createService<Hotel>('/platform/hotels')
