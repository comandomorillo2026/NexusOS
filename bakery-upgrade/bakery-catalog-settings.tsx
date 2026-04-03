'use client';

import React, { useState } from 'react';
import {
  Store,
  Image,
  Tag,
  Clock,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Save,
  Upload,
  X,
  Check,
  AlertCircle,
  Link as LinkIcon,
  MessageCircle,
  Globe,
  Sparkles,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  showInCatalog: boolean;
  isPromo: boolean;
  promoPrice?: number;
  allergens: string[];
  stock: number;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  validUntil: string;
  active: boolean;
  order: number;
}

interface BakeryCatalogSettings {
  enabled: boolean;
  customSlug: string;
  description: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  instagram: string;
  facebook: string;
  schedule: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  theme: {
    primary: string;
    secondary: string;
  };
  products: Product[];
  promotions: Promotion[];
}

const defaultSettings: BakeryCatalogSettings = {
  enabled: true,
  customSlug: 'mi-panaderia',
  description: 'El sabor tradicional de siempre, ahora más cerca de ti.',
  phone: '+1 868-123-4567',
  email: 'pedidos@mipanaderia.tt',
  whatsapp: '+18681234567',
  address: '123 Main Street, Port of Spain, Trinidad & Tobago',
  instagram: '@mipanaderia',
  facebook: 'MiPanaderia',
  schedule: {
    weekdays: '6:00 AM - 7:00 PM',
    saturday: '7:00 AM - 6:00 PM',
    sunday: '7:00 AM - 2:00 PM'
  },
  theme: {
    primary: '#F97316',
    secondary: '#FBBF24'
  },
  products: [
    {
      id: '1',
      name: 'Pan de Agua Fresco',
      description: 'Recién horneado, crujiente por fuera y suave por dentro.',
      price: 8,
      category: 'Panes',
      showInCatalog: true,
      isPromo: false,
      allergens: [],
      stock: 50
    }
  ],
  promotions: []
};

const categories = ['Panes', 'Tortas', 'Postres', 'Dulces', 'Salados', 'Bebidas'];
const allergenOptions = ['gluten', 'lactosa', 'huevos', 'nueces', 'soja', 'maní'];

export function BakeryCatalogSettings() {
  const [settings, setSettings] = useState<BakeryCatalogSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);

  const catalogUrl = `https://nexus-os-alpha.vercel.app/bakery/${settings.customSlug}/catalog`;

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const updateSettings = (updates: Partial<BakeryCatalogSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const toggleProductVisibility = (productId: string) => {
    setSettings(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.id === productId ? { ...p, showInCatalog: !p.showInCatalog } : p
      )
    }));
  };

  const toggleProductPromo = (productId: string) => {
    setSettings(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.id === productId ? { ...p, isPromo: !p.isPromo, promoPrice: p.isPromo ? undefined : p.price * 0.8 } : p
      )
    }));
  };

  const deleteProduct = (productId: string) => {
    setSettings(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };

  const addPromotion = () => {
    const newPromo: Promotion = {
      id: Date.now().toString(),
      title: '',
      description: '',
      image: '',
      validUntil: '',
      active: true,
      order: settings.promotions.length
    };
    setEditingPromo(newPromo);
    setShowPromoModal(true);
  };

  const savePromotion = () => {
    if (!editingPromo) return;

    const exists = settings.promotions.some(p => p.id === editingPromo.id);
    if (exists) {
      setSettings(prev => ({
        ...prev,
        promotions: prev.promotions.map(p => p.id === editingPromo.id ? editingPromo : p)
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        promotions: [...prev.promotions, editingPromo]
      }));
    }
    setShowPromoModal(false);
    setEditingPromo(null);
  };

  const deletePromotion = (promoId: string) => {
    setSettings(prev => ({
      ...prev,
      promotions: prev.promotions.filter(p => p.id !== promoId)
    }));
  };

  const movePromotion = (promoId: string, direction: 'up' | 'down') => {
    const promotions = [...settings.promotions];
    const index = promotions.findIndex(p => p.id === promoId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      [promotions[index - 1], promotions[index]] = [promotions[index], promotions[index - 1]];
    } else if (direction === 'down' && index < promotions.length - 1) {
      [promotions[index], promotions[index + 1]] = [promotions[index + 1], promotions[index]];
    }

    setSettings(prev => ({ ...prev, promotions }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Portal de Productos
          </h2>
          <p className="text-[var(--text-dim)] text-sm">
            Configura tu catálogo público para que tus clientes vean productos y te contacten
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Catalog Status */}
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSettings({ enabled: checked })}
            />
            <span className="text-sm text-[var(--text-mid)]">
              {settings.enabled ? 'Portal Activo' : 'Portal Inactivo'}
            </span>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving} className="btn-gold">
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Guardando...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Guardado
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Catalog URL */}
      <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[var(--nexus-gold)]" />
            <div>
              <p className="text-xs text-[var(--text-dim)]">Tu catálogo público:</p>
              <a
                href={catalogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--nexus-violet-lite)] hover:underline flex items-center gap-1"
              >
                {catalogUrl}
                <LinkIcon className="w-3 h-3" />
              </a>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(catalogUrl)}
          >
            Copiar Link
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <Store className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="products">
            <Tag className="w-4 h-4 mr-2" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="promotions">
            <Sparkles className="w-4 h-4 mr-2" />
            Promociones
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Phone className="w-4 h-4 mr-2" />
            Contacto
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Información Básica</h3>

              <div className="space-y-2">
                <Label>URL Personalizada</Label>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-dim)] text-sm">nexus-os-alpha.vercel.app/bakery/</span>
                  <Input
                    value={settings.customSlug}
                    onChange={(e) => updateSettings({ customSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    className="flex-1"
                    placeholder="mi-panaderia"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripción del Negocio</Label>
                <Textarea
                  value={settings.description}
                  onChange={(e) => updateSettings({ description: e.target.value })}
                  placeholder="Breve descripción de tu panadería..."
                  rows={3}
                />
              </div>

              {/* Theme Colors */}
              <div className="space-y-3">
                <Label>Colores del Portal</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-[var(--text-dim)] mb-1">Color Principal</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.theme.primary}
                        onChange={(e) => updateSettings({ theme: { ...settings.theme, primary: e.target.value } })}
                        className="w-10 h-10 rounded-lg cursor-pointer"
                      />
                      <Input value={settings.theme.primary} readOnly className="flex-1" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[var(--text-dim)] mb-1">Color Secundario</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.theme.secondary}
                        onChange={(e) => updateSettings({ theme: { ...settings.theme, secondary: e.target.value } })}
                        className="w-10 h-10 rounded-lg cursor-pointer"
                      />
                      <Input value={settings.theme.secondary} readOnly className="flex-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Horario de Atención</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Lunes - Viernes</Label>
                  <Input
                    value={settings.schedule.weekdays}
                    onChange={(e) => updateSettings({ schedule: { ...settings.schedule, weekdays: e.target.value } })}
                    placeholder="6:00 AM - 7:00 PM"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sábado</Label>
                  <Input
                    value={settings.schedule.saturday}
                    onChange={(e) => updateSettings({ schedule: { ...settings.schedule, saturday: e.target.value } })}
                    placeholder="7:00 AM - 6:00 PM"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Domingo</Label>
                  <Input
                    value={settings.schedule.sunday}
                    onChange={(e) => updateSettings({ schedule: { ...settings.schedule, sunday: e.target.value } })}
                    placeholder="7:00 AM - 2:00 PM"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Logo del Portal</Label>
                <div className="border-2 border-dashed border-[var(--glass-border)] rounded-xl p-6 text-center hover:border-[var(--nexus-violet)] transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-[var(--text-dim)] mb-2" />
                  <p className="text-sm text-[var(--text-mid)]">
                    Arrastra tu logo o haz clic para subir
                  </p>
                  <p className="text-xs text-[var(--text-dim)] mt-1">
                    PNG, JPG o SVG. Máximo 2MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Productos en el Catálogo</h3>
              <p className="text-sm text-[var(--text-dim)]">
                Selecciona qué productos mostrar y cuáles están en promoción
              </p>
            </div>
            <div className="text-sm text-[var(--text-mid)]">
              {settings.products.filter(p => p.showInCatalog).length} de {settings.products.length} visibles
            </div>
          </div>

          <div className="space-y-3">
            {settings.products.map((product) => (
              <div
                key={product.id}
                className={`p-4 rounded-xl border transition-all ${
                  product.showInCatalog
                    ? 'bg-[var(--glass)] border-[var(--glass-border)]'
                    : 'bg-[var(--glass)]/50 border-[var(--glass-border)] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[var(--glass)] to-[var(--obsidian)] flex items-center justify-center">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Tag className="w-6 h-6 text-[var(--text-dim)]" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-[var(--text-primary)]">{product.name}</h4>
                        {product.isPromo && (
                          <span className="px-2 py-0.5 rounded-full bg-[var(--nexus-gold)]/20 text-[var(--nexus-gold)] text-xs font-medium">
                            En Promoción
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-dim)]">{product.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[var(--nexus-gold)] font-medium">
                          {product.isPromo && product.promoPrice ? (
                            <>
                              <span className="line-through text-[var(--text-dim)] text-xs mr-1">TT${product.price}</span>
                              {' '}TT${product.promoPrice}
                            </>
                          ) : (
                            `TT$${product.price}`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Show/Hide */}
                    <button
                      onClick={() => toggleProductVisibility(product.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        product.showInCatalog
                          ? 'bg-[var(--success)]/20 text-[var(--success)]'
                          : 'bg-[var(--glass)] text-[var(--text-dim)]'
                      }`}
                      title={product.showInCatalog ? 'Ocultar del catálogo' : 'Mostrar en catálogo'}
                    >
                      {product.showInCatalog ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Toggle Promo */}
                    <button
                      onClick={() => toggleProductPromo(product.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        product.isPromo
                          ? 'bg-[var(--nexus-gold)]/20 text-[var(--nexus-gold)]'
                          : 'bg-[var(--glass)] text-[var(--text-dim)]'
                      }`}
                      title={product.isPromo ? 'Quitar promoción' : 'Poner en promoción'}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button className="p-2 rounded-lg bg-[var(--glass)] text-[var(--text-mid)] hover:text-[var(--text-primary)] transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 rounded-lg bg-[var(--error)]/10 text-[var(--error)] hover:bg-[var(--error)]/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Promociones del Carrusel</h3>
              <p className="text-sm text-[var(--text-dim)]">
                Agrega hasta 6 promociones que rotarán en el carrusel de tu portal
              </p>
            </div>
            <Button
              onClick={addPromotion}
              disabled={settings.promotions.length >= 6}
              className="btn-nexus"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Promoción
            </Button>
          </div>

          {settings.promotions.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-[var(--glass-border)] text-center">
              <Sparkles className="w-12 h-12 mx-auto text-[var(--text-dim)] mb-4" />
              <p className="text-[var(--text-mid)]">No tienes promociones activas</p>
              <p className="text-sm text-[var(--text-dim)] mt-1">
                Agrega promociones para destacarlas en tu portal
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {settings.promotions.map((promo, index) => (
                <div
                  key={promo.id}
                  className={`p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] ${!promo.active ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-12 rounded-lg bg-gradient-to-r from-[var(--nexus-gold)] to-[var(--nexus-violet)] flex items-center justify-center">
                        {promo.image ? (
                          <img src={promo.image} alt={promo.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Image className="w-6 h-6 text-white" />
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium text-[var(--text-primary)]">{promo.title || 'Sin título'}</h4>
                        <p className="text-sm text-[var(--text-dim)] line-clamp-1">{promo.description}</p>
                        {promo.validUntil && (
                          <p className="text-xs text-[var(--nexus-gold)] mt-1">
                            Válido hasta: {new Date(promo.validUntil).toLocaleDateString('es-TT')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Move Up/Down */}
                      <button
                        onClick={() => movePromotion(promo.id, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-[var(--glass)] disabled:opacity-30"
                      >
                        <MoveUp className="w-4 h-4 text-[var(--text-dim)]" />
                      </button>
                      <button
                        onClick={() => movePromotion(promo.id, 'down')}
                        disabled={index === settings.promotions.length - 1}
                        className="p-1 rounded hover:bg-[var(--glass)] disabled:opacity-30"
                      >
                        <MoveDown className="w-4 h-4 text-[var(--text-dim)]" />
                      </button>

                      {/* Toggle Active */}
                      <Switch
                        checked={promo.active}
                        onCheckedChange={(checked) => {
                          setSettings(prev => ({
                            ...prev,
                            promotions: prev.promotions.map(p =>
                              p.id === promo.id ? { ...p, active: checked } : p
                            )
                          }));
                        }}
                      />

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setEditingPromo(promo);
                          setShowPromoModal(true);
                        }}
                        className="p-2 rounded-lg bg-[var(--glass)] text-[var(--text-mid)] hover:text-[var(--text-primary)]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deletePromotion(promo.id)}
                        className="p-2 rounded-lg bg-[var(--error)]/10 text-[var(--error)] hover:bg-[var(--error)]/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Información de Contacto</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Teléfono
                  </Label>
                  <Input
                    value={settings.phone}
                    onChange={(e) => updateSettings({ phone: e.target.value })}
                    placeholder="+1 868-123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Label>
                  <Input
                    value={settings.whatsapp}
                    onChange={(e) => updateSettings({ whatsapp: e.target.value })}
                    placeholder="+18681234567"
                  />
                  <p className="text-xs text-[var(--text-dim)]">Número sin espacios ni guiones</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSettings({ email: e.target.value })}
                    placeholder="pedidos@tuempresa.tt"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Dirección
                  </Label>
                  <Textarea
                    value={settings.address}
                    onChange={(e) => updateSettings({ address: e.target.value })}
                    placeholder="Dirección completa de tu negocio"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Redes Sociales</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </Label>
                  <Input
                    value={settings.instagram}
                    onChange={(e) => updateSettings({ instagram: e.target.value })}
                    placeholder="@tuempresa"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Label>
                  <Input
                    value={settings.facebook}
                    onChange={(e) => updateSettings({ facebook: e.target.value })}
                    placeholder="TuPaginaFacebook"
                  />
                </div>
              </div>

              {/* Preview Card */}
              <div className="mt-6 p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
                <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Vista Previa de Contacto</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--text-mid)]">
                    <Phone className="w-4 h-4 text-[var(--nexus-gold)]" />
                    <span>{settings.phone || 'Sin teléfono'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-mid)]">
                    <Mail className="w-4 h-4 text-[var(--nexus-gold)]" />
                    <span>{settings.email || 'Sin email'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-mid)]">
                    <MapPin className="w-4 h-4 text-[var(--nexus-gold)]" />
                    <span className="line-clamp-1">{settings.address || 'Sin dirección'}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {settings.instagram && (
                      <span className="px-2 py-1 rounded bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white text-xs">
                        Instagram
                      </span>
                    )}
                    {settings.facebook && (
                      <span className="px-2 py-1 rounded bg-[#1877F2] text-white text-xs">
                        Facebook
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Promotion Modal */}
      {showPromoModal && editingPromo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--obsidian)] rounded-2xl p-6 max-w-lg w-full border border-[var(--glass-border)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Editar Promoción</h3>
              <button
                onClick={() => {
                  setShowPromoModal(false);
                  setEditingPromo(null);
                }}
                className="p-2 rounded-lg hover:bg-[var(--glass)]"
              >
                <X className="w-5 h-5 text-[var(--text-dim)]" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título de la Promoción</Label>
                <Input
                  value={editingPromo.title}
                  onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                  placeholder="🎉 Promoción Especial"
                />
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={editingPromo.description}
                  onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })}
                  placeholder="Describe tu promoción..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Válida Hasta</Label>
                <Input
                  type="date"
                  value={editingPromo.validUntil}
                  onChange={(e) => setEditingPromo({ ...editingPromo, validUntil: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Imagen (URL)</Label>
                <Input
                  value={editingPromo.image}
                  onChange={(e) => setEditingPromo({ ...editingPromo, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPromoModal(false);
                  setEditingPromo(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={savePromotion} className="btn-gold">
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
