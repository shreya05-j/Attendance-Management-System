import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Validation middleware factory using Zod schemas.
 * Returns a structured 400 response on validation failure.
 *
 * Response format on error:
 *   { success: false, error: "Validation failed", code: "VALIDATION_ERROR", details: [...] }
 */
export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);

      // Replace original with parsed (& transformed) data.
      // Note: req.query is read-only in Express, so we use Object.defineProperty
      // to overwrite it safely. For body/params, direct assignment works.
      if (source === "query") {
        Object.defineProperty(req, "query", {
          value: data,
          writable: true,
          configurable: true,
        });
      } else {
        req[source] = data;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }));

        res.status(400).json({
          success: false,
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          details,
        });
        return;
      }
      next(error);
    }
  };
}
