import type { User } from "./useAuth";

export interface Post {
  created_at: string
  description: string
  id: number
  image: string
  updated_at: string
  user: User
  user_id: number
}

export const usePosts = () => {
  const posts = useState<Post[]>("posts", () => []);
  const post = useState<Post>("post");
  const loading = useState<boolean>("posts-loading", () => false);
  
  const apiUrl = useApiUrl();
  const toast = useToast();

  const fetchPosts = async () => {
    loading.value = true;
    try {
      const data = await $fetch<Post[]>(`${apiUrl}/api/posts`);
      posts.value = data;
    } catch (error) {
      console.error("Erreur lors de la récupération du feed :", error);
      toast.add({
        title: "Erreur",
        description: "Impossible de charger le feed. Veuillez réessayer plus tard.",
      });
    } finally {
      loading.value = false;
    }
  };

  const fetchPost = async (id: number | string) => {
    const existingPost = posts.value.find(p => p.id == id);
    if (existingPost) {
      return existingPost;
    }
    loading.value = true;
    try {
      const data = await $fetch<Post>(`${apiUrl}/api/posts/${id}`);
      return {
        ...data,
        user: {
          ...data.user,
          avatar: data.user.avatar ? `${apiUrl}/storage/${data.user.avatar}` : null
        }
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération du post ${id} :`, error);
      toast.add({
        title: "Erreur",
        description: `Impossible de charger le post. Veuillez réessayer plus tard.`,
      });
      return null;
    } finally {
      loading.value = false;
    }
  };

  return { 
    posts,
    post,
    loading, 
    fetchPosts, 
    fetchPost 
  };
};