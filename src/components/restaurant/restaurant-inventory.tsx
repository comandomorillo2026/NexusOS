'use client';

import React, { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { toast } from 'sonner';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Filter,
  Download,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    inventory: 'Inventory',
    search: 'Search inventory...',
    addItem: 'Add Item',
    itemName: 'Item Name',
    category: 'Category',
    quantity: 'Quantity',
    unit: 'Unit',
    reorderLevel: 'Reorder Level',
    cost: 'Cost',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    lowStock: 'Low Stock',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    totalItems: 'Total Items',
    lowStockAlerts: 'Low Stock Alerts',
    totalValue: 'Total Value',
    categories: {
      all: 'All',
      ingredients: 'Ingredients',
      beverages: 'Beverages',
      supplies: 'Supplies',
      packaging: 'Packaging',
    },
    units: {
      kg: 'Kilograms (kg)',
      l: 'Liters (L)',
      units: 'Units',
      boxes: 'Boxes',
    },
    itemAdded: 'Item added successfully',
    itemUpdated: 'Item updated successfully',
    itemDeleted: 'Item deleted successfully',
    confirmDelete: 'Are you sure you want to delete this item?',
    reorderNow: 'Reorder Now',
    exportInventory: 'Export',
  },
  es: {
    inventory: 'Inventario',
    search: 'Buscar en inventario...',
    addItem: 'Agregar Artículo',
    itemName: 'Nombre del Artículo',
    category: 'Categoría',
    quantity: 'Cantidad',
    unit: 'Unidad',
    reorderLevel: 'Nivel de Reorden',
    cost: 'Costo',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    lowStock: 'Stock Bajo',
    inStock: 'En Stock',
    outOfStock: 'Sin Stock',
    totalItems: 'Total Artículos',
    lowStockAlerts: 'Alertas de Stock Bajo',
    totalValue: 'Valor Total',
    categories: {
      all: 'Todos',
      ingredients: 'Ingredientes',
      beverages: 'Bebidas',
      supplies: 'Suministros',
      packaging: 'Empaques',
    },
    units: {
      kg: 'Kilogramos (kg)',
      l: 'Litros (L)',
      units: 'Unidades',
      boxes: 'Cajas',
    },
    itemAdded: 'Artículo agregado exitosamente',
    itemUpdated: 'Artículo actualizado exitosamente',
    itemDeleted: 'Artículo eliminado exitosamente',
    confirmDelete: '¿Está seguro de que desea eliminar este artículo?',
    reorderNow: 'Reordenar',
    exportInventory: 'Exportar',
  },
};

// ============================================
// INTERFACES
// ============================================
interface InventoryItem {
  id: string;
  name: string;
  category: 'ingredients' | 'beverages' | 'supplies' | 'packaging';
  quantity: number;
  unit: 'kg' | 'l' | 'units' | 'boxes';
  reorderLevel: number;
  cost: number;
  lastUpdated: Date;
}

// ============================================
// DEMO DATA
// ============================================
const initialInventory: InventoryItem[] = [
  { id: '1', name: 'Carne de Res', category: 'ingredients', quantity: 25, unit: 'kg', reorderLevel: 20, cost: 45.00, lastUpdated: new Date() },
  { id: '2', name: 'Pollo', category: 'ingredients', quantity: 30, unit: 'kg', reorderLevel: 25, cost: 28.00, lastUpdated: new Date() },
  { id: '3', name: 'Queso Mozzarella', category: 'ingredients', quantity: 5, unit: 'kg', reorderLevel: 10, cost: 55.00, lastUpdated: new Date() },
  { id: '4', name: 'Harina de Trigo', category: 'ingredients', quantity: 50, unit: 'kg', reorderLevel: 30, cost: 8.50, lastUpdated: new Date() },
  { id: '5', name: 'Aceite Vegetal', category: 'ingredients', quantity: 20, unit: 'l', reorderLevel: 15, cost: 12.00, lastUpdated: new Date() },
  { id: '6', name: 'Ron Blanco', category: 'beverages', quantity: 8, unit: 'l', reorderLevel: 10, cost: 85.00, lastUpdated: new Date() },
  { id: '7', name: 'Vino Tinto', category: 'beverages', quantity: 12, unit: 'units', reorderLevel: 8, cost: 65.00, lastUpdated: new Date() },
  { id: '8', name: 'Cerveza Nacional', category: 'beverages', quantity: 48, unit: 'units', reorderLevel: 36, cost: 6.50, lastUpdated: new Date() },
  { id: '9', name: 'Coca Cola', category: 'beverages', quantity: 72, unit: 'units', reorderLevel: 48, cost: 4.00, lastUpdated: new Date() },
  { id: '10', name: 'Café Molido', category: 'ingredients', quantity: 3, unit: 'kg', reorderLevel: 5, cost: 120.00, lastUpdated: new Date() },
  { id: '11', name: 'Servilletas', category: 'supplies', quantity: 500, unit: 'units', reorderLevel: 200, cost: 0.05, lastUpdated: new Date() },
  { id: '12', name: 'Palillos', category: 'supplies', quantity: 200, unit: 'units', reorderLevel: 100, cost: 0.02, lastUpdated: new Date() },
  { id: '13', name: 'Cajas para Llevar (Grande)', category: 'packaging', quantity: 50, unit: 'units', reorderLevel: 30, cost: 2.50, lastUpdated: new Date() },
  { id: '14', name: 'Cajas para Llevar (Pequeña)', category: 'packaging', quantity: 75, unit: 'units', reorderLevel: 50, cost: 1.50, lastUpdated: new Date() },
  { id: '15', name: 'Mariscos Mixtos', category: 'ingredients', quantity: 2, unit: 'kg', reorderLevel: 5, cost: 95.00, lastUpdated: new Date() },
  { id: '16', name: 'Leche', category: 'ingredients', quantity: 15, unit: 'l', reorderLevel: 10, cost: 8.00, lastUpdated: new Date() },
  { id: '17', name: 'Mantequilla', category: 'ingredients', quantity: 4, unit: 'kg', reorderLevel: 5, cost: 35.00, lastUpdated: new Date() },
  { id: '18', name: 'Limones', category: 'ingredients', quantity: 8, unit: 'kg', reorderLevel: 5, cost: 12.00, lastUpdated: new Date() },
];

// ============================================
// MAIN INVENTORY COMPONENT
// ============================================
export function RestaurantInventory() {
  const { language } = useTheme();
  const t = translations[language];

  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'ingredients' as InventoryItem['category'],
    quantity: '',
    unit: 'kg' as InventoryItem['unit'],
    reorderLevel: '',
    cost: '',
  });

  // Stats
  const stats = {
    totalItems: items.length,
    lowStock: items.filter((i) => i.quantity <= i.reorderLevel).length,
    outOfStock: items.filter((i) => i.quantity === 0).length,
    totalValue: items.reduce((sum, i) => sum + i.quantity * i.cost, 0),
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get stock status
  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return 'out';
    if (item.quantity <= item.reorderLevel) return 'low';
    return 'ok';
  };

  // Format currency
  const formatCurrency = (amount: number) =>
    `TT$${amount.toLocaleString('en-TT', { minimumFractionDigits: 2 })}`;

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      category: 'ingredients',
      quantity: '',
      unit: 'kg',
      reorderLevel: '',
      cost: '',
    });
    setSelectedItem(null);
  }, []);

  // Add item
  const handleAddItem = useCallback(() => {
    if (!formData.name || !formData.quantity) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'Por favor complete todos los campos');
      return;
    }

    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      reorderLevel: parseFloat(formData.reorderLevel) || 0,
      cost: parseFloat(formData.cost) || 0,
      lastUpdated: new Date(),
    };

    setItems((prev) => [...prev, newItem]);
    setShowAddDialog(false);
    resetForm();
    toast.success(t.itemAdded);
  }, [formData, language, t.itemAdded, resetForm]);

  // Edit item
  const handleEditItem = useCallback(() => {
    if (!selectedItem || !formData.name) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              name: formData.name,
              category: formData.category,
              quantity: parseFloat(formData.quantity),
              unit: formData.unit,
              reorderLevel: parseFloat(formData.reorderLevel),
              cost: parseFloat(formData.cost),
              lastUpdated: new Date(),
            }
          : item
      )
    );
    setShowEditDialog(false);
    resetForm();
    toast.success(t.itemUpdated);
  }, [selectedItem, formData, t.itemUpdated, resetForm]);

  // Delete item
  const handleDeleteItem = useCallback(() => {
    if (!selectedItem) return;
    setItems((prev) => prev.filter((item) => item.id !== selectedItem.id));
    setShowDeleteDialog(false);
    setSelectedItem(null);
    toast.success(t.itemDeleted);
  }, [selectedItem, t.itemDeleted]);

  // Open edit dialog
  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      reorderLevel: item.reorderLevel.toString(),
      cost: item.cost.toString(),
    });
    setShowEditDialog(true);
  };

  // Export inventory
  const handleExport = () => {
    const csv = items.map(i => `${i.name},${i.category},${i.quantity},${i.unit},${i.reorderLevel},${i.cost}`).join('\n');
    const blob = new Blob([`Name,Category,Quantity,Unit,Reorder Level,Cost\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    toast.success(language === 'en' ? 'Inventory exported' : 'Inventario exportado');
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.totalItems}</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-[#EF4444]" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">{t.lowStock}</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.lowStock}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">{t.outOfStock}</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.outOfStock}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.totalValue}</p>
                <p className="text-2xl font-bold text-[#EF4444]">{formatCurrency(stats.totalValue)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.categories.all}</SelectItem>
              <SelectItem value="ingredients">{t.categories.ingredients}</SelectItem>
              <SelectItem value="beverages">{t.categories.beverages}</SelectItem>
              <SelectItem value="supplies">{t.categories.supplies}</SelectItem>
              <SelectItem value="packaging">{t.categories.packaging}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            {t.exportInventory}
          </Button>
          <Button onClick={() => setShowAddDialog(true)} className="bg-[#EF4444] hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            {t.addItem}
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-28rem)]">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-4 font-medium">{t.itemName}</th>
                  <th className="text-left p-4 font-medium">{t.category}</th>
                  <th className="text-left p-4 font-medium">{t.quantity}</th>
                  <th className="text-left p-4 font-medium">{t.reorderLevel}</th>
                  <th className="text-left p-4 font-medium">{t.cost}</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} className="border-t hover:bg-muted/30">
                      <td className="p-4 font-medium">{item.name}</td>
                      <td className="p-4">
                        <Badge variant="outline">{t.categories[item.category]}</Badge>
                      </td>
                      <td className="p-4">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-4">{item.reorderLevel} {item.unit}</td>
                      <td className="p-4">{formatCurrency(item.cost)}</td>
                      <td className="p-4">
                        {status === 'ok' && (
                          <Badge className="bg-green-500">{t.inStock}</Badge>
                        )}
                        {status === 'low' && (
                          <Badge className="bg-yellow-500">{t.lowStock}</Badge>
                        )}
                        {status === 'out' && (
                          <Badge className="bg-red-500">{t.outOfStock}</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(item)}>
                              <Edit className="w-4 h-4 mr-2" />
                              {t.edit}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedItem(item);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-500"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.addItem}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.itemName} *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.category}</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as InventoryItem['category'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingredients">{t.categories.ingredients}</SelectItem>
                    <SelectItem value="beverages">{t.categories.beverages}</SelectItem>
                    <SelectItem value="supplies">{t.categories.supplies}</SelectItem>
                    <SelectItem value="packaging">{t.categories.packaging}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.unit}</Label>
                <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v as InventoryItem['unit'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">{t.units.kg}</SelectItem>
                    <SelectItem value="l">{t.units.l}</SelectItem>
                    <SelectItem value="units">{t.units.units}</SelectItem>
                    <SelectItem value="boxes">{t.units.boxes}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t.quantity} *</Label>
                <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t.reorderLevel}</Label>
                <Input type="number" value={formData.reorderLevel} onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t.cost}</Label>
                <Input type="number" step="0.01" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>{t.cancel}</Button>
            <Button className="bg-[#EF4444] hover:bg-red-600" onClick={handleAddItem}>{t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.edit}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.itemName} *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.category}</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as InventoryItem['category'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingredients">{t.categories.ingredients}</SelectItem>
                    <SelectItem value="beverages">{t.categories.beverages}</SelectItem>
                    <SelectItem value="supplies">{t.categories.supplies}</SelectItem>
                    <SelectItem value="packaging">{t.categories.packaging}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.unit}</Label>
                <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v as InventoryItem['unit'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">{t.units.kg}</SelectItem>
                    <SelectItem value="l">{t.units.l}</SelectItem>
                    <SelectItem value="units">{t.units.units}</SelectItem>
                    <SelectItem value="boxes">{t.units.boxes}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t.quantity} *</Label>
                <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t.reorderLevel}</Label>
                <Input type="number" value={formData.reorderLevel} onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t.cost}</Label>
                <Input type="number" step="0.01" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>{t.cancel}</Button>
            <Button className="bg-[#EF4444] hover:bg-red-600" onClick={handleEditItem}>{t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-500">{t.delete}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">{t.confirmDelete}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>{t.cancel}</Button>
            <Button variant="destructive" onClick={handleDeleteItem}>{t.delete}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
