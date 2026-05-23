'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/services/user.service';
import { 
  fetchInstitutionTypes, 
  fetchInstitutionsList, 
  insertNewInstitution, 
  verifyAuditLog,
  InstitutionInsertInput 
} from '@/services/institution.service';

/**
 * Checks if the current authenticated user has the 'super_admin' role.
 */
async function checkSuperAdmin(supabase: any) {
  const session = await getCurrentUser(supabase);
  if (!session) {
    return { isAuthorized: false, userId: null, error: 'Authentication failed. Please log in.' };
  }

  const isSuper = session.roles.includes('super_admin');
  if (!isSuper) {
    return { isAuthorized: false, userId: session.user.id, error: 'Access denied. Super Admin role required.' };
  }

  return { isAuthorized: true, userId: session.user.id };
}

/**
 * Server Action: Fetches all registered institution types.
 */
export async function getInstitutionTypesAction() {
  try {
    const supabase = await createClient();
    const data = await fetchInstitutionTypes(supabase);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Server Action: Fetches all registered institutions.
 */
export async function getInstitutionsAction() {
  try {
    const supabase = await createClient();
    const data = await fetchInstitutionsList(supabase);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Server Action: Creates a new institution (restricted to Super Admins).
 */
export async function createInstitutionAction(input: Omit<InstitutionInsertInput, 'created_by'>) {
  try {
    const supabase = await createClient();
    
    // 1. Authorize the user
    const authResult = await checkSuperAdmin(supabase);
    if (!authResult.isAuthorized) {
      return { success: false, error: authResult.error };
    }

    // 2. Insert the record
    const insertResult = await insertNewInstitution(supabase, {
      ...input,
      created_by: authResult.userId
    });

    if (!insertResult.success) {
      const dbError = insertResult.error;
      
      // Handle Postgres unique constraint violation error (code '23505')
      if (dbError?.code === '23505') {
        if (dbError.message.includes('slug')) {
          return { success: false, error: `An institution with the slug "${input.slug}" already exists.` };
        }
        if (dbError.message.includes('institution_code')) {
          return { success: false, error: `An institution with the code "${input.institution_code}" already exists.` };
        }
        return { success: false, error: 'An institution with duplicate unique values already exists.' };
      }

      // Handle RLS or other database errors
      if (dbError?.code === '42501') {
        return { success: false, error: 'RLS Permission Denied: You do not have permission to write to this table.' };
      }

      return { success: false, error: dbError?.message || 'Failed to insert institution.' };
    }

    // 3. Verify the automated audit log trigger executed successfully
    const auditVerified = await verifyAuditLog(supabase, input.slug);

    return { 
      success: true, 
      data: insertResult.data,
      auditVerified: auditVerified
    };
  } catch (err: any) {
    console.error('createInstitutionAction error:', err);
    return { success: false, error: err.message || 'An unexpected error occurred during execution.' };
  }
}
