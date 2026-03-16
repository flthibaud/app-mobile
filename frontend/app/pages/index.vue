<script setup>
const apiUrl = useApiUrl();

const { user, logout } = useAuth();

const { data: posts, pending, error } = await useFetch(`${apiUrl}/api/posts`);
</script>

<template>
  <div class="container mx-auto p-4 max-w-2xl">
    
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Accueil</h1>
      
      <div v-if="user" class="flex items-center gap-4">
        <span class="text-sm text-gray-600">Salut, {{ user.firstname }}</span>
        <button @click="logout()" class="text-sm text-red-500 hover:underline">
          Déconnexion
        </button>
      </div>
    </div>

    <nav class="mb-8">
      <ul>
        <li><NuxtLink to="/account" class="text-blue-500 hover:underline">Mon compte</NuxtLink></li>
      </ul>
    </nav>

    <hr class="mb-8 border-gray-200" />

    <div>
      
      <div v-if="pending" class="text-center text-gray-500 py-8">
        Chargement des posts...
      </div>

      <div v-else-if="error" class="text-center text-red-500 py-8">
        Impossible de charger le fil d'actualité.
      </div>

      <div v-else class="flex flex-col border border-gray-200 rounded-xl divide-y divide-gray-200 bg-white">
        
        <a 
          v-for="post in posts" 
          :key="post.id" 
          class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          :href="`/post/${post.id}`"
        >
          <div class="flex items-start gap-3">
            
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0">
              <img v-if="post.user.avatar" :src="`${apiUrl}/storage/${post.user.avatar}`" alt="Avatar" class="w-12 h-12 rounded-full" />
              <span v-else>{{ post.user.firstname?.charAt(0) || 'A' }}</span>
            </div>
            
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-gray-900">{{ post.user.firstname + ' ' + post.user.lastname || 'Anonyme' }}</span>
                <span class="text-sm text-gray-500">@{{ post.user.firstname + '_' + post.user.lastname || 'user' }}</span>
                <span class="text-sm text-gray-500">· {{ useTimeAgo(post.created_at) }}</span>
              </div>
              
              <p class="text-gray-800 text-base leading-snug">
                {{ post.description }}
              </p>
              
              <div class="flex items-center justify-between text-gray-500 mt-3 max-w-md">
                <button class="hover:text-blue-500">💬 12</button>
                <button class="hover:text-green-500">🔁 4</button>
                <button class="hover:text-red-500">❤️ 48</button>
                <button class="hover:text-blue-500">📊 1.2k</button>
              </div>
            </div>

          </div>
        </a>
        
      </div>
    </div>

  </div>
</template>