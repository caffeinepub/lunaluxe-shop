import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../state/cart';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ShoppingBag, Plus } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { toast } from 'sonner';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: products } = useProducts();
  const addItem = useCart((state) => state.addItem);

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success('Added to cart');
  };

  return (
    <div className="container px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold mb-4">Search Products</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {searchQuery && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {filteredProducts?.length || 0} results for "{searchQuery}"
          </p>

          {filteredProducts && filteredProducts.length > 0 ? (
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
      )}

      {!searchQuery && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Start typing to search for products</p>
        </div>
      )}
    </div>
  );
}
