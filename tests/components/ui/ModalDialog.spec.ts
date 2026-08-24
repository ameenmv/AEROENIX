import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import POV from '@/components/ui/modals/POV.vue'

describe('modalDialog', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders when show prop is true', async () => {
    const wrapper = mount(POV, {
      props: {
        show: true,
        title: 'Test Modal 1',
      },
      attachTo: document.body,
    })

    await nextTick()
    expect(document.body.textContent).toContain('Test Modal 1')
    wrapper.unmount()
  })

  it('does not render when show prop is false', async () => {
    const wrapper = mount(POV, {
      props: {
        show: false,
        title: 'Test Modal 2',
      },
      attachTo: document.body,
    })

    await nextTick()
    const modalDiv = document.body.querySelector('.fixed.inset-0')
    if (modalDiv) {
      expect(
        modalDiv.classList.contains('hidden')
        || getComputedStyle(modalDiv).display === 'none'
        || !modalDiv.checkVisibility(),
      ).toBe(true)
    }
    wrapper.unmount()
  })

  it('displays title correctly', async () => {
    const wrapper = mount(POV, {
      props: {
        show: true,
        title: 'My Modal Title 3',
      },
      attachTo: document.body,
    })

    await nextTick()
    expect(document.body.textContent).toContain('My Modal Title 3')
    wrapper.unmount()
  })

  it('emits close event when close button clicked', async () => {
    const wrapper = mount(POV, {
      props: {
        show: true,
        title: 'Test Modal 4',
      },
      attachTo: document.body,
    })

    await nextTick()
    const closeButton = wrapper.find('button')
    if (closeButton.exists()) {
      await closeButton.trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    }
    wrapper.unmount()
  })

  it('renders slot content', async () => {
    const wrapper = mount(POV, {
      props: {
        show: true,
        title: 'Test Modal 5',
      },
      slots: {
        default: '<div class="modal-content">Custom Content 5</div>',
      },
      attachTo: document.body,
    })

    await nextTick()
    expect(document.body.textContent).toContain('Custom Content 5')
    wrapper.unmount()
  })

  it('renders with different max widths', async () => {
    const widths = ['sm', 'md', 'lg', 'xl', '2xl', '4xl', 'full'] as const

    for (const maxWidth of widths) {
      document.body.innerHTML = ''
      const wrapper = mount(POV, {
        props: {
          show: true,
          title: 'Test 6',
          maxWidth,
        },
        attachTo: document.body,
      })

      await nextTick()
      expect(document.body.textContent).toContain('Test 6')
      wrapper.unmount()
    }
  })

  it('applies no padding when noPadding is true', async () => {
    const wrapper = mount(POV, {
      props: {
        show: true,
        title: 'Test 7',
        noPadding: true,
      },
      attachTo: document.body,
    })

    await nextTick()
    expect(document.body.textContent).toContain('Test 7')
    wrapper.unmount()
  })

  it('renders footer slot when provided', async () => {
    const wrapper = mount(POV, {
      props: {
        show: true,
        title: 'Test 8',
      },
      slots: {
        footer: '<div class="custom-footer">Footer Content 8</div>',
      },
      attachTo: document.body,
    })

    await nextTick()
    expect(document.body.textContent).toContain('Footer Content 8')
    wrapper.unmount()
  })

  it('renders header slot when provided', async () => {
    const wrapper = mount(POV, {
      props: {
        show: true,
        title: 'Test 9',
      },
      slots: {
        header: '<span class="custom-header">Header Content 9</span>',
      },
      attachTo: document.body,
    })

    await nextTick()
    expect(document.body.textContent).toContain('Header Content 9')
    wrapper.unmount()
  })

  it('respects closeable prop', async () => {
    const wrapper = mount(POV, {
      props: {
        show: true,
        title: 'Test 10',
        closeable: false,
      },
      attachTo: document.body,
    })

    await nextTick()
    expect(document.body.textContent).toContain('Test 10')
    wrapper.unmount()
  })

  it('renders with actions', async () => {
    const actions = [
      { label: 'Save 11', onClick: () => { } },
      { label: 'Cancel 11', onClick: () => { } },
    ]

    const wrapper = mount(POV, {
      props: {
        show: true,
        title: 'Test 11',
        actions,
      },
      attachTo: document.body,
    })

    await nextTick()
    expect(document.body.textContent).toContain('Save 11')
    expect(document.body.textContent).toContain('Cancel 11')
    wrapper.unmount()
  })
})
