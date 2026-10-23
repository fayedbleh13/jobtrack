import { describe, expect, it } from 'vitest';
import { createReminderSchema } from './create-reminder-schema';

const VALID = {
  applicationId: 'a1',
  title: 'Follow up with the recruiter',
  dueAt: '2026-10-30',
};

describe('createReminderSchema', () => {
  it('accepts a complete reminder', () => {
    expect(createReminderSchema.safeParse(VALID).success).toBe(true);
  });

  it('requires an application, a title and a due date', () => {
    const result = createReminderSchema.safeParse({ applicationId: '', title: '  ', dueAt: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual([
        'applicationId',
        'title',
        'dueAt',
      ]);
    }
  });

  it('rejects an over-long title', () => {
    expect(createReminderSchema.safeParse({ ...VALID, title: 'x'.repeat(201) }).success).toBe(
      false,
    );
  });
});
