import type { User } from "./useAuth";

export interface Comment {
  id: number;
  body: string;
  user_id: number;
  post_id: number;
  user: User;
  created_at: string;
  updated_at: string;
}

export const useComments = () => {
  const apiUrl = useApiUrl();
  const { authFetch } = useAuth();

  const withAvatarUrl = (comment: Comment): Comment => ({
    ...comment,
    user: {
      ...comment.user,
      avatar: comment.user.avatar ? `${apiUrl}/storage/${comment.user.avatar}` : null,
    },
  });

  const fetchComments = (postId: number | string) =>
    useAsyncData(`post-${postId}-comments`, async () => {
      const data = await $fetch<Comment[]>(`${apiUrl}/api/posts/${postId}/comments`);
      return data.map(withAvatarUrl);
    });

  const postComment = async (postId: number, body: string) => {
    const comment = await authFetch<Comment>(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: { body },
    });
    return withAvatarUrl(comment);
  };

  const deleteComment = async (commentId: number) => {
    await authFetch(`/api/comments/${commentId}`, { method: "DELETE" });
  };

  return { fetchComments, postComment, deleteComment };
};
