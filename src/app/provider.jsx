import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Centralized Query Client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes before refetching
      retry: 1, // Only retry failed requests once to avoid infinite loops
      refetchOnWindowFocus: false, // Prevents excessive API calls during dev
    },
  },
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}