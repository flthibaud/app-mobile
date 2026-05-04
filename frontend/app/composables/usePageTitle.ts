export const usePageTitle = (title?: string | Ref<string>) => {
  const state = useState<string>('pageTitle', () => '');

  if (title !== undefined) {
    if (isRef(title)) {
      watchEffect(() => {
        state.value = title.value;
      });
    } else {
      state.value = title;
    }
  }

  return state;
};
