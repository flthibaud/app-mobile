<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

definePageMeta({
  layout: 'guest'
})

const toast = useToast()
const { login } = useAuth()

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Entrez votre adresse email',
  required: true
}, {
  name: 'password',
  label: 'Mot de passe',
  type: 'password',
  placeholder: 'Entrez votre mot de passe',
  required: true
}, {
  name: 'remember',
  label: 'Se souvenir de moi',
  type: 'checkbox'
}]

const schema = z.object({
  email: z.email('Email invalide'),
  password: z.string('Le mot de passe est requis').min(8, 'Doit contenir au moins 8 caractères')
})

type Schema = z.output<typeof schema>

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
  const success = await login(payload.data.email, payload.data.password)

  if (success) {
    toast.add({
      title: 'Opération réussie !',
      description: 'Vous êtes connecté.',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
    navigateTo('/')
  } else {
    toast.add({
      title: 'Erreur !',
      description: 'Échec de la connexion.',
      color: 'error',
      icon: 'i-heroicons-x-circle'
    })
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Connexion"
        description="Entrez vos identifiants pour accéder à votre compte."
        icon="i-lucide-user"
        :fields="fields"
        @submit="onSubmit"
      >
        <template #footer>
          Pas encore de compte ?
          <ULink to="/register" class="text-primary font-medium">S'inscrire</ULink>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>