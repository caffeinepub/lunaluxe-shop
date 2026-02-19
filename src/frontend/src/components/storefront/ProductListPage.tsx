import { Link, useSearch } from '@tanstack/react-router';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../state/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '../../utils/format';
import { toast } from 'sonner';

export default function ProductListPage() {
  const search = useSearch({ strict: false }) as { category?: string };
  const { data: products, isLoading } = useProducts();
  const addItem = useCart((state) => state.addItem);

  const filteredProducts = products?.filter((product) => {
    if (!search.category) return true;
    return product.description.toLowerCase().includes(search.category.toLowerCase());
  });

  const categoryName = search.category === 'clothing' ? "Women's Clothing" : search.category === 'jewelry' ? 'Jewelry' : 'All Products';

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success('Added to cart');
  };

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">{categoryName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredProducts?.length || 0} items
          </p>
        </div>
        {search.category && (
          <Badge variant="secondary">{categoryName}</Badge>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="aspect-square w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <Link key={product.id} to="/products/$productId" params={{ productId: product.id }}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0].getDirectURL()}
                      alt={product.name}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-square w-full bg-muted flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-primary font-semibold">
                        {formatPrice(product.price)}
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No products found</p>
        </div>
      )}
    </div>
  );
}
