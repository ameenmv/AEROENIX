import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useModal } from '@/composables/useModal'

describe('useModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with default values', () => {
    const modal = useModal()

    expect(modal.showCreate.value).toBe(false)
    expect(modal.showEdit.value).toBe(false)
    expect(modal.showView.value).toBe(false)
    expect(modal.selectedId.value).toBeNull()
    expect(modal.createFormData.value).toEqual({})
    expect(modal.editFormData.value).toEqual({})
  })

  it('opens create modal', () => {
    const modal = useModal()

    modal.openCreate()

    expect(modal.showCreate.value).toBe(true)
    expect(modal.createFormData.value).toEqual({})
  })

  it('closes create modal', () => {
    const modal = useModal()

    modal.openCreate()
    modal.closeCreate()

    expect(modal.showCreate.value).toBe(false)
    expect(modal.createFormData.value).toEqual({})
  })

  it('clears errors when opening create modal', () => {
    const clearErrors = vi.fn()
    const modal = useModal({ clearErrors })

    modal.openCreate()

    expect(clearErrors).toHaveBeenCalled()
  })

  it('opens edit modal with id', async () => {
    const modal = useModal()

    await modal.openEdit(123)

    expect(modal.showEdit.value).toBe(true)
    expect(modal.selectedId.value).toBe(123)
  })

  it('closes edit modal and resets state', () => {
    const modal = useModal()

    modal.openEdit(123)
    modal.closeEdit()

    expect(modal.showEdit.value).toBe(false)
    expect(modal.editFormData.value).toEqual({})
    expect(modal.selectedId.value).toBeNull()
  })

  it('opens view modal with id', async () => {
    const modal = useModal()

    await modal.openView(456)

    expect(modal.showView.value).toBe(true)
    expect(modal.selectedId.value).toBe(456)
  })

  it('closes view modal', () => {
    const modal = useModal()

    modal.openView(456)
    modal.closeView()

    expect(modal.showView.value).toBe(false)
    expect(modal.selectedId.value).toBeNull()
  })

  it('fetches data when opening edit modal with onFetchOne', async () => {
    const onFetchOne = vi.fn()
    const modal = useModal({ onFetchOne })

    await modal.openEdit(123)

    expect(onFetchOne).toHaveBeenCalledWith(123)
  })

  it('loads form data when opening edit modal with getFormData', async () => {
    const onFetchOne = vi.fn()
    const getFormData = vi.fn(() => ({ name: 'Test', email: 'test@example.com' }))
    const modal = useModal({ onFetchOne, getFormData })

    await modal.openEdit(123)

    expect(modal.editFormData.value).toEqual({ name: 'Test', email: 'test@example.com' })
  })

  it('fetches data when opening view modal with onFetchOne', async () => {
    const onFetchOne = vi.fn()
    const modal = useModal({ onFetchOne })

    await modal.openView(456)

    expect(onFetchOne).toHaveBeenCalledWith(456)
  })

  it('handles create successfully', async () => {
    const onCreate = vi.fn(() => Promise.resolve({ success: true, data: { id: 1 } }))
    const modal = useModal({ onCreate })

    modal.openCreate()
    modal.createFormData.value = { name: 'New Item' }

    const result = await modal.handleCreate()

    expect(result).toBe(true)
    expect(onCreate).toHaveBeenCalledWith({ name: 'New Item' })
    expect(modal.showCreate.value).toBe(false)
  })

  it('handles create failure', async () => {
    const onCreate = vi.fn(() =>
      Promise.resolve({ success: false, data: null, error: new Error('Failed') }),
    )
    const modal = useModal({ onCreate })

    modal.openCreate()
    modal.createFormData.value = { name: 'New Item' }

    const result = await modal.handleCreate()

    expect(result).toBe(false)
    expect(modal.showCreate.value).toBe(true)
  })

  it('handles edit successfully', async () => {
    const onEdit = vi.fn(() => Promise.resolve({ success: true, data: { id: 123 } }))
    const modal = useModal({ onEdit })

    await modal.openEdit(123)
    modal.editFormData.value = { name: 'Updated Item' }

    const result = await modal.handleEdit()

    expect(result).toBe(true)
    expect(onEdit).toHaveBeenCalledWith(123, { name: 'Updated Item' })
    expect(modal.showEdit.value).toBe(false)
  })

  it('handles edit failure', async () => {
    const onEdit = vi.fn(() =>
      Promise.resolve({ success: false, data: null, error: new Error('Failed') }),
    )
    const modal = useModal({ onEdit })

    await modal.openEdit(123)
    modal.editFormData.value = { name: 'Updated Item' }

    const result = await modal.handleEdit()

    expect(result).toBe(false)
    expect(modal.showEdit.value).toBe(true)
  })

  it('returns false when onCreate is not provided', async () => {
    const modal = useModal()

    const result = await modal.handleCreate()

    expect(result).toBe(false)
  })

  it('returns false when onEdit is not provided', async () => {
    const modal = useModal()

    const result = await modal.handleEdit()

    expect(result).toBe(false)
  })

  it('returns false when editing without selectedId', async () => {
    const onEdit = vi.fn()
    const modal = useModal({ onEdit })

    // Don't open edit modal, so selectedId is null
    const result = await modal.handleEdit()

    expect(result).toBe(false)
    expect(onEdit).not.toHaveBeenCalled()
  })

  it('clears errors when opening edit modal', async () => {
    const clearErrors = vi.fn()
    const modal = useModal({ clearErrors })

    await modal.openEdit(123)

    expect(clearErrors).toHaveBeenCalled()
  })

  it('maintains separate form data for create and edit', async () => {
    const modal = useModal()

    modal.openCreate()
    modal.createFormData.value = { name: 'Create Item' }

    await modal.openEdit(123)
    modal.editFormData.value = { name: 'Edit Item' }

    expect(modal.createFormData.value).toEqual({ name: 'Create Item' })
    expect(modal.editFormData.value).toEqual({ name: 'Edit Item' })
  })
})
