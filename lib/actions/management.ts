'use server';

import { revalidatePath } from 'next/cache';
import {
  createBarangay,
  createCategory,
  createUser,
  getBarangays,
  getCategories,
  getDashboardStats,
  getUsers,
  updateBarangay,
  updateCategory,
  updateUser,
} from '../data/store';
import {
  barangayManagementSchema,
  categoryManagementSchema,
  userManagementSchema,
} from '../validations/complaint';

export async function fetchDashboardStatsAction() {
  try {
    const stats = await getDashboardStats();
    return { success: true, data: stats };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch dashboard stats',
    };
  }
}

export async function fetchBarangaysAction() {
  try {
    const data = await getBarangays();
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch barangays',
    };
  }
}

export async function createBarangayAction(name: string) {
  try {
    const parsed = barangayManagementSchema.safeParse({ name });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join('. '),
      };
    }
    const data = await createBarangay(parsed.data.name);
    revalidatePath('/barangays');
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create barangay',
    };
  }
}

export async function updateBarangayAction(
  id: string,
  status: 'ACTIVE' | 'INACTIVE'
) {
  try {
    const data = await updateBarangay(id, { status });
    revalidatePath('/barangays');
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update barangay',
    };
  }
}

export async function fetchCategoriesAction() {
  try {
    const data = await getCategories();
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch categories',
    };
  }
}

export async function createCategoryAction(name: string, description?: string) {
  try {
    const parsed = categoryManagementSchema.safeParse({ name, description });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join('. '),
      };
    }
    const data = await createCategory(parsed.data.name, parsed.data.description);
    revalidatePath('/settings');
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create category',
    };
  }
}

export async function fetchUsersAction() {
  try {
    const data = await getUsers();
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch users',
    };
  }
}

export async function createUserAction(formData: unknown) {
  try {
    const parsed = userManagementSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join('. '),
      };
    }
    const data = await createUser({
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      role: parsed.data.role,
      status: parsed.data.status,
      contact_number: parsed.data.contactNumber || null,
    });
    revalidatePath('/users');
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create user',
    };
  }
}

export async function updateUserAction(
  id: string,
  updates: { status?: 'ACTIVE' | 'INACTIVE'; role?: 'ADMIN' | 'STAFF' }
) {
  try {
    const data = await updateUser(id, updates);
    revalidatePath('/users');
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update user',
    };
  }
}
