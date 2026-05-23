import { createClient } from "@/utils/supabase/server";

export async function createInstitution(data: {
  name: string;
  slug: string;
  institution_code: string;
  institution_type: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logo_url?: string;
  created_by?: string;
}) {
  const supabase = await createClient();

  const { data: institution, error } = await supabase
    .schema("institution")
    .from("institutions")
    .insert({
      name: data.name,
      slug: data.slug,
      institution_code: data.institution_code,
      institution_type: data.institution_type,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      website: data.website || null,
      logo_url: data.logo_url || null,
      status: "onboarding",
      created_by: data.created_by || null,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return institution;
}

export async function listInstitutions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .schema("institution")
    .from("institutions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function assignInstitutionAdmin(
  institutionId: string,
  userEmail: string,
  assignedByUserId: string
) {
  const supabase = await createClient();

  // 1. Resolve business user by email
  const { data: user, error: userError } = await supabase
    .schema("core")
    .from("users")
    .select("id")
    .eq("email", userEmail)
    .maybeSingle();

  if (userError || !user) {
    throw new Error(
      userError?.message || `User with email ${userEmail} does not exist in core.users. Please onboard them first.`
    );
  }

  // 2. Link in institution_admins
  const { error: adminError } = await supabase
    .schema("institution")
    .from("institution_admins")
    .insert({
      institution_id: institutionId,
      user_id: user.id,
      assigned_by: assignedByUserId,
      role_scope: "primary",
    });

  if (adminError) {
    throw adminError;
  }

  // 3. Link user to tenant_id
  const { error: updateError } = await supabase
    .schema("core")
    .from("users")
    .update({ tenant_id: institutionId })
    .eq("id", user.id);

  if (updateError) {
    throw updateError;
  }

  // 4. Map user to 'institution_admin' role
  const { data: role } = await supabase
    .schema("core")
    .from("roles")
    .select("id")
    .eq("name", "institution_admin")
    .single();

  if (role) {
    await supabase
      .schema("core")
      .from("user_roles")
      .insert({
        user_id: user.id,
        role_id: role.id,
      })
      .maybeSingle();
  }

  return user;
}

export async function getInstitutionDetails(institutionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .schema("institution")
    .from("institutions")
    .select("*")
    .eq("id", institutionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
