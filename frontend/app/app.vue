<script setup>
  const { token, user, fetchUser } = useAuth()
  const { start, stop } = useNotificationStream()

  onMounted(async () => {
    if (token.value) {
      await fetchUser()
      if (user.value) start()
    } else {
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
