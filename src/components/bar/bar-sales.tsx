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
  Search,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  Receipt,
  Clock,
  Users,
} from "lucide-react";
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
    title: "Sales",
    subtitle: "Track your bar sales",
    searchPlaceholder: "Search transactions...",
    allPaymentMethods: "All payment methods",
    today: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    transaction: "Transaction",
    customer: "Customer",
    items: "Items",
    total: "Total",
    paymentMethod: "Payment",
    date: "Date",
    status: "Status",
    actions: "Actions",
    view: "View",
    export: "Export",
    salesSummary: "Sales Summary",
    totalSales: "Total Sales",
    totalTransactions: "Transactions",
    averageTicket: "Avg. Ticket",
    completed: "Completed",
    pending: "Pending",
    refunded: "Refunded",
    cash: "Cash",
    card: "Card",
    transfer: "Transfer",
    noTransactions: "No transactions found",
  },
  es: {
    title: "Ventas",
    subtitle: "Controla las ventas de tu bar",
    searchPlaceholder: "Buscar transacciones...",
    allPaymentMethods: "Todos los metodos",
    today: "Hoy",
    thisWeek: "Esta Semana",
    thisMonth: "Este Mes",
    transaction: "Transaccion",
    customer: "Cliente",
    items: "Items",
    total: "Total",
    paymentMethod: "Pago",
    date: "Fecha",
    status: "Estado",
    actions: "Acciones",
    view: "Ver",
    export: "Exportar",
    salesSummary: "Resumen de Ventas",
    totalSales: "Ventas Totales",
    totalTransactions: "Transacciones",
    averageTicket: "Ticket Promedio",
    completed: "Completada",
    pending: "Pendiente",
    refunded: "Reembolsada",
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transfer",
    noTransactions: "No se encontraron transacciones",
  },
};

// ============================================
// INTERFACES
// ============================================
interface Sale {
  id: string;
  transactionNumber: string;
  customerName: string;
  items: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  status: 'completed' | 'pending' | 'refunded';
  createdAt: string;
}

// ============================================
// DEMO DATA
// ============================================
const DEMO_SALES: Sale[] = [
  { id: '1', transactionNumber: 'TXN-2024-001', customerName: 'Maria Garcia', items: 4, total: 1850, paymentMethod: 'card', status: 'completed', createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: '2', transactionNumber: 'TXN-2024-002', customerName: 'Carlos Rodriguez', items: 6, total: 2450, paymentMethod: 'cash', status: 'completed', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: '3', transactionNumber: 'TXN-2024-003', customerName: 'Ana Martinez', items: 3, total: 980, paymentMethod: 'card', status: 'completed', createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  { id: '4', transactionNumber: 'TXN-2024-004', customerName: 'Luis Fernandez', items: 8, total: 4200, paymentMethod: 'transfer', status: 'completed', createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: '5', transactionNumber: 'TXN-2024-005', customerName: 'Walk-in Customer', items: 2, total: 560, paymentMethod: 'cash', status: 'completed', createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString() },
  { id: '6', transactionNumber: 'TXN-2024-006', customerName: 'Pedro Sanchez', items: 5, total: 1875, paymentMethod: 'card', status: 'pending', createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
  { id: '7', transactionNumber: 'TXN-2024-007', customerName: 'Sofia Reyes', items: 7, total: 3150, paymentMethod: 'card', status: 'completed', createdAt: new Date(Date.now() - 1000 * 60 * 210).toISOString() },
  { id: '8', transactionNumber: 'TXN-2024-008', customerName: 'Juan Perez', items: 3, total: 1100, paymentMethod: 'cash', status: 'refunded', createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
  { id: '9', transactionNumber: 'TXN-2024-009', customerName: 'Carmen Diaz', items: 4, total: 1680, paymentMethod: 'transfer', status: 'completed', createdAt: new Date(Date.now() - 1000 * 60 * 270).toISOString() },
  { id: '10', transactionNumber: 'TXN-2024-010', customerName: 'Roberto Torres', items: 6, total: 2340, paymentMethod: 'card', status: 'completed', createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
];

// ============================================
// MAIN COMPONENT
// ============================================
export function BarSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const { language } = useTheme();
  
  const t = translations[language];

  const loadSales = () => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = [...DEMO_SALES];
      
      if (paymentFilter !== "all") {
        filtered = filtered.filter(s => s.paymentMethod === paymentFilter);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(s => 
          s.transactionNumber.toLowerCase().includes(searchLower) ||
          s.customerName.toLowerCase().includes(searchLower)
        );
      }
      
      setSales(filtered);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    loadSales();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentFilter, dateFilter, search]);

  const formatCurrency = (amount: number) => {
    return `RD$${amount.toLocaleString("es-DO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'transfer': return <Receipt className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'refunded': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return t.completed;
      case 'pending': return t.pending;
      case 'refunded': return t.refunded;
      default: return status;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'cash': return t.cash;
      case 'card': return t.card;
      case 'transfer': return t.transfer;
      default: return method;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-DO' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate summary metrics
  const totalSales = sales.filter(s => s.status !== 'refunded').reduce((sum, s) => sum + s.total, 0);
  const totalTransactions = sales.length;
  const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.totalSales}</p>
                <p className="text-2xl font-bold text-[#8B5CF6]">{formatCurrency(totalSales)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#8B5CF6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.totalTransactions}</p>
                <p className="text-2xl font-bold">{totalTransactions}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.averageTicket}</p>
                <p className="text-2xl font-bold">{formatCurrency(averageTicket)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
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
        <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
          <Download className="h-4 w-4 mr-2" />
          {t.export}
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
                placeholder={t.searchPlaceholder}
                className="pl-10"
              />
            </div>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t.paymentMethod} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allPaymentMethods}</SelectItem>
                <SelectItem value="cash">{t.cash}</SelectItem>
                <SelectItem value="card">{t.card}</SelectItem>
                <SelectItem value="transfer">{t.transfer}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t.date} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">{t.today}</SelectItem>
                <SelectItem value="week">{t.thisWeek}</SelectItem>
                <SelectItem value="month">{t.thisMonth}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]" />
            </div>
          ) : sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Receipt className="h-12 w-12 mb-4 opacity-50" />
              <p>{t.noTransactions}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.transaction}</TableHead>
                    <TableHead>{t.customer}</TableHead>
                    <TableHead className="text-center">{t.items}</TableHead>
                    <TableHead className="text-right">{t.total}</TableHead>
                    <TableHead>{t.paymentMethod}</TableHead>
                    <TableHead>{t.date}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead className="text-center">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-sm">
                        {sale.transactionNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Users className="h-4 w-4 text-[#8B5CF6]" />
                          </div>
                          <span>{sale.customerName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{sale.items}</TableCell>
                      <TableCell className="text-right font-bold text-[#8B5CF6]">
                        {formatCurrency(sale.total)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentIcon(sale.paymentMethod)}
                          <span>{getPaymentLabel(sale.paymentMethod)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(sale.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(sale.status)}>
                          {getStatusLabel(sale.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
