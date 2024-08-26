import { string, z } from "zod";

export const requestDto = z.object({
    to: z.string(),
    msg: z.string(),
});