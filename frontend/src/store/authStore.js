import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../api'

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (credentials) => {
                set({ isLoading: true })
                const { data } = await authApi.login(credentials)
                localStorage.setItem('accessToken', data.accessToken)
                localStorage.setItem('refreshToken', data.refreshToken)
                set({
                    user: data.user,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                })
                return data
            },

            register: async (userData) => {
                set({ isLoading: true })
                const { data } = await authApi.register(userData)
                localStorage.setItem('accessToken', data.accessToken)
                localStorage.setItem('refreshToken', data.refreshToken)
                set({
                    user: data.user,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                })
                return data
            },

            logout: () => {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
            },

            fetchMe: async () => {
                try {
                    const { data } = await authApi.me()
                    set({ user: data, isAuthenticated: true })
                } catch {
                    get().logout()
                }
            },

            loginWithOAuth: async (token, refreshToken) => {
                localStorage.setItem('accessToken', token)
                if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
                set({ accessToken: token, refreshToken: refreshToken || null })
                const { data } = await authApi.me()
                set({ user: data, isAuthenticated: true })
                return data
            },

            updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)

export default useAuthStore
