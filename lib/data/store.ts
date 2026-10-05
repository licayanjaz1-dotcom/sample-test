import fs from 'fs';
import path from 'path';
import {
  ActionRecord,
  Barangay,
  Complaint,
  ComplaintAssignment,
  ComplaintCategory,
  ComplaintFilterOptions,
  ComplaintPriority,
  ComplaintStatus,
  ComplaintStatusHistory,
  DashboardStats,
  UserProfile,
} from '../types';
import {
  DEFAULT_COMPLAINT_CATEGORIES,
  DEFAULT_USERS,
  OFFICIAL_BUTUAN_BARANGAYS,
} from '../constants';
import { ComplaintRegistrationInput } from '../validations/complaint';
import { isSupabaseConfigured, supabase } from '../supabase/client';

// Local storage file for simple persistence without mock data
const DATA_FILE = path.join(process.cwd(), 'complaints-data.json');

function loadStoredComplaints(): Complaint[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Fall back to empty array
  }
  return [];
}

function saveStoredComplaints(data: Complaint[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Ignore file write error in restricted environments
  }
}

// Global cached state (empty by default, no mock data)
const globalStore = globalThis as unknown as {
  __BUTUAN_COMPLAINTS__?: Complaint[];
  __BUTUAN_BARANGAYS__?: Barangay[];
  __BUTUAN_CATEGORIES__?: ComplaintCategory[];
  __BUTUAN_USERS__?: UserProfile[];
};

if (!globalStore.__BUTUAN_COMPLAINTS__) {
  globalStore.__BUTUAN_COMPLAINTS__ = loadStoredComplaints();
}

if (!globalStore.__BUTUAN_BARANGAYS__) {
  globalStore.__BUTUAN_BARANGAYS__ = OFFICIAL_BUTUAN_BARANGAYS.map((b, idx) => ({
    id: `brgy-${idx + 1}`,
    name: b.name,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  }));
}

if (!globalStore.__BUTUAN_CATEGORIES__) {
  globalStore.__BUTUAN_CATEGORIES__ = DEFAULT_COMPLAINT_CATEGORIES.map((c, idx) => ({
    id: `cat-${idx + 1}`,
    name: c.name,
    description: c.description,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  }));
}

if (!globalStore.__BUTUAN_USERS__) {
  globalStore.__BUTUAN_USERS__ = [...DEFAULT_USERS];
}

const cachedComplaints = globalStore.__BUTUAN_COMPLAINTS__;
const cachedBarangays = globalStore.__BUTUAN_BARANGAYS__;
const cachedCategories = globalStore.__BUTUAN_CATEGORIES__;
const cachedUsers = globalStore.__BUTUAN_USERS__;

// Helper to find barangay by ID or name
function resolveBarangay(idOrName: string): Barangay | undefined {
  return cachedBarangays.find(
    (b) => b.id === idOrName || b.name.toLowerCase() === idOrName.toLowerCase()
  );
}

// -------------------------------------------------------------
// EXPORTED STORE METHODS
// -------------------------------------------------------------

export async function getComplaints(
  filters?: ComplaintFilterOptions
): Promise<Complaint[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('complaints').select(`
        *,
        category:complaint_categories(*),
        location:locations(*, barangay:barangays(*)),
        complainant:complainants(*),
        assigned_staff:profiles!complaints_assigned_to_fkey(*),
        status_history:complaint_status_history(*),
        action_records:action_records(*),
        assignments:complaint_assignments(*)
      `);

      if (filters?.categoryId && filters.categoryId !== 'ALL') {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority && filters.priority !== 'ALL') {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as unknown as Complaint[];
      }
    } catch {
      // Fallback to local store
    }
  }

  let list = [...cachedComplaints];

  if (filters?.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.complaint_number.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location?.barangay_name?.toLowerCase().includes(q) ||
        c.location?.landmark?.toLowerCase().includes(q) ||
        c.complainant?.full_name?.toLowerCase().includes(q)
    );
  }

  if (filters?.categoryId && filters.categoryId !== 'ALL') {
    list = list.filter((c) => c.category_id === filters.categoryId);
  }

  if (filters?.barangayId && filters.barangayId !== 'ALL') {
    list = list.filter(
      (c) =>
        c.location?.barangay_id === filters.barangayId ||
        c.location?.barangay_name === filters.barangayId
    );
  }

  if (filters?.status && filters.status !== 'ALL') {
    list = list.filter((c) => c.status === filters.status);
  }

  if (filters?.priority && filters.priority !== 'ALL') {
    list = list.filter((c) => c.priority === filters.priority);
  }

  if (filters?.assignedTo && filters.assignedTo !== 'ALL') {
    list = list.filter((c) => c.assigned_to === filters.assignedTo);
  }

  if (filters?.startDate) {
    const start = new Date(filters.startDate).getTime();
    list = list.filter((c) => new Date(c.date_reported).getTime() >= start);
  }

  if (filters?.endDate) {
    const end = new Date(filters.endDate).getTime() + 86400000;
    list = list.filter((c) => new Date(c.date_reported).getTime() <= end);
  }

  return list.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getComplaintById(id: string): Promise<Complaint | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          category:complaint_categories(*),
          location:locations(*, barangay:barangays(*)),
          complainant:complainants(*),
          assigned_staff:profiles!complaints_assigned_to_fkey(*),
          status_history:complaint_status_history(*),
          action_records:action_records(*),
          assignments:complaint_assignments(*)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        return data as unknown as Complaint;
      }
    } catch {
      // Fallback
    }
  }

  const found = cachedComplaints.find(
    (c) => c.id === id || c.complaint_number === id
  );
  return found || null;
}

export async function createComplaint(
  input: ComplaintRegistrationInput,
  createdBy?: string
): Promise<Complaint> {
  const brgy = resolveBarangay(input.barangayId);
  const barangayName = brgy ? brgy.name : input.barangayName || input.barangayId;
  const category = cachedCategories.find((c) => c.id === input.categoryId);

  const complaintId = `cmp-${Date.now()}`;
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const complaintNumber = `BTC-${new Date().getFullYear()}-${randomNum}`;
  const now = new Date().toISOString();

  const newComplaint: Complaint = {
    id: complaintId,
    complaint_number: complaintNumber,
    category_id: input.categoryId,
    location_id: `loc-${Date.now()}`,
    description: input.description,
    priority: input.priority,
    status: 'Pending',
    photo_path: input.photoPath || null,
    created_by: createdBy || 'Officer',
    date_reported: now,
    created_at: now,
    updated_at: now,
    complainant: {
      id: `cmp-usr-${Date.now()}`,
      full_name: input.isAnonymous ? null : input.fullName || null,
      contact_number: input.contactNumber || null,
      email: input.email || null,
      address: input.address || null,
      barangay_id: input.barangayId,
      is_anonymous: input.isAnonymous,
    },
    category: category || {
      id: input.categoryId,
      name: 'General Concern',
      status: 'ACTIVE',
    },
    location: {
      id: `loc-${Date.now()}`,
      barangay_id: input.barangayId,
      barangay_name: barangayName,
      purok_zone: input.purokZone || null,
      street: input.street || null,
      landmark: input.landmark || null,
      location_description: input.locationDescription || null,
      latitude: input.latitude !== undefined ? input.latitude : null,
      longitude: input.longitude !== undefined ? input.longitude : null,
    },
    status_history: [
      {
        id: `sth-${Date.now()}`,
        complaint_id: complaintId,
        previous_status: null,
        new_status: 'Pending',
        changed_by: createdBy || 'Citizen Intake',
        changed_by_name: input.isAnonymous
          ? 'Anonymous Citizen'
          : input.fullName || 'Citizen Intake',
        remarks: 'Complaint registered successfully.',
        created_at: now,
      },
    ],
    action_records: [],
    assignments: [],
  };

  cachedComplaints.unshift(newComplaint);
  saveStoredComplaints(cachedComplaints);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('complaints').insert({
        id: newComplaint.id,
        complaint_number: newComplaint.complaint_number,
        category_id: newComplaint.category_id,
        location_id: newComplaint.location_id,
        description: newComplaint.description,
        priority: newComplaint.priority,
        status: newComplaint.status,
        photo_path: newComplaint.photo_path,
        created_by: newComplaint.created_by,
        date_reported: newComplaint.date_reported,
      });
    } catch {
      // Keep cached copy
    }
  }

  return newComplaint;
}

export async function updateComplaintStatus(
  complaintId: string,
  newStatus: ComplaintStatus,
  changedBy: string = 'Officer',
  changerName: string = 'Staff Officer',
  remarks?: string
): Promise<Complaint | null> {
  const complaint = cachedComplaints.find(
    (c) => c.id === complaintId || c.complaint_number === complaintId
  );
  if (!complaint) return null;

  const previousStatus = complaint.status;
  complaint.status = newStatus;
  complaint.updated_at = new Date().toISOString();

  if (newStatus === 'Resolved' && !complaint.date_resolved) {
    complaint.date_resolved = new Date().toISOString();
  }

  const historyEntry: ComplaintStatusHistory = {
    id: `sth-${Date.now()}`,
    complaint_id: complaint.id,
    previous_status: previousStatus,
    new_status: newStatus,
    changed_by: changedBy,
    changed_by_name: changerName,
    remarks: remarks || `Status updated from ${previousStatus} to ${newStatus}`,
    created_at: new Date().toISOString(),
  };

  if (!complaint.status_history) complaint.status_history = [];
  complaint.status_history.push(historyEntry);

  saveStoredComplaints(cachedComplaints);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('complaints')
        .update({
          status: newStatus,
          date_resolved: complaint.date_resolved,
          updated_at: complaint.updated_at,
        })
        .eq('id', complaint.id);
    } catch {
      // Ignored
    }
  }

  return complaint;
}

export async function assignComplaint(
  complaintId: string,
  assignedTo: string,
  assignedBy: string = 'Officer',
  instructions?: string,
  remarks?: string
): Promise<Complaint | null> {
  const complaint = cachedComplaints.find(
    (c) => c.id === complaintId || c.complaint_number === complaintId
  );
  if (!complaint) return null;

  const staff = cachedUsers.find((u) => u.id === assignedTo);

  complaint.assigned_to = assignedTo;
  complaint.assigned_staff = staff || {
    id: assignedTo,
    full_name: 'Assigned Officer',
    email: 'staff@butuan.gov.ph',
    role: 'STAFF',
    status: 'ACTIVE',
  };
  complaint.updated_at = new Date().toISOString();

  if (complaint.status === 'Pending' || complaint.status === 'Verified') {
    const prev = complaint.status;
    complaint.status = 'Assigned';
    if (!complaint.status_history) complaint.status_history = [];
    complaint.status_history.push({
      id: `sth-${Date.now()}`,
      complaint_id: complaint.id,
      previous_status: prev,
      new_status: 'Assigned',
      changed_by: assignedBy,
      changed_by_name: 'Administrator',
      remarks: `Assigned to ${staff?.full_name || 'Staff'}.`,
      created_at: new Date().toISOString(),
    });
  }

  const assignment: ComplaintAssignment = {
    id: `asg-${Date.now()}`,
    complaint_id: complaint.id,
    assigned_to: assignedTo,
    assigned_to_name: staff?.full_name || 'Assigned Officer',
    assigned_by: assignedBy,
    assigned_by_name: 'Administrator',
    assignment_date: new Date().toISOString(),
    instructions: instructions || null,
    remarks: remarks || null,
    created_at: new Date().toISOString(),
  };

  if (!complaint.assignments) complaint.assignments = [];
  complaint.assignments.unshift(assignment);

  saveStoredComplaints(cachedComplaints);
  return complaint;
}

export async function addActionRecord(
  complaintId: string,
  actionTaken: string,
  userId: string = 'Officer',
  userName: string = 'Staff Officer',
  remarks?: string
): Promise<ActionRecord> {
  const complaint = cachedComplaints.find(
    (c) => c.id === complaintId || c.complaint_number === complaintId
  );
  const record: ActionRecord = {
    id: `act-${Date.now()}`,
    complaint_id: complaintId,
    action_taken: actionTaken,
    remarks: remarks || null,
    action_date: new Date().toISOString(),
    user_id: userId,
    user_name: userName,
    created_at: new Date().toISOString(),
  };

  if (complaint) {
    if (!complaint.action_records) complaint.action_records = [];
    complaint.action_records.unshift(record);

    if (complaint.status === 'Assigned') {
      await updateComplaintStatus(
        complaint.id,
        'In Progress',
        userId,
        userName,
        'Field action commenced.'
      );
    }
    saveStoredComplaints(cachedComplaints);
  }

  return record;
}

export async function deleteComplaint(id: string): Promise<boolean> {
  const index = cachedComplaints.findIndex(
    (c) => c.id === id || c.complaint_number === id
  );
  if (index !== -1) {
    cachedComplaints.splice(index, 1);
    saveStoredComplaints(cachedComplaints);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('complaints').delete().eq('id', id);
      } catch {
        // Ignored
      }
    }
    return true;
  }
  return false;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const complaints = await getComplaints();

  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter((c) => c.status === 'Pending').length;
  const verifiedComplaints = complaints.filter((c) => c.status === 'Verified').length;
  const assignedComplaints = complaints.filter((c) => c.status === 'Assigned').length;
  const inProgressComplaints = complaints.filter(
    (c) => c.status === 'In Progress'
  ).length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved').length;
  const closedComplaints = complaints.filter((c) => c.status === 'Closed').length;

  // By Category
  const catMap = new Map<string, number>();
  complaints.forEach((c) => {
    const name = c.category?.name || 'Other';
    catMap.set(name, (catMap.get(name) || 0) + 1);
  });
  const byCategory = Array.from(catMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // By Barangay
  const brgyMap = new Map<string, number>();
  complaints.forEach((c) => {
    const name = c.location?.barangay_name || 'Unknown';
    brgyMap.set(name, (brgyMap.get(name) || 0) + 1);
  });
  const byBarangay = Array.from(brgyMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // By Status
  const statuses: ComplaintStatus[] = [
    'Pending',
    'Verified',
    'Assigned',
    'In Progress',
    'Resolved',
    'Closed',
  ];
  const byStatus = statuses.map((status) => ({
    status,
    count: complaints.filter((c) => c.status === status).length,
  }));

  // Over time (last 7 days)
  const days: { [key: string]: number } = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    days[key] = 0;
  }
  complaints.forEach((c) => {
    const d = new Date(c.date_reported);
    const key = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    if (days[key] !== undefined) {
      days[key]++;
    }
  });
  const overTime = Object.entries(days).map(([date, count]) => ({ date, count }));

  return {
    totalComplaints,
    pendingComplaints,
    verifiedComplaints,
    assignedComplaints,
    inProgressComplaints,
    resolvedComplaints,
    closedComplaints,
    byCategory,
    byBarangay,
    byStatus,
    overTime,
    recentComplaints: complaints.slice(0, 6),
  };
}

// Barangay Management Methods
export async function getBarangays(): Promise<Barangay[]> {
  return cachedBarangays;
}

export async function createBarangay(
  name: string,
  status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE'
): Promise<Barangay> {
  const newBrgy: Barangay = {
    id: `brgy-${Date.now()}`,
    name,
    status,
    created_at: new Date().toISOString(),
  };
  cachedBarangays.unshift(newBrgy);
  return newBrgy;
}

export async function updateBarangay(
  id: string,
  updates: Partial<Barangay>
): Promise<Barangay | null> {
  const brgy = cachedBarangays.find((b) => b.id === id);
  if (!brgy) return null;
  Object.assign(brgy, updates);
  return brgy;
}

// Category Management Methods
export async function getCategories(): Promise<ComplaintCategory[]> {
  return cachedCategories;
}

export async function createCategory(
  name: string,
  description?: string
): Promise<ComplaintCategory> {
  const newCat: ComplaintCategory = {
    id: `cat-${Date.now()}`,
    name,
    description: description || null,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  };
  cachedCategories.unshift(newCat);
  return newCat;
}

export async function updateCategory(
  id: string,
  updates: Partial<ComplaintCategory>
): Promise<ComplaintCategory | null> {
  const cat = cachedCategories.find((c) => c.id === id);
  if (!cat) return null;
  Object.assign(cat, updates);
  return cat;
}

// User Management Methods
export async function getUsers(): Promise<UserProfile[]> {
  return cachedUsers;
}

export async function createUser(
  data: Omit<UserProfile, 'id' | 'created_at'>
): Promise<UserProfile> {
  const newUser: UserProfile = {
    id: `usr-${Date.now()}`,
    ...data,
    created_at: new Date().toISOString(),
  };
  cachedUsers.unshift(newUser);
  return newUser;
}

export async function updateUser(
  id: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  const user = cachedUsers.find((u) => u.id === id);
  if (!user) return null;
  Object.assign(user, updates);
  return user;
}
