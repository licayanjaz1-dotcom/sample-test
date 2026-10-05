import { ComplaintPriority, ComplaintStatus } from './types';

export const BUTUAN_CITY_CENTER = {
  lat: 8.9492,
  lng: 125.5436,
  zoom: 13,
};

export const OFFICIAL_BUTUAN_BARANGAYS: { name: string; lat: number; lng: number }[] = [
  { name: 'Agao Pob. (Barangay 9)', lat: 8.9515, lng: 125.5398 },
  { name: 'Agusan Pequeño', lat: 8.9723, lng: 125.5178 },
  { name: 'Alviola Village', lat: 8.9447, lng: 125.5312 },
  { name: 'Ambago', lat: 8.9734, lng: 125.5023 },
  { name: 'Amparo', lat: 8.8724, lng: 125.5891 },
  { name: 'Ampayon', lat: 8.9575, lng: 125.6021 },
  { name: 'Anticala', lat: 9.0211, lng: 125.6712 },
  { name: 'Antongalon', lat: 8.9682, lng: 125.6318 },
  { name: 'Aupagan', lat: 8.9102, lng: 125.5923 },
  { name: 'Baan KM 3', lat: 8.9612, lng: 125.5567 },
  { name: 'Baan Riverside', lat: 8.9587, lng: 125.5489 },
  { name: 'Babag', lat: 8.9892, lng: 125.5134 },
  { name: 'Bading Pob. (Barangay 22)', lat: 8.9571, lng: 125.5342 },
  { name: 'Bancasi', lat: 8.9496, lng: 125.4802 },
  { name: 'Banza', lat: 8.9832, lng: 125.5467 },
  { name: 'Baobaoan', lat: 8.9945, lng: 125.5912 },
  { name: 'Basag', lat: 8.9245, lng: 125.6212 },
  { name: 'Bayanihan Pob. (Barangay 27)', lat: 8.9482, lng: 125.5412 },
  { name: 'Bilay', lat: 8.8523, lng: 125.6219 },
  { name: 'Bit-os', lat: 8.8834, lng: 125.6102 },
  { name: 'Bitan-agan', lat: 8.8923, lng: 125.5789 },
  { name: 'Bobon', lat: 9.0012, lng: 125.5345 },
  { name: 'Bonbon', lat: 8.9312, lng: 125.5218 },
  { name: 'Bugabus', lat: 8.8678, lng: 125.5512 },
  { name: 'Cabcabon', lat: 8.8892, lng: 125.6512 },
  { name: 'Camayahan', lat: 9.0123, lng: 125.6218 },
  { name: 'Dagohoy Pob. (Barangay 7)', lat: 8.9521, lng: 125.5432 },
  { name: 'Dankias', lat: 8.8945, lng: 125.5398 },
  { name: 'De Oro', lat: 8.9234, lng: 125.6421 },
  { name: 'Diego Silang Pob. (Barangay 6)', lat: 8.9498, lng: 125.5401 },
  { name: 'Doongan', lat: 8.9467, lng: 125.5567 },
  { name: 'Dulag', lat: 8.8412, lng: 125.5689 },
  { name: 'Dumalagan', lat: 8.9412, lng: 125.4678 },
  { name: 'Florida', lat: 8.8987, lng: 125.6321 },
  { name: 'Golden Ribbon Pob. (Barangay 2)', lat: 8.9489, lng: 125.5367 },
  { name: 'Holy Redeemer Pob. (Barangay 23)', lat: 8.9421, lng: 125.5467 },
  { name: 'Humabon Pob. (Barangay 11)', lat: 8.9534, lng: 125.5389 },
  { name: 'Imadejas Pob. (Barangay 24)', lat: 8.9434, lng: 125.5312 },
  { name: 'Kinamlutan', lat: 8.9123, lng: 125.4987 },
  { name: 'Lapu-lapu Pob. (Barangay 8)', lat: 8.9545, lng: 125.5412 },
  { name: 'Lemon', lat: 8.9189, lng: 125.5478 },
  { name: 'Leon Kilat Pob. (Barangay 13)', lat: 8.9501, lng: 125.5378 },
  { name: 'Libertad', lat: 8.9456, lng: 125.5089 },
  { name: 'Limaha Pob. (Barangay 14)', lat: 8.9478, lng: 125.5434 },
  { name: 'Los Angeles', lat: 8.9812, lng: 125.6289 },
  { name: 'Lumbocan', lat: 9.0089, lng: 125.4987 },
  { name: 'Maguinda', lat: 8.9912, lng: 125.4812 },
  { name: 'Mahay', lat: 8.9389, lng: 125.5678 },
  { name: 'Mahogany Pob. (Barangay 21)', lat: 8.9532, lng: 125.5321 },
  { name: 'Maibu', lat: 8.8712, lng: 125.6412 },
  { name: 'Mandamo', lat: 8.9034, lng: 125.5812 },
  { name: 'Manila de Bugabus', lat: 8.8789, lng: 125.5401 },
  { name: 'Maon Pob. (Barangay 1)', lat: 8.9432, lng: 125.5389 },
  { name: 'Masao', lat: 9.0189, lng: 125.5123 },
  { name: 'Maug', lat: 8.9878, lng: 125.5712 },
  { name: 'New Society Village Pob. (Barangay 26)', lat: 8.9467, lng: 125.5345 },
  { name: 'Nongnong', lat: 8.8734, lng: 125.5123 },
  { name: 'Obrero Pob. (Barangay 18)', lat: 8.9567, lng: 125.5421 },
  { name: 'Ong Yiu Pob. (Barangay 16)', lat: 8.9521, lng: 125.5356 },
  { name: 'Pagatpatan', lat: 8.9989, lng: 125.5218 },
  { name: 'Pangabugan', lat: 8.9712, lng: 125.5678 },
  { name: 'Pianing', lat: 8.9321, lng: 125.6812 },
  { name: 'Pigdaulan', lat: 8.9212, lng: 125.4789 },
  { name: 'Pinamanculan', lat: 8.9345, lng: 125.4987 },
  { name: 'Port Poyohon Pob. (Barangay 17)', lat: 8.9589, lng: 125.5389 },
  { name: 'Rajah Soliman Pob. (Barangay 4)', lat: 8.9512, lng: 125.5456 },
  { name: 'Salvacion', lat: 8.8912, lng: 125.5189 },
  { name: 'San Ignacio Pob. (Barangay 15)', lat: 8.9498, lng: 125.5467 },
  { name: 'San Mateo', lat: 8.8612, lng: 125.6012 },
  { name: 'San Vicente', lat: 8.9321, lng: 125.5398 },
  { name: 'Santa Ines', lat: 8.8321, lng: 125.5412 },
  { name: 'Santo Niño', lat: 8.9189, lng: 125.6123 },
  { name: 'Sikatuna Pob. (Barangay 10)', lat: 8.9523, lng: 125.5418 },
  { name: 'Silongan Pob. (Barangay 5)', lat: 8.9489, lng: 125.5445 },
  { name: 'Sumilihon', lat: 8.9745, lng: 125.6512 },
  { name: 'Tagabaca', lat: 8.9892, lng: 125.6412 },
  { name: 'Taguibo', lat: 8.9612, lng: 125.6189 },
  { name: 'Taligaman', lat: 8.9345, lng: 125.6312 },
  { name: 'Tandag Pob. (Barangay 19)', lat: 8.9545, lng: 125.5356 },
  { name: 'Tiniwisan', lat: 8.9489, lng: 125.5891 },
  { name: 'Tungao', lat: 8.7892, lng: 125.5612 },
  { name: 'Urduja Pob. (Barangay 3)', lat: 8.9501, lng: 125.5423 },
  { name: 'Victoria Pob. (Barangay 20)', lat: 8.9556, lng: 125.5334 },
  { name: 'Villa Kananga', lat: 8.9389, lng: 125.5267 },
];

export const DEFAULT_COMPLAINT_CATEGORIES: { name: string; description: string }[] = [
  {
    name: 'Garbage / Improper Waste Disposal',
    description: 'Uncollected refuse, illegal dumping, littering, and dirty surroundings.',
  },
  {
    name: 'Flooding',
    description: 'Overflowing rainwater, riverbank swelling, and submerged roads.',
  },
  {
    name: 'Road Damage',
    description: 'Potholes, unpaved surfaces, cracks, and hazardous road conditions.',
  },
  {
    name: 'Drainage Problem',
    description: 'Clogged culverts, open manholes, canal blockages, and foul odor.',
  },
  {
    name: 'Streetlight Problem',
    description: 'Broken, unlit, blinking, or fallen street lamp posts.',
  },
  {
    name: 'Traffic Concern',
    description: 'Illegal parking, obstructed lanes, malfunctioning traffic lights.',
  },
  {
    name: 'Environmental Concern',
    description: 'Smoke belching, river pollution, illegal cutting of trees, chemical smells.',
  },
  {
    name: 'Public Facility Problem',
    description: 'Damaged barangay hall, public park fixtures, sports complex facilities.',
  },
  {
    name: 'Water Supply Problem',
    description: 'Broken water pipes, low water pressure, contaminated supply.',
  },
  {
    name: 'Noise Complaint',
    description: 'Excessive videoke after curfew, loud modified mufflers, disturbance.',
  },
  {
    name: 'Other',
    description: 'General community concerns and other public service requests.',
  },
];

export const COMPLAINT_STATUSES: ComplaintStatus[] = [
  'Pending',
  'Verified',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

export const STATUS_CONFIG: Record<
  ComplaintStatus,
  { label: string; badgeClass: string; step: number; description: string }
> = {
  Pending: {
    label: 'Pending',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    step: 1,
    description: 'Complaint submitted and awaiting verification.',
  },
  Verified: {
    label: 'Verified',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    step: 2,
    description: 'Complaint verified by authorities and confirmed valid.',
  },
  Assigned: {
    label: 'Assigned',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    step: 3,
    description: 'Delegated to specific city department personnel.',
  },
  'In Progress': {
    label: 'In Progress',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    step: 4,
    description: 'Action is currently underway to resolve the problem.',
  },
  Resolved: {
    label: 'Resolved',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    step: 5,
    description: 'Field action completed and issue successfully resolved.',
  },
  Closed: {
    label: 'Closed',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    step: 6,
    description: 'Case officially closed after inspection and validation.',
  },
};

export const PRIORITY_CONFIG: Record<
  ComplaintPriority,
  { label: string; badgeClass: string }
> = {
  Low: {
    label: 'Low',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
  },
  Medium: {
    label: 'Medium',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
  },
  High: {
    label: 'High',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
  },
  Urgent: {
    label: 'Urgent',
    badgeClass: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 animate-pulse',
  },
};

export const DEFAULT_USERS = [
  {
    id: 'usr-admin-01',
    full_name: 'Complaints Officer',
    email: 'officer@butuan.gov.ph',
    role: 'ADMIN' as const,
    contact_number: '0917-000-0000',
    status: 'ACTIVE' as const,
    created_at: new Date().toISOString(),
  },
];

