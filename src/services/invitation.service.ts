import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export interface InvitationWithUser {
  id: string;
  user_id: string;
  tenant_id: string | null;
  token: string;
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  status: string;
  invitation_type: string;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    email: string;
    full_name: string | null;
    status: string;
    tenant_id: string | null;
    deleted_at: string | null;
  } | null;
}

/**
 * Resolves an invitation record by token, including its linked user details.
 */
export async function getInvitationByToken(
  supabase: SupabaseClient<Database>,
  token: string
): Promise<InvitationWithUser | null> {
  const { data, error } = await supabase
    .schema('core')
    .from('user_invitations')
    .select('*, users:users(id, email, full_name, status, tenant_id, deleted_at)')
    .eq('token', token)
    .single();

  if (error || !data) {
    console.error('Failed to get invitation by token:', error?.message);
    return null;
  }

  return data as unknown as InvitationWithUser;
}

/**
 * Updates invitation status to 'accepted' and sets accepted_at.
 */
export async function acceptInvitation(
  supabase: SupabaseClient<Database>,
  invitationId: string
) {
  const { data, error } = await supabase
    .schema('core')
    .from('user_invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', invitationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to accept invitation: ${error.message}`);
  }
  return data;
}
