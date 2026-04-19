export interface Coords {
  lat: number;
  lng: number;
}

export const useGeolocation = () => {
  const coords = ref<Coords | null>(null);
  const error = ref<string | null>(null);
  const pending = ref(false);

  const locate = () => {
    if (!import.meta.client || !navigator.geolocation) {
      error.value = "Géolocalisation indisponible";
      return;
    }

    pending.value = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        coords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        error.value = null;
        pending.value = false;
      },
      (err) => {
        error.value = err.message;
        pending.value = false;
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
    );
  };

  return { coords, error, pending, locate };
};
