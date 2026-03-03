import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const BP_READINGS_KEY = ['bp-readings'];

export function useBPReadings() {
  const queryClient = useQueryClient();

  const { data: readings = [], isLoading, isError, error } = useQuery({
    queryKey: BP_READINGS_KEY,
    queryFn: () => base44.entities.BloodPressureReading.list('-measured_at', 1000),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BloodPressureReading.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BP_READINGS_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BloodPressureReading.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BP_READINGS_KEY }),
  });

  return { readings, isLoading, isError, error, createMutation, deleteMutation };
}
