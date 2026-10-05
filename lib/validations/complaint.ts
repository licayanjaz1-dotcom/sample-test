import { z } from 'zod';

export const complaintRegistrationSchema = z
  .object({
    categoryId: z.string().min(1, 'Please select a complaint category'),
    description: z
      .string()
      .min(10, 'Complaint description must be at least 10 characters')
      .max(2000, 'Complaint description cannot exceed 2000 characters'),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent'], {
      message: 'Please select a valid priority level',
    }),
    // Complainant fields
    isAnonymous: z.boolean().default(false),
    fullName: z.string().optional(),
    contactNumber: z.string().optional(),
    email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
    address: z.string().optional(),
    // Location fields (Barangay is REQUIRED, Purok/Street/Landmark are OPTIONAL)
    barangayId: z.string().min(1, 'Barangay is required'),
    barangayName: z.string().optional(),
    purokZone: z.string().optional(),
    street: z.string().optional(),
    landmark: z.string().optional(),
    locationDescription: z.string().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    // Evidence
    photoPath: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // If not anonymous, fullName is required
      if (!data.isAnonymous) {
        return !!data.fullName && data.fullName.trim().length >= 2;
      }
      return true;
    },
    {
      message: 'Complainant full name is required unless marked as Anonymous',
      path: ['fullName'],
    }
  );

export type ComplaintRegistrationInput = z.infer<typeof complaintRegistrationSchema>;

export const statusUpdateSchema = z.object({
  complaintId: z.string().min(1, 'Complaint ID is required'),
  newStatus: z.enum([
    'Pending',
    'Verified',
    'Assigned',
    'In Progress',
    'Resolved',
    'Closed',
  ]),
  remarks: z.string().max(500, 'Remarks cannot exceed 500 characters').optional(),
});

export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;

export const assignmentSchema = z.object({
  complaintId: z.string().min(1, 'Complaint ID is required'),
  assignedTo: z.string().min(1, 'Please select a staff member to assign'),
  instructions: z.string().max(1000).optional(),
  remarks: z.string().max(500).optional(),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;

export const actionRecordSchema = z.object({
  complaintId: z.string().min(1, 'Complaint ID is required'),
  actionTaken: z
    .string()
    .min(5, 'Action taken description must be at least 5 characters')
    .max(1000),
  remarks: z.string().max(500).optional(),
});

export type ActionRecordInput = z.infer<typeof actionRecordSchema>;

export const userManagementSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'STAFF']),
  contactNumber: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export type UserManagementInput = z.infer<typeof userManagementSchema>;

export const barangayManagementSchema = z.object({
  name: z.string().min(2, 'Barangay name must be at least 2 characters'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type BarangayManagementInput = z.infer<typeof barangayManagementSchema>;

export const categoryManagementSchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export type CategoryManagementInput = z.infer<typeof categoryManagementSchema>;
