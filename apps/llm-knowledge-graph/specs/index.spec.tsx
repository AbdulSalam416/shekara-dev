import { render } from '@testing-library/react';
import Page from '../src/app/page';
import { SidebarProvider } from '@shekara-dev/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('Page', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <Page />
        </SidebarProvider>
      </QueryClientProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
