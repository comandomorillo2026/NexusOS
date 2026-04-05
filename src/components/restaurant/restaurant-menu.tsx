'use client';

import React, { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  UtensilsCrossed,
  Wine,
  Cake,
  Salad,
  MoreVertical,
  DollarSign,
  FileText,
  Tag,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    menuManagement: 'Menu Management',
    search: 'Search menu items...',
    addItem: 'Add Item',
    categories: 'Categories',
    allItems: 'All Items',
    appetizers: 'Appetizers',
    mainCourse: 'Main Course',
    desserts: 'Desserts',
    drinks: 'Drinks',
    itemName: 'Item Name',
    price: 'Price',
    description: 'Description',
    category: 'Category',
    available: 'Available',
    notAvailable: 'Not Available',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    toggleAvailability: 'Toggle Availability',
    confirmDelete: 'Confirm Delete',
    confirmDeleteMessage: 'Are you sure you want to delete this item?',
    itemAdded: 'Item added successfully',
    itemUpdated: 'Item updated successfully',
    itemDeleted: 'Item deleted successfully',
    availabilityToggled: 'Availability updated',
    itemsCount: 'items',
    new: 'NEW',
  },
  es: {
    menuManagement: 'Gestión del Menú',
    search: 'Buscar en el menú...',
    addItem: 'Agregar Artículo',
    categories: 'Categorías',
    allItems: 'Todos los Artículos',
    appetizers: 'Entradas',
    mainCourse: 'Plato Principal',
    desserts: 'Postres',
    drinks: 'Bebidas',
    itemName: 'Nombre del Artículo',
    price: 'Precio',
    description: 'Descripción',
    category: 'Categoría',
    available: 'Disponible',
    notAvailable: 'No Disponible',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    toggleAvailability: 'Cambiar Disponibilidad',
    confirmDelete: 'Confirmar Eliminación',
    confirmDeleteMessage: '¿Está seguro de que desea eliminar este artículo?',
    itemAdded: 'Artículo agregado exitosamente',
    itemUpdated: 'Artículo actualizado exitosamente',
    itemDeleted: 'Artículo eliminado exitosamente',
    availabilityToggled: 'Disponibilidad actualizada',
    itemsCount: 'artículos',
    new: 'NUEVO',
  },
};

// ============================================
// INTERFACES
// ============================================
interface MenuItem {
  id: string;
  name: string;
  category: 'appetizers' | 'mainCourse' | 'desserts' | 'drinks';
  price: number;
  description: string;
  available: boolean;
  createdAt: Date;
}

// ============================================
// DEMO DATA
// ============================================
const initialMenuItems: MenuItem[] = [
  // Appetizers
  { id: '1', name: 'Tacos al Pastor', category: 'appetizers', price: 35.00, description: '3 tacos with marinated pork, pineapple, onions, and cilantro', available: true, createdAt: new Date() },
  { id: '2', name: 'Nachos Supreme', category: 'appetizers', price: 45.00, description: 'Crispy tortilla chips loaded with cheese, guacamole, sour cream, and jalapeños', available: true, createdAt: new Date() },
  { id: '3', name: 'Chicken Wings', category: 'appetizers', price: 55.00, description: '8 crispy wings with your choice of Buffalo or BBQ sauce', available: true, createdAt: new Date() },
  { id: '4', name: 'Quesadillas', category: 'appetizers', price: 42.00, description: 'Flour tortilla filled with cheese and your choice of chicken or beef', available: true, createdAt: new Date() },
  { id: '5', name: 'Ceviche', category: 'appetizers', price: 48.00, description: 'Fresh fish marinated in lime juice with onions, cilantro, and peppers', available: false, createdAt: new Date() },
  // Main Course
  { id: '6', name: 'Hamburguesa Especial', category: 'mainCourse', price: 65.00, description: 'Angus beef patty with bacon, cheese, lettuce, tomato, and special sauce', available: true, createdAt: new Date() },
  { id: '7', name: 'Pasta Carbonara', category: 'mainCourse', price: 55.00, description: 'Spaghetti with creamy bacon sauce, parmesan, and egg', available: true, createdAt: new Date() },
  { id: '8', name: 'Grilled Salmon', category: 'mainCourse', price: 85.00, description: 'Fresh Atlantic salmon with seasonal vegetables and lemon butter sauce', available: true, createdAt: new Date() },
  { id: '9', name: 'Ribeye Steak', category: 'mainCourse', price: 120.00, description: '12oz prime ribeye cooked to your preference with garlic mashed potatoes', available: true, createdAt: new Date() },
  { id: '10', name: 'Chicken Parmesan', category: 'mainCourse', price: 58.00, description: 'Breaded chicken breast with marinara sauce and melted mozzarella', available: true, createdAt: new Date() },
  { id: '11', name: 'Seafood Paella', category: 'mainCourse', price: 95.00, description: 'Traditional Spanish rice with shrimp, mussels, clams, and chorizo', available: true, createdAt: new Date() },
  // Desserts
  { id: '12', name: 'Tiramisú', category: 'desserts', price: 32.00, description: 'Classic Italian dessert with mascarpone, espresso, and cocoa', available: true, createdAt: new Date() },
  { id: '13', name: 'Chocolate Lava Cake', category: 'desserts', price: 35.00, description: 'Warm chocolate cake with molten center, served with vanilla ice cream', available: true, createdAt: new Date() },
  { id: '14', name: 'Cheesecake', category: 'desserts', price: 28.00, description: 'New York style cheesecake with berry compote', available: true, createdAt: new Date() },
  { id: '15', name: 'Flan', category: 'desserts', price: 25.00, description: 'Traditional caramel custard flan', available: true, createdAt: new Date() },
  // Drinks
  { id: '16', name: 'Mojito Clásico', category: 'drinks', price: 28.00, description: 'White rum, fresh mint, lime juice, sugar, and soda water', available: true, createdAt: new Date() },
  { id: '17', name: 'Piña Colada', category: 'drinks', price: 30.00, description: 'White rum, pineapple juice, and coconut cream', available: true, createdAt: new Date() },
  { id: '18', name: 'Cerveza Nacional', category: 'drinks', price: 18.00, description: 'Local Caribbean beer, ice cold', available: true, createdAt: new Date() },
  { id: '19', name: 'Limonada', category: 'drinks', price: 15.00, description: 'Fresh limeade with mint', available: true, createdAt: new Date() },
  { id: '20', name: 'Café Expresso', category: 'drinks', price: 12.00, description: 'Double shot of espresso', available: true, createdAt: new Date() },
  { id: '21', name: 'Sangría', category: 'drinks', price: 25.00, description: 'Red wine punch with fruits and brandy', available: true, createdAt: new Date() },
];

// ============================================
// MAIN MENU MANAGEMENT COMPONENT
// ============================================
export function RestaurantMenu() {
  const { language } = useTheme();
  const t = translations[language];

  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'mainCourse' as MenuItem['category'],
    available: true,
  });

  // Categories with icons
  const categories = [
    { id: 'all', label: t.allItems, icon: null, count: menuItems.length },
    { id: 'appetizers', label: t.appetizers, icon: Salad, count: menuItems.filter(i => i.category === 'appetizers').length },
    { id: 'mainCourse', label: t.mainCourse, icon: UtensilsCrossed, count: menuItems.filter(i => i.category === 'mainCourse').length },
    { id: 'desserts', label: t.desserts, icon: Cake, count: menuItems.filter(i => i.category === 'desserts').length },
    { id: 'drinks', label: t.drinks, icon: Wine, count: menuItems.filter(i => i.category === 'drinks').length },
  ];

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Format currency
  const formatCurrency = (amount: number) =>
    `TT$${amount.toLocaleString('en-TT', { minimumFractionDigits: 2 })}`;

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: 'mainCourse',
      available: true,
    });
    setSelectedItem(null);
  }, []);

  // Add item
  const handleAddItem = useCallback(() => {
    if (!formData.name || !formData.price) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'Por favor complete todos los campos requeridos');
      return;
    }

    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      available: formData.available,
      createdAt: new Date(),
    };

    setMenuItems((prev) => [...prev, newItem]);
    setShowAddDialog(false);
    resetForm();
    toast.success(t.itemAdded);
  }, [formData, language, t.itemAdded, resetForm]);

  // Edit item
  const handleEditItem = useCallback(() => {
    if (!selectedItem || !formData.name || !formData.price) return;

    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              name: formData.name,
              price: parseFloat(formData.price),
              description: formData.description,
              category: formData.category,
              available: formData.available,
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
    setMenuItems((prev) => prev.filter((item) => item.id !== selectedItem.id));
    setShowDeleteDialog(false);
    setSelectedItem(null);
    toast.success(t.itemDeleted);
  }, [selectedItem, t.itemDeleted]);

  // Toggle availability
  const toggleAvailability = useCallback((itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, available: !item.available } : item
      )
    );
    toast.success(t.availabilityToggled);
  }, [t.availabilityToggled]);

  // Open edit dialog
  const openEditDialog = (item: MenuItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      description: item.description,
      category: item.category,
      available: item.available,
    });
    setShowEditDialog(true);
  };

  // Get category icon
  const getCategoryIcon = (category: MenuItem['category']) => {
    switch (category) {
      case 'appetizers': return <Salad className="w-5 h-5" />;
      case 'mainCourse': return <UtensilsCrossed className="w-5 h-5" />;
      case 'desserts': return <Cake className="w-5 h-5" />;
      case 'drinks': return <Wine className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-[#EF4444] hover:bg-red-600">
          <Plus className="w-4 h-4 mr-2" />
          {t.addItem}
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap ${selectedCategory === cat.id ? 'bg-[#EF4444] hover:bg-red-600' : ''}`}
          >
            {cat.icon && <cat.icon className="w-4 h-4 mr-2" />}
            {cat.label}
            <Badge variant="secondary" className="ml-2">{cat.count}</Badge>
          </Button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <ScrollArea className="h-[calc(100vh-20rem)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className={`relative ${!item.available ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444]">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                    </div>
                  </div>
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
                      <DropdownMenuItem onClick={() => toggleAvailability(item.id)}>
                        {item.available ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Mark Unavailable' : 'Marcar No Disponible'}
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Mark Available' : 'Marcar Disponible'}
                          </>
                        )}
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
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#EF4444]">{formatCurrency(item.price)}</span>
                  <Badge variant={item.available ? 'default' : 'secondary'} className={item.available ? 'bg-green-500' : ''}>
                    {item.available ? t.available : t.notAvailable}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#EF4444]" />
              {t.addItem}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.itemName} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.itemName}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">{t.price} *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t.category}</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as MenuItem['category'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appetizers">{t.appetizers}</SelectItem>
                    <SelectItem value="mainCourse">{t.mainCourse}</SelectItem>
                    <SelectItem value="desserts">{t.desserts}</SelectItem>
                    <SelectItem value="drinks">{t.drinks}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t.description}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t.description}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="available">{t.available}</Label>
              <Switch
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
              {t.cancel}
            </Button>
            <Button className="bg-[#EF4444] hover:bg-red-600" onClick={handleAddItem}>
              <Save className="w-4 h-4 mr-2" />
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-[#EF4444]" />
              {t.edit}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t.itemName} *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">{t.price} *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">{t.category}</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as MenuItem['category'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appetizers">{t.appetizers}</SelectItem>
                    <SelectItem value="mainCourse">{t.mainCourse}</SelectItem>
                    <SelectItem value="desserts">{t.desserts}</SelectItem>
                    <SelectItem value="drinks">{t.drinks}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">{t.description}</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-available">{t.available}</Label>
              <Switch
                id="edit-available"
                checked={formData.available}
                onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
              {t.cancel}
            </Button>
            <Button className="bg-[#EF4444] hover:bg-red-600" onClick={handleEditItem}>
              <Save className="w-4 h-4 mr-2" />
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-500">{t.confirmDelete}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">{t.confirmDeleteMessage}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
