import { useParams, useNavigate } from '@tanstack/react-router';
import { useProduct } from '../../hooks/useProducts';
import { useCart } from '../../state/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ShoppingBag, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '../../utils/format';
import { toast } from 'sonner';
import { useState } from 'react';

export default function ProductDetailPage() {
  const { productId } = useParams({ strict: false }) as { productId: string };
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(productId);
  const addItem = useCart((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success(`Added ${quantity} item(s) to cart`);
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-6 space-y-6">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container px-4 py-12 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-2xl font-semibold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
        <Button onClick={() => navigate({ to: '/products' })}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 space-y-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate({ to: '/products' })}
        className="rounded-full"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Image Gallery */}
      {product.images.length > 0 ? (
        product.images.length === 1 ? (
          <img
            src={product.images[0].getDirectURL()}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-lg"
          />
        ) : (
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((image, index) => (
                <CarouselItem key={index}>
                  <img
                    src={image.getDirectURL()}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        )
      ) : (
        <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground" />
        </div>
      )}

      {/* Product Info */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-serif font-bold mb-2">{product.name}</h1>
          <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
          </CardContent>
        </Card>

        {/* Quantity Selector */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Quantity</h3>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add to Cart Button */}
        <Button size="lg" className="w-full" onClick={handleAddToCart}>
          <ShoppingBag className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
