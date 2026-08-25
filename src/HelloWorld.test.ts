import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import HelloWorld from './HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders its default title and text when no props are given', () => {
    const wrapper = mount(HelloWorld)
    expect(wrapper.get('.bv-hello-world-title').text()).toBe('Test Title')
    expect(wrapper.get('.bv-hello-world-text').text()).toBe('Hello from BojuVue')
  })

  it('renders caller-supplied title and text instead of the defaults', () => {
    const wrapper = mount(HelloWorld, {
      props: { title: 'Custom Title', text: 'Custom text' },
    })
    expect(wrapper.get('.bv-hello-world-title').text()).toBe('Custom Title')
    expect(wrapper.get('.bv-hello-world-text').text()).toBe('Custom text')
  })
})
