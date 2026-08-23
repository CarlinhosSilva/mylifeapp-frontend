import { flushPromises, mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import LoginView from './LoginView.vue'

const loginMock = vi.fn()

vi.mock('../composables/useAuth', () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}))

describe('LoginView', () => {
  it('calls login and redirects to home when credentials are valid', async () => {
    loginMock.mockResolvedValueOnce({ email: 'demo@vue.com' })

    const routes = [{ path: '/', name: 'home', component: { template: '<div>home</div>' } }]
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    })

    const wrapper = mount(LoginView, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.get('input#email').setValue('demo@vue.com')
    await wrapper.get('input#password').setValue('123456')
    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(loginMock).toHaveBeenCalledWith({
      email: 'demo@vue.com',
      password: '123456',
    })
    expect(router.currentRoute.value.name).toBe('home')
  })

})
