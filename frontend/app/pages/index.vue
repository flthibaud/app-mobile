<script setup>
  const { user, logout } = useAuth()
</script>


<template>
  <div>
    <h1>Dashboard</h1>


    <div v-if="user">
      <p>Bienvenue {{ user.firstname }}</p>
    </div>


    <button @click="logout()">Logout</button>
  </div>
</template>