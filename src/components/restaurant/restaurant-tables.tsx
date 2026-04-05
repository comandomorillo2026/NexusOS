'use client';

import React, { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { toast } from 'sonner';
import {
  LayoutGrid,
  Users,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  Timer,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    tables: 'Tables',
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    cleaning: 'Cleaning',
    capacity: 'Capacity',
    guests: 'guests',
    currentOrder: 'Current Order',
    timeSeated: 'Time Seated',
    assignTable: 'Assign Table',
    clearTable: 'Clear Table',
    reserveTable: 'Reserve',
    markCleaning: 'Mark Cleaning',
    addTable: 'Add Table',
    editTable: 'Edit Table',
    deleteTable: 'Delete Table',
    tableNumber: 'Table Number',
    tableCapacity: 'Capacity',
    save: 'Save',
    cancel: 'Cancel',
    confirmDelete: 'Are you sure you want to delete this table?',
    tableAdded: 'Table added successfully',
    tableUpdated: 'Table updated successfully',
    tableDeleted: 'Table deleted successfully',
    noOrder: 'No active order',
    minutes: 'min',
  },
  es: {
    tables: 'Mesas',
    available: 'Disponible',
    occupied: 'Ocupada',
    reserved: 'Reservada',
    cleaning: 'Limpiando',
    capacity: 'Capacidad',
    guests: 'invitados',
    currentOrder: 'Pedido Actual',
    timeSeated: 'Tiempo Ocupada',
    assignTable: 'Asignar Mesa',
    clearTable: 'Desocupar Mesa',
    reserveTable: 'Reservar',
    markCleaning: 'Marcar Limpieza',
    addTable: 'Agregar Mesa',
    editTable: 'Editar Mesa',
    deleteTable: 'Eliminar Mesa',
    tableNumber: 'Número de Mesa',
    tableCapacity: 'Capacidad',
    save: 'Guardar',
    cancel: 'Cancelar',
    confirmDelete: '¿Está seguro de que desea eliminar esta mesa?',
    tableAdded: 'Mesa agregada exitosamente',
    tableUpdated: 'Mesa actualizada exitosamente',
    tableDeleted: 'Mesa eliminada exitosamente',
    noOrder: 'Sin pedido activo',
    minutes: 'min',
  },
};

// ============================================
// INTERFACES
// ============================================
interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  guests?: number;
  orderTotal?: number;
  timeSeated?: number;
  serverName?: string;
}

// ============================================
// DEMO DATA
// ============================================
const initialTables: Table[] = [
  { id: '1', number: 1, capacity: 4, status: 'occupied', guests: 3, orderTotal: 125.50, timeSeated: 45, serverName: 'María' },
  { id: '2', number: 2, capacity: 4, status: 'available' },
  { id: '3', number: 3, capacity: 2, status: 'occupied', guests: 2, orderTotal: 85.00, timeSeated: 20, serverName: 'Carlos' },
  { id: '4', number: 4, capacity: 6, status: 'reserved' },
  { id: '5', number: 5, capacity: 4, status: 'occupied', guests: 4, orderTotal: 210.00, timeSeated: 35, serverName: 'María' },
  { id: '6', number: 6, capacity: 8, status: 'available' },
  { id: '7', number: 7, capacity: 4, status: 'cleaning' },
  { id: '8', number: 8, capacity: 2, status: 'occupied', guests: 2, orderTotal: 95.00, timeSeated: 15, serverName: 'Ana' },
  { id: '9', number: 9, capacity: 6, status: 'available' },
  { id: '10', number: 10, capacity: 4, status: 'occupied', guests: 3, orderTotal: 145.00, timeSeated: 55, serverName: 'Carlos' },
  { id: '11', number: 11, capacity: 6, status: 'reserved' },
  { id: '12', number: 12, capacity: 8, status: 'occupied', guests: 6, orderTotal: 380.00, timeSeated: 40, serverName: 'Ana' },
  { id: '13', number: 13, capacity: 4, status: 'available' },
  { id: '14', number: 14, capacity: 2, status: 'available' },
  { id: '15', number: 15, capacity: 4, status: 'occupied', guests: 4, orderTotal: 195.00, timeSeated: 25, serverName: 'María' },
  { id: '16', number: 16, capacity: 6, status: 'available' },
  { id: '17', number: 17, capacity: 4, status: 'cleaning' },
  { id: '18', number: 18, capacity: 8, status: 'available' },
  { id: '19', number: 19, capacity: 4, status: 'available' },
  { id: '20', number: 20, capacity: 6, status: 'available' },
];

// ============================================
// TABLE CARD COMPONENT
// ============================================
interface TableCardProps {
  table: Table;
  t: typeof translations.en;
  onStatusChange: (tableId: string, newStatus: Table['status']) => void;
  onEdit: (table: Table) => void;
  onDelete: (table: Table) => void;
}

function TableCard({ table, t, onStatusChange, onEdit, onDelete }: TableCardProps) {
  const statusConfig = {
    available: {
      color: 'border-green-500 bg-green-50 dark:bg-green-950/20',
      badge: 'bg-green-500',
      icon: CheckCircle2,
    },
    occupied: {
      color: 'border-red-500 bg-red-50 dark:bg-red-950/20',
      badge: 'bg-red-500',
      icon: Users,
    },
    reserved: {
      color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
      badge: 'bg-blue-500',
      icon: Clock,
    },
    cleaning: {
      color: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
      badge: 'bg-yellow-500',
      icon: Timer,
    },
  };

  const config = statusConfig[table.status];
  const StatusIcon = config.icon;

  const formatCurrency = (amount: number) =>
    `TT$${amount.toLocaleString('en-TT', { minimumFractionDigits: 2 })}`;

  return (
    <Card className={`${config.color} border-2`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#EF4444] text-white flex items-center justify-center font-bold text-xl">
              {table.number}
            </div>
            <div>
              <CardTitle className="text-lg">{t.tables} {table.number}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-3 h-3" />
                {table.capacity} {t.guests}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(table)}>
                <Edit className="w-4 h-4 mr-2" />
                {t.editTable}
              </DropdownMenuItem>
              {table.status === 'available' && (
                <DropdownMenuItem onClick={() => onStatusChange(table.id, 'occupied')}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t.assignTable}
                </DropdownMenuItem>
              )}
              {table.status === 'occupied' && (
                <DropdownMenuItem onClick={() => onStatusChange(table.id, 'cleaning')}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t.clearTable}
                </DropdownMenuItem>
              )}
              {table.status === 'available' && (
                <DropdownMenuItem onClick={() => onStatusChange(table.id, 'reserved')}>
                  <Clock className="w-4 h-4 mr-2" />
                  {t.reserveTable}
                </DropdownMenuItem>
              )}
              {table.status === 'cleaning' && (
                <DropdownMenuItem onClick={() => onStatusChange(table.id, 'available')}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t.available}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(table)} className="text-red-500">
                <Trash2 className="w-4 h-4 mr-2" />
                {t.deleteTable}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Badge className={config.badge}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {t[table.status]}
        </Badge>

        {table.status === 'occupied' && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.guests}:</span>
              <span className="font-medium">{table.guests}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.currentOrder}:</span>
              <span className="font-bold text-[#EF4444]">
                {table.orderTotal ? formatCurrency(table.orderTotal) : t.noOrder}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.timeSeated}:</span>
              <span className="font-medium">{table.timeSeated} {t.minutes}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Server:</span>
              <span className="font-medium">{table.serverName}</span>
            </div>
          </>
        )}

        {table.status === 'reserved' && (
          <div className="text-sm text-muted-foreground">
            <Clock className="w-3 h-3 inline mr-1" />
            {language === 'en' ? 'Reserved for tonight' : 'Reservada para esta noche'}
          </div>
        )}

        {table.status === 'cleaning' && (
          <div className="text-sm text-muted-foreground">
            <Timer className="w-3 h-3 inline mr-1" />
            {language === 'en' ? 'Being cleaned' : 'Siendo limpiada'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Workaround for language in TableCard
const language = 'es';

// ============================================
// MAIN TABLES COMPONENT
// ============================================
export function RestaurantTables() {
  const { language } = useTheme();
  const t = translations[language];

  const [tables, setTables] = useState<Table[]>(initialTables);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({ number: '', capacity: '4' });

  // Stats
  const stats = {
    available: tables.filter((t) => t.status === 'available').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
    cleaning: tables.filter((t) => t.status === 'cleaning').length,
  };

  // Handle status change
  const handleStatusChange = useCallback((tableId: string, newStatus: Table['status']) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId ? { ...table, status: newStatus } : table
      )
    );
    toast.success(language === 'en' ? 'Table status updated' : 'Estado de mesa actualizado');
  }, [language]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({ number: '', capacity: '4' });
    setSelectedTable(null);
  }, []);

  // Add table
  const handleAddTable = useCallback(() => {
    if (!formData.number) {
      toast.error(language === 'en' ? 'Please enter a table number' : 'Por favor ingrese un número de mesa');
      return;
    }

    const newTable: Table = {
      id: `table-${Date.now()}`,
      number: parseInt(formData.number),
      capacity: parseInt(formData.capacity),
      status: 'available',
    };

    setTables((prev) => [...prev, newTable]);
    setShowAddDialog(false);
    resetForm();
    toast.success(t.tableAdded);
  }, [formData, language, t.tableAdded, resetForm]);

  // Edit table
  const handleEditTable = useCallback(() => {
    if (!selectedTable || !formData.number) return;

    setTables((prev) =>
      prev.map((table) =>
        table.id === selectedTable.id
          ? { ...table, number: parseInt(formData.number), capacity: parseInt(formData.capacity) }
          : table
      )
    );
    setShowEditDialog(false);
    resetForm();
    toast.success(t.tableUpdated);
  }, [selectedTable, formData, t.tableUpdated, resetForm]);

  // Delete table
  const handleDeleteTable = useCallback(() => {
    if (!selectedTable) return;
    setTables((prev) => prev.filter((table) => table.id !== selectedTable.id));
    setShowDeleteDialog(false);
    setSelectedTable(null);
    toast.success(t.tableDeleted);
  }, [selectedTable, t.tableDeleted]);

  // Open edit dialog
  const openEditDialog = (table: Table) => {
    setSelectedTable(table);
    setFormData({ number: table.number.toString(), capacity: table.capacity.toString() });
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">{t.available}</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.available}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">{t.occupied}</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.occupied}</p>
              </div>
              <Users className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">{t.reserved}</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.reserved}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">{t.cleaning}</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.cleaning}</p>
              </div>
              <Timer className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#EF4444]/10 border-[#EF4444]/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#EF4444]">Total</p>
                <p className="text-2xl font-bold text-[#EF4444]">{tables.length}</p>
              </div>
              <LayoutGrid className="h-8 w-8 text-[#EF4444]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t.tables}</h2>
        <Button onClick={() => setShowAddDialog(true)} className="bg-[#EF4444] hover:bg-red-600">
          <Plus className="w-4 h-4 mr-2" />
          {t.addTable}
        </Button>
      </div>

      {/* Tables Grid */}
      <ScrollArea className="h-[calc(100vh-24rem)]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables
            .sort((a, b) => a.number - b.number)
            .map((table) => (
              <TableCard
                key={table.id}
                table={table}
                t={t}
                onStatusChange={handleStatusChange}
                onEdit={openEditDialog}
                onDelete={(t) => {
                  setSelectedTable(t);
                  setShowDeleteDialog(true);
                }}
              />
            ))}
        </div>
      </ScrollArea>

      {/* Add Table Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#EF4444]" />
              {t.addTable}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="number">{t.tableNumber} *</Label>
              <Input
                id="number"
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">{t.tableCapacity} *</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
              {t.cancel}
            </Button>
            <Button className="bg-[#EF4444] hover:bg-red-600" onClick={handleAddTable}>
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-[#EF4444]" />
              {t.editTable}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-number">{t.tableNumber} *</Label>
              <Input
                id="edit-number"
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">{t.tableCapacity} *</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
              {t.cancel}
            </Button>
            <Button className="bg-[#EF4444] hover:bg-red-600" onClick={handleEditTable}>
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-500">{t.deleteTable}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">{t.confirmDelete}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDeleteTable}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t.deleteTable}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
