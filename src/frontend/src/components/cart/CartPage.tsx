import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../../state/cart';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { toast } from 'sonner';

export default function CartPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { items, updateQuantity, removeItem, getTotal } = useCart();

  const isAuthenticated = !!identity;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to checkout');
      return;
    }
    navigate({ to: '/checkout' });
  };

  if (items.length === 0) {
    return (
      <div className="container px-4 py-12 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some items to get started</p>
        <Button onClick={() => navigate({ to: '/products' })}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 space-y-6">
      <h1 className="text-2xl font-serif font-bold">Shopping Cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.product.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {item.product.images.length > 0 ? (
                  <img
                    src={item.product.images[0].getDirectURL()}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-primary font-semibold">
                    {formatPrice(item.product.price)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-auto"
                      onClick={() => {
                        removeItem(item.product.id);
                        toast.success('Removed from cart');
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{formatPrice(getTotal())}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-primary">{formatPrice(getTotal())}</span>
          </div>
          <Button size="lg" className="w-full" onClick={handleCheckout}>
            Proceed to Checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
