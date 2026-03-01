<script setup>
  const { APP_ENV, WEBAPI_URL, APPAPI_URL } = useRuntimeConfig().public;
  const api_url = ref(null);
  const message = ref("Loading...");

  api_url.value = APP_ENV === "mobile" ? APPAPI_URL : WEBAPI_URL;

  onMounted(async () => {
    try {
      const res = await fetch(`${api_url.value}/api/ping`);
      const data = await res.json();
      message.value = data.message;
    } catch (e) {
      message.value = "API ERROR";
    }
  });
</script>

<template>
  <div class="container">
    <h1>Test API on {{ api_url }}</h1>
    <p>{{ message }}</p>
  </div>
</template>

<style scoped>
  .container {
    margin: 40px;
  }
</style>
