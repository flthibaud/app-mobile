interface InfiniteFeed {
  pending: Readonly<Ref<boolean>>;
  error: Readonly<Ref<unknown>>;
  hasMore: Readonly<Ref<boolean>>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

/**
 * Charge la première page au montage puis enchaîne les suivantes
 * dès qu'un élément sentinelle approche du bas du viewport.
 */
export const useInfiniteScroll = (feed: InfiniteFeed) => {
  const sentinel = ref<HTMLElement | null>(null);
  let observer: IntersectionObserver | null = null;

  const checkAndLoad = async () => {
    if (feed.pending.value || feed.error.value || !feed.hasMore.value || !sentinel.value) return;

    const rect = sentinel.value.getBoundingClientRect();
    if (rect.top > window.innerHeight + 200) return;

    await feed.loadMore();
    await nextTick();
    // Continue tant que la sentinelle reste visible (gros écrans, page peu remplie)
    if (!feed.error.value) await checkAndLoad();
  };

  onMounted(async () => {
    feed.reset();
    await feed.loadMore();
    await nextTick();

    observer = new IntersectionObserver(() => { checkAndLoad(); }, { rootMargin: "200px" });
    if (sentinel.value) observer.observe(sentinel.value);

    await checkAndLoad();
  });

  onBeforeUnmount(() => observer?.disconnect());

  return { sentinel };
};
