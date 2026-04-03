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

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  quantityInStock: number;
  reorderLevel?: number;
  unitOfMeasure: string;
  imageUrl?: string;
  isCustomizable: boolean;
  variants?: ProductVariant[];
  isActive: boolean;
}

interface ProductVariant {
  id: string;
  name: string;
  priceModifier: number;
  sku?: string;
}

interface Category {
  name: string;
  count: number;
}

export function BakeryProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    costPrice: 0,
    sellingPrice: 0,
    quantityInStock: 0,
    reorderLevel: 5,
    unitOfMeasure: "unidad",
    isCustomizable: false,
  });

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, showLowStock]);

  const fetchProducts = async () => {
    try {
      let url = "/api/bakery/products?";
      if (selectedCategory !== "all") {
        url += `category=${selectedCategory}&`;
      }
      if (showLowStock) {
        url += "lowStock=true&";
      }
      if (search) {
        url += `search=${search}&`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProducts();
  };

  const handleAddProduct = async () => {
    try {
      const response = await fetch("/api/bakery/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddModal(false);
        fetchProducts();
        resetForm();
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      category: "",
      costPrice: 0,
      sellingPrice: 0,
      quantityInStock: 0,
      reorderLevel: 5,
      unitOfMeasure: "unidad",
      isCustomizable: false,
    });
  };

  const formatCurrency = (amount: number) => {
    return `TT$${amount.toFixed(2)}`;
  };

  const getStockStatus = (product: Product) => {
    if (product.quantityInStock === 0) {
      return { label: "Sin Stock", color: "bg-red-100 text-red-700" };
    }
    if (product.reorderLevel && product.quantityInStock <= product.reorderLevel) {
      return { label: "Stock Bajo", color: "bg-yellow-100 text-yellow-700" };
    }
    return { label: "En Stock", color: "bg-green-100 text-green-700" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
          <p className="text-gray-500">Gestiona tu inventario de panaderia</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[#F97316] hover:bg-[#EA580C]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Buscar producto o SKU..."
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorias</SelectItem>
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
              className={showLowStock ? "bg-[#F97316] hover:bg-[#EA580C]" : ""}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Stock Bajo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316]" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Package className="h-12 w-12 mb-4 text-gray-300" />
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-sm">
                          {product.sku}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                              <Package className="h-5 w-5 text-[#F97316]" />
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.isCustomizable && (
                                <p className="text-xs text-gray-500">
                                  Personalizable
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right font-bold text-[#F97316]">
                          {formatCurrency(product.sellingPrice)}
                        </TableCell>
                        <TableCell className="text-center">
                          {product.quantityInStock} {product.unitOfMeasure}
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

      {/* Add Product Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nuevo Producto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  placeholder="Auto-generado"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nombre *</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nombre del producto"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Descripcion</label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripcion del producto"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Categoria *</label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="ej. Panes, Pasteles"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unidad</label>
                <Select
                  value={formData.unitOfMeasure}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unitOfMeasure: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidad">Unidad</SelectItem>
                    <SelectItem value="kg">Kilogramo</SelectItem>
                    <SelectItem value="lb">Libra</SelectItem>
                    <SelectItem value="docena">Docena</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Costo</label>
                <Input
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      costPrice: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Precio Venta *</label>
                <Input
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sellingPrice: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Stock Inicial</label>
                <Input
                  type="number"
                  value={formData.quantityInStock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantityInStock: parseInt(e.target.value),
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nivel Reorden</label>
                <Input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reorderLevel: parseInt(e.target.value),
                    })
                  }
                  placeholder="5"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddProduct}
              className="bg-[#F97316] hover:bg-[#EA580C]"
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
