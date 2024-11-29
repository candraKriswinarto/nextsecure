import { useEffect, useState } from 'react';
import { Session } from 'better-auth/types';
import { authClient } from '@/lib/auth-client';

export function useSession() {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const currentSession = await authClient.getSession();
        console.log(currentSession);
        setSession(currentSession.data?.session);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setSession(undefined);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, []);

  return { session, isLoading };
}