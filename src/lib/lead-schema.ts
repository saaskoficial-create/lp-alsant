import { z } from 'zod';

export const patientVolumeOptions = ['Até 20', '21 a 50', '51 a 100', 'Mais de 100'] as const;

export const examFrequencyOptions = [
  'Na maioria dos atendimentos',
  'Em alguns atendimentos',
  'Raramente',
] as const;

export const recordVolumeOptions = ['Até 50', '51 a 100', '101 a 300', 'Mais de 300'] as const;

function normalizePhone(input: string): string | null {
  if (!/^\+?[\d\s().-]+$/.test(input)) return null;
  const digits = input.replace(/\D/g, '');

  if (input.startsWith('+')) {
    if (digits.startsWith('55')) return /^55[1-9]\d{9,10}$/.test(digits) ? `+${digits}` : null;
    return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
  }

  // Unprefixed local numbers are Brazilian; international numbers need +.
  if (/^[1-9]\d{9,10}$/.test(digits)) return `+55${digits}`;
  if (/^55[1-9]\d{9,10}$/.test(digits)) return `+${digits}`;
  return null;
}

export const leadSchema = z.object({
  fullName: z
    .string({ error: 'Informe seu nome completo.' })
    .trim()
    .min(3, 'Informe seu nome completo.')
    .max(120, 'Use até 120 caracteres.'),
  email: z
    .string({ error: 'Informe seu e-mail.' })
    .trim()
    .max(254, 'Use até 254 caracteres.')
    .pipe(z.email({ error: 'Informe um e-mail válido.' })),
  phone: z
    .string({ error: 'Informe seu WhatsApp com DDD.' })
    .trim()
    .max(40, 'Informe um WhatsApp válido.')
    .transform((value, context) => {
      const normalized = normalizePhone(value);
      if (normalized) return normalized;
      context.addIssue({
        code: 'custom',
        message: 'Informe seu WhatsApp com DDD ou código internacional (+).',
      });
      return z.NEVER;
    }),
  clinic: z
    .string({ error: 'Informe o nome da clínica ou consultório.' })
    .trim()
    .min(2, 'Informe o nome da clínica ou consultório.')
    .max(160, 'Use até 160 caracteres.'),
  patientVolume: z.enum(patientVolumeOptions, {
    error: 'Selecione quantos pacientes você atende.',
  }),
  examFrequency: z.enum(examFrequencyOptions, {
    error: 'Selecione a frequência de solicitação de exames.',
  }),
  recordVolume: z.enum(recordVolumeOptions, {
    error: 'Selecione quantos prontuários você mantém.',
  }),
  website: z.string().trim().max(0, 'Solicitação inválida.').optional(),
});

export type LeadInput = z.input<typeof leadSchema>;
export type LeadValues = z.output<typeof leadSchema>;
