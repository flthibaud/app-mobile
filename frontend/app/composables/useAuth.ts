export interface User {
  avatar: string
  created_at?: string;
  email?: string;
  email_verified_at?: string;
  firstname?: string;
  id?: number;
  lastname?: string;
  updated_at: string
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

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();

      token.value = data.token;
      user.value = data.user;

      localStorage.setItem("token", data.token);

      return true;
    } catch (e) {
      return false;
    }
  };

  const fetchUser = async () => {
    if (!token.value) return;

    const res = await fetch(`${apiUrl}/api/user`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (res.ok) {
      user.value = await res.json();
    }
  };

  const logout = async () => {
    await fetch(`${apiUrl}/api/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
    navigateTo("/login");
  };

  return {
    user,
    token,
    login,
    logout,
    fetchUser,
  };
};
