import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useClaimFirstAdmin } from '../../hooks/useAdminOnboarding';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const claimAdmin = useClaimFirstAdmin();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    console.log('AdminGuard: Component mounted/updated');
    console.log('AdminGuard: Identity present:', !!identity);
    console.log('AdminGuard: Actor present:', !!actor);
    console.log('AdminGuard: Actor fetching:', isFetching);
    if (identity) {
      console.log('AdminGuard: Principal ID =', identity.getPrincipal().toString());
    }
  }, [identity, actor, isFetching]);

  const { data: isAdmin, isLoading, error } = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      console.log('AdminGuard: Checking admin status...');
      if (!actor) {
        console.log('AdminGuard: Actor not available');
        return false;
      }
      try {
        const result = await actor.isCallerAdmin();
        console.log('AdminGuard: Admin check result =', result);
        return result;
      } catch (error) {
        console.error('AdminGuard: Admin check failed -', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
  });

  useEffect(() => {
    if (error) {
      console.error('AdminGuard: Query error -', error);
    }
  }, [error]);

  const handleClaimAdmin = async () => {
    console.log('AdminGuard: Claim admin button clicked');
    setErrorMessage('');
    try {
      await claimAdmin.mutateAsync();
      console.log('AdminGuard: Admin claim successful');
      toast.success('Admin privileges granted successfully!');
    } catch (error: any) {
      const message = error?.message || 'Failed to claim admin status';
      console.error('AdminGuard: Admin claim failed -', message);
      setErrorMessage(message);
      toast.error(message);
    }
  };

  if (!identity) {
    console.log('AdminGuard: Rendering access denied - not authenticated');
    return (
      <div className="container px-4 py-12 text-center">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 space-y-4">
            <ShieldAlert className="h-16 w-16 mx-auto text-destructive" />
            <h2 className="text-2xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground">Please log in to access the admin area</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    console.log('AdminGuard: Rendering loading state');
    return (
      <div className="container px-4 py-12">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    console.log('AdminGuard: Rendering access denied - not admin');
    return (
      <div className="container px-4 py-12 text-center">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 space-y-4">
            <ShieldAlert className="h-16 w-16 mx-auto text-destructive" />
            <h2 className="text-2xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this area
            </p>
            
            {/* Admin onboarding action - visible only when authenticated */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Testing or first-time setup?</span>
              </div>
              <Button
                onClick={handleClaimAdmin}
                disabled={claimAdmin.isPending}
                variant="outline"
                className="mx-auto"
              >
                {claimAdmin.isPending ? 'Claiming admin...' : 'Make me admin'}
              </Button>
              {errorMessage && (
                <p className="text-sm text-destructive mt-2">
                  {errorMessage}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('AdminGuard: Rendering admin content');
  return <>{children}</>;
}
