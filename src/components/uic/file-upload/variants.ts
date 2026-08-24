/**
 * FileUpload variants — file upload with drag & drop.
 *
 * Props:
 *  - accept: string (MIME types, e.g. 'image/*')
 *  - multiple: boolean
 *  - maxSize: number (in bytes)
 *  - disabled: boolean
 */
export const fileUploadDefaults = {
  accept: '*/*',
  multiple: false,
  maxSize: 10 * 1024 * 1024, // 10MB
} as const
