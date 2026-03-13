import "dotenv/config";
import tls from "tls";

const host = process.env.TIDB_HOST;
const port = Number(process.env.TIDB_PORT || "4000");

console.log("ENV:", {
  TIDB_HOST: process.env.TIDB_HOST,
  TIDB_PORT: process.env.TIDB_PORT,
  TIDB_USER: process.env.TIDB_USER,
  TIDB_DATABASE: process.env.TIDB_DATABASE,
  TIDB_SSL_CA: process.env.TIDB_SSL_CA,
  TIDB_SSL_INSECURE: process.env.TIDB_SSL_INSECURE,
});

if (!host) {
  console.error("Missing TIDB_HOST");
  process.exit(1);
}

console.log("TLS testing:", { host, port });

const s = tls.connect({
  host,
  port,
  servername: host,
  rejectUnauthorized: false,   // just testing if TLS can establish at all
  minVersion: "TLSv1.2",
}, () => {
  console.log("✅ TLS connected");
  console.log("authorized:", s.authorized);
  try {
    const cert = s.getPeerCertificate(true);
    console.log("peer subject:", cert?.subject);
    console.log("peer issuer :", cert?.issuer);
  } catch (e) {
    console.log("peer cert read failed:", e?.message || e);
  }
  s.end();
});

s.on("error", (e) => {
  console.error("❌ TLS ERROR:", e.code || e.name, e.message);
  process.exit(1);
});
