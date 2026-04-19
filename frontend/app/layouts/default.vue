<script setup>
import { LogOut } from '@lucide/vue';

const apiUrl = useApiUrl();
const { user, logout } = useAuth()
</script>

<template>
  <div class="min-h-screen flex justify-center">
    <!-- Sidebar -->
    <aside class="w-68 shrink-0 h-screen sticky top-0 flex flex-col justify-between p-2 pr-4">
      <nav class="flex flex-col gap-1 mt-4">
        <NuxtLink
          to="/"
          class="flex items-center gap-4 px-4 py-3 rounded-full text-xl hover:bg-gray-100 transition-colors"
          active-class="font-bold"
        >
          <span class="text-2xl">&#127968;</span>
          <span>Accueil</span>
        </NuxtLink>

        <NuxtLink
          to="/marketplace"
          class="flex items-center gap-4 px-4 py-3 rounded-full text-xl hover:bg-gray-100 transition-colors"
          active-class="font-bold"
        >
          <span class="text-2xl">
            &#128722;
          </span>
          <span>Marketplace</span>
        </NuxtLink>

        <NuxtLink
          to="/account"
          class="flex items-center gap-4 px-4 py-3 rounded-full text-xl hover:bg-gray-100 transition-colors"
          active-class="font-bold"
        >
          <span class="text-2xl">&#9881;</span>
          <span>Paramètres</span>
        </NuxtLink>
      </nav>

      <!-- User info + logout -->
      <div v-if="user" class="flex items-center group rounded-full hover:bg-gray-100 transition-colors cursor-pointer p-3 mb-4 gap-3">
        <NuxtLink
          v-if="user"
          :to="`/${user.username}`"
          active-class="font-bold"
          class="flex items-center gap-3"
        >
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0 text-sm">
            <img v-if="user.avatar" :src="`${apiUrl}/storage/${user.avatar}`" alt="Avatar" class="w-12 h-12 rounded-full" />
            <span v-else>{{ user.firstname?.charAt(0) || 'A' }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-sm truncate group-hover:text-gray-700">{{ user.firstname }} {{ user.lastname }}</p>
            <p class="text-xs text-gray-500 truncate group-hover:text-gray-700">@{{ user.username }}</p>
          </div>
        </NuxtLink>
        <button @click="logout()" class="text-gray-500 hover:text-red-500 text-lg hover:cursor-pointer" title="Déconnexion">
          <LogOut />
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="w-150 shrink-0 border-x border-gray-200 min-h-screen">
      <slot />
    </main>

    <!-- Right spacer to keep layout balanced -->
    <div class="w-68 shrink-0 hidden lg:block"></div>
  </div>
</template>
