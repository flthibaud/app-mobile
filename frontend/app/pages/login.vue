<script setup lang="ts">
  const { login } = useAuth()

  const email = ref('')
  const password = ref('')
  const message = ref('')

  const handleLogin = async () => {
    const success = await login(email.value, password.value)

    if (success) {
      message.value = 'Connexion réussie !'
      navigateTo('/')
    } else {
      message.value = 'Email ou mot de passe incorrect'
    }
  }
</script>

<template>
  <div class="container">
    <h1>Login</h1>


    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" autocomplete="email" />
      <input v-model="password" type="password" placeholder="Password" autocomplete="current-password" />


      <button type="submit">Se connecter</button>
    </form>


    <p>{{ message }}</p>
  </div>
</template>