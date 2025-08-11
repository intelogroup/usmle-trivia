import React from 'react';
import { ConvexProvider } from 'convex/react';
import { ConvexReactClient } from 'convex/react';
import { useAuth } from '@clerk/clerk-react';

interface ConvexClerkProviderProps {
  children: React.ReactNode;
  client: ConvexReactClient;
}

export function ConvexClerkProvider({ children, client }: ConvexClerkProviderProps) {
  const { getToken } = useAuth();

  // Configure the Convex client to use Clerk tokens
  React.useEffect(() => {
    client.setAuth({
      getToken: async () => {
        try {
          const token = await getToken({ template: 'convex' });
          return token ?? null;
        } catch (error) {
          console.error('Failed to get Clerk token:', error);
          return null;
        }
      }
    });
  }, [client, getToken]);

  return (
    <ConvexProvider client={client}>
      {children}
    </ConvexProvider>
  );
}