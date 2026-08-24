export function createMockProvider<T extends { id: string | number }, V>(
  mockData: T[],
  _mockList: any,
) {
  return {
    list: async (_params?: Record<string, unknown>) => {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { data: mockData, total: mockData.length }
    },
    get: async (id: string | number) => {
      await new Promise(resolve => setTimeout(resolve, 300))
      const item = mockData.find(i => i.id === id || i.id === id.toString())
      if (!item)
        throw new Error('Not found')
      return item
    },
    create: async (data: V) => {
      await new Promise(resolve => setTimeout(resolve, 300))
      const newItem = {
        ...data,
        id: `mock-${Date.now()}`,
        created_at: new Date().toISOString(),
      } as unknown as T
      mockData.unshift(newItem)
      return newItem
    },
    update: async (id: string | number, data: Partial<V>) => {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = mockData.findIndex(i => i.id === id || i.id === id.toString())
      if (index === -1)
        throw new Error('Not found')
      mockData[index] = { ...mockData[index], ...data } as unknown as T
      return mockData[index]
    },
    delete: async (id: string | number) => {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = mockData.findIndex(i => i.id === id || i.id === id.toString())
      if (index !== -1)
        mockData.splice(index, 1)
    },
  }
}
