<script setup lang="ts">
import { Share2 } from '@lucide/vue';
import { Share } from '@capacitor/share';

const router = useRouter();
const route = useRoute();
const { fetchPost, loading } = usePosts();

const post = ref<any>(null);

onMounted(async () => {
  post.value = await fetchPost(route.params.id as string);
});

const sharePost = async () => {
  console.log("Partager le post", post.value);
  if (!post.value) return;
  const author = `${post.value.user.firstname} ${post.value.user.lastname}`.trim() || 'Anonyme';
  const text = post.value.description.length > 140
    ? post.value.description.substring(0, 140) + '…'
    : post.value.description;

  if (import.meta.env.APP_ENV === 'web') {
    // Utiliser l'API Web Share si disponible
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post de ${author}`,
          text,
          url: window.location.href,
        });
        console.log('Post partagé avec succès');
      } catch (error) {
        console.error('Erreur lors du partage du post', error);
      }
    } else {
      alert('Le partage n\'est pas supporté sur ce navigateur.');
    }
    return;
  } else if (import.meta.env.APP_ENV === 'mobile') {
    // Utiliser Capacitor Share pour les plateformes mobiles
    try {
      await Share.share({
        title: `Post de ${author}`,
        text,
        url: window.location.href,
        dialogTitle: 'Partager ce post',
      });
      console.log('Post partagé avec succès');
    } catch (error) {
      console.error('Erreur lors du partage du post', error);
    }
  } else {
    alert('Le partage n\'est pas supporté sur cette plateforme.');
  }
};

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

      <div class="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
        <div class="flex flex-wrap gap-x-6 gap-y-2 py-4 text-sm text-gray-500">
          <div class="cursor-pointer hover:underline"><span class="font-bold text-gray-900">12</span> Reposts</div>
          <div class="cursor-pointer hover:underline"><span class="font-bold text-gray-900">4</span> Citations</div>
          <div class="cursor-pointer hover:underline"><span class="font-bold text-gray-900">48</span> J'aime</div>
          <div class="cursor-pointer hover:underline"><span class="font-bold text-gray-900">2</span> Signets</div>
        </div>

        <div>
          <button @click="sharePost" class="flex items-center gap-1 hover:text-blue-500 transition-colors text-gray-500">
            <Share2 class="w-4 h-4" />
            Partager
          </button>
        </div>
      </div>

    </article>

  </div>
</template>