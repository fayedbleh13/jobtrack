import { z } from 'zod';
import { PRIORITY_VALUES, SOURCE_OPTIONS, STAGE_VALUES } from './application-options';

const WHOLE_NUMBER = /^\d+$/;

export const createApplicationSchema = z
  .object({
    company: z.string().trim().min(1, 'Company is required').max(120),
    role: z.string().trim().min(1, 'Role is required').max(120),
    status: z.enum(STAGE_VALUES).optional(),
    location: z.string().trim().max(120).optional(),
    source: z.enum(SOURCE_OPTIONS).optional(),
    priority: z.enum(PRIORITY_VALUES).optional(),
    salaryMin: z.string().trim().optional(),
    salaryMax: z.string().trim().optional(),
    notes: z.string().trim().max(4000).optional(),
  })
  .refine((values) => !values.salaryMin || WHOLE_NUMBER.test(values.salaryMin), {
    path: ['salaryMin'],
    message: 'Enter a whole number',
  })
  .refine((values) => !values.salaryMax || WHOLE_NUMBER.test(values.salaryMax), {
    path: ['salaryMax'],
    message: 'Enter a whole number',
  })
  .refine(
    (values) =>
      !values.salaryMin ||
      !values.salaryMax ||
      Number(values.salaryMin) <= Number(values.salaryMax),
    { path: ['salaryMax'], message: 'Maximum must not be below the minimum' },
  );

export type CreateApplicationValues = z.infer<typeof createApplicationSchema>;

export const createApplicationDefaultValues: CreateApplicationValues = {
  company: '',
  role: '',
  status: 'APPLIED',
  location: '',
  source: undefined,
  priority: undefined,
  salaryMin: '',
  salaryMax: '',
  notes: '',
};
