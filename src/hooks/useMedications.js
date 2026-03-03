import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const MEDICATIONS_KEY = ['medications'];

export function useMedications() {
  const queryClient = useQueryClient();

  const { data: medications = [], isLoading, isError, error } = useQuery({
    queryKey: MEDICATIONS_KEY,
    queryFn: () => base44.entities.Medication.list('name'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Medication.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEDICATIONS_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Medication.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEDICATIONS_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Medication.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEDICATIONS_KEY }),
  });

  return { medications, isLoading, isError, error, createMutation, updateMutation, deleteMutation };
}
