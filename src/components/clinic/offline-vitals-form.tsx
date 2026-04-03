'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Heart, Activity, Thermometer, Scale, Ruler, 
  Save, RefreshCw, AlertCircle, CheckCircle, 
  Mic, Calculator, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ClinicDB, STORES, type OfflineRecord } from '@/lib/offline/db';
import { syncManager, saveOfflineAndSync } from '@/lib/offline/sync';

// Types
interface VitalsRecord extends OfflineRecord {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  
  // Blood Pressure
  systolicBP?: number;
  diastolicBP?: number;
  bpUnit: 'mmHg';
  
  // Heart Rate
  heartRate?: number;
  heartRateUnit: 'bpm';
  
  // Temperature
  temperature?: number;
  temperatureUnit: '°C' | '°F';
  
  // Weight
  weight?: number;
  weightUnit: 'kg' | 'lbs';
  
  // Height
  height?: number;
  heightUnit: 'cm' | 'in';
  
  // BMI (calculated)
  bmi?: number;
  
  // Respiratory Rate
  respiratoryRate?: number;
  respiratoryRateUnit: 'br/min';
  
  // Oxygen Saturation
  oxygenSaturation?: number;
  oxygenSaturationUnit: '%';
  
  // Notes
  notes?: string;
  
  // Sync status
  _synced?: boolean;
}

interface OfflineVitalsFormProps {
  patient?: {id: string; name: string} | null;
  onSave?: () => void;
  compact?: boolean;
}

// Normal ranges for alerts
const NORMAL_RANGES = {
  systolicBP: { min: 90, max: 140, label: 'Presión Sistólica' },
  diastolicBP: { min: 60, max: 90, label: 'Presión Diastólica' },
  heartRate: { min: 60, max: 100, label: 'Frecuencia Cardíaca' },
  temperature: { min: 36.0, max: 37.5, label: 'Temperatura' },
  respiratoryRate: { min: 12, max: 20, label: 'Frecuencia Respiratoria' },
  oxygenSaturation: { min: 95, max: 100, label: 'Saturación de Oxígeno' },
  bmi: { min: 18.5, max: 24.9, label: 'IMC' },
};

export function OfflineVitalsForm({ patient, onSave, compact = false }: OfflineVitalsFormProps) {
  // State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<VitalsRecord>>({
    patientId: patient?.id || '',
    patientName: patient?.name || '',
    bpUnit: 'mmHg',
    heartRateUnit: 'bpm',
    temperatureUnit: '°C',
    weightUnit: 'kg',
    heightUnit: 'cm',
    respiratoryRateUnit: 'br/min',
    oxygenSaturationUnit: '%',
  });

  // Update form when patient changes
  useEffect(() => {
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patientId: patient.id,
        patientName: patient.name,
      }));
    }
  }, [patient]);

  // Listen for online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Calculate BMI
  const calculateBMI = useCallback(() => {
    const weight = formData.weight;
    let height = formData.height;
    
    if (!weight || !height) return null;
    
    // Convert height to meters if needed
    if (formData.heightUnit === 'cm') {
      height = height / 100;
    } else if (formData.heightUnit === 'in') {
      height = height * 0.0254; // inches to meters
    }
    
    // Convert weight to kg if needed
    let weightKg = weight;
    if (formData.weightUnit === 'lbs') {
      weightKg = weight * 0.453592;
    }
    
    const bmi = weightKg / (height * height);
    return Math.round(bmi * 10) / 10;
  }, [formData.weight, formData.height, formData.weightUnit, formData.heightUnit]);

  // Update BMI when weight/height changes
  useEffect(() => {
    const bmi = calculateBMI();
    if (bmi) {
      setFormData(prev => ({ ...prev, bmi }));
    }
  }, [calculateBMI]);

  // Check if value is abnormal
  const isAbnormal = (field: string, value?: number): boolean => {
    if (value === undefined || value === null) return false;
    const range = NORMAL_RANGES[field as keyof typeof NORMAL_RANGES];
    if (!range) return false;
    return value < range.min || value > range.max;
  };

  // Get status for a field
  const getFieldStatus = (field: string, value?: number): 'normal' | 'high' | 'low' | 'none' => {
    if (value === undefined || value === null) return 'none';
    const range = NORMAL_RANGES[field as keyof typeof NORMAL_RANGES];
    if (!range) return 'none';
    if (value < range.min) return 'low';
    if (value > range.max) return 'high';
    return 'normal';
  };

  // Handle input change
  const handleChange = (field: keyof VitalsRecord, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
    setError(null);
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.patientId) {
      setError('Seleccione un paciente');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const vitalsRecord: VitalsRecord = {
        id: `vitals-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        patientId: formData.patientId,
        patientName: formData.patientName || '',
        timestamp: new Date().toISOString(),
        systolicBP: formData.systolicBP,
        diastolicBP: formData.diastolicBP,
        bpUnit: 'mmHg',
        heartRate: formData.heartRate,
        heartRateUnit: 'bpm',
        temperature: formData.temperature,
        temperatureUnit: formData.temperatureUnit || '°C',
        weight: formData.weight,
        weightUnit: formData.weightUnit || 'kg',
        height: formData.height,
        heightUnit: formData.heightUnit || 'cm',
        bmi: calculateBMI() || undefined,
        respiratoryRate: formData.respiratoryRate,
        respiratoryRateUnit: 'br/min',
        oxygenSaturation: formData.oxygenSaturation,
        oxygenSaturationUnit: '%',
        notes: formData.notes,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString(),
        _synced: false,
      };

      // Save to IndexedDB
      await ClinicDB.saveVitals(vitalsRecord);

      // If online, try to sync
      if (isOnline) {
        try {
          const response = await fetch('/api/clinic/mobile/vitals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vitalsRecord),
          });
          
          if (response.ok) {
            vitalsRecord._synced = true;
            await ClinicDB.saveVitals(vitalsRecord);
          } else {
            // Queue for sync
            await syncManager.addToQueue(
              '/api/clinic/mobile/vitals',
              'POST',
              STORES.CLINIC_VITALS,
              vitalsRecord.id,
              vitalsRecord
            );
          }
        } catch {
          // Queue for sync
          await syncManager.addToQueue(
            '/api/clinic/mobile/vitals',
            'POST',
            STORES.CLINIC_VITALS,
            vitalsRecord.id,
            vitalsRecord
          );
        }
      } else {
        // Queue for sync
        await syncManager.addToQueue(
          '/api/clinic/mobile/vitals',
          'POST',
          STORES.CLINIC_VITALS,
          vitalsRecord.id,
          vitalsRecord
        );
      }

      setSaved(true);
      
      // Reset form
      setFormData({
        patientId: patient?.id || '',
        patientName: patient?.name || '',
        bpUnit: 'mmHg',
        heartRateUnit: 'bpm',
        temperatureUnit: '°C',
        weightUnit: 'kg',
        heightUnit: 'cm',
        respiratoryRateUnit: 'br/min',
        oxygenSaturationUnit: '%',
      });

      // Callback
      onSave?.();

      // Reset saved state after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving vitals:', err);
      setError('Error al guardar. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  // Voice input handler (simulated - would use Web Speech API in production)
  const startVoiceInput = () => {
    setIsListening(true);
    // In production, would use:
    // const recognition = new webkitSpeechRecognition();
    // recognition.start();
    setTimeout(() => setIsListening(false), 2000);
  };

  // Field wrapper component
  const VitalField = ({ 
    label, 
    field, 
    value, 
    unit, 
    icon, 
    placeholder,
    type = 'number'
  }: { 
    label: string;
    field: keyof VitalsRecord;
    value?: number | string;
    unit?: string;
    icon: React.ReactNode;
    placeholder?: string;
    type?: 'number' | 'text';
  }) => {
    const status = typeof value === 'number' ? getFieldStatus(field, value) : 'none';
    
    return (
      <div className="space-y-2">
        <Label className="text-sm text-gray-400 flex items-center gap-2">
          {icon}
          {label}
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={type}
              value={value || ''}
              onChange={(e) => handleChange(field, type === 'number' ? parseFloat(e.target.value) || '' : e.target.value)}
              placeholder={placeholder}
              className={`bg-white/5 border-white/10 text-white h-12 text-lg ${
                status === 'high' ? 'border-red-500/50 bg-red-500/10' :
                status === 'low' ? 'border-amber-500/50 bg-amber-500/10' :
                status === 'normal' ? 'border-emerald-500/50' : ''
              }`}
            />
            {status !== 'none' && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {status === 'normal' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className={`w-5 h-5 ${status === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
                )}
              </div>
            )}
          </div>
          {unit && (
            <div className="w-16 flex items-center justify-center text-gray-400 text-sm bg-white/5 rounded-lg border border-white/10">
              {unit}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Patient Info */}
      {patient && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold">
            {patient.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-white">{patient.name}</p>
            <p className="text-sm text-gray-400">ID: {patient.id}</p>
          </div>
        </div>
      )}

      {/* Offline Warning */}
      {!isOnline && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <p className="text-sm text-amber-400">
            Modo offline. Los datos se guardarán localmente.
          </p>
        </div>
      )}

      {/* Success Message */}
      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <p className="text-sm text-emerald-400">
            ¡Vitales guardados correctamente!
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Main Vitals */}
      <div className="grid grid-cols-2 gap-4">
        {/* Blood Pressure - Systolic */}
        <VitalField
          label="P. Sistólica"
          field="systolicBP"
          value={formData.systolicBP}
          unit="mmHg"
          icon={<Activity className="w-4 h-4 text-red-400" />}
          placeholder="120"
        />

        {/* Blood Pressure - Diastolic */}
        <VitalField
          label="P. Diastólica"
          field="diastolicBP"
          value={formData.diastolicBP}
          unit="mmHg"
          icon={<Activity className="w-4 h-4 text-red-400" />}
          placeholder="80"
        />
      </div>

      {/* Heart Rate & Temperature */}
      <div className="grid grid-cols-2 gap-4">
        <VitalField
          label="Frec. Cardíaca"
          field="heartRate"
          value={formData.heartRate}
          unit="bpm"
          icon={<Heart className="w-4 h-4 text-rose-400" />}
          placeholder="72"
        />

        <div className="space-y-2">
          <Label className="text-sm text-gray-400 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-orange-400" />
            Temperatura
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                step="0.1"
                value={formData.temperature || ''}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value) || '')}
                placeholder="36.5"
                className={`bg-white/5 border-white/10 text-white h-12 text-lg ${
                  isAbnormal('temperature', formData.temperature) ? 'border-amber-500/50' : ''
                }`}
              />
            </div>
            <Select
              value={formData.temperatureUnit}
              onValueChange={(v) => handleChange('temperatureUnit', v)}
            >
              <SelectTrigger className="w-16 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0820] border-white/10">
                <SelectItem value="°C">°C</SelectItem>
                <SelectItem value="°F">°F</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Weight & Height */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-gray-400 flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-400" />
            Peso
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.1"
              value={formData.weight || ''}
              onChange={(e) => handleChange('weight', parseFloat(e.target.value) || '')}
              placeholder="70"
              className="bg-white/5 border-white/10 text-white h-12 text-lg flex-1"
            />
            <Select
              value={formData.weightUnit}
              onValueChange={(v) => handleChange('weightUnit', v)}
            >
              <SelectTrigger className="w-16 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0820] border-white/10">
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lbs">lbs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-400 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-emerald-400" />
            Altura
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={formData.height || ''}
              onChange={(e) => handleChange('height', parseFloat(e.target.value) || '')}
              placeholder="170"
              className="bg-white/5 border-white/10 text-white h-12 text-lg flex-1"
            />
            <Select
              value={formData.heightUnit}
              onValueChange={(v) => handleChange('heightUnit', v)}
            >
              <SelectTrigger className="w-16 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0820] border-white/10">
                <SelectItem value="cm">cm</SelectItem>
                <SelectItem value="in">in</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* BMI Display */}
      {formData.bmi && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-violet-400" />
            <span className="text-gray-400">IMC Calculado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">{formData.bmi}</span>
            <Badge className={
              formData.bmi < 18.5 ? 'bg-amber-500/20 text-amber-400' :
              formData.bmi < 25 ? 'bg-emerald-500/20 text-emerald-400' :
              formData.bmi < 30 ? 'bg-amber-500/20 text-amber-400' :
              'bg-red-500/20 text-red-400'
            }>
              {formData.bmi < 18.5 ? 'Bajo peso' :
               formData.bmi < 25 ? 'Normal' :
               formData.bmi < 30 ? 'Sobrepeso' : 'Obesidad'}
            </Badge>
          </div>
        </div>
      )}

      {/* Advanced Vitals (collapsible) */}
      {!compact && (
        <>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400"
          >
            <span>Signos Adicionales</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-2 gap-4">
              <VitalField
                label="Frec. Respiratoria"
                field="respiratoryRate"
                value={formData.respiratoryRate}
                unit="br/min"
                icon={<Activity className="w-4 h-4 text-cyan-400" />}
                placeholder="16"
              />

              <VitalField
                label="Sat. Oxígeno"
                field="oxygenSaturation"
                value={formData.oxygenSaturation}
                unit="%"
                icon={<Activity className="w-4 h-4 text-sky-400" />}
                placeholder="98"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-400 flex items-center gap-2">
              Notas
            </Label>
            <div className="relative">
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Observaciones adicionales..."
                className="bg-white/5 border-white/10 text-white min-h-[80px] pr-12"
              />
              <button
                onClick={startVoiceInput}
                className={`absolute right-2 bottom-2 p-2 rounded-lg ${
                  isListening ? 'bg-red-500 animate-pulse' : 'bg-violet-500'
                } text-white`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-14 text-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl touch-manipulation"
      >
        {saving ? (
          <>
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            Guardar Vitales
          </>
        )}
      </Button>

      {/* Quick Reference */}
      {!compact && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Valores Normales de Referencia</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Presión Arterial:</span>
              <span className="text-white">90/60 - 140/90 mmHg</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Frec. Cardíaca:</span>
              <span className="text-white">60 - 100 bpm</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Temperatura:</span>
              <span className="text-white">36.0 - 37.5 °C</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Sat. Oxígeno:</span>
              <span className="text-white">95 - 100%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfflineVitalsForm;
