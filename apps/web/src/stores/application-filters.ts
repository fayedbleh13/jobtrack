import { create } from 'zustand';
import type { ApplicationStatus } from '@/graphql/generated/graphql';

export type StatusFilterValue = ApplicationStatus | 'ALL';

type ApplicationFiltersState = {
  status: StatusFilterValue;
  search: string;
  setStatus: (status: StatusFilterValue) => void;
  setSearch: (search: string) => void;
  reset: () => void;
};

export const useApplicationFilters = create<ApplicationFiltersState>((set) => ({
  status: 'ALL',
  search: '',
  setStatus: (status) => set({ status }),
  setSearch: (search) => set({ search }),
  reset: () => set({ status: 'ALL', search: '' }),
}));
