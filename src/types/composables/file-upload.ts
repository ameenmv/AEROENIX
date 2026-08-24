import type { Ref } from 'vue'

export interface FileUploadOptions {
  accept?: string[]
  maxSize?: number
  minSize?: number
  maxFiles?: number
  multiple?: boolean
  validate?: (file: File) => boolean | Promise<boolean>
  uploadUrl?: string
  headers?: Record<string, string>
  autoUpload?: boolean
}
export interface FileWithStatus extends File {
  id: string
  status: 'idle' | 'valid' | 'invalid' | 'uploading' | 'uploaded' | 'error'
  error?: string
  progress?: number
  uploadedUrl?: string
}
export interface UseFileUploadReturn {
  files: Ref<FileWithStatus[]>
  isOverDropZone: Ref<boolean>
  dropZoneRef: Ref<HTMLElement | null>
  openFileDialog: () => void
  validateFile: (file: File) => Promise<{ isValid: boolean, error?: string }>
  validateFiles: () => Promise<boolean>
  uploadFile: (file: FileWithStatus) => Promise<void>
  uploadAll: () => Promise<void>
  removeFile: (id: string) => void
  clearFiles: () => void
  totalProgress: Ref<number>
  isUploading: Ref<boolean>
  validFiles: Ref<FileWithStatus[]>
  invalidFiles: Ref<FileWithStatus[]>
  uploadedFiles: Ref<FileWithStatus[]>
  errorFiles: Ref<FileWithStatus[]>
}
