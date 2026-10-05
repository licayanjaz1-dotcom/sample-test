'use server';

import { revalidatePath } from 'next/cache';
import {
  actionRecordSchema,
  assignmentSchema,
  complaintRegistrationSchema,
  statusUpdateSchema,
} from '../validations/complaint';
import {
  addActionRecord,
  assignComplaint,
  createComplaint,
  deleteComplaint,
  getComplaintById,
  getComplaints,
  updateComplaintStatus,
} from '../data/store';
import { ComplaintFilterOptions, ComplaintStatus } from '../types';

export async function fetchComplaintsAction(filters?: ComplaintFilterOptions) {
  try {
    const list = await getComplaints(filters);
    return { success: true, data: list };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch complaints',
    };
  }
}

export async function fetchComplaintByIdAction(id: string) {
  try {
    const complaint = await getComplaintById(id);
    if (!complaint) {
      return { success: false, error: 'Complaint not found' };
    }
    return { success: true, data: complaint };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch complaint',
    };
  }
}

export async function submitComplaintAction(rawData: unknown) {
  try {
    const parsed = complaintRegistrationSchema.safeParse(rawData);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join('. ');
      return { success: false, error: errorMsg };
    }

    const complaint = await createComplaint(parsed.data);
    revalidatePath('/complaints');
    revalidatePath('/dashboard');
    revalidatePath('/map');
    return { success: true, data: complaint };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to submit complaint',
    };
  }
}

export async function updateStatusAction(
  complaintId: string,
  newStatus: ComplaintStatus,
  changedBy: string = 'usr-admin-01',
  changerName: string = 'Administrator',
  remarks?: string
) {
  try {
    const parsed = statusUpdateSchema.safeParse({
      complaintId,
      newStatus,
      remarks,
    });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join('. '),
      };
    }

    const updated = await updateComplaintStatus(
      complaintId,
      newStatus,
      changedBy,
      changerName,
      remarks
    );

    revalidatePath(`/complaints/${complaintId}`);
    revalidatePath('/complaints');
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update status',
    };
  }
}

export async function assignComplaintAction(
  complaintId: string,
  assignedTo: string,
  assignedBy: string = 'usr-admin-01',
  instructions?: string,
  remarks?: string
) {
  try {
    const parsed = assignmentSchema.safeParse({
      complaintId,
      assignedTo,
      instructions,
      remarks,
    });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join('. '),
      };
    }

    const updated = await assignComplaint(
      complaintId,
      assignedTo,
      assignedBy,
      instructions,
      remarks
    );

    revalidatePath(`/complaints/${complaintId}`);
    revalidatePath('/complaints');
    revalidatePath('/assignments');
    return { success: true, data: updated };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to assign complaint',
    };
  }
}

export async function addActionRecordAction(
  complaintId: string,
  actionTaken: string,
  userId: string = 'usr-staff-01',
  userName: string = 'Staff Officer',
  remarks?: string
) {
  try {
    const parsed = actionRecordSchema.safeParse({
      complaintId,
      actionTaken,
      remarks,
    });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join('. '),
      };
    }

    const record = await addActionRecord(
      complaintId,
      actionTaken,
      userId,
      userName,
      remarks
    );

    revalidatePath(`/complaints/${complaintId}`);
    revalidatePath('/complaints');
    return { success: true, data: record };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to record action',
    };
  }
}

export async function deleteComplaintAction(complaintId: string) {
  try {
    const deleted = await deleteComplaint(complaintId);
    if (!deleted) {
      return { success: false, error: 'Complaint not found' };
    }
    revalidatePath('/complaints');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete complaint',
    };
  }
}
