<script setup>
const apiUrl = useApiUrl();

const { data: posts, pending, error } = await useFetch(`${apiUrl}/api/posts`);
</script>

<template>
  <div class="bg-white">

    <div class="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-4 py-3 border-b border-gray-200">
      <h1 class="text-xl font-bold text-black">Accueil</h1>
    </div>

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