import { Link } from '@tanstack/react-router';
import { useProducts } from '../../hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '../../utils/format';

export default function HomePage() {
  const { data: products, isLoading } = useProducts();

  const featuredProducts = products?.slice(0, 4) || [];

  return (
    <div className="container px-4 py-6 space-y-8">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden">
        <img
          src="/assets/generated/lunaluxe-hero-banner.dim_1200x600.svg"
          alt="Neelamaa Collection"
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
          <h1 className="text-3xl font-serif font-bold text-white mb-2">
            Elegant Style, Timeless Beauty
          </h1>
          <p className="text-white/90 mb-4">Discover our curated collection</p>
          <Link to="/categories">
            <Button size="lg" className="w-full sm:w-auto">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <h2 className="text-2xl font-serif font-semibold">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/products" search={{ category: 'clothing' }}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center">
                  <Sparkles className="h-16 w-16 text-rose-600" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-center">Women's Clothing</h3>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/products" search={{ category: 'jewelry' }}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                  <Sparkles className="h-16 w-16 text-amber-600" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-center">Jewelry</h3>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-semibold">Featured Items</h2>
          <Link to="/products">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
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
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {featuredProducts.map((product) => (
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
                      <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                      <p className="text-primary font-semibold mt-1">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No products available yet</p>
          </div>
        )}
      </section>
    </div>
  );
}
