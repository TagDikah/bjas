const fs = require("node:fs");
const path = require("node:path");
const localtunnel = require("localtunnel");

const port = Number(process.env.TUNNEL_PORT || process.env.PORT || 3000);
const localHost = process.env.TUNNEL_LOCAL_HOST || "127.0.0.1";
const subdomain = process.env.TUNNEL_SUBDOMAIN || undefined;
const host = process.env.TUNNEL_HOST || "https://localtunnel.me";
const outputFile =
  process.env.TUNNEL_OUTPUT_FILE ||
  path.join(process.cwd(), "localtunnel-url.txt");

async function main() {
  const tunnel = await localtunnel({
    port,
    host,
    subdomain,
    local_host: localHost,
  });

  const payload = {
    publicUrl: tunnel.url,
    localUrl: `http://${localHost}:${port}`,
    startedAt: new Date().toISOString(),
  };

  fs.writeFileSync(outputFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`PUBLIC_URL=${tunnel.url}`);
  console.log(`WROTE_TUNNEL_INFO=${outputFile}`);

  tunnel.on("close", () => {
    process.exit(0);
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, async () => {
      try {
        await tunnel.close();
      } finally {
        process.exit(0);
      }
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
