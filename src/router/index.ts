import { createRouter, createWebHistory } from 'vue-router'
import { AUTH_SESSION_TTL } from '@/config/auth'
import { useAuthStore } from '@/stores'
import i18n, { DEFAULT_LOCALE, setLocale, SUPPORTED_LOCALES } from '../i18n'
import { getModuleRoutes } from './modules'

// Auto-import all modules so they register themselves
import.meta.glob('../modules/**/index.ts', { eager: true })
import.meta.glob('../modules/*.ts', { eager: true })

const routes = [
  {
    path: 'admin/login',
    name: 'admin-login',
    component: () => import('../views/admin/auth/LoginView.vue'),
    meta: { layout: 'blank', breadcrumbKey: 'auth.login_title' },
  },
  {
    path: 'admin/forgot-password',
    name: 'admin-forgot-password',
    component: () => import('../views/admin/auth/ForgotPasswordView.vue'),
    meta: { layout: 'blank', breadcrumbKey: 'auth.forgot_password_title' },
  },
  {
    path: 'admin/forgot-password/verify',
    name: 'admin-forgot-password-verify',
    component: () => import('../views/admin/auth/ForgotPasswordOtpView.vue'),
    meta: { layout: 'blank', breadcrumbKey: 'auth.verify_code_title' },
  },
  {
    path: 'admin/set-password',
    name: 'admin-set-password',
    component: () => import('../views/admin/auth/AcceptInvitationView.vue'),
    meta: { layout: 'blank', breadcrumbKey: 'auth.set_password_title' },
  },
  {
    path: 'admin/reset-password',
    name: 'admin-reset-password',
    component: () => import('../views/admin/auth/ResetPasswordView.vue'),
    meta: { layout: 'blank', breadcrumbKey: 'auth.reset_password_title' },
  },
  {
    path: 'admin/otp',
    name: 'admin-otp',
    component: () => import('../views/admin/auth/OtpView.vue'),
    meta: { layout: 'blank', breadcrumbKey: 'auth.otp_title' },
  },
  {
    path: '',
    name: 'landing',
    redirect: { name: 'admin-dashboard' },
  },
  {
    path: 'admin',
    redirect: { name: 'admin-dashboard' },
  },
  {
    path: 'admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('../views/admin/DashboardView.vue'),
    meta: { breadcrumbKey: 'menu.home' },
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:lang([a-z]{2})?',
      children: [...routes, ...getModuleRoutes()],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { layout: 'blank' },
    },
  ],
})
router.beforeEach((to, _from, next) => {
  // Clear auth errors on navigation so alerts don't persist between pages
  try {
    const authStore = useAuthStore()
    authStore.error = null
  }
  catch {
    // Store may not be ready on initial load — safe to ignore
  }
  const lang = to.params.lang as string
  const savedLocale = localStorage.getItem('locale') || DEFAULT_LOCALE
  if (lang && SUPPORTED_LOCALES.includes(lang)) {
    if (i18n.global.locale.value !== lang) {
      setLocale(lang)
    }
  }
  else {
    const pathParts = to.path.split('/')
    const firstSegment = pathParts[1]
    if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment)) {
      if (i18n.global.locale.value !== firstSegment) {
        setLocale(firstSegment)
      }
    }
    else {
      const targetPath = `/${savedLocale}${to.path === '/' ? '' : to.path}`
      return next({ path: targetPath })
    }
  }
  // Auth guard for admin routes
  const isAdminRoute = to.path.includes('/admin')
  const isAuthRoute
    = to.path.includes('/admin/login')
      || to.path.includes('/admin/forgot-password')
      || to.path.includes('/admin/reset-password')
      || to.path.includes('/admin/set-password')
      || to.path.includes('/admin/otp')

  // ── Mock Auth Bypass ──────────────────────────────────────────────────────
  // When VITE_MOCK_AUTH is enabled, auto-seed localStorage with mock token
  // and wildcard permissions so the developer can navigate directly to any
  // admin route without going through the login page first.
  const isMockAuth = import.meta.env.VITE_MOCK_AUTH !== 'false'
  if (isMockAuth && !isAuthRoute) {
    if (!localStorage.getItem('auth_token')) {
      localStorage.setItem('auth_token', 'mock-bearer-token-for-development')
    }
    if (!localStorage.getItem('permissions')) {
      localStorage.setItem('permissions', JSON.stringify(['*']))
    }
    if (!localStorage.getItem('auth_user')) {
      localStorage.setItem('auth_user', JSON.stringify({
        id: 1,
        name: 'Aeroenix Admin',
        email: 'admin@aeroenix.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aeroenix',
        role: 'super-admin',
        roles: ['super_admin'],
        permissions: ['*'],
      }))
    }
  }

  let token = localStorage.getItem('auth_token')

  if (token) {
    const ttlMs = AUTH_SESSION_TTL > 0 ? AUTH_SESSION_TTL * 60 * 1000 : 0
    const issuedAt = Number(localStorage.getItem('auth_token_issued_at') || 0)
    if (ttlMs > 0 && issuedAt > 0 && Date.now() - issuedAt > ttlMs) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_token_issued_at')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('permissions')
      token = null
    }
  }

  if (isAdminRoute && !isAuthRoute && !token) {
    const currentLang = (to.params.lang as string) || savedLocale
    return next({ path: `/${currentLang}/admin/login` })
  }

  if (isAuthRoute && token) {
    const currentLang = (to.params.lang as string) || savedLocale
    return next({ path: `/${currentLang}/admin/dashboard` })
  }
  // Permission guard (optional per-route)
  if (to.meta.permission) {
    const permissions: string[] = JSON.parse(localStorage.getItem('permissions') || '[]')
    const hasPermission
      = permissions.includes(to.meta.permission as string) || permissions.includes('*')
    if (!hasPermission) {
      const currentLang = (to.params.lang as string) || savedLocale
      return next({ path: `/${currentLang}/admin/dashboard` })
    }
  }
  next()
})
export default router
