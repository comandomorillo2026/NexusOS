"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  Percent,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// Types
interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  category: string;
  description?: string;
  commissionValue?: number;
}

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  sku?: string;
  quantityInStock: number;
  category?: string;
}

interface StaffMember {
  id: string;
  fullName: string;
  commissionPercent?: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: "service" | "product";
  staffId?: string;
  staffName?: string;
}

export function BeautyPOS() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"services" | "products">("services");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get tenant ID from localStorage
  const getTenantId = useCallback(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('nexus_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.tenantId || 'demo-tenant';
      }
    }
    return 'demo-tenant';
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const tenantId = getTenantId();

      // Fetch services
      const servicesRes = await fetch(`/api/beauty/services?tenantId=${tenantId}`);
      const servicesData = await servicesRes.json();
      if (servicesData.success && servicesData.services) {
        setServices(servicesData.services);
      }

      // Fetch products
      const productsRes = await fetch(`/api/beauty/products?tenantId=${tenantId}`);
      const productsData = await productsRes.json();
      if (productsData.success && productsData.products) {
        setProducts(productsData.products);
      }

      // Fetch staff
      const staffRes = await fetch(`/api/beauty/staff?tenantId=${tenantId}`);
      const staffData = await staffRes.json();
      if (staffData.success && staffData.staff) {
        setStaff(staffData.staff);
      }
    } catch (error) {
      console.error('Error fetching POS data:', error);
      // Use demo data on error
      setServices([
        { id: "1", name: "Corte Dama", price: 150, durationMinutes: 45, category: "hair" },
        { id: "2", name: "Corte Caballero", price: 80, durationMinutes: 30, category: "hair" },
        { id: "3", name: "Tinte", price: 350, durationMinutes: 90, category: "hair" },
        { id: "4", name: "Mechas", price: 500, durationMinutes: 120, category: "hair" },
        { id: "5", name: "Manicure", price: 120, durationMinutes: 45, category: "nails" },
        { id: "6", name: "Pedicure", price: 150, durationMinutes: 60, category: "nails" },
        { id: "7", name: "Uñas Acrílicas", price: 350, durationMinutes: 90, category: "nails" },
        { id: "8", name: "Facial", price: 280, durationMinutes: 60, category: "skin" },
        { id: "9", name: "Barba", price: 60, durationMinutes: 30, category: "barber" },
        { id: "10", name: "Maquillaje", price: 250, durationMinutes: 60, category: "makeup" },
      ]);
      setProducts([
        { id: "p1", name: "Shampoo Profesional 500ml", sellingPrice: 120, sku: "SHP-001", quantityInStock: 15 },
        { id: "p2", name: "Acondicionador 500ml", sellingPrice: 130, sku: "ACD-001", quantityInStock: 12 },
        { id: "p3", name: "Serum Capilar", sellingPrice: 180, sku: "SRM-001", quantityInStock: 8 },
        { id: "p4", name: "Aceite para Barba", sellingPrice: 95, sku: "ACB-001", quantityInStock: 20 },
        { id: "p5", name: "Crema Facial", sellingPrice: 150, sku: "CRF-001", quantityInStock: 10 },
      ]);
      setStaff([
        { id: "1", fullName: "Ana García", commissionPercent: 20 },
        { id: "2", fullName: "Pedro López", commissionPercent: 20 },
        { id: "3", fullName: "Sofía Martínez", commissionPercent: 25 },
        { id: "4", fullName: "Carmen Ruiz", commissionPercent: 20 },
      ]);
    } finally {
      setLoading(false);
    }
  }, [getTenantId]);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = activeTab === "services"
    ? services.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const addToCart = (item: Service | Product, type: "service" | "product") => {
    const price = type === "service" 
      ? (item as Service).price 
      : (item as Product).sellingPrice;
    
    const existing = cart.find((c) => c.id === item.id && c.type === type);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.id === item.id && c.type === type
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          name: item.name,
          price,
          quantity: 1,
          type,
        },
      ]);
    }
    toast.success(`${item.name} agregado al carrito`);
  };

  const updateQuantity = (id: string, type: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.id === id && item.type === type
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string, type: string) => {
    setCart(cart.filter((item) => !(item.id === id && item.type === type)));
  };

  const assignStaff = (itemId: string, staffId: string) => {
    const staffMember = staff.find((s) => s.id === staffId);
    setCart(
      cart.map((item) =>
        item.id === itemId && item.type === "service"
          ? { ...item, staffId, staffName: staffMember?.fullName }
          : item
      )
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount =
    discountType === "percentage"
      ? (subtotal * discount) / 100
      : discount;
  const tax = (subtotal - discountAmount) * 0.125; // 12.5% VAT Trinidad
  const total = subtotal - discountAmount + tax;

  // Process payment
  const processPayment = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setIsProcessing(true);
    try {
      const tenantId = getTenantId();
      
      // Create sale via API
      const response = await fetch('/api/beauty/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          items: cart,
          subtotal,
          discount: discountAmount,
          tax,
          total,
          paymentMethod,
          clientId: selectedClient || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('¡Pago procesado exitosamente!');
        // Reset
        setCart([]);
        setDiscount(0);
        setSelectedClient("");
        setShowPaymentDialog(false);
      } else {
        toast.error(data.error || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.success('¡Pago procesado! (Demo)');
      setCart([]);
      setDiscount(0);
      setSelectedClient("");
      setShowPaymentDialog(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        <span className="ml-3 text-gray-500">Cargando catálogo...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
      {/* Products/Services Catalog */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search and Tabs */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Buscar ${activeTab === "services" ? "servicios" : "productos"}...`}
                className="w-64 pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => fetchData()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "services" ? "default" : "outline"}
              onClick={() => setActiveTab("services")}
              className={activeTab === "services" ? "bg-pink-500 hover:bg-pink-600" : ""}
            >
              Servicios
            </Button>
            <Button
              variant={activeTab === "products" ? "default" : "outline"}
              onClick={() => setActiveTab("products")}
              className={activeTab === "products" ? "bg-pink-500 hover:bg-pink-600" : ""}
            >
              Productos
            </Button>
          </div>
        </div>

        {/* Items Grid */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-4 h-full overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron {activeTab === "services" ? "servicios" : "productos"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item, activeTab === "services" ? "service" : "product")}
                    className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50/50 transition-all text-left"
                  >
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mb-3">
                      {activeTab === "services" ? (
                        <span className="text-3xl">✂️</span>
                      ) : (
                        <span className="text-3xl">🧴</span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {item.name}
                    </h4>
                    <p className="text-pink-600 font-bold mt-1">
                      TT${activeTab === "services" ? (item as Service).price : (item as Product).sellingPrice}
                    </p>
                    {activeTab === "services" && (item as Service).durationMinutes && (
                      <p className="text-xs text-gray-500 mt-1">
                        {(item as Service).durationMinutes} min
                      </p>
                    )}
                    {activeTab === "products" && (item as Product).quantityInStock !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        Stock: {(item as Product).quantityInStock}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cart */}
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Venta Actual</CardTitle>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCart([])}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {/* Client Selection */}
          <div className="mb-4">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">+ Nuevo Cliente</SelectItem>
                <SelectItem value="1">María González</SelectItem>
                <SelectItem value="2">Carlos Pérez</SelectItem>
                <SelectItem value="3">Ana Martínez</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2" />
                <p>Carrito vacío</p>
                <p className="text-sm">Agrega servicios o productos</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.id}-${item.type}`}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            item.type === "service"
                              ? "border-pink-300 text-pink-600"
                              : "border-purple-300 text-purple-600"
                          }
                        >
                          {item.type === "service" ? "Servicio" : "Producto"}
                        </Badge>
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                      <p className="text-pink-600 font-bold mt-1">
                        TT${item.price}
                      </p>

                      {item.type === "service" && (
                        <Select
                          value={item.staffId || ""}
                          onValueChange={(value) => assignStaff(item.id, value)}
                        >
                          <SelectTrigger className="h-8 mt-2 text-xs">
                            <SelectValue placeholder="Asignar estilista" />
                          </SelectTrigger>
                          <SelectContent>
                            {staff.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.fullName} ({s.commissionPercent || 20}%)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.type, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.type, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500"
                        onClick={() => removeFromCart(item.id, item.type)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Discount */}
          {cart.length > 0 && (
            <div className="flex gap-2 mb-4">
              <Input
                type="number"
                placeholder="Descuento"
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="flex-1"
              />
              <Select
                value={discountType}
                onValueChange={(v) => setDiscountType(v as "percentage" | "fixed")}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">%</SelectItem>
                  <SelectItem value="fixed">TT$</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>TT${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento</span>
                <span>-TT${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">IVA (12.5%)</span>
              <span>TT${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-pink-600">TT${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Buttons */}
          {cart.length > 0 && (
            <div className="mt-4 space-y-2">
              <Button
                className="w-full bg-pink-500 hover:bg-pink-600 h-12"
                onClick={processPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Procesar Pago - TT${total.toFixed(2)}
                  </>
                )}
              </Button>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => {
                    setPaymentMethod("cash");
                    processPayment();
                  }}
                  disabled={isProcessing}
                >
                  <Banknote className="h-4 w-4 mr-1" />
                  Efectivo
                </Button>
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => {
                    setPaymentMethod("card");
                    processPayment();
                  }}
                  disabled={isProcessing}
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Tarjeta
                </Button>
                <Button
                  variant="outline"
                  className="h-10"
                  onClick={() => {
                    setPaymentMethod("transfer");
                    processPayment();
                  }}
                  disabled={isProcessing}
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  Transfer
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
