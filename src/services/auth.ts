import { createClient } from "@/utils/supabase/server";

export interface UserDetails {
  authUser: any;
  user: any;
  primaryRole: string;
  tenantId: string | null;
  institution: any | null;
}

export async function getCurrentUser(): Promise<UserDetails | null> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  // Resolve business user from core.users (bypassing public views)
  const { data: user, error: userError } = await supabase
    .schema("core")
    .from("users")
    .select("*")
    .eq("auth_user_id", authUser.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (userError || !user) {
    // If auth user exists but is not pre-provisioned in core.users, fallback to public role
    return {
      authUser,
      user: null,
      primaryRole: "public",
      tenantId: null,
      institution: null,
    };
  }

  // Resolve all roles mapped to user to select the one with highest priority
  const { data: userRoles, error: rolesError } = await supabase
    .schema("core")
    .from("user_roles")
    .select(`
      role_id,
      roles:role_id (
        name,
        priority
      )
    `)
    .eq("user_id", user.id);

  let primaryRole = "public";
  if (!rolesError && userRoles && userRoles.length > 0) {
    let maxPriority = -1;
    userRoles.forEach((ur: any) => {
      const role = ur.roles;
      if (role && role.priority > maxPriority) {
        maxPriority = role.priority;
        primaryRole = role.name;
      }
    });
  }

  // Fetch tenant/institution details if tenant_id is linked
  let institution = null;
  if (user.tenant_id) {
    const { data: instData } = await supabase
      .schema("institution")
      .from("institutions")
      .select("*")
      .eq("id", user.tenant_id)
      .maybeSingle();

    institution = instData;
  }

  return {
    authUser,
    user,
    primaryRole,
    tenantId: user.tenant_id,
    institution,
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
