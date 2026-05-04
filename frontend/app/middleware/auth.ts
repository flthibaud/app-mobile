export default defineNuxtRouteMiddleware(async () => {
  if (!import.meta.client) return

  const { user, token, fetchUser } = useAuth()

  if (!token.value) return navigateTo('/login')

  if (!user.value) await fetchUser()

  if (!user.value) return navigateTo('/login')
})
