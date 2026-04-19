export interface User {
  avatar: string | null;
  created_at?: string;
  email?: string;
  username?: string;
  email_verified_at?: string;
  firstname?: string;
  id?: number;
  lastname?: string;
  updated_at: string;
}

export interface PasswordForm {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export const useAuth = () => {
  const user = useState<User | null>("user", () => null);
  const token = useState<string | null>("token", () => {
    if (import.meta.client) {
      return localStorage.getItem("token");
    }
    return null;
  });

  const apiUrl = useApiUrl();

  const authFetch = <T = unknown>(url: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> => {
    return $fetch<T>(`${apiUrl}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token.value}`,
      },
    });
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await $fetch<{ token: string; user: User }>(`${apiUrl}/api/login`, {
        method: "POST",
        body: { email, password },
      });
      token.value = data.token;
      user.value = data.user;
      if (import.meta.client) localStorage.setItem("token", data.token);
      return true;
    } catch {
      return false;
    }
  };

  const fetchUser = async () => {
    if (!token.value) return;
    try {
      user.value = await authFetch<User>("/api/user");
    } catch {
      user.value = null;
    }
  };

  const logout = async () => {
    try {
      await authFetch("/api/logout", { method: "POST" });
    } catch {
      // Même si la requête échoue, on nettoie la session locale
    }
    token.value = null;
    user.value = null;
    if (import.meta.client) localStorage.removeItem("token");
    navigateTo("/login");
  };

  const updateProfile = async (form: Partial<User>) => {
    await authFetch("/api/user", { method: "PUT", body: form });
    await fetchUser();
  };

  const updatePassword = async (form: PasswordForm) => {
    await authFetch("/api/user/password", { method: "PUT", body: form });
  };

  const updateAvatar = async (file: Blob, filename = "avatar.jpg") => {
    const formData = new FormData();
    formData.append("avatar", file, filename);
    await authFetch("/api/user/avatar", { method: "POST", body: formData });
    await fetchUser();
  };

  return {
    user,
    token,
    login,
    logout,
    fetchUser,
    updateProfile,
    updatePassword,
    updateAvatar,
  };
};
