import type {
  FileUploadOptions,
  FileWithStatus,
  UseFileUploadReturn,
} from '@/types/composables/file-upload'
import { useDropZone, useFileDialog } from '@vueuse/core'

export function useFileUpload(options: FileUploadOptions = {}): UseFileUploadReturn {
  const {
    accept = [],
    maxSize = Infinity,
    minSize = 0,
    maxFiles = 10,
    multiple = false,
    validate,
    uploadUrl,
    headers = {},
    autoUpload = false,
  } = options
  const files = ref<FileWithStatus[]>([])
  const totalProgress = ref(0)
  const isUploading = ref(false)
  const { open: openFileDialog, onChange } = useFileDialog({
    accept: accept.length > 0 ? accept.join(',') : undefined,
    multiple,
  })
  onChange((selectedFiles) => {
    if (!selectedFiles)
      return
    const newFiles = Array.from(selectedFiles).map(file => ({
      ...file,
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'idle' as const,
      progress: 0,
    }))
    const currentCount = files.value.length
    const remainingSlots = maxFiles - currentCount
    const filesToAdd = multiple ? newFiles.slice(0, remainingSlots) : newFiles.slice(0, 1)
    files.value = [...files.value, ...filesToAdd]
    // eslint-disable-next-line ts/no-use-before-define
    filesToAdd.forEach(file => validateAndSetStatus(file))
    if (autoUpload) {
      // eslint-disable-next-line ts/no-use-before-define
      uploadAll()
    }
  })
  const dropZoneRef = ref<HTMLElement | null>(null)
  const { isOverDropZone } = useDropZone(dropZoneRef, {
    onDrop: (filesList) => {
      if (!filesList)
        return
      const newFiles = Array.from(filesList).map(file => ({
        ...file,
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'idle' as const,
        progress: 0,
      }))
      const currentCount = files.value.length
      const remainingSlots = maxFiles - currentCount
      const filesToAdd = multiple ? newFiles.slice(0, remainingSlots) : newFiles.slice(0, 1)
      files.value = [...files.value, ...filesToAdd]
      // eslint-disable-next-line ts/no-use-before-define
      filesToAdd.forEach(validateAndSetStatus)
      if (autoUpload) {
        // eslint-disable-next-line ts/no-use-before-define
        uploadAll()
      }
    },
  })
  const validateFile = async (file: File): Promise<{ isValid: boolean, error?: string }> => {
    if (file.size < minSize) {
      return { isValid: false, error: `File size too small. Minimum size is ${minSize} bytes.` }
    }
    if (file.size > maxSize) {
      return { isValid: false, error: `File size too large. Maximum size is ${maxSize} bytes.` }
    }
    if (accept.length > 0 && !accept.includes(file.type)) {
      return { isValid: false, error: `Invalid file type. Accepted types: ${accept.join(', ')}.` }
    }
    if (validate) {
      const result = await Promise.resolve(validate(file))
      if (!result) {
        return { isValid: false, error: 'File validation failed.' }
      }
    }
    return { isValid: true }
  }
  const validateAndSetStatus = async (file: FileWithStatus) => {
    const { isValid, error } = await validateFile(file)
    file.status = isValid ? 'valid' : 'invalid'
    if (error) {
      file.error = error
    }
  }
  const validateFiles = async (): Promise<boolean> => {
    const validations = await Promise.all(files.value.map(file => validateFile(file)))
    validations.forEach(({ isValid, error }, index) => {
      const file = files.value[index]
      if (file) {
        file.status = isValid ? 'valid' : 'invalid'
        if (error) {
          file.error = error
        }
      }
    })
    return validations.every(v => v.isValid)
  }
  const uploadFile = async (file: FileWithStatus): Promise<void> => {
    if (!uploadUrl) {
      return
    }
    if (file.status !== 'valid') {
      return
    }
    file.status = 'uploading'
    file.progress = 0
    try {
      const formData = new FormData()
      formData.append('file', file)
      const xhr = new XMLHttpRequest()
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          file.progress = Math.round((event.loaded / event.total) * 100)
          const validFiles = files.value.filter(
            f => f.status === 'valid' || f.status === 'uploading' || f.status === 'uploaded',
          )
          if (validFiles.length > 0) {
            const totalProgressSum = validFiles.reduce((sum, f) => sum + (f.progress || 0), 0)
            totalProgress.value = Math.round(totalProgressSum / validFiles.length)
          }
        }
      })
      await new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            let response
            try {
              response = JSON.parse(xhr.responseText)
            }
            catch {
              response = { url: null, data: null }
            }
            if (file) {
              file.uploadedUrl = response.url || response.data?.url
              file.status = 'uploaded'
            }
            resolve(response)
          }
          else {
            if (file) {
              file.status = 'error'
              file.error = `Upload failed with status ${xhr.status}`
            }
            reject(new Error(`Upload failed: ${xhr.statusText}`))
          }
        })
        xhr.addEventListener('error', () => {
          if (file) {
            file.status = 'error'
            file.error = 'Upload failed due to network error'
          }
          reject(new Error('Network error during upload'))
        })
        xhr.open('POST', uploadUrl)
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value)
        })
        xhr.send(formData)
      })
    }
    catch (error: any) {
      file.status = 'error'
      file.error = error.message || 'Upload failed'
    }
  }
  const uploadAll = async (): Promise<void> => {
    if (!uploadUrl) {
      return
    }
    isUploading.value = true
    totalProgress.value = 0
    try {
      const validFiles = files.value.filter(file => file.status === 'valid')
      for (const file of validFiles) {
        await uploadFile(file)
      }
    }
    finally {
      isUploading.value = false
    }
  }
  const removeFile = (id: string): void => {
    files.value = files.value.filter(file => file.id !== id)
  }
  const clearFiles = (): void => {
    files.value = []
    totalProgress.value = 0
  }
  const validFiles = computed(() => files.value.filter(file => file.status === 'valid'))
  const invalidFiles = computed(() => files.value.filter(file => file.status === 'invalid'))
  const uploadedFiles = computed(() => files.value.filter(file => file.status === 'uploaded'))
  const errorFiles = computed(() => files.value.filter(file => file.status === 'error'))
  return {
    files,
    isOverDropZone,
    dropZoneRef,
    openFileDialog,
    validateFile,
    validateFiles,
    uploadFile,
    uploadAll,
    removeFile,
    clearFiles,
    totalProgress,
    isUploading,
    validFiles,
    invalidFiles,
    uploadedFiles,
    errorFiles,
  }
}
export type { FileWithStatus }
