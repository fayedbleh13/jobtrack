import { beforeEach, describe, expect, it } from 'vitest';
import { useApplicationFilters } from './application-filters';

describe('application filters store', () => {
  beforeEach(() => {
    useApplicationFilters.getState().reset();
  });

  it('starts unfiltered', () => {
    const { status, search } = useApplicationFilters.getState();
    expect(status).toBe('ALL');
    expect(search).toBe('');
  });

  it('updates status and search independently', () => {
    useApplicationFilters.getState().setStatus('INTERVIEW');
    useApplicationFilters.getState().setSearch('acme');

    const { status, search } = useApplicationFilters.getState();
    expect(status).toBe('INTERVIEW');
    expect(search).toBe('acme');
  });

  it('resets both filters', () => {
    useApplicationFilters.getState().setStatus('OFFER');
    useApplicationFilters.getState().setSearch('globex');
    useApplicationFilters.getState().reset();

    const { status, search } = useApplicationFilters.getState();
    expect(status).toBe('ALL');
    expect(search).toBe('');
  });
});
