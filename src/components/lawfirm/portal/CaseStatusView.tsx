'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  ArrowRight,
  Scale,
  Building,
  User,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface CaseStatusViewProps {
  caseData: {
    caseNumber: string;
    title: string;
    status: string;
    stage: string;
    progress: number;
    practiceArea: string;
    court: string;
    judge: string;
    openDate: string;
    nextDeadline: string;
    nextDeadlineDesc: string;
    leadAttorneyName: string;
    description: string;
    timeline: Array<{
      id: string;
      date: string;
      title: string;
      description: string;
      status: 'completed' | 'current' | 'pending';
    }>;
  };
  language?: 'en' | 'es';
}

const translations = {
  en: {
    caseStatus: 'Case Status',
    caseDetails: 'Case Details',
    caseNumber: 'Case Number',
    practiceArea: 'Practice Area',
    court: 'Court',
    judge: 'Judge',
    attorney: 'Lead Attorney',
    openedOn: 'Opened On',
    nextDeadline: 'Next Deadline',
    progress: 'Progress',
    timeline: 'Case Timeline',
    completed: 'Completed',
    current: 'In Progress',
    pending: 'Pending',
    stages: {
      intake: 'Intake',
      investigation: 'Investigation',
      discovery: 'Discovery',
      negotiation: 'Negotiation',
      trial: 'Trial',
      appeal: 'Appeal',
      settlement: 'Settlement',
      closed: 'Closed',
    },
    statuses: {
      open: 'Open',
      in_progress: 'In Progress',
      pending: 'Pending',
      discovery: 'Discovery',
      negotiation: 'Negotiation',
      trial: 'Trial',
      closed: 'Closed',
      settled: 'Settled',
    },
  },
  es: {
    caseStatus: 'Estado del Caso',
    caseDetails: 'Detalles del Caso',
    caseNumber: 'Número de Caso',
    practiceArea: 'Área de Práctica',
    court: 'Tribunal',
    judge: 'Juez',
    attorney: 'Abogado Principal',
    openedOn: 'Fecha de Apertura',
    nextDeadline: 'Próximo Plazo',
    progress: 'Progreso',
    timeline: 'Línea de Tiempo',
    completed: 'Completado',
    current: 'En Progreso',
    pending: 'Pendiente',
    stages: {
      intake: 'Recepción',
      investigation: 'Investigación',
      discovery: 'Descubrimiento',
      negotiation: 'Negociación',
      trial: 'Juicio',
      appeal: 'Apelación',
      settlement: 'Acuerdo',
      closed: 'Cerrado',
    },
    statuses: {
      open: 'Abierto',
      in_progress: 'En Progreso',
      pending: 'Pendiente',
      discovery: 'Descubrimiento',
      negotiation: 'Negociación',
      trial: 'Juicio',
      closed: 'Cerrado',
      settled: 'Resuelto',
    },
  },
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700 border-blue-200',
    in_progress: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    discovery: 'bg-purple-100 text-purple-700 border-purple-200',
    negotiation: 'bg-orange-100 text-orange-700 border-orange-200',
    trial: 'bg-red-100 text-red-700 border-red-200',
    closed: 'bg-gray-100 text-gray-700 border-gray-200',
    settled: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export function CaseStatusView({ caseData, language = 'en' }: CaseStatusViewProps) {
  const t = translations[language];

  return (
    <div className="space-y-6">
      {/* Status Header Card */}
      <Card className="bg-gradient-to-br from-[#1E3A5F] to-[#2C4A6F] text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[#C4A35A] text-sm font-medium">{caseData.caseNumber}</p>
              <h2 className="text-xl font-bold mt-1">{caseData.title}</h2>
            </div>
            <Badge className={`${getStatusColor(caseData.status)} font-medium`}>
              {t.statuses[caseData.status as keyof typeof t.statuses] || caseData.status}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">{t.progress}</span>
              <span className="font-semibold text-[#C4A35A]">{caseData.progress}%</span>
            </div>
            <Progress value={caseData.progress} className="h-3 bg-white/20" />
          </div>

          {/* Current Stage */}
          {caseData.stage && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-[#C4A35A]/20 rounded-full">
              <Circle className="w-3 h-3 text-[#C4A35A] fill-current" />
              <span className="text-sm text-[#C4A35A] font-medium">
                {t.stages[caseData.stage as keyof typeof t.stages] || caseData.stage}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Case Details Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#1E3A5F]" />
            {t.caseDetails}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <FileText className="w-5 h-5 text-[#C4A35A] mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">{t.caseNumber}</p>
              <p className="font-medium">{caseData.caseNumber}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Scale className="w-5 h-5 text-[#C4A35A] mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">{t.practiceArea}</p>
              <p className="font-medium">{caseData.practiceArea}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Building className="w-5 h-5 text-[#C4A35A] mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">{t.court}</p>
              <p className="font-medium">{caseData.court || '-'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-[#C4A35A] mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">{t.attorney}</p>
              <p className="font-medium">{caseData.leadAttorneyName || '-'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-[#C4A35A] mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">{t.openedOn}</p>
              <p className="font-medium">{caseData.openDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-xs text-yellow-600">{t.nextDeadline}</p>
              <p className="font-medium text-yellow-700">{caseData.nextDeadline}</p>
              {caseData.nextDeadlineDesc && (
                <p className="text-xs text-yellow-600 mt-0.5">{caseData.nextDeadlineDesc}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1E3A5F]" />
            {t.timeline}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Timeline Items */}
            <div className="space-y-4">
              {caseData.timeline.map((item, index) => (
                <div key={item.id} className="relative flex gap-4">
                  {/* Status Icon */}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                    item.status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : item.status === 'current'
                      ? 'bg-[#C4A35A] text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : item.status === 'current' ? (
                      <ArrowRight className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-4 ${
                    index < caseData.timeline.length - 1 ? 'border-b border-gray-100' : ''
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`font-medium ${
                          item.status === 'current' ? 'text-[#1E3A5F]' : 'text-gray-700'
                        }`}>
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{item.date}</span>
                    </div>

                    {item.status === 'current' && (
                      <Badge variant="outline" className="mt-2 text-[#C4A35A] border-[#C4A35A]">
                        {t.current}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Case Description */}
      {caseData.description && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {language === 'en' ? 'Description' : 'Descripción'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 whitespace-pre-wrap">{caseData.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CaseStatusView;
