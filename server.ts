import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API to list all files in the public directory
  app.get("/api/files", (req, res) => {
    try {
      // In production, Vite copies public/* into dist/
      // In development, they are in public/
      const targetDir = path.join(process.cwd(), "public");
      
      if (!fs.existsSync(targetDir)) {
          return res.json({ files: [] });
      }

      const allFiles = fs.readdirSync(targetDir).filter(file => {
        // Only return regular files, and skip index.html or standard Vite artifacts if needed
        const isFile = fs.statSync(path.join(targetDir, file)).isFile();
        const isNotIndex = file !== 'index.html' && file !== 'vite.svg';
        // Basic filter for code files
        const isCode = file.endsWith('.c') || file.endsWith('.cpp') || file.endsWith('.py');
        return isFile && isNotIndex && isCode;
      });

      res.json({ files: allFiles });
    } catch (error) {
      console.error("Error reading directory:", error);
      res.status(500).json({ error: "Failed to read files" });
    }
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
    const publicPath = path.join(process.cwd(), 'public');
    app.use(express.static(distPath));
    app.use(express.static(publicPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
