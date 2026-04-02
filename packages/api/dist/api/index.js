import {
  app_default
} from "../chunk-LFBMA3MZ.js";

// api/index.ts
import { handle } from "hono/vercel";
var runtime = "nodejs";
var GET = handle(app_default);
var POST = handle(app_default);
var PATCH = handle(app_default);
var DELETE = handle(app_default);
var OPTIONS = handle(app_default);
export {
  DELETE,
  GET,
  OPTIONS,
  PATCH,
  POST,
  runtime
};
//# sourceMappingURL=index.js.map