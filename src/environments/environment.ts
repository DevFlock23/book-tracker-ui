export const environment = {
  production: false,
  // Use relative '/api' during development so the Angular dev server proxy (proxy.conf.json)
  // can intercept requests and avoid CORS errors. For production builds, override this
  // in environment.prod.ts with the real backend URL.
  apiBaseUrl: '/api' 
};
