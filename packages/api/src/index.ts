import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { corsMiddleware } from "./middleware/cors";
import { quotesRouter } from "./routes/quotes";

const app = new Hono().basePath("/api");

app.use("*", corsMiddleware);

app.get("/health", (c) => c.json({ status: "ok" }));
app.route("/quotes", quotesRouter);

const port = Number(process.env.PORT) || 3002;

console.log(`Shory API running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

export default app;
