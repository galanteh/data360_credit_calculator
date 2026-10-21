export interface IndustryOption {
  value: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  defaultProfiles: number;
  defaultEngagement: number;
  defaultSegments: number;
}

export const INDUSTRY_OPTIONS: IndustryOption[] = [
  {
    value: 'financial_services',
    label: 'Financial Services',
    description: 'Banca, seguros y gestión de patrimonio para cumplimiento normativo y vista integral del cliente.',
    icon: '💳',
    color: '#032D60',
    defaultProfiles: 1_000_000,
    defaultEngagement: 7_000_000,
    defaultSegments: 80,
  },
  {
    value: 'healthcare',
    label: 'Healthcare & Life Sciences',
    description: 'Hospitales, clínicas y ciencias de la salud para coordinación de pacientes y flujos conformes con HIPAA.',
    icon: '🏥',
    color: '#4BCA81',
    defaultProfiles: 800_000,
    defaultEngagement: 4_000_000,
    defaultSegments: 50,
  },
  {
    value: 'manufacturing',
    label: 'Manufacturing Cloud',
    description: 'Fabricantes, pronósticos basados en cuentas y gestión de acuerdos de ventas.',
    icon: '🏭',
    color: '#706E6B',
    defaultProfiles: 400_000,
    defaultEngagement: 2_000_000,
    defaultSegments: 40,
  },
  {
    value: 'consumer_goods',
    label: 'Consumer Goods Cloud',
    description: 'Marcas de consumo masivo para ejecución comercial y gestión en puntos de venta (POS).',
    icon: '🛍️',
    color: '#FF7D4E',
    defaultProfiles: 2_000_000,
    defaultEngagement: 14_000_000,
    defaultSegments: 120,
  },
  {
    value: 'retail',
    label: 'Retail',
    description: 'Comercio minorista para unificar la experiencia de compra física y digital.',
    icon: '🛒',
    color: '#0070D2',
    defaultProfiles: 2_000_000,
    defaultEngagement: 10_000_000,
    defaultSegments: 150,
  },
  {
    value: 'communications',
    label: 'Communications',
    description: 'Proveedores de telecomunicaciones y suscripciones.',
    icon: '📡',
    color: '#1589EE',
    defaultProfiles: 5_000_000,
    defaultEngagement: 25_000_000,
    defaultSegments: 100,
  },
  {
    value: 'media',
    label: 'Media & Entertainment',
    description: 'Empresas de medios, streaming, entretenimiento y publicaciones.',
    icon: '🎬',
    color: '#FFB75D',
    defaultProfiles: 3_000_000,
    defaultEngagement: 20_000_000,
    defaultSegments: 150,
  },
  {
    value: 'automotive',
    label: 'Automotive',
    description: 'Fabricantes de automóviles, financieras y redes de concesionarios.',
    icon: '🚗',
    color: '#706E6B',
    defaultProfiles: 500_000,
    defaultEngagement: 2_500_000,
    defaultSegments: 45,
  },
  {
    value: 'education',
    label: 'Education',
    description: 'Instituciones educativas para ciclo de vida de estudiantes y admisiones.',
    icon: '🎓',
    color: '#9B59B6',
    defaultProfiles: 300_000,
    defaultEngagement: 1_800_000,
    defaultSegments: 60,
  },
];

export const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email Marketing', icon: '📧' },
  { value: 'sms', label: 'SMS / WhatsApp', icon: '💬' },
  { value: 'push', label: 'Push Notifications', icon: '🔔' },
  { value: 'paid_media', label: 'Paid Media (DSP)', icon: '📢' },
  { value: 'web', label: 'Personalización Web', icon: '🌐' },
  { value: 'mobile', label: 'App Móvil', icon: '📱' },
  { value: 'crm', label: 'CRM / Salesforce', icon: '🤝' },
  { value: 'cdp', label: 'CDP Downstream', icon: '🔄' },
];

export const DATA_SOURCE_OPTIONS = [
  { value: 'crm', label: 'CRM / Ventas', description: 'Salesforce Sales/Service Cloud u otro CRM', icon: '🤝' },
  { value: 'erp', label: 'ERP / Finanzas', description: 'SAP, Oracle, NetSuite', icon: '🏢' },
  { value: 'ecommerce', label: 'Comercio Digital', description: 'Commerce Cloud, Shopify, Magento', icon: '🛒' },
  { value: 'pos', label: 'Puntos de Venta (POS)', description: 'Sistemas de caja y retail físico', icon: '🏪' },
  { value: 'digital', label: 'Comportamiento Digital / Apps', description: 'Google Analytics, SDK móvil, navegación web', icon: '📊' },
  { value: 'datalake', label: 'Data Lake / DWH', description: 'Snowflake, BigQuery, Databricks, Amazon S3', icon: '🗄️' },
  { value: 'marketing', label: 'Marketing & Pauta', description: 'Marketing Cloud, Meta Ads, Google Ads', icon: '📣' },
];
