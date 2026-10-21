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

export interface DataSourceOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

export interface TransversalSourceGroup {
  group: string;
  groupLabel: string;
  sources: DataSourceOption[];
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
    value: 'travel_hospitality',
    label: 'Travel, Transportation & Hospitality',
    description: 'Hotelería, aerolíneas, cruceros y logística para viajes personalizados, programas de lealtad y reservas.',
    icon: '🏨',
    color: '#00A1E0',
    defaultProfiles: 2_000_000,
    defaultEngagement: 10_000_000,
    defaultSegments: 120,
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
  { value: 'loyalty', label: 'Programas de Lealtad', icon: '🎁' },
  { value: 'agentforce', label: 'Agentforce', icon: '🤖' },
  { value: 'third_party', label: 'Sistemas de Terceros (APIs)', icon: '🔌' },
];

export const INDUSTRY_CORE_SOURCES: Record<string, DataSourceOption[]> = {
  travel_hospitality: [
    { value: 'pms', label: 'PMS (Property Management System)', description: 'Opera, Infor, Mews, Cloudbeds', icon: '🏨' },
    { value: 'crs', label: 'Motor de Reservas / CRS', description: 'Sabre, Amadeus, IBS, Travelport', icon: '📋' },
    { value: 'loyalty', label: 'Plataforma de Lealtad / Puntos', description: 'Loyalty Engine, Comarch, OpenLoyalty', icon: '⭐' },
    { value: 'gds', label: 'GDS (Global Distribution System)', description: 'Sabre GDS, Amadeus, Galileo, Worldspan', icon: '🌐' },
  ],
  healthcare: [
    { value: 'ehr', label: 'EHR / EMR (Expediente Clínico)', description: 'Epic, Cerner, Meditech, Athena', icon: '📋' },
    { value: 'scheduling', label: 'Sistema de Citas y Admisión', description: 'Gestión de agenda y admisiones hospitalarias', icon: '📅' },
    { value: 'pharmacy', label: 'Farmacia / Laboratorio', description: 'Sistemas de farmacia y laboratorio clínico', icon: '💊' },
  ],
  financial_services: [
    { value: 'core_banking', label: 'Core Bancario / Core Asegurador', description: 'Temenos, Finastra, FIS, Guidewire', icon: '🏦' },
    { value: 'policies', label: 'Sistema de Pólizas y Siniestros', description: 'Policy & claims management', icon: '📄' },
    { value: 'trading', label: 'Plataformas de Inversión / Trading', description: 'Bloomberg, Refinitiv, Murex', icon: '📈' },
  ],
  retail: [
    { value: 'pos_retail', label: 'Puntos de Venta Físicos (POS)', description: 'Oracle Retail, NCR, Square, Lightspeed', icon: '🏪' },
    { value: 'ecommerce', label: 'E-commerce', description: 'Commerce Cloud, Shopify, Magento', icon: '🛒' },
    { value: 'erp_retail', label: 'ERP / Catálogo de Productos', description: 'SAP, Oracle, Microsoft Dynamics', icon: '🏢' },
  ],
  consumer_goods: [
    { value: 'pos_cg', label: 'Puntos de Venta Físicos (POS)', description: 'Oracle Retail, NCR, Square', icon: '🏪' },
    { value: 'ecommerce_cg', label: 'E-commerce / DTC', description: 'Commerce Cloud, Shopify, Magento', icon: '🛒' },
    { value: 'erp_cg', label: 'ERP / Catálogo de Productos', description: 'SAP, Oracle, Microsoft Dynamics', icon: '🏢' },
  ],
};

export const DEFAULT_CORE_SOURCES: DataSourceOption[] = [
  { value: 'erp_generic', label: 'ERP / Facturación', description: 'SAP, Oracle, NetSuite', icon: '🏢' },
  { value: 'crm_core', label: 'Base de Clientes / Sistema Maestro', description: 'CRM u otro sistema maestro de clientes', icon: '👥' },
];

export const TRANSVERSAL_SOURCE_GROUPS: TransversalSourceGroup[] = [
  {
    group: 'crm_sales',
    groupLabel: 'CRM & Ventas',
    sources: [
      { value: 'sf_crm', label: 'Salesforce CRM (Sales/Service)', description: 'Sales Cloud, Service Cloud, otros orgs', icon: '☁️' },
      { value: 'other_crm', label: 'Otro CRM', description: 'HubSpot, Microsoft Dynamics, Zoho CRM', icon: '🤝' },
    ],
  },
  {
    group: 'service_callcenter',
    groupLabel: 'Atención & Call Center',
    sources: [
      { value: 'service_desk', label: 'Service Cloud / Zendesk', description: 'Gestión de casos, tickets y soporte', icon: '🎧' },
      { value: 'cti', label: 'Telefonía / CTI / IVR', description: 'Genesys, Amazon Connect, Avaya, Five9', icon: '📞' },
    ],
  },
  {
    group: 'ingestion',
    groupLabel: 'Mecanismos de Ingesta & Archivos',
    sources: [
      { value: 'api_webhooks', label: 'APIs / Webhooks en tiempo real', description: 'REST APIs, event streams, webhooks', icon: '🔌' },
      { value: 'sftp_files', label: 'Archivos / SFTP / Lotes planos', description: 'CSV, Amazon S3, Azure Blob, FTP', icon: '📁' },
    ],
  },
  {
    group: 'digital',
    groupLabel: 'Comportamiento Digital',
    sources: [
      { value: 'mobile_sdk', label: 'App Móvil (SDK)', description: 'Firebase, Segment, Amplitude, MParticle', icon: '📱' },
      { value: 'web_analytics', label: 'Navegación Web / Tag Management', description: 'Google Analytics, Adobe Analytics, GTM', icon: '🌐' },
    ],
  },
  {
    group: 'data_platform',
    groupLabel: 'Data Lake & DWH',
    sources: [
      { value: 'datalake', label: 'Snowflake / BigQuery / Databricks', description: 'Cloud data warehouse o data lakehouse', icon: '🗄️' },
      { value: 'cloud_dw', label: 'Amazon Redshift / Azure Synapse', description: 'Data warehouse en AWS o Azure', icon: '☁️' },
    ],
  },
  {
    group: 'marketing',
    groupLabel: 'Marketing & Medios',
    sources: [
      { value: 'marketing_cloud', label: 'Salesforce Marketing Cloud', description: 'Email, SMS, Mobile Push, Journeys', icon: '📧' },
      { value: 'paid_ads', label: 'Plataformas de Pauta', description: 'Google Ads, Meta Ads, DV360, The Trade Desk', icon: '📣' },
    ],
  },
];
