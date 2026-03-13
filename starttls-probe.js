import "dotenv/config";
import net from "net";
import tls from "tls";

const host = process.env.TIDB_HOST;
const port = Number(process.env.TIDB_PORT || "4000");

if (!host) throw new Error("Missing TIDB_HOST");

function readPacketHeader(buf) {
  // MySQL packet header: 3-byte length + 1-byte sequence
  const len = buf[0] | (buf[1] << 8) | (buf[2] << 16);
  const seq = buf[3];
  return { len, seq };
}

console.log("🔎 Probing MySQL STARTTLS upgrade:", { host, port });

const sock = net.connect({ host, port }, () => {
  console.log("✅ TCP connected, waiting for MySQL handshake...");
});

sock.setTimeout(15000);

let first = true;

sock.on("data", (buf) => {
  if (!first) return;
  first = false;

  const { len, seq } = readPacketHeader(buf);
  console.log("⬇️ Got initial MySQL handshake packet:", { packetLen: len, seq, totalBytes: buf.length });
  console.log("HEX (first 60):", buf.slice(0, 60).toString("hex"));

  // Build SSL Request packet (CLIENT_SSL + basic flags).
  // Payload is 32 bytes:
  // 4 capability flags, 4 max packet, 1 charset, 23 reserved
  const CLIENT_SSL = 0x0800;
  const CLIENT_PROTOCOL_41 = 0x0200;
  const CLIENT_SECURE_CONNECTION = 0x8000;
  const CLIENT_LONG_PASSWORD = 0x0001;
  const CLIENT_PLUGIN_AUTH = 0x00080000;

  const capability =
    CLIENT_SSL |
    CLIENT_PROTOCOL_41 |
    CLIENT_SECURE_CONNECTION |
    CLIENT_LONG_PASSWORD |
    CLIENT_PLUGIN_AUTH;

  const payload = Buffer.alloc(32, 0);
  payload.writeUInt32LE(capability, 0);
  payload.writeUInt32LE(0x01000000, 4); // max packet (16MB)
  payload.writeUInt8(45, 8);            // charset (45 = utf8mb4_general_ci, good enough for probe)

  // Wrap in MySQL packet header
  const header = Buffer.alloc(4);
  header[0] = payload.length & 0xff;
  header[1] = (payload.length >> 8) & 0xff;
  header[2] = (payload.length >> 16) & 0xff;
  header[3] = (seq + 1) & 0xff;

  const sslRequestPacket = Buffer.concat([header, payload]);

  console.log("➡️ Sending SSL Request packet (STARTTLS)...");
  sock.write(sslRequestPacket);

  console.log("🔐 Starting TLS on existing socket...");
  const tlsSock = tls.connect({
    socket: sock,
    servername: host,
    rejectUnauthorized: false, // probe only
    minVersion: "TLSv1.2",
    maxVersion: "TLSv1.2",
  }, () => {
    console.log("✅ TLS handshake succeeded (STARTTLS upgrade works)!");
    tlsSock.end();
  });

  tlsSock.on("error", (e) => {
    console.error("❌ TLS UPGRADE ERROR:", e.code || e.name, e.message);
    process.exit(1);
  });
});

sock.on("timeout", () => {
  console.error("❌ Timeout waiting for handshake");
  process.exit(1);
});

sock.on("error", (e) => {
  console.error("❌ TCP ERROR:", e.code || e.name, e.message);
  process.exit(1);
});
