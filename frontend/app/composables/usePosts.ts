import type { User } from "./useAuth";

export interface Post {
  created_at: string;
  description: string;
  id: number;
  image: string;
  updated_at: string;
  user: User;
  user_id: number;
}

export const usePosts = () => {
  const apiUrl = useApiUrl();

  const withAvatarUrl = (post: Post): Post => ({
    ...post,
    user: {
      ...post.user,
      avatar: post.user.avatar ? `${apiUrl}/storage/${post.user.avatar}` : null,
    },
  });

  const fetchPosts = () =>
    useAsyncData("posts", async () => {
      const data = await $fetch<Post[]>(`${apiUrl}/api/posts`);
      return data.map(withAvatarUrl);
    });

  const fetchPost = (id: string | number) =>
    useAsyncData(`post-${id}`, async () => {
      const cachedList = useNuxtData<Post[]>("posts").data.value;
      const cached = cachedList?.find((p) => p.id == id);
      if (cached) return cached;

      const data = await $fetch<Post>(`${apiUrl}/api/posts/${id}`);
      return withAvatarUrl(data);
    });

  const fetchUserPosts = (username: string | number) =>
    useAsyncData(`user-posts-${username}`, async () => {
      const data = await $fetch<Post[]>(`${apiUrl}/api/users/${username}/posts`);
      return data.map(withAvatarUrl);
    });

  return { fetchPosts, fetchPost, fetchUserPosts };
};
