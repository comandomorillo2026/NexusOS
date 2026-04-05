"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Package,
  Edit,
  Trash2,
  AlertTriangle,
  Filter,
  Beer,
  Wine,
  GlassWater,
  Coffee,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/contexts/theme-context";

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    title: "Beverage Inventory",
    subtitle: "Manage your bar inventory",
    newProduct: "New Beverage",
    searchPlaceholder: "Search beverage or SKU...",
    allCategories: "All categories",
    lowStock: "Low Stock",
    sku: "SKU",
    product: "Product",
    category: "Category",
    brand: "Brand",
    costPrice: "Cost",
    sellingPrice: "Price",
    stock: "Stock",
    status: "Status",
    actions: "Actions",
    outOfStock: "Out of Stock",
    lowStockStatus: "Low Stock",
    inStock: "In Stock",
    customizable: "Customizable",
    noProducts: "No products found",
    newBeverage: "New Beverage",
    namePlaceholder: "Beverage name",
    description: "Description",
    descriptionPlaceholder: "Description...",
    unit: "Unit",
    unitPiece: "Piece",
    unitBottle: "Bottle",
    unitCan: "Can",
    unitKeg: "Keg",
    initialStock: "Initial Stock",
    reorderLevel: "Reorder Level",
    cancel: "Cancel",
    save: "Save",
    inventorySummary: "Inventory Summary",
    totalItems: "Total Items",
    totalValue: "Total Value",
    lowStockItems: "Low Stock Items",
    outOfStockItems: "Out of Stock",
    alcoholContent: "Alcohol",
    volume: "Volume",
  },
  es: {
    title: "Inventario de Bebidas",
    subtitle: "Administra tu inventario de bar",
    newProduct: "Nueva Bebida",
    searchPlaceholder: "Buscar bebida o SKU...",
    allCategories: "Todas las categorias",
    lowStock: "Stock Bajo",
    sku: "SKU",
    product: "Producto",
    category: "Categoria",
    brand: "Marca",
    costPrice: "Costo",
    sellingPrice: "Precio",
    stock: "Stock",
    status: "Estado",
    actions: "Acciones",
    outOfStock: "Sin Stock",
    lowStockStatus: "Stock Bajo",
    inStock: "En Stock",
    customizable: "Personalizable",
    noProducts: "No se encontraron productos",
    newBeverage: "Nueva Bebida",
    namePlaceholder: "Nombre de la bebida",
    description: "Descripcion",
    descriptionPlaceholder: "Descripcion...",
    unit: "Unidad",
    unitPiece: "Unidad",
    unitBottle: "Botella",
    unitCan: "Lata",
    unitKeg: "Barril",
    initialStock: "Stock Inicial",
    reorderLevel: "Nivel Reorden",
    cancel: "Cancelar",
    save: "Guardar",
    inventorySummary: "Resumen de Inventario",
    totalItems: "Total Items",
    totalValue: "Valor Total",
    lowStockItems: "Stock Bajo",
    outOfStockItems: "Sin Stock",
    alcoholContent: "Alcohol",
    volume: "Volumen",
  },
};

// ============================================
// INTERFACES
// ============================================
interface Beverage {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  costPrice: number;
  sellingPrice: number;
  quantityInStock: number;
  reorderLevel?: number;
  unitOfMeasure: string;
  imageUrl?: string;
  alcoholContent?: string;
  volume?: string;
  isActive: boolean;
}

interface Category {
  name: string;
  count: number;
}

// ============================================
// DEMO DATA - BAR INVENTORY
// ============================================
const DEMO_BEVERAGES: Beverage[] = [
  // BEER
  {
    id: 'b1',
    sku: 'BER-001',
    name: 'Presidente',
    description: 'Cerveza dominicana premium, la favorita del pais.',
    category: 'Beer',
    brand: 'Presidente',
    costPrice: 65,
    sellingPrice: 120,
    quantityInStock: 48,
    reorderLevel: 24,
    unitOfMeasure: 'unidad',
    alcoholContent: '5%',
    volume: '12oz',
    isActive: true
  },
  {
    id: 'b2',
    sku: 'BER-002',
    name: 'Presidente Light',
    description: 'Version ligera de la cerveza Presidente.',
    category: 'Beer',
    brand: 'Presidente',
    costPrice: 55,
    sellingPrice: 100,
    quantityInStock: 36,
    reorderLevel: 18,
    unitOfMeasure: 'unidad',
    alcoholContent: '4.2%',
    volume: '12oz',
    isActive: true
  },
  {
    id: 'b3',
    sku: 'BER-003',
    name: 'Heineken',
    description: 'Cerveza premium holandesa importada.',
    category: 'Beer',
    brand: 'Heineken',
    costPrice: 85,
    sellingPrice: 150,
    quantityInStock: 24,
    reorderLevel: 12,
    unitOfMeasure: 'unidad',
    alcoholContent: '5%',
    volume: '12oz',
    isActive: true
  },
  {
    id: 'b4',
    sku: 'BER-004',
    name: 'Corona Extra',
    description: 'Cerveza mexicana con limon.',
    category: 'Beer',
    brand: 'Corona',
    costPrice: 80,
    sellingPrice: 140,
    quantityInStock: 30,
    reorderLevel: 15,
    unitOfMeasure: 'unidad',
    alcoholContent: '4.6%',
    volume: '12oz',
    isActive: true
  },
  {
    id: 'b5',
    sku: 'BER-005',
    name: 'Budweiser',
    description: 'Cerveza americana clasica.',
    category: 'Beer',
    brand: 'Budweiser',
    costPrice: 60,
    sellingPrice: 110,
    quantityInStock: 42,
    reorderLevel: 20,
    unitOfMeasure: 'unidad',
    alcoholContent: '5%',
    volume: '12oz',
    isActive: true
  },
  
  // WINE
  {
    id: 'w1',
    sku: 'VIN-001',
    name: 'Vino Tinto Reserva',
    description: 'Vino tinto reserva con notas de roble.',
    category: 'Wine',
    brand: 'Casillero del Diablo',
    costPrice: 350,
    sellingPrice: 650,
    quantityInStock: 12,
    reorderLevel: 6,
    unitOfMeasure: 'botella',
    alcoholContent: '13.5%',
    volume: '750ml',
    isActive: true
  },
  {
    id: 'w2',
    sku: 'VIN-002',
    name: 'Vino Blanco Chardonnay',
    description: 'Vino blanco fresco y afrutado.',
    category: 'Wine',
    brand: 'Concha y Toro',
    costPrice: 280,
    sellingPrice: 550,
    quantityInStock: 8,
    reorderLevel: 4,
    unitOfMeasure: 'botella',
    alcoholContent: '13%',
    volume: '750ml',
    isActive: true
  },
  {
    id: 'w3',
    sku: 'VIN-003',
    name: 'Vino Rosado',
    description: 'Vino rosado semidulce perfecto para el verano.',
    category: 'Wine',
    brand: 'Barefoot',
    costPrice: 240,
    sellingPrice: 480,
    quantityInStock: 6,
    reorderLevel: 3,
    unitOfMeasure: 'botella',
    alcoholContent: '9%',
    volume: '750ml',
    isActive: true
  },
  {
    id: 'w4',
    sku: 'VIN-004',
    name: 'Champagne Brut',
    description: 'Champagne frances premium para celebraciones.',
    category: 'Wine',
    brand: 'Moet & Chandon',
    costPrice: 950,
    sellingPrice: 1800,
    quantityInStock: 4,
    reorderLevel: 2,
    unitOfMeasure: 'botella',
    alcoholContent: '12%',
    volume: '750ml',
    isActive: true
  },
  
  // SPIRITS
  {
    id: 's1',
    sku: 'SPI-001',
    name: 'Ron Brugal Extra Viejo',
    description: 'Ron dominicano añejo premium.',
    category: 'Spirits',
    brand: 'Brugal',
    costPrice: 500,
    sellingPrice: 950,
    quantityInStock: 10,
    reorderLevel: 5,
    unitOfMeasure: 'botella',
    alcoholContent: '38%',
    volume: '750ml',
    isActive: true
  },
  {
    id: 's2',
    sku: 'SPI-002',
    name: 'Ron Bacardi Carta Blanca',
    description: 'Ron blanco cubano para cocteles.',
    category: 'Spirits',
    brand: 'Bacardi',
    costPrice: 350,
    sellingPrice: 650,
    quantityInStock: 3,
    reorderLevel: 10,
    unitOfMeasure: 'botella',
    alcoholContent: '40%',
    volume: '750ml',
    isActive: true
  },
  {
    id: 's3',
    sku: 'SPI-003',
    name: 'Vodka Smirnoff',
    description: 'Vodka ruso premium triple destilado.',
    category: 'Spirits',
    brand: 'Smirnoff',
    costPrice: 380,
    sellingPrice: 720,
    quantityInStock: 5,
    reorderLevel: 8,
    unitOfMeasure: 'botella',
    alcoholContent: '40%',
    volume: '750ml',
    isActive: true
  },
  {
    id: 's4',
    sku: 'SPI-004',
    name: 'Whisky Johnnie Walker Red',
    description: 'Whisky escoces blended premium.',
    category: 'Spirits',
    brand: 'Johnnie Walker',
    costPrice: 720,
    sellingPrice: 1350,
    quantityInStock: 6,
    reorderLevel: 3,
    unitOfMeasure: 'botella',
    alcoholContent: '40%',
    volume: '750ml',
    isActive: true
  },
  {
    id: 's5',
    sku: 'SPI-005',
    name: 'Tequila Jose Cuervo Gold',
    description: 'Tequila mexicano gold para margaritas.',
    category: 'Spirits',
    brand: 'Jose Cuervo',
    costPrice: 480,
    sellingPrice: 890,
    quantityInStock: 7,
    reorderLevel: 4,
    unitOfMeasure: 'botella',
    alcoholContent: '38%',
    volume: '750ml',
    isActive: true
  },
  {
    id: 's6',
    sku: 'SPI-006',
    name: 'Gin Tanqueray',
    description: 'Gin ingles premium para gin tonics.',
    category: 'Spirits',
    brand: 'Tanqueray',
    costPrice: 620,
    sellingPrice: 1150,
    quantityInStock: 2,
    reorderLevel: 6,
    unitOfMeasure: 'botella',
    alcoholContent: '47.3%',
    volume: '750ml',
    isActive: true
  },
  
  // COCKTAILS (Pre-mix)
  {
    id: 'c1',
    sku: 'COK-001',
    name: 'Mojito Mix',
    description: 'Mezcla preparada para mojitos.',
    category: 'Cocktails',
    costPrice: 120,
    sellingPrice: 350,
    quantityInStock: 20,
    reorderLevel: 10,
    unitOfMeasure: 'unidad',
    isActive: true
  },
  {
    id: 'c2',
    sku: 'COK-002',
    name: 'Pina Colada Mix',
    description: 'Mezcla preparada para pina coladas.',
    category: 'Cocktails',
    costPrice: 130,
    sellingPrice: 380,
    quantityInStock: 15,
    reorderLevel: 8,
    unitOfMeasure: 'unidad',
    isActive: true
  },
  
  // SOFT DRINKS
  {
    id: 'sd1',
    sku: 'SFT-001',
    name: 'Coca Cola',
    description: 'Refresco de cola clasico.',
    category: 'Soft Drinks',
    brand: 'Coca Cola',
    costPrice: 30,
    sellingPrice: 60,
    quantityInStock: 60,
    reorderLevel: 30,
    unitOfMeasure: 'unidad',
    volume: '12oz',
    isActive: true
  },
  {
    id: 'sd2',
    sku: 'SFT-002',
    name: 'Sprite',
    description: 'Refresco de limon sin cafeina.',
    category: 'Soft Drinks',
    brand: 'Sprite',
    costPrice: 30,
    sellingPrice: 60,
    quantityInStock: 48,
    reorderLevel: 24,
    unitOfMeasure: 'unidad',
    volume: '12oz',
    isActive: true
  },
  {
    id: 'sd3',
    sku: 'SFT-003',
    name: 'Jugo de Naranja Natural',
    description: 'Jugo de naranja recien exprimido.',
    category: 'Soft Drinks',
    costPrice: 60,
    sellingPrice: 120,
    quantityInStock: 20,
    reorderLevel: 10,
    unitOfMeasure: 'unidad',
    volume: '12oz',
    isActive: true
  },
  {
    id: 'sd4',
    sku: 'SFT-004',
    name: 'Agua Mineral',
    description: 'Agua mineral natural.',
    category: 'Soft Drinks',
    brand: 'Dasani',
    costPrice: 25,
    sellingPrice: 50,
    quantityInStock: 72,
    reorderLevel: 36,
    unitOfMeasure: 'unidad',
    volume: '16oz',
    isActive: true
  },
];

// ============================================
// MAIN COMPONENT
// ============================================
export function BarInventory() {
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { language } = useTheme();
  
  const t = translations[language];

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    brand: "",
    costPrice: 0,
    sellingPrice: 0,
    quantityInStock: 0,
    reorderLevel: 5,
    unitOfMeasure: "unidad",
    alcoholContent: "",
    volume: "",
  });

  const loadDemoBeverages = () => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = [...DEMO_BEVERAGES];
      
      if (selectedCategory !== "all") {
        filtered = filtered.filter(b => b.category === selectedCategory);
      }
      
      if (showLowStock) {
        filtered = filtered.filter(b => 
          b.reorderLevel && b.quantityInStock <= b.reorderLevel
        );
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(b => 
          b.name.toLowerCase().includes(searchLower) ||
          b.sku.toLowerCase().includes(searchLower) ||
          (b.brand?.toLowerCase().includes(searchLower))
        );
      }
      
      setBeverages(filtered);
      
      // Calculate categories
      const categoryMap = new Map<string, number>();
      DEMO_BEVERAGES.forEach(b => {
        if (b.isActive) {
          categoryMap.set(b.category, (categoryMap.get(b.category) || 0) + 1);
        }
      });
      setCategories(Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count })));
      
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    loadDemoBeverages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, showLowStock, search]);

  const handleAddBeverage = () => {
    const newBeverage: Beverage = {
      id: `new-${Date.now()}`,
      sku: formData.sku || generateCode(formData.name),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      brand: formData.brand,
      costPrice: formData.costPrice,
      sellingPrice: formData.sellingPrice,
      quantityInStock: formData.quantityInStock,
      reorderLevel: formData.reorderLevel,
      unitOfMeasure: formData.unitOfMeasure,
      alcoholContent: formData.alcoholContent,
      volume: formData.volume,
      isActive: true
    };
    
    DEMO_BEVERAGES.push(newBeverage);
    setBeverages(prev => [...prev, newBeverage]);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      category: "",
      brand: "",
      costPrice: 0,
      sellingPrice: 0,
      quantityInStock: 0,
      reorderLevel: 5,
      unitOfMeasure: "unidad",
      alcoholContent: "",
      volume: "",
    });
  };

  const generateCode = (name: string) => {
    if (!name) return "";
    const prefix = name.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `${prefix}-${random}`;
  };

  const formatCurrency = (amount: number) => {
    return `RD$${amount.toLocaleString("es-DO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const getStockStatus = (beverage: Beverage) => {
    if (beverage.quantityInStock === 0) {
      return { label: t.outOfStock, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    }
    if (beverage.reorderLevel && beverage.quantityInStock <= beverage.reorderLevel) {
      return { label: t.lowStockStatus, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
    }
    return { label: t.inStock, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Beer': return <Beer className="h-4 w-4" />;
      case 'Wine': return <Wine className="h-4 w-4" />;
      case 'Spirits': return <GlassWater className="h-4 w-4" />;
      case 'Cocktails': return <GlassWater className="h-4 w-4" />;
      default: return <Coffee className="h-4 w-4" />;
    }
  };

  // Calculate summary metrics
  const totalItems = DEMO_BEVERAGES.reduce((sum, b) => sum + b.quantityInStock, 0);
  const totalValue = DEMO_BEVERAGES.reduce((sum, b) => sum + (b.costPrice * b.quantityInStock), 0);
  const lowStockCount = DEMO_BEVERAGES.filter(b => b.reorderLevel && b.quantityInStock <= b.reorderLevel && b.quantityInStock > 0).length;
  const outOfStockCount = DEMO_BEVERAGES.filter(b => b.quantityInStock === 0).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.totalItems}</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Package className="h-5 w-5 text-[#8B5CF6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.totalValue}</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.lowStockItems}</p>
                <p className="text-2xl font-bold text-amber-600">{lowStockCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.outOfStockItems}</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED]"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t.newProduct}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadDemoBeverages()}
                placeholder={t.searchPlaceholder}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t.category} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCategories}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
              className={showLowStock ? "bg-[#8B5CF6] hover:bg-[#7C3AED]" : ""}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {t.lowStock}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Beverages Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]" />
            </div>
          ) : beverages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Package className="h-12 w-12 mb-4 opacity-50" />
              <p>{t.noProducts}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.sku}</TableHead>
                    <TableHead>{t.product}</TableHead>
                    <TableHead>{t.category}</TableHead>
                    <TableHead className="text-right">{t.costPrice}</TableHead>
                    <TableHead className="text-right">{t.sellingPrice}</TableHead>
                    <TableHead className="text-center">{t.stock}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead className="text-center">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {beverages.map((beverage) => {
                    const stockStatus = getStockStatus(beverage);
                    return (
                      <TableRow key={beverage.id}>
                        <TableCell className="font-mono text-sm">
                          {beverage.sku}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-[#8B5CF6]">
                              {getCategoryIcon(beverage.category)}
                            </div>
                            <div>
                              <p className="font-medium">{beverage.name}</p>
                              {beverage.brand && (
                                <p className="text-xs text-muted-foreground">
                                  {beverage.brand}
                                </p>
                              )}
                              {(beverage.alcoholContent || beverage.volume) && (
                                <p className="text-xs text-muted-foreground">
                                  {beverage.alcoholContent} {beverage.volume && `| ${beverage.volume}`}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{beverage.category}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(beverage.costPrice)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-[#8B5CF6]">
                          {formatCurrency(beverage.sellingPrice)}
                        </TableCell>
                        <TableCell className="text-center">
                          {beverage.quantityInStock} {beverage.unitOfMeasure}
                        </TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Beverage Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t.newBeverage}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t.sku}</label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Auto-generado"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t.namePlaceholder} *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.namePlaceholder}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t.brand}</label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder={t.brand}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t.category} *</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.category} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beer">Beer</SelectItem>
                    <SelectItem value="Wine">Wine</SelectItem>
                    <SelectItem value="Spirits">Spirits</SelectItem>
                    <SelectItem value="Cocktails">Cocktails</SelectItem>
                    <SelectItem value="Soft Drinks">Soft Drinks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">{t.unit}</label>
                <Select
                  value={formData.unitOfMeasure}
                  onValueChange={(value) => setFormData({ ...formData, unitOfMeasure: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidad">{t.unitPiece}</SelectItem>
                    <SelectItem value="botella">{t.unitBottle}</SelectItem>
                    <SelectItem value="lata">{t.unitCan}</SelectItem>
                    <SelectItem value="barril">{t.unitKeg}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t.alcoholContent}</label>
                <Input
                  value={formData.alcoholContent}
                  onChange={(e) => setFormData({ ...formData, alcoholContent: e.target.value })}
                  placeholder="ej. 5%"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t.volume}</label>
                <Input
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  placeholder="ej. 750ml"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t.costPrice}</label>
                <Input
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t.sellingPrice} *</label>
                <Input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t.initialStock}</label>
                <Input
                  type="number"
                  value={formData.quantityInStock}
                  onChange={(e) => setFormData({ ...formData, quantityInStock: parseInt(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t.reorderLevel}</label>
                <Input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })}
                  placeholder="5"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleAddBeverage} className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
