'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, User, ChevronRight, Phone, Mail, Calendar, 
  Heart, AlertCircle, RefreshCw, CloudOff, Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { ClinicDB, STORES, type OfflineRecord } from '@/lib/offline/db';
import { syncManager } from '@/lib/offline/sync';

// Types
interface Patient extends OfflineRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string[];
  lastVisit?: string;
  _synced?: boolean;
}

interface OfflinePatientListProps {
  onSelectPatient: (patient: {id: string; name: string}) => void;
  searchQuery?: string;
}

// Mock patients for demo
const mockPatients: Patient[] = [
  {
    id: 'P001',
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    phone: '+1 868-555-0101',
    dateOfBirth: '1985-03-15',
    gender: 'F',
    bloodType: 'O+',
    allergies: ['Penicilina'],
    lastVisit: '2024-01-15',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
  },
  {
    id: 'P002',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    phone: '+1 868-555-0102',
    dateOfBirth: '1978-07-22',
    gender: 'M',
    bloodType: 'A+',
    allergies: [],
    lastVisit: '2024-01-10',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
  },
  {
    id: 'P003',
    name: 'Ana Martínez',
    email: 'ana.martinez@email.com',
    phone: '+1 868-555-0103',
    dateOfBirth: '1992-11-08',
    gender: 'F',
    bloodType: 'B+',
    allergies: ['Aspirina', 'Lactosa'],
    lastVisit: '2024-01-18',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
  },
  {
    id: 'P004',
    name: 'José Pérez',
    email: 'jose.perez@email.com',
    phone: '+1 868-555-0104',
    dateOfBirth: '1965-05-30',
    gender: 'M',
    bloodType: 'AB-',
    allergies: ['Sulfas'],
    lastVisit: '2024-01-05',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
  },
  {
    id: 'P005',
    name: 'Laura Fernández',
    email: 'laura.fernandez@email.com',
    phone: '+1 868-555-0105',
    dateOfBirth: '1990-09-12',
    gender: 'F',
    bloodType: 'O-',
    allergies: [],
    lastVisit: '2024-01-20',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
  },
  {
    id: 'P006',
    name: 'Miguel Santos',
    email: 'miguel.santos@email.com',
    phone: '+1 868-555-0106',
    dateOfBirth: '1982-12-25',
    gender: 'M',
    bloodType: 'A-',
    allergies: ['Ibuprofeno'],
    lastVisit: '2024-01-12',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
  },
];

export function OfflinePatientList({ onSelectPatient, searchQuery = '' }: OfflinePatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<Patient | null>(null);

  // Load patients
  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        // Try to get from IndexedDB first
        const offlinePatients = await ClinicDB.getPatients() as Patient[];
        
        if (offlinePatients.length > 0) {
          setPatients(offlinePatients);
        } else {
          // Use mock data and save to IndexedDB
          for (const patient of mockPatients) {
            await ClinicDB.savePatient(patient);
          }
          setPatients(mockPatients);
        }
      } catch (error) {
        console.error('Error loading patients:', error);
        // Fallback to mock data
        setPatients(mockPatients);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();

    // Listen for online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync search query prop
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    if (!localSearch) return patients;
    const query = localSearch.toLowerCase();
    return patients.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      p.phone?.includes(query) ||
      p.email?.toLowerCase().includes(query)
    );
  }, [patients, localSearch]);

  // Calculate age
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Handle patient click
  const handlePatientClick = (patient: Patient) => {
    onSelectPatient({ id: patient.id, name: patient.name });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0820]/95 backdrop-blur-md p-4 border-b border-[rgba(167,139,250,0.2)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-white">Pacientes</h2>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                <CloudOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
            <Badge className="bg-violet-500/20 text-violet-400">
              {filteredPatients.length} pacientes
            </Badge>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, ID, teléfono..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Patient List */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No se encontraron pacientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handlePatientClick(patient)}
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors touch-manipulation text-left"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {patient.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white truncate">
                        {patient.name}
                      </p>
                      {!patient._synced && (
                        <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                          Pendiente
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-400">
                        ID: {patient.id}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className="text-sm text-gray-400">
                        {patient.dateOfBirth && `${calculateAge(patient.dateOfBirth)} años`}
                      </span>
                      {patient.bloodType && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-sm text-rose-400 font-medium">
                            {patient.bloodType}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {/* Allergies warning */}
                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs text-amber-400">
                          Alérgico: {patient.allergies.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button className="fixed bottom-28 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg flex items-center justify-center touch-manipulation">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}

export default OfflinePatientList;
