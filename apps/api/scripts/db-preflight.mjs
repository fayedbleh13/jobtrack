import dns from 'node:dns/promises';
import net from 'node:net';

const url = process.env.DATABASE_URL;

if (!url) {
  console.log('[db-preflight] DATABASE_URL is not set');
  process.exit(0);
}

let hostname;
let port;

try {
  const parsed = new URL(url);
  hostname = parsed.hostname;
  port = Number(parsed.port || 5432);
} catch {
  console.log('[db-preflight] DATABASE_URL is not a valid URL');
  process.exit(0);
}

function probe(family) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: hostname, port, family, timeout: 3000 });
    const finish = (result) => {
      socket.destroy();
      resolve(result);
    };

    socket.on('connect', () => finish('connected'));
    socket.on('timeout', () => finish('timeout'));
    socket.on('error', (error) => finish(error.code ?? 'error'));
  });
}

async function records(resolve) {
  try {
    const addresses = await resolve(hostname);
    return addresses.length > 0 ? addresses.join(', ') : 'none';
  } catch {
    return 'none';
  }
}

console.log(`[db-preflight] host=${hostname} port=${port}`);
console.log(`[db-preflight] A=${await records(dns.resolve4)}`);
console.log(`[db-preflight] AAAA=${await records(dns.resolve6)}`);
console.log(`[db-preflight] tcp ipv4=${await probe(4)}`);
console.log(`[db-preflight] tcp ipv6=${await probe(6)}`);
