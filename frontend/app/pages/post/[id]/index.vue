<script setup lang="ts">
import { Share2 } from '@lucide/vue';
import { Share } from '@capacitor/share';
import { usePageTitle } from "~/composables/usePageTitle";
import { useComments } from '~/composables/useComments';

definePageMeta({ showBack: true });

usePageTitle('Post');

const route = useRoute();
const { public: { APP_ENV } } = useRuntimeConfig();
const { fetchPost, toggleLike } = usePosts();
const { fetchComments, postComment, deleteComment } = useComments();
const { token, user } = useAuth();

const postId = route.params.id as string;

const { data: post, pending, error } = fetchPost(postId);
const { data: comments, pending: commentsPending, refresh: refreshComments } = fetchComments(postId);

const newComment = ref('');
const submitting = ref(false);

const onToggleLike = async () => {
  if (!token.value || !post.value) {
    navigateTo('/login');
    return;
  }

  const wasLiked = !!post.value.liked_by_me;
  post.value.liked_by_me = !wasLiked;
  post.value.likes_count += wasLiked ? -1 : 1;

  try {
    const { liked, likes_count } = await toggleLike(post.value.id);
    post.value.liked_by_me = liked;
    post.value.likes_count = likes_count;
  } catch (e) {
    post.value.liked_by_me = wasLiked;
    post.value.likes_count += wasLiked ? 1 : -1;
    console.error('toggleLike failed', e);
  }
};

const onSubmitComment = async () => {
  if (!token.value) {
    navigateTo('/login');
    return;
  }
  const body = newComment.value.trim();
  if (!body || !post.value) return;

  submitting.value = true;
  try {
    const created = await postComment(post.value.id, body);
    comments.value = [created, ...(comments.value ?? [])];
    post.value.comments_count += 1;
    newComment.value = '';
  } catch (e) {
    console.error('postComment failed', e);
  } finally {
    submitting.value = false;
  }
};

const onDeleteComment = async (commentId: number) => {
  if (!post.value) return;
  try {
    await deleteComment(commentId);
    comments.value = (comments.value ?? []).filter((c) => c.id !== commentId);
    post.value.comments_count = Math.max(0, post.value.comments_count - 1);
  } catch (e) {
    console.error('deleteComment failed', e);
    await refreshComments();
  }
};

const sharePost = async () => {
  if (!post.value) return;

  const author = `${post.value.user.firstname} ${post.value.user.lastname}`.trim() || 'Anonyme';
  const text = post.value.description.length > 140
    ? post.value.description.substring(0, 140) + '…'
    : post.value.description;

  const payload = {
    title: `Post de ${author}`,
    text,
    url: window.location.href,
  };

  try {
    if (APP_ENV === 'mobile') {
      await Share.share({ ...payload, dialogTitle: 'Partager ce post' });
    } else if (navigator.share) {
      await navigator.share(payload);
    } else {
      alert("Le partage n'est pas supporté sur ce navigateur.");
    }
  } catch (err) {
    console.error('Erreur lors du partage du post', err);
  }
};

const formatDetailedDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
};
</script>

<template>
  <div class="bg-white min-h-screen pb-20">

    <div v-if="pending" class="p-8 text-center text-gray-500">
      Chargement du post...
    </div>

    <div v-else-if="error || !post" class="p-8 text-center text-red-500">
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
            {{ post.user.firstname }} {{ post.user.lastname }}
          </span>
          <span class="text-gray-500 text-sm">
            @{{ post.user.username }}
          </span>
        </div>
      </div>

      <p class="text-xl text-gray-900 mb-4 whitespace-pre-wrap">
        {{ post.description }}
      </p>

      <div class="text-gray-500 text-base mb-4 border-b border-gray-200 pb-4">
        {{ formatDetailedDate(post.created_at) }}
      </div>

      <div class="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
        <div class="flex flex-wrap gap-x-6 gap-y-2 py-4 text-sm text-gray-500 items-center">
          <button
            type="button"
            @click="onToggleLike"
            class="flex items-center gap-1 transition-colors"
            :class="post.liked_by_me ? 'text-red-500' : 'hover:text-red-500'"
          >
            <span>{{ post.liked_by_me ? '❤️' : '🤍' }}</span>
            <span class="font-bold text-gray-900">{{ post.likes_count }}</span>
            <span>J'aime</span>
          </button>

          <div class="flex items-center gap-1">
            <span>💬</span>
            <span class="font-bold text-gray-900">{{ post.comments_count }}</span>
            <span>Commentaires</span>
          </div>
        </div>

        <div>
          <button @click="sharePost" class="flex items-center gap-1 hover:text-blue-500 transition-colors text-gray-500">
            <Share2 class="w-4 h-4" />
            Partager
          </button>
        </div>
      </div>

      <section class="space-y-4">
        <h2 class="font-bold text-lg text-gray-900">Commentaires</h2>

        <form v-if="token" @submit.prevent="onSubmitComment" class="flex flex-col gap-2">
          <textarea
            v-model="newComment"
            placeholder="Écrire un commentaire…"
            rows="2"
            maxlength="2000"
            class="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="submitting || !newComment.trim()"
              class="px-4 py-1.5 bg-blue-500 text-white rounded-full text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              {{ submitting ? 'Envoi…' : 'Commenter' }}
            </button>
          </div>
        </form>

        <p v-else class="text-sm text-gray-500">
          <NuxtLink to="/login" class="text-blue-500 hover:underline">Connecte-toi</NuxtLink> pour commenter.
        </p>

        <div v-if="commentsPending" class="text-center text-gray-500 py-4">Chargement…</div>

        <div v-else-if="!comments || comments.length === 0" class="text-center text-gray-400 py-4 text-sm">
          Aucun commentaire pour l'instant.
        </div>

        <ul v-else class="divide-y divide-gray-100">
          <li v-for="comment in comments" :key="comment.id" class="py-3 flex gap-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0">
              <img v-if="comment.user.avatar" :src="comment.user.avatar" alt="Avatar" class="w-10 h-10 rounded-full" />
              <span v-else>{{ comment.user.firstname?.charAt(0) || 'A' }}</span>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 text-sm">
                <span class="font-bold text-gray-900">{{ comment.user.firstname }} {{ comment.user.lastname }}</span>
                <span class="text-gray-500">@{{ comment.user.username }}</span>
                <span class="text-gray-400">· {{ useTimeAgo(comment.created_at) }}</span>
              </div>
              <p class="text-gray-800 text-sm whitespace-pre-wrap mt-0.5">{{ comment.body }}</p>
            </div>
            <button
              v-if="user && user.id === comment.user_id"
              type="button"
              @click="onDeleteComment(comment.id)"
              class="text-xs text-gray-400 hover:text-red-500 self-start"
              aria-label="Supprimer"
            >
              ✕
            </button>
          </li>
        </ul>
      </section>

    </article>

  </div>
</template>
