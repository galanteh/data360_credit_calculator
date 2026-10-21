export interface IndustryOption {
  value: string;
  label: string;
  icon: string;
  color: string;
  defaultProfiles: number;
  defaultEngagement: number;
}

export const INDUSTRY_OPTIONS: IndustryOption[] = [
  {
    value: 'retail',
    label: 'Retail / E-commerce',
    icon: '🛒',
    color: '#0070D2',
    defaultProfiles: 2_000_000,
    defaultEngagement: 10_000_000,
  },
  {
    value: 'banking',
    label: 'Banca / Servicios Financieros',
    icon: '🏦',
    color: '#032D60',
    defaultProfiles: 1_000_000,
    defaultEngagement: 5_000_000,
  },
  {
    value: 'manufacturing',
    label: 'Manufactura / Industria',
    icon: '🏭',
    color: '#706E6B',
    defaultProfiles: 500_000,
    defaultEngagement: 2_000_000,
  },
  {
    value: 'telecom',
    label: 'Telecomunicaciones',
    icon: '📡',
    color: '#1589EE',
    defaultProfiles: 5_000_000,
    defaultEngagement: 25_000_000,
  },
  {
    value: 'healthcare',
    label: 'Salud / Healthcare',
    icon: '🏥',
    color: '#4BCA81',
    defaultProfiles: 1_000_000,
    defaultEngagement: 4_000_000,
  },
  {
    value: 'media',
    label: 'Media / Entretenimiento',
    icon: '🎬',
    color: '#FFB75D',
    defaultProfiles: 3_000_000,
    defaultEngagement: 20_000_000,
  },
  {
    value: 'energy',
    label: 'Energía / Utilities',
    icon: '⚡',
    color: '#FF5D5D',
    defaultProfiles: 500_000,
    defaultEngagement: 1_500_000,
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
