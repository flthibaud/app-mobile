<script setup lang="ts">
import { MapPin, Navigation } from "@lucide/vue";
import { useAds } from "~/composables/useAds";
import { useGeolocation } from "~/composables/useGeolocation";
import { GoogleMap } from '@capacitor/google-maps';

const { public: { GOOGLE_MAPS_API_KEY } } = useRuntimeConfig();
const { coords, error: geoError, pending: geoPending, locate } = useGeolocation();
const { fetchAds } = useAds();
const { data: ads, pending, error, refresh } = fetchAds(coords);

const viewMode = ref<'list' | 'map'>('list');
const mapRef = ref<HTMLElement | null>(null);
let map: GoogleMap | null = null;

const formatDistance = (km?: number) => {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
};

const createMap = async () => {
  if (!mapRef.value || map) return;

  const center = coords.value
    ? { lat: coords.value.lat, lng: coords.value.lng }
    : { lat: 46.603354, lng: 1.888334 };

  map = await GoogleMap.create({
    id: 'marketplace-map',
    element: mapRef.value,
    apiKey: GOOGLE_MAPS_API_KEY as string,
    config: {
      center,
      zoom: coords.value ? 12 : 5,
    },
  });

  const markers = (ads.value ?? [])
    .filter((a) => a.lat != null && a.lng != null)
    .map((a) => ({
      coordinate: { lat: a.lat, lng: a.lng },
      title: a.title,
      snippet: a.city,
    }));

  if (markers.length) await map.addMarkers(markers);
};

const destroyMap = async () => {
  if (!map) return;
  await map.destroy();
  map = null;
};

const toggleView = async () => {
  if (viewMode.value === 'list') {
    viewMode.value = 'map';
    await nextTick();
    await createMap();
  } else {
    await destroyMap();
    viewMode.value = 'list';
  }
};

watch(coords, () => refresh());
onUnmounted(() => destroyMap());
</script>

<template>
  <div class="bg-white">

    <div class="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
      <h1 class="text-xl font-bold text-black">Marketplace</h1>
      <button
        class="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
        :disabled="geoPending"
        @click="locate"
      >
        <Navigation class="w-4 h-4" />
        <span v-if="geoPending">Localisation…</span>
        <span v-else-if="coords">Autour de moi</span>
        <span v-else>Me localiser</span>
      </button>
    </div>

    <div v-if="geoError" class="px-4 py-2 text-xs text-amber-700 bg-amber-50 border-b border-amber-100">
      {{ geoError }} — tri par défaut.
    </div>

    <div v-if="pending" class="text-center text-gray-500 py-8">
      Chargement des annonces...
    </div>

    <div v-else-if="error" class="text-center text-red-500 py-8">
      Impossible de charger les annonces.
    </div>

    <div v-else-if="!ads?.length" class="text-center text-gray-500 py-12">
      Aucune annonce pour le moment.
    </div>

    <div v-else class="p-4">
      <button
        class="border border-gray-200 text-sm px-3 py-1.5 rounded-full flex items-center gap-2 mb-4 hover:bg-gray-100 transition-colors cursor-pointer"
        @click="toggleView"
      >
        {{ viewMode === 'list' ? 'Voir sur la carte' : 'Voir la liste' }}
      </button>

      <div v-show="viewMode === 'map'" class="rounded-2xl overflow-hidden border border-gray-200">
        <div ref="mapRef" class="w-full h-[70vh]"></div>
      </div>

      <div v-show="viewMode === 'list'" class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
  
        <NuxtLink
          v-for="ad in ads"
          :key="ad.id"
          :to="`/marketplace/${ad.id}`"
          class="group flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-blue-400 hover:shadow-md transition-all"
        >
          <div class="aspect-square bg-gray-100 relative overflow-hidden">
            <img
              v-if="ad.image"
              :src="ad.image"
              :alt="ad.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
              🛍️
            </div>
  
            <div
              v-if="ad.distance != null"
              class="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm"
            >
              <MapPin class="w-3 h-3 text-blue-500" />
              {{ formatDistance(ad.distance) }}
            </div>
          </div>
  
          <div class="p-3 flex flex-col gap-2">
            <h2 class="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">
              {{ ad.title }}
            </h2>
  
            <div class="flex items-center gap-1 text-xs text-gray-500">
              <MapPin class="w-3 h-3" />
              <span>{{ ad.city }}</span>
            </div>
  
            <div class="flex items-center gap-2 pt-2 border-t border-gray-100">
              <div class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0 text-xs overflow-hidden">
                <img v-if="ad.user.avatar" :src="ad.user.avatar" alt="Avatar" class="w-7 h-7 rounded-full object-cover" />
                <span v-else>{{ ad.user.firstname?.charAt(0) || 'A' }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold text-gray-900 truncate">
                  {{ ad.user.firstname }} {{ ad.user.lastname }}
                </p>
                <p class="text-xs text-gray-500 truncate">@{{ ad.user.username }}</p>
              </div>
            </div>
          </div>
        </NuxtLink>
  
      </div>
    </div>

  </div>
</template>
