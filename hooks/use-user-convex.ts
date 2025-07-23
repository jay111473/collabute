// BetterAuth removed - implement your own auth hooks here if needed
export function useUserConvex() {
  return {
    user: null,
    loading: false,
    error: null,
    refetch: () => {},
  };
}

export function useUserData() {
  return useUserConvex();
}

export function useAuthUser() {
  return {
    user: null,
    session: null,
    loading: false,
    error: null,
  };
}