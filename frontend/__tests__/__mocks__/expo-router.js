const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockPrefetch = jest.fn();

export const router = {
  replace: mockReplace,
  push: mockPush,
  back: mockBack,
  prefetch: mockPrefetch,
};

export const useRouter = jest.fn(() => router);

export const useLocalSearchParams = jest.fn(() => ({}));

export const Stack = {
  Screen: () => null,
};
