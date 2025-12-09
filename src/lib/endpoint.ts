// All API requests now go through Next.js API routes (/api/*)
// which proxy to the backend. This ensures cookies stay on the same domain.
const API_BASE = '/api';

export default API_BASE;
