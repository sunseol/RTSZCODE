import { createZaloRelayServer } from '../lib/auth/zalo-relay.js';

const secret = process.env.ZALO_RELAY_SECRET?.trim();
const port = Number.parseInt(process.env.ZALO_RELAY_PORT ?? '8787', 10);

if (!secret || secret.length < 32) {
  console.error('ZALO_RELAY_SECRET must contain at least 32 characters.');
  process.exitCode = 1;
} else if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('ZALO_RELAY_PORT must be a valid TCP port.');
  process.exitCode = 1;
} else {
  const server = createZaloRelayServer({ secret });
  server.listen(port, '127.0.0.1', () => {
    console.log(`Zalo relay listening on http://127.0.0.1:${port}`);
  });
}
