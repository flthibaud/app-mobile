<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

definePageMeta({
  layout: 'guest'
})

const toast = useToast()
const { register } = useAuth()

const fields: AuthFormField[] = [{
  name: 'firstname',
  type: 'text',
  label: 'Prénom',
  placeholder: 'Entrez votre prénom'
}, {
  name: 'lastname',
  type: 'text',
  label: 'Nom',
  placeholder: 'Entrez votre nom'
}, {
  name: 'username',
  type: 'text',
  label: "Nom d'utilisateur",
  placeholder: 'Choisissez un pseudo'
}, {
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
  name: 'password_confirmation',
  label: 'Confirmation du mot de passe',
  type: 'password',
  placeholder: 'Confirmez votre mot de passe',
  required: true
}]

const schema = z.object({
  firstname: z.string().max(255),
  lastname: z.string().max(255),
  username: z.string().max(255).refine(v => !v.includes('.'), 'Le pseudo ne peut pas contenir de point.'),
  email: z.email('Email invalide'),
  password: z.string('Le mot de passe est requis').min(8, 'Doit contenir au moins 8 caractères'),
  password_confirmation: z.string('Veuillez confirmer le mot de passe')
}).refine(data => data.password === data.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirmation']
})

type Schema = z.output<typeof schema>

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
  const success = await register(payload.data)

  if (success) {
    toast.add({
      title: 'Opération réussie !',
      description: 'Votre compte a été créé.',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })
    navigateTo('/')
  } else {
    toast.add({
      title: 'Erreur !',
      description: "Échec de l'inscription.",
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
        title="Inscription"
        description="Créez votre compte pour commencer."
        icon="i-lucide-user-plus"
        :fields="fields"
        @submit="onSubmit"
      >
        <template #footer>
          Déjà un compte ?
          <ULink to="/login" class="text-primary font-medium">Se connecter</ULink>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
