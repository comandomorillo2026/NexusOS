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
  Users,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Customer {
  id: string;
  customerNumber: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  customerType: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  createdAt: string;
  _count?: {
    orders: number;
  };
}

export function BakeryCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
    customerType: "regular",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      let url = "/api/bakery/customers?";
      if (search) {
        url += `search=${search}&`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    try {
      const response = await fetch("/api/bakery/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddModal(false);
        fetchCustomers();
        resetForm();
      }
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      notes: "",
      customerType: "regular",
    });
  };

  const formatCurrency = (amount: number) => {
    return `TT$${amount.toLocaleString("en-TT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getCustomerTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      regular: "bg-gray-100 text-gray-700",
      wholesale: "bg-blue-100 text-blue-700",
      vip: "bg-purple-100 text-purple-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const getCustomerTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      regular: "Regular",
      wholesale: "Mayorista",
      vip: "VIP",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          <p className="text-gray-500">Directorio de clientes</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[#F97316] hover:bg-[#EA580C]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchCustomers()}
              placeholder="Buscar por nombre, telefono o email..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316]" />
        </div>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Users className="h-12 w-12 mb-4 text-gray-300" />
            <p>No se encontraron clientes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <Card
              key={customer.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedCustomer(customer)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-[#F97316] font-bold text-lg">
                      {customer.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold">{customer.fullName}</p>
                      <p className="text-sm text-gray-500">
                        {customer.customerNumber}
                      </p>
                    </div>
                  </div>
                  <Badge className={getCustomerTypeColor(customer.customerType)}>
                    {getCustomerTypeLabel(customer.customerType)}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#F97316]">
                      {customer._count?.orders || 0}
                    </p>
                    <p className="text-xs text-gray-500">Pedidos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                    <p className="text-xs text-gray-500">Total gastado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">Nombre Completo *</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Telefono *</label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+1 868 XXX-XXXX"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Direccion</label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Direccion"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ciudad</label>
                <Input
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Ciudad"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo de Cliente</label>
                <select
                  value={formData.customerType}
                  onChange={(e) =>
                    setFormData({ ...formData, customerType: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="regular">Regular</option>
                  <option value="wholesale">Mayorista</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Notas</label>
                <Input
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Notas adicionales"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddCustomer}
              className="bg-[#F97316] hover:bg-[#EA580C]"
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Detail Modal */}
      <Dialog
        open={!!selectedCustomer}
        onOpenChange={() => setSelectedCustomer(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalle del Cliente</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-[#F97316] font-bold text-xl">
                  {selectedCustomer.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-xl font-semibold">
                    {selectedCustomer.fullName}
                  </p>
                  <p className="text-gray-500">
                    {selectedCustomer.customerNumber}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Telefono</p>
                  <p className="font-medium">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">
                    {selectedCustomer.email || "-"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Direccion</p>
                  <p className="font-medium">
                    {selectedCustomer.address || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <Badge
                    className={getCustomerTypeColor(
                      selectedCustomer.customerType
                    )}
                  >
                    {getCustomerTypeLabel(selectedCustomer.customerType)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cliente desde</p>
                  <p className="font-medium">
                    {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-[#F97316]">
                      {selectedCustomer._count?.orders || 0}
                    </p>
                    <p className="text-sm text-gray-500">Total Pedidos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(selectedCustomer.totalSpent)}
                    </p>
                    <p className="text-sm text-gray-500">Total Gastado</p>
                  </CardContent>
                </Card>
              </div>

              {selectedCustomer.notes && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-700">Notas:</p>
                  <p className="text-sm text-yellow-600">
                    {selectedCustomer.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
