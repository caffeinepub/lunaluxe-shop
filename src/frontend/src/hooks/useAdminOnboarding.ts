import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { UserRole } from '../backend';

export function useClaimFirstAdmin() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('useAdminOnboarding: Attempting to claim admin privileges');
      if (!actor) {
        console.error('useAdminOnboarding: Actor not available');
        throw new Error('Actor not available');
      }
      if (!identity) {
        console.error('useAdminOnboarding: Identity not available');
        throw new Error('Not authenticated');
      }

      const principal = identity.getPrincipal();
      console.log('useAdminOnboarding: Claiming admin for principal:', principal.toString());

      try {
        await actor.assignCallerUserRole(principal, UserRole.admin);
        console.log('useAdminOnboarding: Admin claim successful');
      } catch (error: any) {
        console.error('useAdminOnboarding: Admin claim failed -', error);
        
        // Parse error message for user-friendly display
        const errorMessage = error?.message || String(error);
        if (errorMessage.includes('already exists')) {
          throw new Error('An admin already exists. Only the first user can claim admin privileges.');
        } else if (errorMessage.includes('Unauthorized')) {
          throw new Error('You do not have permission to claim admin privileges.');
        } else {
          throw new Error(errorMessage);
        }
      }
    },
    onSuccess: () => {
      console.log('useAdminOnboarding: Invalidating admin status queries');
      // Invalidate admin status to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}
