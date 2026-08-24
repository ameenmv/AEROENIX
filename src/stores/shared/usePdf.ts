import type { PdfOptions } from '@/types/stores/pdf'
import html2pdf from 'html2pdf.js'
import { defineStore } from 'pinia'

export const usePdf = defineStore('pdf', {
  state: () => ({
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async exportPdf(element: HTMLElement, options: PdfOptions = {}) {
      try {
        this.loading = true
        this.error = null
        await document.fonts.ready
        await this.waitForImages(element)
        await html2pdf()
          .from(element)
          .set({
            margin: options.margin ?? 10,
            filename: options.filename ?? 'document.pdf',
            html2canvas: {
              scale: options.scale ?? 2,
              useCORS: true,
            },
            jsPDF: {
              unit: 'mm',
              format: options.format ?? 'a4',
              orientation: options.orientation ?? 'portrait',
            },
          })
          .save()
      }
      catch (err) {
        this.error = 'Failed to generate PDF'
        console.error(err)
      }
      finally {
        this.loading = false
      }
    },
    async waitForImages(container: HTMLElement) {
      const images = Array.from(container.querySelectorAll('img'))
      await Promise.all(
        images.map(
          img =>
            new Promise<void>((resolve) => {
              if (img.complete)
                resolve()
              img.onload = () => resolve()
              img.onerror = () => resolve()
            }),
        ),
      )
    },
  },
})
