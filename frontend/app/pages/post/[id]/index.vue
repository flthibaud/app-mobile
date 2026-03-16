<script setup lang="ts">
const router = useRouter();
const route = useRoute();
const { fetchPost, loading } = usePosts();

const post = await fetchPost(route.params.id as string);

const formatDetailedDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};
</script>

<template>
  <div class="bg-white min-h-screen pb-20">
    
    <div class="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-4 py-3 flex items-center gap-6 border-b border-gray-200">
      <button @click="router.back()" class="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center">
        <span class="text-xl font-bold leading-none">←</span>
      </button>
      <h1 class="text-xl font-bold">Post</h1>
    </div>

    <div v-if="loading" class="p-8 text-center text-gray-500">
      Chargement du post...
    </div>
    
    <div v-else-if="!post" class="p-8 text-center text-red-500">
      <p class="font-bold text-lg mb-2">Oups !</p>
      <p>Ce post n'existe pas ou a été supprimé.</p>
    </div>

    <article v-else class="p-4">
      
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0">
          <img v-if="post.user.avatar" :src="post.user.avatar" alt="Avatar" class="w-12 h-12 rounded-full" />
          <span v-else>{{ post.user.firstname?.charAt(0) || 'A' }}</span>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-gray-900 leading-tight hover:underline cursor-pointer">
            {{ post.user.firstname + ' ' + post.user.lastname || 'Anonyme' }}
          </span>
          <span class="text-gray-500 text-sm">
            @{{ post.user.firstname + '_' + post.user.lastname || 'user' }}
          </span>
        </div>
      </div>

      <p class="text-xl text-gray-900 mb-4 whitespace-pre-wrap">
        {{ post.description }}
      </p>

      <div class="text-gray-500 text-base mb-4 border-b border-gray-200 pb-4">
        {{ formatDetailedDate(post.created_at) }} · 
        <span class="font-bold text-gray-900">1 204</span> Vues
      </div>

      <div class="flex flex-wrap gap-x-6 gap-y-2 py-4 border-b border-gray-200 text-sm text-gray-500">
        <div class="cursor-pointer hover:underline"><span class="font-bold text-gray-900">12</span> Reposts</div>
        <div class="cursor-pointer hover:underline"><span class="font-bold text-gray-900">4</span> Citations</div>
        <div class="cursor-pointer hover:underline"><span class="font-bold text-gray-900">48</span> J'aime</div>
        <div class="cursor-pointer hover:underline"><span class="font-bold text-gray-900">2</span> Signets</div>
      </div>

    </article>

  </div>
</template>