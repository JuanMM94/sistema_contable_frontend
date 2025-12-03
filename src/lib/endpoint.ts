const isDev = process.env.NODE_ENV === 'development';

const API_BASE = isDev
  ? process.env.NEXT_PUBLIC_BACKEND_API_DEV
  : process.env.NEXT_PUBLIC_BACKEND_API && process.env.NEXT_PUBLIC_BACKEND_API.trim() !== ''
    ? process.env.NEXT_PUBLIC_BACKEND_API
    : undefined;

export default API_BASE;
