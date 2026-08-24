export function generateMockPagination<T>(data: T[]) {
  return {
    data,
    total: data.length,
    current_page: 1,
    per_page: 15,
    last_page: 1,
  }
}
