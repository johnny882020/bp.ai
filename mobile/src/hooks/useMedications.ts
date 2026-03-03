import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const MEDICATIONS_KEY = ['medications'];

export interface Medication {
  id: string;
  name: string;
  dosage?: string | null;
  frequency?: 'Daily' | 'Twice Daily' | 'Three Times Daily' | 'Weekly' | 'As Needed' | null;
  active?: boolean;
  start_date?: string | null;
}

export function useMedications() {
  const queryClient = useQueryClient();

  const { data: medications = [], isLoading, isError, error } = useQuery<Medication[]>({
    queryKey: MEDICATIONS_KEY,
    queryFn: () => base44.entities.Medication.list('name'),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Medication, 'id'>) => base44.entities.Medication.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEDICATIONS_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Medication> }) =>
      base44.entities.Medication.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEDICATIONS_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => base44.entities.Medication.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEDICATIONS_KEY }),
  });

  return { medications, isLoading, isError, error, createMutation, updateMutation, deleteMutation };
}
