import type { FunnelMetricsData } from '@/types/entities/report'
import type { ApiSuccessResponse } from '@/types/services/api'
import api from './api'

const ENDPOINT = '/platform/reports'

export const reportsService = {
  /**
   * Reports & Analytics Lead Funnel and KPI performance metrics.
   */
  async getFunnelMetrics(params?: { hotel_id?: number }): Promise<FunnelMetricsData> {
    const response = await api.get<ApiSuccessResponse<FunnelMetricsData>>(`${ENDPOINT}/funnel`, {
      params,
    })
    return response.data.data
  },

  /**
   * Export all customer, conversation, and booking data to CSV for Microsoft Excel.
   * Downloads streamed CSV file with UTF-8 BOM.
   */
  async exportCsv(params?: { hotel_id?: number; classification?: string }): Promise<void> {
    const response = await api.get(`${ENDPOINT}/export-csv`, {
      params,
      responseType: 'blob',
    })

    // Extract filename from Content-Disposition header if available
    let filename = `azul_customers_report_${new Date().toISOString().slice(0, 10)}.csv`
    const disposition = response.headers['content-disposition']
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, '')
      }
    }

    // Trigger browser download via Blob URL
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}
