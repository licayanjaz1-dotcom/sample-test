export type UserRole = 'ADMIN' | 'STAFF';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ComplaintStatus =
  | 'Pending'
  | 'Verified'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  contact_number?: string | null;
  status: UserStatus;
  created_at?: string;
}

export interface Barangay {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  puroks?: string[];
  landmarks?: string[];
  created_at?: string;
}

export interface ComplaintCategory {
  id: string;
  name: string;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export interface Complainant {
  id?: string;
  full_name?: string | null;
  contact_number?: string | null;
  email?: string | null;
  address?: string | null;
  barangay_id?: string | null;
  is_anonymous: boolean;
  created_at?: string;
}

export interface ComplaintLocation {
  id?: string;
  barangay_id: string;
  barangay_name?: string;
  purok_zone?: string | null;
  street?: string | null;
  landmark?: string | null;
  location_description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
}

export interface ComplaintAssignment {
  id: string;
  complaint_id: string;
  assigned_to: string;
  assigned_to_name?: string;
  assigned_by: string;
  assigned_by_name?: string;
  assignment_date: string;
  instructions?: string | null;
  remarks?: string | null;
  created_at: string;
}

export interface ComplaintStatusHistory {
  id: string;
  complaint_id: string;
  previous_status: ComplaintStatus | null;
  new_status: ComplaintStatus;
  changed_by: string;
  changed_by_name?: string;
  remarks?: string | null;
  created_at: string;
}

export interface ActionRecord {
  id: string;
  complaint_id: string;
  action_taken: string;
  remarks?: string | null;
  action_date: string;
  user_id: string;
  user_name?: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  complaint_number: string;
  complainant_id?: string | null;
  category_id: string;
  location_id: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  photo_path?: string | null;
  created_by?: string | null;
  assigned_to?: string | null;
  date_reported: string;
  date_resolved?: string | null;
  created_at: string;
  updated_at: string;

  // Joined / Populated fields
  complainant?: Complainant;
  category?: ComplaintCategory;
  location?: ComplaintLocation;
  assigned_staff?: UserProfile | null;
  assignments?: ComplaintAssignment[];
  status_history?: ComplaintStatusHistory[];
  action_records?: ActionRecord[];
}

export interface ComplaintFilterOptions {
  search?: string;
  categoryId?: string;
  barangayId?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
}

export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  verifiedComplaints: number;
  assignedComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  closedComplaints: number;
  byCategory: { name: string; count: number }[];
  byBarangay: { name: string; count: number }[];
  byStatus: { status: ComplaintStatus; count: number }[];
  overTime: { date: string; count: number }[];
  recentComplaints: Complaint[];
}
