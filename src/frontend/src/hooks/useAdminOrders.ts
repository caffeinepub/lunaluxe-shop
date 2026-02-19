import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Order } from '../backend';

export function useAdminOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}
