// This route is not used directly
// WebSocket is initialized in server.ts
export async function GET() {
  return new Response('WebSocket endpoint', { status: 200 });
}
