import {
  app_default
} from "./chunk-LFBMA3MZ.js";

// src/index.ts
import { serve } from "@hono/node-server";
var port = Number(process.env.PORT) || 3002;
console.log(`Shory API running on http://localhost:${port}`);
serve({ fetch: app_default.fetch, port });
var src_default = app_default;
export {
  src_default as default
};
//# sourceMappingURL=index.js.map