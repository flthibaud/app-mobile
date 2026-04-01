<script setup>
  const {
    public: { APP_ENV, WEBAPI_URL, APPAPI_URL },
  } = useRuntimeConfig();
  const apiUrl = APP_ENV === "mobile" ? APPAPI_URL : WEBAPI_URL;

  const { user, token, fetchUser } = useAuth();

  // FORMULAIRE PROFIL
  const form = reactive({
    firstname: "",
    lastname: "",
    email: "",
  });

  onMounted(() => {
    if (user.value) {
      form.firstname = user.value.firstname;
      form.lastname = user.value.lastname;
      form.email = user.value.email;
    }
  });

  const updateProfile = async () => {
    await fetch(`${apiUrl}/api/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(form),
    });

    await fetchUser();
    alert("Profil mis à jour");
  };

  // FORMULAIRE PASSWORD
  const passwordForm = reactive({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const updatePassword = async () => {
    const res = await fetch(`${apiUrl}/api/user/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(passwordForm),
    });

    if (res.ok) {
      alert("Mot de passe modifié");
    }
  };

  // AVATAR (WEB)
  const uploadAvatar = async (event) => {
    const file = event.target.files[0];

    const formData = new FormData();
    formData.append("avatar", file);

    await fetch(`${apiUrl}/api/user/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: formData,
    });

    await fetchUser();
  };

  // AVATAR (APP MOBILE)
  import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

  const takePicture = async () => {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    const blob = await (await fetch(photo.dataUrl)).blob();

    const formData = new FormData();
    formData.append("avatar", blob, "avatar.jpg");

    await fetch(`${apiUrl}/api/user/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: formData,
    });

    await fetchUser();
  };
</script>

<template>
  <div class="bg-white">
    <div class="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-4 py-3 border-b border-gray-200">
      <h1 class="text-xl font-bold text-black">Paramètres</h1>
    </div>

    <div class="p-4">

    <!-- FORMULAIRE PROFIL -->
    <section class="card">
      <h2>Informations personnelles</h2>

      <form @submit.prevent="updateProfile">
        <div>
          <label>Prénom</label>
          <input v-model="form.firstname" type="text" placeholder="Prénom" />
        </div>

        <div>
          <label>Nom</label>
          <input v-model="form.lastname" type="text" placeholder="Nom" />
        </div>

        <div>
          <label>Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="Email"
            autocomplete="email"
          />
        </div>

        <button type="submit">Mettre à jour le profil</button>
      </form>
    </section>

    <!-- FORMULAIRE PASSWORD -->
    <section class="card">
      <h2>Modifier le mot de passe</h2>

      <form @submit.prevent="updatePassword">
        <div>
          <label>Mot de passe actuel</label>
          <input
            v-model="passwordForm.current_password"
            type="password"
            autocomplete="current-password"
          />
        </div>

        <div>
          <label>Nouveau mot de passe</label>
          <input
            v-model="passwordForm.password"
            type="password"
            autocomplete="new-password"
          />
        </div>

        <div>
          <label>Confirmer le mot de passe</label>
          <input
            v-model="passwordForm.password_confirmation"
            type="password"
            autocomplete="new-password"
          />
        </div>

        <button type="submit">Modifier le mot de passe</button>
      </form>
    </section>

    <!-- FORMULAIRE AVATAR -->
    <section class="card">
      <h2>Avatar</h2>

      <div v-if="user?.avatar">
        <img
          :src="`${apiUrl}/storage/${user.avatar}`"
          alt="Avatar"
          width="150"
        />
      </div>

      <!-- MODE WEB -->
      <div v-if="APP_ENV !== 'mobile'">
        <input type="file" @change="uploadAvatar" />
      </div>

      <!-- MODE MOBILE -->
      <div v-else>
        <button @click="takePicture">Prendre une photo</button>
      </div>
    </section>
    </div>
  </div>
</template>

<style scoped>
  .account-container {
    margin: auto;
    padding: 2rem;
  }

  .card {
    margin-bottom: 2rem;
    padding: 1.5rem;
    border: 1px solid #7e7e7e;
    border-radius: 8px;
    color: #7e7e7e;
  }

  form div {
    margin-bottom: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
</style>
