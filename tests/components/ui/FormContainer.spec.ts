import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FormContainer from '@/components/ui/forms/FormContainer.vue'

describe('formContainer', () => {
  it('renders correctly with slot content', () => {
    const wrapper = mount(FormContainer, {
      slots: {
        default: '<input type="text" class="test-input" />',
      },
    })

    expect(wrapper.find('.test-input').exists()).toBe(true)
  })

  it('displays loading state when loading is true', () => {
    const wrapper = mount(FormContainer, {
      props: {
        loading: true,
      },
    })

    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('displays saving state when saving is true', () => {
    const wrapper = mount(FormContainer, {
      props: {
        saving: true,
      },
    })

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('emits submit event when form is submitted', async () => {
    const wrapper = mount(FormContainer, {})

    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  it('emits cancel event when cancel button clicked', async () => {
    const wrapper = mount(FormContainer, {})

    const cancelButton = wrapper
      .findAll('button')
      .find(btn => btn.text().toLowerCase().includes('cancel'))
    if (cancelButton) {
      await cancelButton.trigger('click')
      expect(wrapper.emitted('cancel')).toBeTruthy()
    }
  })

  it('renders multi-step correctly', () => {
    const wrapper = mount(FormContainer, {
      props: {
        showStepper: true,
        stepCount: 2,
      },
      slots: {
        'step-1': '<div class="step-1-content">Step 1</div>',
        'step-2': '<div class="step-2-content">Step 2</div>',
      },
    })

    expect(wrapper.findComponent({ name: 'Stepper' }).exists()).toBe(true)
    expect(wrapper.text()).toContain('Step 1')
  })
})
