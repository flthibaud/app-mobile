import type { User } from "./useAuth";

export interface Ad {
  id: number;
  title: string;
  description: string;
  image: string | null;
  city: string;
  lat: number;
  lng: number;
  distance?: number;
  user: User;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export const useAds = () => {
  const apiUrl = useApiUrl();

  const withAssetUrls = (ad: Ad): Ad => ({
    ...ad,
    image: ad.image ? `${apiUrl}/storage/${ad.image}` : null,
    user: {
      ...ad.user,
      avatar: ad.user.avatar ? `${apiUrl}/storage/${ad.user.avatar}` : null,
    },
  });

  const fetchAds = (coords?: Ref<{ lat: number; lng: number } | null>) =>
    useAsyncData(
      "ads",
      async () => {
        const params: Record<string, number> = {};
        if (coords?.value) {
          params.lat = coords.value.lat;
          params.lng = coords.value.lng;
        }
        const data = await $fetch<Ad[]>(`${apiUrl}/api/ads`, { params });
        return data.map(withAssetUrls);
      },
      { watch: coords ? [coords] : [] }
    );

  const fetchAd = (id: string | number) =>
    useAsyncData(`ad-${id}`, async () => {
      const cached = useNuxtData<Ad[]>("ads").data.value?.find((a) => a.id == id);
      if (cached) return cached;

      const data = await $fetch<Ad>(`${apiUrl}/api/ads/${id}`);
      return withAssetUrls(data);
    });

  return { fetchAds, fetchAd };
};
