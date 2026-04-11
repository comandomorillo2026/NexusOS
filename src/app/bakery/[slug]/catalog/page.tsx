'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Star,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Facebook,
  ExternalLink,
  Cookie,
  ChefHat,
  Gift,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  Send,
  X,
  Eye,
  TrendingUp,
  Image as ImageIcon,
  Check
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isPromo?: boolean;
  promoPrice?: number;
  inStock: boolean;
  allergens?: string[];
}

interface CartItem extends Product {
  quantity: number;
  notes?: string;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  validUntil?: string;
}

interface InstagramPost {
  id: string;
  image: string;
  caption: string;
  likes: number;
  permalink: string;
  timestamp: string;
}

interface BakeryInfo {
  name: string;
  slug: string;
  logo?: string;
  description: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  schedule?: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  theme?: {
    primary: string;
    secondary: string;
  };
}

// Demo data
const demoBakeryInfo: BakeryInfo = {
  name: 'Panadería Dulce Hogar',
  slug: 'dulce-hogar',
  description: 'El sabor tradicional de siempre, ahora más cerca de ti. Más de 25 años endulzando tu vida con pan fresco y deliciosas tortas artesanales.',
  phone: '+1 868-123-4567',
  email: 'pedidos@dulcehogar.tt',
  whatsapp: '+18681234567',
  address: '123 Frederick Street, Port of Spain, Trinidad & Tobago',
  instagram: '@dulcehogarbakery',
  facebook: 'DulceHogarBakery',
  schedule: {
    weekdays: '6:00 AM - 7:00 PM',
    saturday: '7:00 AM - 6:00 PM',
    sunday: '7:00 AM - 2:00 PM'
  },
  theme: {
    primary: '#F97316',
    secondary: '#FBBF24'
  }
};

const demoPromotions: Promotion[] = [
  {
    id: '1',
    title: '🎉 Promoción de Semana Santa',
    description: '20% OFF en todas las tortas decoradas. ¡Encarga tu cruz de pan dulce!',
    image: '/api/placeholder/800/400',
    validUntil: '2024-03-31'
  },
  {
    id: '2',
    title: '🍰 Torta Cumpleañera Especial',
    description: 'Tortas personalizadas desde TT$250. Incluye velas gratis.',
    image: '/api/placeholder/800/400',
    validUntil: '2024-04-15'
  },
  {
    id: '3',
    title: '☕ Combo Desayuno',
    description: '2 panes dulces + café por solo TT$25. Válido de 6-9 AM.',
    image: '/api/placeholder/800/400',
    validUntil: '2024-04-30'
  }
];

const demoProducts: Product[] = [
  {
    id: '1',
    name: 'Pan de Agua Fresco',
    description: 'Recién horneado, crujiente por fuera y suave por dentro. El clásico de todos los días.',
    price: 8,
    category: 'Panes',
    inStock: true
  },
  {
    id: '2',
    name: 'Pan de Queso',
    description: 'Pan suave relleno de queso derretido. Perfecto para el desayuno.',
    price: 15,
    category: 'Panes',
    inStock: true,
    allergens: ['lactosa']
  },
  {
    id: '3',
    name: 'Torta de Chocolate',
    description: 'Exquisita torta de chocolate belga con cobertura ganache. 10 porciones.',
    price: 350,
    image: '/api/placeholder/400/300',
    category: 'Tortas',
    inStock: true,
    isPromo: true,
    promoPrice: 280,
    allergens: ['gluten', 'lactosa', 'huevos']
  },
  {
    id: '4',
    name: 'Tres Leches Premium',
    description: 'Nuestra especialidad. Bizcocho empapado en tres leches con crema chantilly.',
    price: 320,
    category: 'Tortas',
    inStock: true,
    allergens: ['gluten', 'lactosa', 'huevos']
  },
  {
    id: '5',
    name: 'Cupcake Variado',
    description: 'Deliciosos cupcakes con buttercream. Disponibles en chocolate, vainilla y red velvet.',
    price: 12,
    category: 'Postres',
    inStock: true,
    allergens: ['gluten', 'lactosa']
  },
  {
    id: '6',
    name: 'Empanada de Carne',
    description: 'Empanada criolla con carne sazonada. Hecha al momento.',
    price: 18,
    category: 'Salados',
    inStock: true,
    allergens: ['gluten']
  },
  {
    id: '7',
    name: 'Golfeados Tachireños',
    description: 'Tradicionales golfeados con queso y melado. Pack de 6 unidades.',
    price: 35,
    category: 'Dulces',
    inStock: true
  },
  {
    id: '8',
    name: 'Pan Campesino',
    description: 'Pan rústico de masa madre con corteza crujiente. Ideal para sándwiches.',
    price: 22,
    category: 'Panes',
    inStock: true
  },
  {
    id: '9',
    name: 'Brownie Artesanal',
    description: 'Brownie denso y chocolatoso con nueces. El más pedido de la casa.',
    price: 25,
    category: 'Postres',
    inStock: true,
    isPromo: true,
    promoPrice: 20,
    allergens: ['gluten', 'lactosa', 'nueces']
  },
  {
    id: '10',
    name: 'Pastelito de Guayaba',
    description: 'Hojaldrado crujiente relleno de guayaba natural. Pack de 4.',
    price: 20,
    category: 'Dulces',
    inStock: true
  },
  {
    id: '11',
    name: 'Pandeques',
    description: 'Pequeños panes dulces ideales para la merienda. Docena.',
    price: 30,
    category: 'Panes',
    inStock: true
  },
  {
    id: '12',
    name: 'Pizza Familiar',
    description: 'Pizza artesanal con salsa casera y queso mozzarella. 8 porciones.',
    price: 120,
    category: 'Salados',
    inStock: true,
    allergens: ['gluten', 'lactosa']
  }
];

// Demo Instagram posts
const demoInstagramPosts: InstagramPost[] = [
  {
    id: '1',
    image: '/api/placeholder/300/300',
    caption: 'Nueva torta de cumpleaños disponible! 🎂',
    likes: 245,
    permalink: 'https://instagram.com/p/demo1',
    timestamp: '2024-03-15T10:00:00Z'
  },
  {
    id: '2',
    image: '/api/placeholder/300/300',
    caption: 'Pan recién horneado cada mañana 🥐',
    likes: 189,
    permalink: 'https://instagram.com/p/demo2',
    timestamp: '2024-03-14T08:00:00Z'
  },
  {
    id: '3',
    image: '/api/placeholder/300/300',
    caption: 'Detrás de cámaras en nuestra cocina 📸',
    likes: 156,
    permalink: 'https://instagram.com/p/demo3',
    timestamp: '2024-03-13T15:00:00Z'
  },
  {
    id: '4',
    image: '/api/placeholder/300/300',
    caption: 'Promo especial de Semana Santa ✨',
    likes: 312,
    permalink: 'https://instagram.com/p/demo4',
    timestamp: '2024-03-12T12:00:00Z'
  },
  {
    id: '5',
    image: '/api/placeholder/300/300',
    caption: 'Nuestro equipo de panaderos ⭐',
    likes: 198,
    permalink: 'https://instagram.com/p/demo5',
    timestamp: '2024-03-11T09:00:00Z'
  },
  {
    id: '6',
    image: '/api/placeholder/300/300',
    caption: 'Nuevos sabores de cupcakes! 🧁',
    likes: 267,
    permalink: 'https://instagram.com/p/demo6',
    timestamp: '2024-03-10T14:00:00Z'
  }
];

const categories = ['Todos', 'Panes', 'Tortas', 'Postres', 'Dulces', 'Salados'];

export default function BakeryCatalogPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [bakery, setBakery] = useState<BakeryInfo>(demoBakeryInfo);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [promotions, setPromotions] = useState<Promotion[]>(demoPromotions);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>(demoInstagramPosts);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [currentPromo, setCurrentPromo] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  // Analytics state
  const [viewCount, setViewCount] = useState(0);
  const [productViews, setProductViews] = useState<Record<string, number>>({});

  // Track visit to catalog
  const trackVisit = useCallback(async () => {
    try {
      // In production, this would call the API
      // await fetch(`/api/bakery/catalog/${slug}/analytics`, {
      //   method: 'POST',
      //   body: JSON.stringify({ type: 'catalog_view' })
      // });

      // Demo: increment local counter
      const storedViews = localStorage.getItem(`catalog_${slug}_views`);
      const newViews = (parseInt(storedViews || '0') + 1);
      localStorage.setItem(`catalog_${slug}_views`, newViews.toString());
      setViewCount(newViews);
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  }, [slug]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);

    // Track visit
    trackVisit();

    return () => clearTimeout(timer);
  }, [slug, trackVisit]);

  // Track product view
  const trackProductView = useCallback((productId: string) => {
    setProductViews(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promotions.length]);

  const filteredProducts = selectedCategory === 'Todos'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Cart functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    trackProductView(product.id);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.isPromo && item.promoPrice ? item.promoPrice : item.price;
    return sum + (price * item.quantity);
  }, 0);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Generate WhatsApp message for order
  const generateOrderMessage = () => {
    const items = cart.map(item => {
      const price = item.isPromo && item.promoPrice ? item.promoPrice : item.price;
      return `• ${item.quantity}x ${item.name} - TT$${(price * item.quantity).toFixed(2)}`;
    }).join('\n');

    const message = `🛒 *NUEVO PEDIDO* - ${bakery.name}

👤 *Cliente:* ${customerName}
📱 *Teléfono:* ${customerPhone}
🚚 *Entrega:* ${deliveryOption === 'pickup' ? 'Recoger en tienda' : `Delivery a: ${deliveryAddress}`}

📦 *Productos:*
${items}

💰 *Total:* TT$${cartTotal.toFixed(2)}

📝 *Notas:* ${orderNotes || 'Ninguna'}

_Enviado desde el catálogo digital_`;

    return encodeURIComponent(message);
  };

  const sendOrder = () => {
    if (!customerName || !customerPhone) {
      alert('Por favor completa tu nombre y teléfono');
      return;
    }

    if (deliveryOption === 'delivery' && !deliveryAddress) {
      alert('Por favor ingresa tu dirección de entrega');
      return;
    }

    const message = generateOrderMessage();
    const whatsappUrl = `https://wa.me/${bakery.whatsapp?.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    // Save order locally
    const order = {
      id: Date.now().toString(),
      items: cart,
      customer: { name: customerName, phone: customerPhone },
      delivery: { option: deliveryOption, address: deliveryAddress },
      notes: orderNotes,
      total: cartTotal,
      createdAt: new Date().toISOString()
    };

    const storedOrders = JSON.parse(localStorage.getItem(`orders_${slug}`) || '[]');
    localStorage.setItem(`orders_${slug}`, JSON.stringify([order, ...storedOrders]));

    setShowOrderSuccess(true);
    setTimeout(() => {
      setShowCart(false);
      setShowOrderSuccess(false);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDeliveryAddress('');
      setOrderNotes('');
    }, 3000);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(`Hola! Vi el catálogo de ${bakery.name} y me gustaría hacer un pedido.`);
    window.open(`https://wa.me/${bakery.whatsapp?.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  const formatPrice = (price: number) => {
    return `TT$${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#FFF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] animate-pulse mx-auto flex items-center justify-center">
            <Cookie className="w-8 h-8 text-white" />
          </div>
          <p className="text-[#9D7BEA] mt-4 animate-pulse">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#FFF]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center shadow-lg">
                {bakery.logo ? (
                  <img src={bakery.logo} alt={bakery.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <Cookie className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#1F2937]" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  {bakery.name}
                </h1>
                <p className="text-xs text-[#6B7280] flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#FBBF24] text-[#FBBF24]" />
                  4.9 • Abierto ahora • <Eye className="w-3 h-3" /> {viewCount} visitas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Cart Button */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 rounded-full bg-[#F97316] text-white hover:bg-[#EA580C] transition-colors shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#DC2626] text-white text-xs flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowContactMenu(!showContactMenu)}
                className="p-2 rounded-full bg-[#25D366] text-white hover:bg-[#128C7E] transition-colors shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              {showContactMenu && (
                <div className="absolute top-16 right-4 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 min-w-[180px]">
                  <button
                    onClick={openWhatsApp}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-[#25D366]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </button>
                  <a
                    href={`tel:${bakery.phone}`}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-[#6B7280]"
                  >
                    <Phone className="w-4 h-4" />
                    Llamar
                  </a>
                  <a
                    href={`mailto:${bakery.email}`}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-[#6B7280]"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Promotions Carousel */}
      {promotions.length > 0 && (
        <section className="relative max-w-6xl mx-auto px-4 py-6">
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentPromo * 100}%)` }}
            >
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="w-full flex-shrink-0 relative h-48 md:h-64"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#DC2626]" />
                  <div className="absolute inset-0 bg-[url('/api/placeholder/800/400')] bg-cover bg-center opacity-20" />
                  <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-5 h-5 text-white" />
                      <span className="text-white/80 text-sm font-medium">PROMOCIÓN ESPECIAL</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
                      {promo.title}
                    </h2>
                    <p className="text-white/90 text-sm md:text-base max-w-lg">
                      {promo.description}
                    </p>
                    {promo.validUntil && (
                      <p className="text-white/60 text-xs mt-2">
                        Válido hasta: {new Date(promo.validUntil).toLocaleDateString('es-TT')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentPromo((prev) => (prev - 1 + promotions.length) % promotions.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#F97316]" />
            </button>
            <button
              onClick={() => setCurrentPromo((prev) => (prev + 1) % promotions.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[#F97316]" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {promotions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPromo(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentPromo === index ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bakery Info Banner */}
      <section className="max-w-6xl mx-auto px-4 py-4">
        <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] rounded-xl p-4 md:p-6 border border-[#FBBF24]/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[#92400E] text-sm md:text-base">
                {bakery.description}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#92400E]">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{bakery.schedule?.weekdays}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-[60px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#F97316] text-white shadow-lg'
                    : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-[#1F2937]" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Nuestros Productos
          </h2>
          <span className="text-sm text-[#6B7280]">
            {filteredProducts.length} productos
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-gradient-to-br from-[#FFF8F0] to-[#FFE4C4]">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Cookie className="w-16 h-16 text-[#F97316]/30" />
                  </div>
                )}

                {product.isPromo && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-[#DC2626] text-white text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    OFERTA
                  </div>
                )}

                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      favorites.includes(product.id) ? 'fill-[#F97316] text-[#F97316]' : 'text-gray-400'
                    }`}
                  />
                </button>

                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-xs text-[#6B7280]">
                  {product.category}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-3 md:p-4">
                <h3 className="font-semibold text-[#1F2937] text-sm md:text-base line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
                  {product.description}
                </p>

                {product.allergens && product.allergens.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {product.allergens.map((allergen) => (
                      <span
                        key={allergen}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-[#6B7280]"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price and Add to Cart */}
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    {product.isPromo ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#9CA3AF] line-through">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-lg font-bold text-[#DC2626]">
                          {formatPrice(product.promoPrice!)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-[#F97316]">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow ${
                      product.inStock
                        ? 'bg-[#F97316] text-white hover:bg-[#EA580C]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instagram Feed Section */}
      {instagramPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#1F2937] flex items-center gap-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
              <Instagram className="w-6 h-6 text-[#E4405F]" />
              Síguenos en Instagram
            </h2>
            <a
              href={`https://instagram.com/${bakery.instagram?.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#F97316] hover:underline flex items-center gap-1"
            >
              Ver más <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
            {instagramPosts.slice(0, 6).map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square relative group overflow-hidden rounded-lg md:rounded-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/20 to-[#FBBF24]/20">
                  <ImageIcon className="w-full h-full text-white/30 p-8" />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center">
                    <Heart className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">{post.likes}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-4 text-center">
            <a
              href={`https://instagram.com/${bakery.instagram?.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-5 h-5" />
              Seguir @{bakery.instagram?.replace('@', '')}
            </a>
          </div>
        </section>
      )}

      {/* Contact & Location */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-[#1F2937] mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#F97316]" />
              Contáctanos
            </h3>

            <div className="space-y-4">
              <button
                onClick={openWhatsApp}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">Enviar WhatsApp</span>
              </button>

              <a
                href={`tel:${bakery.phone}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 text-[#6B7280] hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>{bakery.phone}</span>
              </a>

              <a
                href={`mailto:${bakery.email}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 text-[#6B7280] hover:bg-gray-100 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>{bakery.email}</span>
              </a>

              <div className="flex gap-3 pt-2">
                {bakery.instagram && (
                  <a
                    href={`https://instagram.com/${bakery.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white text-sm hover:opacity-90 transition-opacity"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                )}
                {bakery.facebook && (
                  <a
                    href={`https://facebook.com/${bakery.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1877F2] text-white text-sm hover:opacity-90 transition-opacity"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Schedule & Location */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-[#1F2937] mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F97316]" />
              Horario & Ubicación
            </h3>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Lunes - Viernes</span>
                <span className="font-medium text-[#1F2937]">{bakery.schedule?.weekdays}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Sábado</span>
                <span className="font-medium text-[#1F2937]">{bakery.schedule?.saturday}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Domingo</span>
                <span className="font-medium text-[#1F2937]">{bakery.schedule?.sunday}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#F97316] mt-0.5" />
                <div>
                  <p className="text-sm text-[#1F2937]">{bakery.address}</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(bakery.address || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#F97316] hover:underline mt-2"
                  >
                    Ver en Google Maps
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1F2937] text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center">
              <Cookie className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-cormorant)' }}>
              {bakery.name}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            {bakery.description}
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>© 2024 Todos los derechos reservados</span>
            <span>•</span>
            <span>Powered by NexusOS</span>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <button
        onClick={openWhatsApp}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:bg-[#128C7E] transition-colors z-40 animate-bounce"
        style={{ animationDuration: '2s' }}
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* Floating Cart Total */}
      {cartItemCount > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-24 right-6 px-4 py-3 rounded-full bg-[#F97316] text-white shadow-lg flex items-center gap-2 z-40 hover:bg-[#EA580C] transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-bold">TT${cartTotal.toFixed(2)}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{cartItemCount}</span>
        </button>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCart(false)}
          />

          {/* Cart Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col">
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#1F2937]">Tu Pedido</h2>
                <p className="text-xs text-[#6B7280]">{cartItemCount} productos</p>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            {/* Order Success Message */}
            {showOrderSuccess && (
              <div className="p-4 bg-[#10B981]/10 border-b border-[#10B981]/20">
                <div className="flex items-center gap-2 text-[#10B981]">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">¡Pedido enviado por WhatsApp!</span>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                  <p className="text-[#6B7280]">Tu carrito está vacío</p>
                  <p className="text-sm text-gray-400 mt-1">Agrega productos del catálogo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const price = item.isPromo && item.promoPrice ? item.promoPrice : item.price;
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#FFF8F0] to-[#FFE4C4] flex items-center justify-center flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Cookie className="w-8 h-8 text-[#F97316]/30" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[#1F2937] text-sm line-clamp-1">{item.name}</h4>
                          <p className="text-[#F97316] font-bold text-sm">
                            TT${(price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4 text-[#6B7280]" />
                          </button>
                          <span className="w-6 text-center font-medium text-[#1F2937]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4 text-[#6B7280]" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-[#EF4444] hover:bg-[#EF4444]/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer Form */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-100 space-y-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tu nombre *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Tu teléfono *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none"
                  />

                  {/* Delivery Options */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeliveryOption('pickup')}
                      className={`flex-1 py-2 px-4 rounded-xl border text-sm font-medium transition-colors ${
                        deliveryOption === 'pickup'
                          ? 'bg-[#F97316] text-white border-[#F97316]'
                          : 'border-gray-200 text-[#6B7280] hover:border-[#F97316]'
                      }`}
                    >
                      🏪 Recoger
                    </button>
                    <button
                      onClick={() => setDeliveryOption('delivery')}
                      className={`flex-1 py-2 px-4 rounded-xl border text-sm font-medium transition-colors ${
                        deliveryOption === 'delivery'
                          ? 'bg-[#F97316] text-white border-[#F97316]'
                          : 'border-gray-200 text-[#6B7280] hover:border-[#F97316]'
                      }`}
                    >
                      🚚 Delivery
                    </button>
                  </div>

                  {deliveryOption === 'delivery' && (
                    <input
                      type="text"
                      placeholder="Dirección de entrega *"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none"
                    />
                  )}

                  <textarea
                    placeholder="Notas adicionales (opcional)"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none resize-none"
                  />
                </div>

                {/* Total */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <span className="text-[#6B7280]">Total</span>
                  <span className="text-2xl font-bold text-[#F97316]">TT${cartTotal.toFixed(2)}</span>
                </div>

                {/* Send Order Button */}
                <button
                  onClick={sendOrder}
                  className="w-full py-4 rounded-xl bg-[#25D366] text-white font-bold text-lg hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Enviar Pedido por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
