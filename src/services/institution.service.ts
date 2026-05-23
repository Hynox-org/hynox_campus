import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export interface InstitutionInsertInput {
  name: string;
  slug: string;
  institution_code: string;
  institution_type: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logo_url?: string;
  status?: string;
  created_by?: string | null;
}

/**
 * Fetches all available institution types from the database.
 */
export async function fetchInstitutionTypes(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .schema('institution')
    .from('institution_types')
    .select('code, description')
    .order('code', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch institution types: ${error.message}`);
  }
  return data;
}

/**
 * Fetches the list of registered institutions.
 */
export async function fetchInstitutionsList(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .schema('institution')
    .from('institutions')
    .select('id, name, institution_code, institution_type, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch institutions: ${error.message}`);
  }
  return data;
}

/**
 * Inserts a new institution into the database.
 */
export async function insertNewInstitution(supabase: SupabaseClient<Database>, input: InstitutionInsertInput) {
  const { data, error } = await supabase
    .schema('institution')
    .from('institutions')
    .insert({
      name: input.name,
      slug: input.slug,
      institution_code: input.institution_code,
      institution_type: input.institution_type,
      email: input.email || null,
      phone: input.phone || null,
      address: input.address || null,
      website: input.website || null,
      logo_url: input.logo_url || null,
      status: input.status || 'onboarding',
      created_by: input.created_by || null
    })
    .select()
    .single();

  if (error) {
    return { success: false, error };
  }
  return { success: true, data };
}

/**
 * Verifies that the 'institution_created' audit log exists for a given institution slug.
 */
export async function verifyAuditLog(supabase: SupabaseClient<Database>, slug: string) {
  const { data, error } = await supabase
    .schema('core')
    .from('audit_logs')
    .select('id, event_type, metadata')
    .eq('event_type', 'institution_created')
    .limit(10); // Fetch a small batch to scan

  if (error) {
    console.error('Audit verification query error:', error);
    return false;
  }
  
  if (!data) return false;

  const match = data.find(log => {
    const meta = log.metadata as Record<string, any> | null;
    return meta && meta.slug === slug;
  });

  return !!match;
}
