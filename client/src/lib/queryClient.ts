import { QueryClient } from '@tanstack/react-query';

// Function to make API requests
export async function apiRequest(
  url: string,
  { method, headers, body }: RequestInit = {}
) {
  const response = await fetch(url, {
    method: method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // Include cookies/session in requests
    body: body ? JSON.stringify(body) : undefined,
  });

  // Parse the JSON response
  const data = await response.json();
  
  // If response has an error status, throw the error
  if (!response.ok) {
    throw new Error(data.error || 'An error occurred while making the request');
  }
  
  return data;
}

// Default fetcher for React Query
async function defaultFetcher({ queryKey }: { queryKey: readonly unknown[] }) {
  const url = queryKey.join('/');
  return apiRequest(url);
}

// Create and configure query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultFetcher,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});