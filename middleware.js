// Simple middleware with no authentication
export function middleware(request) {
  // Allow all requests to pass through
  return;
}

export const config = {
  matcher: []
};
