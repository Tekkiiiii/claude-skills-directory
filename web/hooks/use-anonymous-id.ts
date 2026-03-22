import { useState, useEffect } from 'react';

/**
 * Generate or retrieve an anonymous visitor ID from localStorage.
 */
export function useAnonymousId() {
  const [visitorId, setVisitorId] = useState<string>('');

  useEffect(() => {
    let id = localStorage.getItem('visitor_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('visitor_id', id);
    }
    setVisitorId(id);
  }, []);

  return visitorId;
}
