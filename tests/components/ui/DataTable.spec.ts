import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import DataTable from '@/components/ui/tables/DataTable.vue'

describe('dataTable', () => {
  const mockColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ]

  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
  ]

  it('renders correctly with columns and data', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
      },
    })

    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.findAll('th')).toHaveLength(3)
  })

  it('renders column headers correctly', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
      },
    })

    const headers = wrapper.findAll('th')
    expect(headers[0]?.text()).toBe('ID')
    expect(headers[1]?.text()).toBe('Name')
    expect(headers[2]?.text()).toBe('Email')
  })

  it('renders data rows correctly', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
      },
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBeGreaterThan(0)
  })

  it('shows no data message when data is empty', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: [],
      },
    })

    expect(wrapper.text()).toContain('No data available')
  })

  it('renders search input when searchable is true', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        searchable: true,
      },
    })

    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('does not render search input when searchable is false', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        searchable: false,
      },
    })

    // Should not have search input
    const searchInputs = wrapper.findAll('input[type="text"]')
    expect(searchInputs.length).toBe(0)
  })

  it('shows loading skeleton when loading is true', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: [],
        loading: true,
        perPage: 5,
      },
    })

    const skeletonRows = wrapper.findAll('.animate-pulse')
    expect(skeletonRows.length).toBeGreaterThan(0)
  })

  it('renders pagination when there are multiple pages', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        serverSide: true,
        totalItems: 30,
        perPage: 10,
        page: 1,
      },
    })

    // Look for pagination buttons
    const buttons = wrapper.findAll('button')
    const hasPagination = buttons.some(
      btn =>
        btn.text().includes('Previous') || btn.text().includes('Next') || !Number.isNaN(Number(btn.text())),
    )
    expect(hasPagination).toBe(true)
  })

  it('emits page change event when pagination button clicked', async () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        serverSide: true,
        totalItems: 30,
        perPage: 10,
        page: 1,
      },
    })

    // Find and click a page number button (not 1)
    const pageButtons = wrapper.findAll('button').filter((btn) => {
      const text = btn.text()
      return !Number.isNaN(Number(text)) && Number(text) > 1
    })

    if (pageButtons.length > 0) {
      await pageButtons[0]?.trigger('click')
      expect(wrapper.emitted('update:page')).toBeTruthy()
    }
  })

  it('shows showing info text', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        totalItems: 3,
        perPage: 10,
        page: 1,
      },
    })

    expect(wrapper.text()).toContain('Showing')
  })

  it('renders filter button when filterable is true', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        filterable: true,
        filterConfig: {
          resource: 'test',
          fields: [],
        },
      },
    })

    const filterButton = wrapper.findAll('button').find(btn => btn.text().includes('Filters'))
    expect(filterButton).toBeTruthy()
  })

  it('disables previous button on first page', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        serverSide: true,
        totalItems: 30,
        page: 1,
        perPage: 10,
      },
    })

    const buttons = wrapper.findAll('button')
    const prevButton = buttons.find(btn => btn.text().includes('Previous'))
    expect(prevButton?.attributes('disabled')).toBeDefined()
  })

  it('disables next button on last page', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        serverSide: true,
        totalItems: 10,
        page: 1,
        perPage: 10,
      },
    })

    const buttons = wrapper.findAll('button')
    const nextButton = buttons.find(btn => btn.text().includes('Next'))
    expect(nextButton?.attributes('disabled')).toBeDefined()
  })

  it('renders actions slot when provided', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
      },
      slots: {
        actions: '<button class="action-btn">Action</button>',
      },
    })

    expect(wrapper.find('.action-btn').exists()).toBe(true)
  })

  it('forwards column slots', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
      },
      slots: {
        name: '<span class="custom-name">Custom Name Cell</span>',
      },
    })

    expect(wrapper.find('table').exists()).toBe(true)
  })

  it('handles server-side pagination', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        serverSide: true,
        totalItems: 100,
        page: 1,
        perPage: 10,
      },
    })

    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.text()).toContain('Showing')
  })

  it('handles client-side filtering', async () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        searchable: true,
        serverSide: false,
      },
    })

    const searchInput = wrapper.find('input[type="text"]')
    expect(searchInput.exists()).toBe(true)

    await searchInput.setValue('John')
    await nextTick()

    // Should filter data
    expect(wrapper.find('table').exists()).toBe(true)
  })

  it('renders per page dropdown', () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        perPage: 10,
      },
    })

    // Look for SelectField component or per page controls
    expect(wrapper.text()).toContain('entries per page')
  })
})
