export const useApiUrl = () => {
  const config = useRuntimeConfig();
  
  const env = config.public.APP_ENV;
  const appApiUrl = config.public.APPAPI_URL as string;
  const webApiUrl = config.public.WEBAPI_URL as string;

  return env === "mobile" ? appApiUrl : webApiUrl;
};