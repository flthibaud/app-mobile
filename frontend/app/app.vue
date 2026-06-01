<script setup>
  const { token, user, fetchUser } = useAuth()
  const { start, stop } = useNotificationStream()
  const route = useRoute()

  const publicRoutes = ['/login', '/register']

  onMounted(async () => {
    if (token.value) {
      await fetchUser()
      if (user.value) start()
    } else if (!publicRoutes.includes(route.path)) {
      navigateTo('/login')
    }
  })

  watch(token, (next) => {
    if (next) {
      start()
    } else {
      stop()
    }
  })

  onBeforeUnmount(() => stop())
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
