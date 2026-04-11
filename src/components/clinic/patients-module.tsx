'use client';

import React, { useState, useEffect } from 'react';
import { ClinicLayout } from './clinic-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  MoreVertical,
  User,
  Filter,
  Loader2
} from 'lucide-react';

interface Patient {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  lastVisit?: string;
  status: string;
}

export function PatientsModule() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    notes: '',
  });

  // Get tenant ID from localStorage
  const getTenantId = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('nexus_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.tenantId || 'demo-tenant';
      }
    }
    return 'demo-tenant';
  };

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const tenantId = getTenantId();
      const response = await fetch(`/api/clinic/patients?tenantId=${tenantId}`);
      const data = await response.json();
      
      if (data.success && data.patients) {
        setPatients(data.patients.map((p: any) => ({
          ...p,
          status: 'active',
          lastVisit: p.updatedAt?.split('T')[0] || 'N/A',
        })));
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Use demo data if API fails
      setPatients([
        { id: '1', patientNumber: 'PAT-001', firstName: 'María', lastName: 'González', fullName: 'María González', phone: '+1 868 555-0001', email: 'maria@email.com', lastVisit: '2026-03-20', status: 'active' },
        { id: '2', patientNumber: 'PAT-002', firstName: 'Carlos', lastName: 'Rodríguez', fullName: 'Carlos Rodríguez', phone: '+1 868 555-0002', email: 'carlos@email.com', lastVisit: '2026-03-19', status: 'active' },
        { id: '3', patientNumber: 'PAT-003', firstName: 'Ana', lastName: 'Martínez', fullName: 'Ana Martínez', phone: '+1 868 555-0003', email: 'ana@email.com', lastVisit: '2026-03-18', status: 'active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Create new patient
  const handleCreatePatient = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      alert('Por favor completa los campos requeridos: Nombre, Apellido y Teléfono');
      return;
    }

    try {
      setSaving(true);
      const tenantId = getTenantId();
      
      const response = await fetch('/api/clinic/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
          notes: formData.notes,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Add new patient to list
        setPatients(prev => [{
          ...data.patient,
          status: 'active',
          lastVisit: 'N/A',
        }, ...prev]);
        
        // Reset form and close modal
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          dateOfBirth: '',
          gender: '',
          address: '',
          notes: '',
        });
        setShowNewPatientForm(false);
      } else {
        alert(data.error || 'Error al crear paciente');
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Error al crear paciente');
    } finally {
      setSaving(false);
    }
  };

  // Load patients on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.patientNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ClinicLayout activeTab="patients">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Pacientes</h1>
          <p className="text-[var(--text-mid)] text-sm">Gestiona la información de tus pacientes</p>
        </div>
        <Button className="btn-gold" onClick={() => setShowNewPatientForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <Input
            placeholder="Buscar por nombre, teléfono o número de paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-[var(--text-mid)] text-xs">Total Pacientes</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-dm-mono)' }}>
            {patients.length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[var(--text-mid)] text-xs">Activos</p>
          <p className="text-2xl font-bold text-[var(--success)]" style={{ fontFamily: 'var(--font-dm-mono)' }}>
            {patients.filter(p => p.status === 'active').length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[var(--text-mid)] text-xs">Nuevos este mes</p>
          <p className="text-2xl font-bold text-[var(--nexus-aqua)]" style={{ fontFamily: 'var(--font-dm-mono)' }}>
            {patients.filter(p => {
              const created = new Date(p.id.split('_')[1] || Date.now());
              const now = new Date();
              return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length || patients.length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[var(--text-mid)] text-xs">Visitas este mes</p>
          <p className="text-2xl font-bold text-[var(--nexus-gold)]" style={{ fontFamily: 'var(--font-dm-mono)' }}>
            48
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--nexus-gold)]" />
          <span className="ml-3 text-[var(--text-mid)]">Cargando pacientes...</span>
        </div>
      )}

      {/* Patients Table/Cards */}
      {!loading && (
        <div className="glass-card overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--glass-border)]">
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-mid)]">Paciente</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-mid)]">Contacto</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-mid)]">Nº Paciente</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-mid)]">Última Visita</th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-mid)]">Estado</th>
                  <th className="text-right p-4 text-sm font-medium text-[var(--text-mid)]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[var(--text-mid)]">
                      No se encontraron pacientes. ¡Crea el primero!
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      className="border-b border-[var(--glass-border)] last:border-0 hover:bg-[var(--glass)] transition-colors cursor-pointer"
                      onClick={() => setSelectedPatient(patient.id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {patient.firstName?.[0] || 'P'}{patient.lastName?.[0] || 'X'}
                            </span>
                          </div>
                          <div>
                            <p className="text-[var(--text-primary)] font-medium">
                              {patient.fullName || `${patient.firstName} ${patient.lastName}`}
                            </p>
                            <p className="text-xs text-[var(--text-dim)]">{patient.email || 'Sin email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-mid)]">
                          <Phone className="w-4 h-4" />
                          {patient.phone}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-[var(--nexus-violet-lite)] font-mono">{patient.patientNumber}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-mid)]">
                          <Calendar className="w-4 h-4" />
                          {patient.lastVisit || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          patient.status === 'active' 
                            ? 'bg-[var(--success)]/10 text-[var(--success)]' 
                            : 'bg-[var(--text-dim)]/10 text-[var(--text-dim)]'
                        }`}>
                          {patient.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="p-2 rounded hover:bg-[var(--glass)] transition-colors">
                          <MoreVertical className="w-4 h-4 text-[var(--text-mid)]" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4 p-4">
            {filteredPatients.map((patient) => (
              <div 
                key={patient.id} 
                className="p-4 rounded-lg bg-[var(--glass)] cursor-pointer"
                onClick={() => setSelectedPatient(patient.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center">
                    <span className="text-white font-bold">
                      {patient.firstName?.[0] || 'P'}{patient.lastName?.[0] || 'X'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[var(--text-primary)] font-medium">
                      {patient.fullName || `${patient.firstName} ${patient.lastName}`}
                    </p>
                    <p className="text-xs text-[var(--nexus-violet-lite)] font-mono">{patient.patientNumber}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    patient.status === 'active' 
                      ? 'bg-[var(--success)]/10 text-[var(--success)]' 
                      : 'bg-[var(--text-dim)]/10 text-[var(--text-dim)]'
                  }`}>
                    {patient.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-mid)]">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {patient.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {patient.lastVisit || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Patient Modal */}
      {showNewPatientForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Nuevo Paciente</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[var(--text-mid)]">Nombre *</Label>
                  <Input 
                    placeholder="Nombre" 
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--text-mid)]">Apellido *</Label>
                  <Input 
                    placeholder="Apellido" 
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[var(--text-mid)]">Teléfono *</Label>
                <Input 
                  placeholder="+1 868 XXX-XXXX" 
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[var(--text-mid)]">Email</Label>
                <Input 
                  type="email" 
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[var(--text-mid)]">Fecha de Nacimiento</Label>
                <Input 
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[var(--text-mid)]">Género</Label>
                <select 
                  className="w-full h-10 px-3 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)] text-[var(--text-primary)]"
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="">Seleccionar</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[var(--text-mid)]">Dirección</Label>
                <Input 
                  placeholder="Dirección completa"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[var(--text-mid)]">Notas / Alergias</Label>
                <Input 
                  placeholder="Alergias conocidas, notas importantes..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowNewPatientForm(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 btn-gold" 
                onClick={handleCreatePatient}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Paciente'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ClinicLayout>
  );
}
