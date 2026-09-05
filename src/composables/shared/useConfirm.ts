export interface ConfirmState {
  show: boolean
  title: string
  message: string
  callback: (() => void) | null
  variant: 'destructive' | 'default'
}
/**
 * Standalone composable for managing confirmation dialogs.
 *
 * @example
 * ```ts
 * const { confirm, confirmState, cancel } = useConfirm()
 *
 * const handleDelete = (id: number) => {
 *   confirm('Delete Item', 'Are you sure?', async () => {
 *     await service.delete(id)
 *     cancel()
 *   })
 * }
 *
 * // For non-destructive actions (green button):
 * confirm('Activate', 'Are you sure?', callback, 'default')
 * ```
 */
export function useConfirm() {
  const confirmState = ref<ConfirmState>({
    show: false,
    title: '',
    message: '',
    callback: null,
    variant: 'destructive',
  })
  const confirm = (title: string, message: string, callback: () => void, variant: 'destructive' | 'default' = 'destructive') => {
    confirmState.value = { show: true, title, message, callback, variant }
  }
  const cancel = () => {
    confirmState.value = { show: false, title: '', message: '', callback: null, variant: 'destructive' }
  }
  return { confirmState, confirm, cancel }
}
