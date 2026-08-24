import { API_ENDPOINTS } from '@/constants/endpoints'
import api from './api'

export interface TempUploadResult {
  token: string
  collection: string
}

export const tempUploadsService = {
  /**
   * Upload a file to temporary storage.
   * Returns a claim token to be used in subsequent model create/update requests.
   */
  async upload(file: File, collection = 'default'): Promise<TempUploadResult> {
    const fd = new FormData()
    fd.append('file', file)
    if (collection !== 'default')
      fd.append('collection', collection)

    const response = await api.post(API_ENDPOINTS.TEMP_UPLOADS.UPLOAD, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return response.data?.data || response.data
  },

  /** Inspect a temp upload by its claim token. */
  async get(token: string) {
    const response = await api.get(API_ENDPOINTS.TEMP_UPLOADS.GET(token))
    return response.data?.data || response.data
  },

  /** Delete an unclaimed temp upload and its associated file. */
  async delete(token: string) {
    await api.delete(API_ENDPOINTS.TEMP_UPLOADS.DELETE(token))
  },
}
