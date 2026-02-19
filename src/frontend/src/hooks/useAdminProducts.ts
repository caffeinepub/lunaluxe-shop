import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Images } from '../backend';

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      price,
      images,
    }: {
      name: string;
      description: string;
      price: bigint;
      images: Images;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(name, description, price, images);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
