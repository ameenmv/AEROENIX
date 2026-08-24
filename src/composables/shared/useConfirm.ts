export interface ConfirmState {
  show: boolean
  title: string
  message: string
  callback: (() => void) | null
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
 * ```
 */
export function useConfirm() {
  const confirmState = ref<ConfirmState>({
    show: false,
    title: '',
    message: '',
    callback: null,
  })
  const confirm = (title: string, message: string, callback: () => void) => {
    confirmState.value = { show: true, title, message, callback }
  }
  const cancel = () => {
    confirmState.value = { show: false, title: '', message: '', callback: null }
  }
  return { confirmState, confirm, cancel }
}
