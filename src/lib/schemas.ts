import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
    .max(100, { message: 'El nombre no puede exceder los 100 caracteres.' })
    .trim(),
  condominio: z.string()
    .min(2, { message: 'El nombre del condominio debe tener al menos 2 caracteres.' })
    .max(100, { message: 'El condominio no puede exceder los 100 caracteres.' })
    .trim(),
  phone: z.string()
    .min(8, { message: 'El teléfono debe tener al menos 8 dígitos.' })
    .max(20, { message: 'El teléfono no puede exceder los 20 caracteres.' })
    .regex(/^[+0-9\s()-]+$/, { message: 'El teléfono contiene caracteres no válidos.' })
    .trim(),
  service: z.string()
    .min(10, { message: 'La descripción del servicio debe tener al menos 10 caracteres.' })
    .max(1000, { message: 'La descripción no puede exceder los 1000 caracteres.' })
    .trim(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
