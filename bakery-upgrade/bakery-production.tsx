"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChefHat,
  Calendar,
  Clock,
  Plus,
  CheckCircle,
  AlertTriangle,
  Package,
} from "lucide-react";

interface ProductionItem {
  id: string;
  productName: string;
  plannedQuantity: number;
  producedQuantity: number;
  status: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

const mockProductionItems: ProductionItem[] = [
  {
    id: "1",
    productName: "Pan Frances",
    plannedQuantity: 100,
    producedQuantity: 100,
    status: "completed",
    startTime: "04:00",
    endTime: "06:30",
  },
  {
    id: "2",
    productName: "Pan de Agua",
    plannedQuantity: 50,
    producedQuantity: 50,
    status: "completed",
    startTime: "04:30",
    endTime: "06:00",
  },
  {
    id: "3",
    productName: "Pan Dulce",
    plannedQuantity: 80,
    producedQuantity: 40,
    status: "in_progress",
    startTime: "05:00",
  },
  {
    id: "4",
    productName: "Quesillo",
    plannedQuantity: 30,
    producedQuantity: 0,
    status: "pending",
  },
  {
    id: "5",
    productName: "Pastelitos de Carne",
    plannedQuantity: 60,
    producedQuantity: 0,
    status: "pending",
  },
];

export function BakeryProduction() {
  const [productionItems, setProductionItems] = useState(mockProductionItems);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      in_progress: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      delayed: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      in_progress: "En Proceso",
      completed: "Completado",
      delayed: "Retrasado",
    };
    return labels[status] || status;
  };

  const getProgressPercentage = (item: ProductionItem) => {
    if (item.plannedQuantity === 0) return 0;
    return (item.producedQuantity / item.plannedQuantity) * 100;
  };

  const totalPlanned = productionItems.reduce(
    (sum, item) => sum + item.plannedQuantity,
    0
  );
  const totalProduced = productionItems.reduce(
    (sum, item) => sum + item.producedQuantity,
    0
  );
  const overallProgress =
    totalPlanned > 0 ? (totalProduced / totalPlanned) * 100 : 0;

  const completedItems = productionItems.filter(
    (item) => item.status === "completed"
  ).length;
  const inProgressItems = productionItems.filter(
    (item) => item.status === "in_progress"
  ).length;
  const pendingItems = productionItems.filter(
    (item) => item.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Produccion</h2>
          <p className="text-gray-500">Planificacion y seguimiento de horneados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </Button>
          <Button className="bg-[#F97316] hover:bg-[#EA580C]">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Orden
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ChefHat className="h-5 w-5 text-[#F97316]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Progreso General</p>
                <p className="text-2xl font-bold">{overallProgress.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completados</p>
                <p className="text-2xl font-bold">{completedItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">En Proceso</p>
                <p className="text-2xl font-bold">{inProgressItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold">{pendingItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Date Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#F97316]" />
              <div>
                <p className="font-semibold">Produccion de Hoy</p>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Produccion</p>
              <p className="text-lg font-bold text-[#F97316]">
                {totalProduced} / {totalPlanned} unidades
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Items */}
      <div className="space-y-4">
        {productionItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Package className="h-6 w-6 text-[#F97316]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{item.productName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {item.startTime && (
                        <span>
                          Inicio: {item.startTime}
                          {item.endTime && ` - Fin: ${item.endTime}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {getStatusLabel(item.status)}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Progreso: {item.producedQuantity} / {item.plannedQuantity}{" "}
                    unidades
                  </span>
                  <span className="font-medium">
                    {getProgressPercentage(item).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      item.status === "completed"
                        ? "bg-green-500"
                        : item.status === "in_progress"
                        ? "bg-blue-500"
                        : "bg-yellow-500"
                    }`}
                    style={{ width: `${getProgressPercentage(item)}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {item.status === "pending" && (
                  <Button
                    size="sm"
                    className="bg-[#F97316] hover:bg-[#EA580C]"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Iniciar
                  </Button>
                )}
                {item.status === "in_progress" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Lote
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Oven Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#F97316]" />
            Horario de Hornos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Horno 1", "Horno 2", "Horno 3"].map((oven, index) => (
              <div
                key={oven}
                className="p-4 border rounded-lg bg-gray-50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{oven}</span>
                  <Badge
                    className={
                      index === 0
                        ? "bg-red-100 text-red-700"
                        : index === 1
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }
                  >
                    {index === 0 ? "En uso" : index === 1 ? "Enfriando" : "Disponible"}
                  </Badge>
                </div>
                {index === 0 && (
                  <p className="text-sm text-gray-600">
                    Pan Dulce - 40 unidades
                  </p>
                )}
                {index === 1 && (
                  <p className="text-sm text-gray-600">
                    Disponible en 15 min
                  </p>
                )}
                {index === 2 && (
                  <p className="text-sm text-gray-600">
                    Listo para usar
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
