export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  core: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_user_id: string | null;
          full_name: string | null;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          tenant_id: string | null;
          status: string;
          onboarding_source: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          delete_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['core']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['core']['Tables']['users']['Row']>;
      };
      user_roles: {
        Row: {
          user_id: string;
          role_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role_id: string;
          created_at?: string;
        };
        Update: Partial<Database['core']['Tables']['user_roles']['Row']>;
      };
      roles: {
        Row: {
          id: string;
          name: string;
          priority: number;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['core']['Tables']['roles']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['core']['Tables']['roles']['Row']>;
      };
      user_invitations: {
        Row: {
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
        };
        Insert: Omit<Database['core']['Tables']['user_invitations']['Row'], 'id' | 'token' | 'created_at' | 'updated_at'> & {
          id?: string;
          token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['core']['Tables']['user_invitations']['Row']>;
      };
      audit_logs: {
        Row: {
          id: string;
          tenant_id: string | null;
          event_type: string;
          actor_user_id: string | null;
          target_user_id: string | null;
          metadata: Record<string, any> | null;
          created_at: string;
        };
        Insert: Omit<Database['core']['Tables']['audit_logs']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['core']['Tables']['audit_logs']['Row']>;
      };
    };
  };
  institution: {
    Tables: {
      institutions: {
        Row: {
          id: string;
          name: string;
          slug: string;
          institution_code: string;
          institution_type: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          website: string | null;
          logo_url: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: Omit<Database['institution']['Tables']['institutions']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['institution']['Tables']['institutions']['Row']>;
      };
      institution_admins: {
        Row: {
          institution_id: string;
          user_id: string;
          assigned_by: string | null;
          assigned_at: string;
          role_scope: string;
        };
        Insert: Omit<Database['institution']['Tables']['institution_admins']['Row'], 'assigned_at'> & {
          assigned_at?: string;
        };
        Update: Partial<Database['institution']['Tables']['institution_admins']['Row']>;
      };
      institution_types: {
        Row: {
          code: string;
          description: string;
          created_at: string;
        };
        Insert: {
          code: string;
          description: string;
          created_at?: string;
        };
        Update: Partial<Database['institution']['Tables']['institution_types']['Row']>;
      };
    };
  };
}
