<script setup lang="ts">
import { usePageTitle } from "~/composables/usePageTitle";

const route = useRoute();
const username = route.params.username as string;

usePageTitle(`@${username}`);

const { useUserPostsFeed, toggleLike } = usePosts();
const feed = useUserPostsFeed(username);
const { posts: userPosts, pending, error, hasMore } = feed;
const { sentinel } = useInfiniteScroll(feed);

const { token } = useAuth();

const onToggleLike = async (postId: number) => {
  if (!token.value) {
    navigateTo('/login');
    return;
  }

  const post = userPosts.value?.find((p) => p.id === postId);
  if (!post) return;

  const wasLiked = !!post.liked_by_me;
  post.liked_by_me = !wasLiked;
  post.likes_count += wasLiked ? -1 : 1;

  try {
    const { liked, likes_count } = await toggleLike(postId);
    post.liked_by_me = liked;
    post.likes_count = likes_count;
  } catch (e) {
    post.liked_by_me = wasLiked;
    post.likes_count += wasLiked ? 1 : -1;
    console.error('toggleLike failed', e);
  }
};
</script>

<template>
  <div class="bg-white">

    <div>

      <div v-if="pending && !userPosts.length" class="text-center text-gray-500 py-8">
        Chargement des posts...
      </div>

      <div v-else-if="error && !userPosts.length" class="text-center text-red-500 py-8">
        Impossible de charger le fil d'actualité.
      </div>

      <div v-else-if="!userPosts.length" class="text-center text-gray-500 py-8">
        Aucun post pour le moment.
      </div>

      <div v-else class="flex flex-col border border-gray-200 rounded-xl divide-y divide-gray-200 bg-white">

        <NuxtLink
          v-for="post in userPosts"
          :key="post.id"
          :to="`/post/${post.id}`"
          class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div class="flex items-start gap-3">

            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0">
              <img v-if="post.user.avatar" :src="post.user.avatar" alt="Avatar" class="w-12 h-12 rounded-full" />
              <span v-else>{{ post.user.firstname?.charAt(0) || 'A' }}</span>
            </div>

            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-gray-900">{{ post.user.firstname }} {{ post.user.lastname }}</span>
                <span class="text-sm text-gray-500">@{{ post.user.username }}</span>
                <span class="text-sm text-gray-500">· {{ useTimeAgo(post.created_at) }}</span>
              </div>

              <p class="text-gray-800 text-base leading-snug">
                {{ post.description }}
              </p>

              <div class="flex items-center justify-between text-gray-500 mt-3 max-w-md">
                <button type="button" @click.prevent.stop class="hover:text-blue-500">💬 {{ post.comments_count }}</button>
                <button type="button" @click.prevent.stop class="hover:text-green-500">🔁 0</button>
                <button
                  type="button"
                  @click.prevent.stop="onToggleLike(post.id)"
                  class="transition-colors"
                  :class="post.liked_by_me ? 'text-red-500' : 'hover:text-red-500'"
                >
                  {{ post.liked_by_me ? '❤️' : '🤍' }} {{ post.likes_count }}
                </button>
                <button type="button" @click.prevent.stop class="hover:text-blue-500">📊 0</button>
              </div>
            </div>

          </div>
        </NuxtLink>

      </div>

      <div ref="sentinel" class="py-6 text-center text-gray-500 text-sm">
        <span v-if="pending && userPosts.length">Chargement…</span>
        <span v-else-if="error && userPosts.length" class="text-red-500">Erreur de chargement.</span>
        <span v-else-if="!hasMore && userPosts.length">Vous avez tout vu 🎉</span>
      </div>
    </div>
  </div>
</template>