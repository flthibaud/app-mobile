<script setup lang="ts">
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

definePageMeta({ middleware: "auth" });

const apiUrl = useApiUrl();
const { public: { APP_ENV } } = useRuntimeConfig();
const { user, updateProfile, updatePassword, updateAvatar } = useAuth();
const toast = useToast();

const form = reactive({
  firstname: "",
  lastname: "",
  email: "",
});

watch(
  user,
  (current) => {
    if (!current) return;
    form.firstname = current.firstname ?? "";
    form.lastname = current.lastname ?? "";
    form.email = current.email ?? "";
  },
  { immediate: true },
);

const passwordForm = reactive({
  current_password: "",
  password: "",
  password_confirmation: "",
});

const submitProfile = async () => {
  try {
    await updateProfile(form);
    toast.add({
      title: 'Opération réussie !',
      description: 'Votre profil a été mis à jour.',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
  } catch {
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la mise à jour de votre profil.',
      color: 'error',
      icon: 'i-heroicons-x-circle'
    })
  }
};

const submitPassword = async () => {
  try {
    await updatePassword(passwordForm);
    passwordForm.current_password = "";
    passwordForm.password = "";
    passwordForm.password_confirmation = "";
    toast.add({
      title: 'Opération réussie !',
      description: 'Votre mot de passe a été modifié.',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
  } catch {
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors du changement de mot de passe.',
      color: 'error',
      icon: 'i-heroicons-x-circle'
    })
  }
};

const uploadAvatar = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  await updateAvatar(file);
};

const takePicture = async () => {
  const photo = await Camera.getPhoto({
    quality: 80,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Camera,
  });
  if (!photo.dataUrl) return;
  const blob = await (await fetch(photo.dataUrl)).blob();
  await updateAvatar(blob);
};
</script>

<template>
  <div class="bg-white">
    <div class="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-4 py-3 border-b border-gray-200">
      <h1 class="text-xl font-bold text-black">Paramètres</h1>
    </div>

    <div v-if="!user" class="p-8 text-center text-gray-500">
      Chargement du profil...
    </div>

    <div v-else class="p-4">

      <section class="card">
        <h2>Informations personnelles</h2>

        <form @submit.prevent="submitProfile">
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
            <input v-model="form.email" type="email" placeholder="Email" autocomplete="email" />
          </div>

          <button type="submit">Mettre à jour le profil</button>
        </form>
      </section>

      <section class="card">
        <h2>Modifier le mot de passe</h2>

        <form @submit.prevent="submitPassword">
          <div>
            <label>Mot de passe actuel</label>
            <input v-model="passwordForm.current_password" type="password" autocomplete="current-password" />
          </div>

          <div>
            <label>Nouveau mot de passe</label>
            <input v-model="passwordForm.password" type="password" autocomplete="new-password" />
          </div>

          <div>
            <label>Confirmer le mot de passe</label>
            <input v-model="passwordForm.password_confirmation" type="password" autocomplete="new-password" />
          </div>

          <button type="submit">Modifier le mot de passe</button>
        </form>
      </section>

      <section class="card">
        <h2>Avatar</h2>

        <div v-if="user.avatar">
          <img :src="`${apiUrl}/storage/${user.avatar}`" alt="Avatar" width="150" />
        </div>

        <div v-if="APP_ENV !== 'mobile'">
          <input type="file" @change="uploadAvatar" />
        </div>

        <div v-else>
          <button @click="takePicture">Prendre une photo</button>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
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
