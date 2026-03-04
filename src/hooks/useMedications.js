import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const STORAGE_KEY = 'bp_medications';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function save(meds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meds));
}

export const MEDICATIONS_KEY = ['medications'];

export function useMedications() {
  const queryClient = useQueryClient();

  const { data: medications = [], isLoading, isError, error } = useQuery({
    queryKey: MEDICATIONS_KEY,
    queryFn: load,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const meds = load();
      const entry = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() };
      save([...meds, entry]);
      return entry;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEDICATIONS_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const updated = load().map(m => m.id === id ? { ...m, ...data } : m);
      save(updated);
      return updated.find(m => m.id === id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEDICATIONS_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => { save(load().filter(m => m.id !== id)); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEDICATIONS_KEY }),
  });

  return { medications, isLoading, isError, error, createMutation, updateMutation, deleteMutation };
}
