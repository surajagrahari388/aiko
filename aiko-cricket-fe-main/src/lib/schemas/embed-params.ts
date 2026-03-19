import { z } from "zod";

const hexColorRegex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const tenantIdSchema = z.string().regex(/^[a-zA-Z0-9_-]+$/);

export const embedBrandingSchema = z.object({
  accent_color: z
    .string()
    .regex(hexColorRegex)
    .transform((v) => (v.startsWith("#") ? v : `#${v}`))
    .optional(),
  font_family: z.string().max(100).optional(),
  border_radius: z.enum(["none", "sm", "md", "lg"]).optional(),
  heading_size: z.enum(["sm", "md", "lg"]).optional(),
  body_size: z.enum(["sm", "md", "lg"]).optional(),
});

export type EmbedBrandingInput = z.input<typeof embedBrandingSchema>;
export type EmbedBrandingParsed = z.output<typeof embedBrandingSchema>;
