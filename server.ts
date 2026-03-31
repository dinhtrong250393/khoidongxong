import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });
  const PORT = 3000;

  // State
  let counts = { math: 0, lit: 0, both: 0, neither: 0 };
  const MAX_STUDENTS = 39;

  io.on("connection", (socket) => {
    // Send current state to new client
    socket.emit("stateUpdate", counts);

    socket.on("vote", (voteType) => {
      const totalVotes = counts.math + counts.lit + counts.both + counts.neither;
      if (totalVotes < MAX_STUDENTS && counts[voteType] !== undefined) {
        counts[voteType]++;
        io.emit("stateUpdate", counts);
      }
    });

    socket.on("reset", () => {
      counts = { math: 0, lit: 0, both: 0, neither: 0 };
      io.emit("stateUpdate", counts);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
