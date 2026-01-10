import { z } from "zod";

export const photoUploadSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd").max(200, "Tittel kan ikke være lengre enn 200 tegn").optional(),
  description: z.string().max(1000, "Beskrivelse kan ikke være lengre enn 1000 tegn").optional(),
  year: z
    .number()
    .int("Årstall må være et heltall")
    .min(1988, "Årstall må være 1988 eller senere")
    .max(new Date().getFullYear(), `Årstall kan ikke være senere enn ${new Date().getFullYear()}`),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, "Filen kan ikke være større enn 10MB før komprimering")
    .refine(
      (file) => file.type.startsWith("image/"),
      "Filen må være et bilde"
    ),
});

export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Kommentar kan ikke være tom")
    .max(500, "Kommentar kan ikke være lengre enn 500 tegn"),
  photoId: z.string().uuid("Ugyldig bilde-ID"),
});

export type CommentInput = z.infer<typeof commentSchema>;

export const userApprovalSchema = z.object({
  userId: z.string().uuid("Ugyldig bruker-ID"),
  approved: z.boolean(),
});

export type UserApprovalInput = z.infer<typeof userApprovalSchema>;
