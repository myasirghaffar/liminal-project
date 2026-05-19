import { copyFileSync } from "fs";

// Vercel serves 404.html for unknown paths; copying index.html enables client-side routing.
copyFileSync("dist/index.html", "dist/404.html");
console.log("SPA fallback: dist/404.html created from index.html");
