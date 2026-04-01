import type { Context } from "hono";
import { ZodError } from "zod";

export function errorResponse(
  c: Context,
  code: string,
  message: string,
  status: number,
) {
  return c.json({ error: { code, message, status } }, status as 400);
}

export function handleZodError(c: Context, error: ZodError) {
  const message = error.errors
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join(", ");
  return errorResponse(c, "VALIDATION_ERROR", message, 400);
}
