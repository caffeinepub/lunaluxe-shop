import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCompletePayment } from '../../hooks/useQueries';
import { getPendingOrderId, clearPendingOrderId } from '../../state/pendingPayment';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { session_id?: string };
  const completePayment = useCompletePayment();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      const sessionId = search.session_id;
      const orderId = getPendingOrderId();

      if (!sessionId) {
        setError('Payment session not found');
        setIsProcessing(false);
        return;
      }

      if (!orderId) {
        setError('Order not found');
        setIsProcessing(false);
        return;
      }

      try {
        await completePayment.mutateAsync({ sessionId, orderId });
        clearPendingOrderId();
        setIsProcessing(false);
        setTimeout(() => {
          navigate({ to: '/order-confirmation/$orderId', params: { orderId } });
        }, 1500);
      } catch (err: any) {
        console.error('Payment completion error:', err);
        setError(err.message || 'Failed to complete payment');
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [search.session_id]);

  if (error) {
    return (
      <div className="container px-4 py-12 text-center">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Payment Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate({ to: '/orders' })}>View My Orders</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12 text-center">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 space-y-4">
          {isProcessing ? (
            <>
              <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
              <h2 className="text-2xl font-semibold">Processing Payment...</h2>
              <p className="text-muted-foreground">Please wait while we confirm your payment</p>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-2xl font-semibold">Payment Successful!</h2>
              <p className="text-muted-foreground">Redirecting to order confirmation...</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
