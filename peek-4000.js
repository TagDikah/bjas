import net from "net";

const host = "gateway01.ap-southeast-1.prod.aws.tidbcloud.com";
const port = 4000;

console.log("Connecting (raw TCP)...", { host, port });

const s = net.connect({ host, port }, () => {
  console.log("✅ TCP connected. Waiting for data...");
});

s.setTimeout(8000);

s.on("data", (buf) => {
  console.log("⬇️ Received bytes:", buf.length);
  console.log("HEX:", buf.slice(0, 80).toString("hex"));
  console.log("TEXT:", JSON.stringify(buf.slice(0, 200).toString("utf8")));
  s.end();
});

s.on("timeout", () => {
  console.log("⏱️ Timeout: no data received (server waited for client hello)");
  s.end();
});

s.on("error", (e) => {
  console.error("❌ TCP ERROR:", e.code || e.name, e.message);
  process.exit(1);
});

s.on("end", () => console.log("🔚 Connection ended"));
