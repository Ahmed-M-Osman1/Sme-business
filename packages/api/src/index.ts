import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { corsMiddleware } from "./middleware/cors";

const app = new Hono().basePath("/api");

app.use("*", corsMiddleware);

app.get("/health", (c) => c.json({ status: "ok" }));

const port = Number(process.env.PORT) || 3002;

console.log(`Shory API running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

export default app;
