<script setup>
import { House, ShoppingBag, Settings, LogOut, CircleUser } from '@lucide/vue';

const apiUrl = useApiUrl();
const route = useRoute();
const router = useRouter();
const { user, logout } = useAuth();
const pageTitle = usePageTitle();

const showBack = computed(() => Boolean(route.meta.showBack));

const navItems = [
  { to: '/', label: 'Accueil', icon: House },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/account', label: 'Paramètres', icon: Settings },
];
</script>

<template>
  <div class="min-h-screen flex justify-center">
    <!-- Sidebar (desktop only) -->
    <aside class="w-68 shrink-0 h-screen sticky top-0 hidden md:flex flex-col justify-between p-2 pr-4">
      <nav class="flex flex-col gap-1 mt-4">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-4 px-4 py-3 rounded-full text-xl hover:bg-gray-100 transition-colors"
          active-class="font-bold"
        >
          <component :is="item.icon" class="w-6 h-6" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div v-if="user" class="flex items-center group rounded-full hover:bg-gray-100 transition-colors cursor-pointer p-3 mb-4 gap-3">
        <NuxtLink
          :to="`/${user.username}`"
          active-class="font-bold"
          class="flex items-center gap-3 flex-1 min-w-0"
        >
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0 text-sm overflow-hidden">
            <img v-if="user.avatar" :src="`${apiUrl}/storage/${user.avatar}`" alt="Avatar" class="w-10 h-10 rounded-full object-cover" />
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
    <main class="w-full md:w-150 shrink-0 md:border-x border-gray-200 min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <!-- Top header: avatar left, title centered -->
      <header class="sticky top-0 bg-white/80 backdrop-blur-md z-20 px-4 border-b border-gray-200 flex items-center gap-3 h-14 pt-[env(safe-area-inset-top)] box-content">
        <button
          v-if="showBack"
          @click="router.back()"
          class="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center shrink-0"
          aria-label="Retour"
        >
          <span class="text-xl font-bold leading-none">←</span>
        </button>

        <NuxtLink
          v-else-if="user"
          :to="`/${user.username}`"
          class="shrink-0"
          aria-label="Mon profil"
        >
          <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm overflow-hidden">
            <img v-if="user.avatar" :src="`${apiUrl}/storage/${user.avatar}`" alt="Avatar" class="w-9 h-9 rounded-full object-cover" />
            <span v-else>{{ user.firstname?.charAt(0) || 'A' }}</span>
          </div>
        </NuxtLink>

        <NuxtLink
          v-else
          to="/login"
          class="shrink-0 text-gray-500 hover:text-black transition-colors"
          aria-label="Se connecter"
        >
          <CircleUser class="w-9 h-9" />
        </NuxtLink>

        <h1 class="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-black truncate max-w-[60%]">
          {{ pageTitle }}
        </h1>
      </header>

      <slot />
    </main>

    <!-- Right spacer for desktop balance -->
    <div class="w-68 shrink-0 hidden lg:block"></div>

    <!-- Bottom bar (mobile only) -->
    <nav class="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)] box-content">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-black transition-colors"
        active-class="text-black"
      >
        <component :is="item.icon" class="w-6 h-6" />
        <span class="text-xs mt-0.5">{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>
