import http from "http"

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" })
  res.end("ok")
}).listen(3000, "127.0.0.1", () => {
  console.log("LISTEN 3000")
})
