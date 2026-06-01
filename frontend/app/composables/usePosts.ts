import type { User } from "./useAuth";

export interface Post {
  created_at: string;
  description: string;
  id: number;
  image: string;
  updated_at: string;
  user: User;
  user_id: number;
  likes_count: number;
  comments_count: number;
  liked_by_me?: boolean;
}

interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
}

const PER_PAGE = 12;

export const usePosts = () => {
  const apiUrl = useApiUrl();
  const { authFetch } = useAuth();

  const withAvatarUrl = (post: Post): Post => ({
    ...post,
    user: {
      ...post.user,
      avatar: post.user.avatar ? `${apiUrl}/storage/${post.user.avatar}` : null,
    },
  });

  const createFeed = (key: string, path: string) => {
    const posts = useState<Post[]>(key, () => []);
    const page = useState<number>(`${key}:page`, () => 0);
    const lastPage = useState<number>(`${key}:lastPage`, () => 1);
    const pending = useState<boolean>(`${key}:pending`, () => false);
    const error = useState<unknown>(`${key}:error`, () => null);

    const hasMore = computed(() => page.value < lastPage.value);

    const loadMore = async () => {
      if (pending.value || !hasMore.value) return;
      pending.value = true;
      error.value = null;
      try {
        const next = page.value + 1;
        const sep = path.includes("?") ? "&" : "?";
        const res = await authFetch<Paginated<Post>>(
          `${path}${sep}per_page=${PER_PAGE}&page=${next}`
        );
        posts.value = [...posts.value, ...res.data.map(withAvatarUrl)];
        page.value = res.current_page;
        lastPage.value = res.last_page;
      } catch (e) {
        error.value = e;
      } finally {
        pending.value = false;
      }
    };

    const reset = () => {
      posts.value = [];
      page.value = 0;
      lastPage.value = 1;
      error.value = null;
    };

    return { posts, pending, error, hasMore, loadMore, reset };
  };

  const usePostsFeed = () => createFeed("posts", "/api/posts");

  const useUserPostsFeed = (username: string | number) =>
    createFeed(`user-posts:${username}`, `/api/users/${username}/posts`);

  const fetchPost = (id: string | number) =>
    useAsyncData(`post-${id}`, async () => {
      const cachedList = useState<Post[]>("posts").value;
      const cached = cachedList?.find((p) => p.id == id);
      if (cached) return cached;

      const data = await authFetch<Post>(`/api/posts/${id}`);
      return withAvatarUrl(data);
    }, { deep: true });

  const toggleLike = async (postId: number) => {
    return await authFetch<{ liked: boolean; likes_count: number }>(
      `/api/posts/${postId}/likes`,
      { method: "POST" }
    );
  };

  return { usePostsFeed, useUserPostsFeed, fetchPost, toggleLike };
};
