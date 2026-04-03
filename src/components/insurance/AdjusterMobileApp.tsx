'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  MessageSquare,
  Navigation,
  FileText,
  Image,
  Upload,
  Signature,
  DollarSign,
  User,
  Calendar,
  ChevronRight,
  Bell,
  Home,
  ClipboardList,
  CameraIcon,
  Send,
  Check,
  X,
  Eye,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ClaimAssignment {
  id: string;
  claimNumber: string;
  policyNumber: string;
  insuredName: string;
  insuredPhone: string;
  claimType: string;
  reportedAmount: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'assigned' | 'in_progress' | 'inspection' | 'pending_docs' | 'completed';
  address: string;
  latitude: number;
  longitude: number;
  assignedAt: string;
  scheduledFor?: string;
  description: string;
  notes: string[];
  photos: string[];
  estimatedAmount?: number;
  approvedAmount?: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const ASSIGNED_CLAIMS: ClaimAssignment[] = [
  {
    id: '1',
    claimNumber: 'CLM-2024-000362',
    policyNumber: 'POL-2024-001567',
    insuredName: 'Robert Thompson',
    insuredPhone: '+1-868-689-1234',
    claimType: 'Motor Accident',
    reportedAmount: 45000,
    priority: 'high',
    status: 'assigned',
    address: '45 Wrightson Road, Port of Spain',
    latitude: 10.6596,
    longitude: -61.5082,
    assignedAt: '2024-10-22 08:30',
    scheduledFor: '2024-10-22 14:00',
    description: 'Rear-end collision at traffic light. Vehicle rear bumper damaged.',
    notes: [],
    photos: [],
  },
  {
    id: '2',
    claimNumber: 'CLM-2024-000361',
    policyNumber: 'POL-2024-002345',
    insuredName: 'Maria Santos',
    insuredPhone: '+1-868-756-7890',
    claimType: 'Property Damage',
    reportedAmount: 85000,
    priority: 'urgent',
    status: 'in_progress',
    address: '12 Victoria Avenue, San Fernando',
    latitude: 10.2764,
    longitude: -61.4676,
    assignedAt: '2024-10-21 16:00',
    description: 'Water damage from burst pipe affecting multiple rooms.',
    notes: ['Initial inspection completed', 'Plumber report requested'],
    photos: ['photo1.jpg', 'photo2.jpg'],
    estimatedAmount: 72000,
  },
  {
    id: '3',
    claimNumber: 'CLM-2024-000360',
    policyNumber: 'POL-2024-001890',
    insuredName: 'James Mohammed',
    insuredPhone: '+1-868-345-2345',
    claimType: 'Motor Theft',
    reportedAmount: 120000,
    priority: 'medium',
    status: 'inspection',
    address: '78 Eastern Main Road, St. Augustine',
    latitude: 10.6349,
    longitude: -61.4006,
    assignedAt: '2024-10-20 10:00',
    description: 'Vehicle stolen from parking lot. Police report filed.',
    notes: ['Police report verified', 'GPS tracker data requested'],
    photos: ['police_report.jpg'],
    estimatedAmount: 120000,
  },
  {
    id: '4',
    claimNumber: 'CLM-2024-000358',
    policyNumber: 'POL-2024-001234',
    insuredName: 'Sarah Williams',
    insuredPhone: '+1-868-678-9012',
    claimType: 'Property Fire',
    reportedAmount: 250000,
    priority: 'urgent',
    status: 'pending_docs',
    address: '34 Maraval Road, Port of Spain',
    latitude: 10.6802,
    longitude: -61.5194,
    assignedAt: '2024-10-19 14:00',
    description: 'Kitchen fire causing extensive smoke and heat damage.',
    notes: ['Fire department report received', 'Awaiting contractor quotes'],
    photos: ['fire_damage_1.jpg', 'fire_damage_2.jpg', 'fire_damage_3.jpg'],
    estimatedAmount: 185000,
  },
];

const COMPLETED_TODAY = [
  { claimNumber: 'CLM-2024-000355', insuredName: 'David Lee', type: 'Motor', amount: 32000, completedAt: '10:30 AM' },
  { claimNumber: 'CLM-2024-000354', insuredName: 'Jennifer Brown', type: 'Property', amount: 15600, completedAt: '09:15 AM' },
];

// ============================================================================
// COMPONENTS
// ============================================================================

interface ClaimCardProps {
  claim: ClaimAssignment;
  onStart?: () => void;
  onComplete?: () => void;
}

function ClaimCard({ claim, onStart, onComplete }: ClaimCardProps) {
  const priorityColors = {
    low: 'bg-slate-500/20 text-slate-300',
    medium: 'bg-blue-500/20 text-blue-300',
    high: 'bg-amber-500/20 text-amber-300',
    urgent: 'bg-red-500/20 text-red-300',
  };

  const statusIcons = {
    assigned: <Clock className="w-4 h-4 text-slate-400" />,
    in_progress: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    inspection: <Eye className="w-4 h-4 text-blue-400" />,
    pending_docs: <FileText className="w-4 h-4 text-purple-400" />,
    completed: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-bold">{claim.claimNumber}</span>
              <Badge className={priorityColors[claim.priority]}>
                {claim.priority.toUpperCase()}
              </Badge>
            </div>
            <p className="text-slate-400 text-sm">{claim.policyNumber}</p>
          </div>
          <div className="flex items-center gap-1">
            {statusIcons[claim.status]}
            <span className="text-slate-400 text-sm capitalize">{claim.status.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Insured Info */}
        <div className="p-3 rounded-lg bg-slate-700/30 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{claim.insuredName}</p>
              <p className="text-slate-400 text-sm">{claim.claimType}</p>
            </div>
            <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300">
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-3 p-2 rounded bg-slate-700/20">
          <MapPin className="w-4 h-4 text-red-400" />
          <span className="text-slate-300 text-sm flex-1 truncate">{claim.address}</span>
          <Button size="sm" variant="ghost" className="text-blue-400 p-1 h-auto">
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {/* Amount & Schedule */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-2 rounded bg-slate-700/20">
            <p className="text-slate-500 text-xs">Reported Amount</p>
            <p className="text-amber-400 font-bold">TT${claim.reportedAmount.toLocaleString()}</p>
          </div>
          {claim.scheduledFor && (
            <div className="p-2 rounded bg-slate-700/20">
              <p className="text-slate-500 text-xs">Scheduled</p>
              <p className="text-white font-medium">{claim.scheduledFor.split(' ')[1]}</p>
            </div>
          )}
          {claim.estimatedAmount && (
            <div className="p-2 rounded bg-slate-700/20">
              <p className="text-slate-500 text-xs">Estimated</p>
              <p className="text-blue-400 font-bold">TT${claim.estimatedAmount.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Photos & Notes Count */}
        {(claim.photos.length > 0 || claim.notes.length > 0) && (
          <div className="flex items-center gap-4 mb-3 text-sm">
            {claim.photos.length > 0 && (
              <div className="flex items-center gap-1 text-slate-400">
                <Image className="w-4 h-4" />
                <span>{claim.photos.length} photos</span>
              </div>
            )}
            {claim.notes.length > 0 && (
              <div className="flex items-center gap-1 text-slate-400">
                <FileText className="w-4 h-4" />
                <span>{claim.notes.length} notes</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {claim.status === 'assigned' && (
            <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" onClick={onStart}>
              <CheckCircle className="w-4 h-4 mr-2" />Start Inspection
            </Button>
          )}
          {claim.status === 'in_progress' && (
            <>
              <Button variant="outline" className="flex-1 border-slate-600 text-slate-300">
                <Camera className="w-4 h-4 mr-2" />Add Photos
              </Button>
              <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={onComplete}>
                <Check className="w-4 h-4 mr-2" />Complete
              </Button>
            </>
          )}
          {claim.status === 'inspection' && (
            <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
              <FileText className="w-4 h-4 mr-2" />Submit Report
            </Button>
          )}
          {claim.status === 'pending_docs' && (
            <Button variant="outline" className="flex-1 border-slate-600 text-slate-300">
              <Upload className="w-4 h-4 mr-2" />Upload Docs
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${color}/10 flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-slate-500 text-xs">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdjusterMobileApp() {
  const [activeTab, setActiveTab] = useState('assignments');

  const todayCompleted = COMPLETED_TODAY.length;
  const pendingCount = ASSIGNED_CLAIMS.filter(c => c.status !== 'completed').length;
  const urgentCount = ASSIGNED_CLAIMS.filter(c => c.priority === 'urgent').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white">Claims Adjuster</h1>
              <p className="text-slate-400 text-sm">Tuesday, Oct 22, 2024</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-slate-400 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {urgentCount}
                </span>
              </Button>
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <QuickStatCard icon={ClipboardList} label="Pending" value={pendingCount} color="bg-amber-500" />
            <QuickStatCard icon={CheckCircle} label="Completed" value={todayCompleted} color="bg-emerald-500" />
            <QuickStatCard icon={AlertTriangle} label="Urgent" value={urgentCount} color="bg-red-500" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700 mb-4">
            <TabsTrigger value="assignments" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs">
              <ClipboardList className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs">
              <MapPin className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="camera" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs">
              <CameraIcon className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs">
              <Clock className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            {/* Urgent First */}
            {ASSIGNED_CLAIMS.filter(c => c.priority === 'urgent').map(claim => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}

            {/* High Priority */}
            {ASSIGNED_CLAIMS.filter(c => c.priority === 'high').map(claim => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}

            {/* Medium/Low */}
            {ASSIGNED_CLAIMS.filter(c => !['urgent', 'high'].includes(c.priority)).map(claim => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="h-64 rounded-lg bg-slate-700/30 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <p className="text-white font-medium">Map View</p>
                    <p className="text-slate-400 text-sm">{ASSIGNED_CLAIMS.length} locations to visit</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {ASSIGNED_CLAIMS.slice(0, 3).map(claim => (
                    <div key={claim.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-red-400" />
                        <div>
                          <p className="text-white text-sm font-medium">{claim.insuredName}</p>
                          <p className="text-slate-500 text-xs truncate max-w-[200px]">{claim.address}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-blue-400">
                        <Navigation className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Camera Tab */}
          <TabsContent value="camera">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="aspect-square rounded-lg bg-slate-700/30 flex items-center justify-center mb-4 border-2 border-dashed border-slate-600">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-slate-500 mx-auto mb-3" />
                    <p className="text-white font-medium mb-1">Take Photo</p>
                    <p className="text-slate-400 text-sm">Capture claim evidence</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white h-12">
                    <Camera className="w-5 h-5 mr-2" />Camera
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 h-12">
                    <Image className="w-5 h-5 mr-2" />Gallery
                  </Button>
                </div>

                <div className="p-3 rounded-lg bg-slate-700/30">
                  <p className="text-slate-400 text-sm mb-2">Recent Photos</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="aspect-square rounded bg-slate-600 flex items-center justify-center">
                        <Image className="w-6 h-6 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Completed Today</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  {COMPLETED_TODAY.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <div>
                          <p className="text-white font-medium">{item.claimNumber}</p>
                          <p className="text-slate-400 text-sm">{item.insuredName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-medium">TT${item.amount.toLocaleString()}</p>
                        <p className="text-slate-500 text-xs">{item.completedAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Weekly Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Claims Processed</span>
                    <span className="text-white font-bold">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Value</span>
                    <span className="text-emerald-400 font-bold">TT$456K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Avg Processing Time</span>
                    <span className="text-white font-bold">2.3 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Customer Rating</span>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400 font-bold">4.8</span>
                      <span className="text-amber-400">★</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 p-2 safe-area-pb">
        <div className="grid grid-cols-5 gap-1">
          {[
            { icon: Home, label: 'Home', tab: 'assignments' },
            { icon: ClipboardList, label: 'Tasks', tab: 'assignments' },
            { icon: CameraIcon, label: 'Camera', tab: 'camera' },
            { icon: MapPin, label: 'Map', tab: 'map' },
            { icon: User, label: 'Profile', tab: 'history' },
          ].map((item, i) => (
            <Button
              key={i}
              variant="ghost"
              className={`flex flex-col items-center py-2 h-auto ${
                activeTab === item.tab ? 'text-blue-400' : 'text-slate-500'
              }`}
              onClick={() => setActiveTab(item.tab)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { ClaimAssignment };
