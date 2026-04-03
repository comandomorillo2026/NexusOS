'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Building2,
  Globe,
  DollarSign,
  FileText,
  Shield,
  Brain,
  Lock,
  Bell,
  Palette,
  Save,
  RefreshCw,
} from 'lucide-react';

export default function InsuranceSettings() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="company">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="company" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Company Info</TabsTrigger>
          <TabsTrigger value="numbering" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Numbering</TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Integrations</TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">AI Settings</TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Company Name</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="Nexus Insurance Company Ltd" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Legal Name</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="Nexus Insurance Company Limited" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Tax ID / TRN</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="TRN-123456789" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Email</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" type="email" defaultValue="info@nexusinsurance.tt" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Phone</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="868-623-NEXUS" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">License Number</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="INS-2024-001" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">License Expiry</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" type="date" defaultValue="2025-12-31" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Address</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="123 Insurance Plaza, Port of Spain" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Country</label>
                    <Select defaultValue="TT">
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TT">Trinidad & Tobago</SelectItem>
                        <SelectItem value="JM">Jamaica</SelectItem>
                        <SelectItem value="BB">Barbados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Base Currency</label>
                    <Select defaultValue="TTD">
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TTD">TTD - Trinidad & Tobago Dollar</SelectItem>
                        <SelectItem value="JMD">JMD - Jamaican Dollar</SelectItem>
                        <SelectItem value="BBD">BBD - Barbados Dollar</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="numbering">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Document Numbering
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Policy Prefix</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="POL" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Claim Prefix</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="CLM" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Endorsement Prefix</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="END" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Receipt Prefix</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="RCP" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Quote Prefix</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="QTE" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Default Commission Rate (%)</label>
                    <Input className="bg-slate-700/50 border-slate-600 text-white" type="number" defaultValue="12" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" />
                Integrations & EDI
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50">
                  <h4 className="text-white font-medium mb-4">X12 EDI Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 uppercase mb-2 block">Sender ID</label>
                      <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="NEXUSINS001" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase mb-2 block">Receiver ID</label>
                      <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="SAGICOR" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: 'WiPay', status: 'connected', icon: DollarSign },
                    { name: 'Resend Email', status: 'connected', icon: Bell },
                    { name: 'QuickBooks', status: 'disconnected', icon: Building2 },
                  ].map((int, i) => (
                    <div key={i} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50 text-center">
                      <int.icon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-white">{int.name}</p>
                      <Badge className={int.status === 'connected' ? 'bg-emerald-500/20 text-emerald-300 mt-2' : 'bg-slate-500/20 text-slate-300 mt-2'}>
                        {int.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-amber-400" />
                AI & Fraud Detection Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600/50">
                  <div>
                    <p className="text-white font-medium">Fraud Detection</p>
                    <p className="text-slate-400 text-sm">AI-powered fraud scoring for all claims</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300">Enabled</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Fraud Alert Threshold</label>
                    <Select defaultValue="0.7">
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">50% - Low Threshold</SelectItem>
                        <SelectItem value="0.6">60% - Medium-Low</SelectItem>
                        <SelectItem value="0.7">70% - Medium (Recommended)</SelectItem>
                        <SelectItem value="0.8">80% - High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase mb-2 block">Auto-Flag High Risk</label>
                    <Select defaultValue="true">
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes - Automatically flag</SelectItem>
                        <SelectItem value="false">No - Manual review only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-pink-400" />
                Branding & Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-slate-400 uppercase mb-2 block">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="#1E40AF" />
                    <div className="w-10 h-10 rounded bg-blue-700" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase mb-2 block">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="#3B82F6" />
                    <div className="w-10 h-10 rounded bg-blue-500" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 uppercase mb-2 block">Logo URL</label>
                  <Input className="bg-slate-700/50 border-slate-600 text-white" defaultValue="/logos/nexus-insurance.png" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleSave} disabled={saving}>
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
