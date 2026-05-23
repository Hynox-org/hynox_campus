import { createClient } from "@/utils/supabase/server";

export interface OnboardingResult {
  email: string;
  status: "success" | "error";
  link?: string;
  error?: string;
}

export function parseCsv(csvContent: string) {
  const lines = csvContent.split(/\r?\n/);
  const result: Array<{ name: string; email: string; role: string; institution_id?: string }> = [];

  if (lines.length === 0) return result;

  // Read headers to map columns
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = headers.indexOf("name");
  const emailIdx = headers.indexOf("email");
  const roleIdx = headers.indexOf("role");
  const instIdx = headers.indexOf("institution_id");

  if (nameIdx === -1 || emailIdx === -1 || roleIdx === -1) {
    throw new Error("CSV must contain 'name', 'email', and 'role' headers.");
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(",").map((c) => c.trim());
    if (columns.length < 3) continue;

    result.push({
      name: columns[nameIdx],
      email: columns[emailIdx],
      role: columns[roleIdx],
      institution_id: instIdx !== -1 ? columns[instIdx] : undefined,
    });
  }

  return result;
}

export async function processCsvOnboarding(
  csvContent: string,
  selectedInstitutionId: string,
  invitedByUserId: string
): Promise<OnboardingResult[]> {
  const supabase = await createClient();
  const parsedRows = parseCsv(csvContent);
  const results: OnboardingResult[] = [];

  // Fetch all roles to map names to IDs
  const { data: rolesList } = await supabase
    .schema("core")
    .from("roles")
    .select("id, name");

  const rolesMap = new Map(rolesList?.map((r) => [r.name.toLowerCase(), r.id]));

  for (const row of parsedRows) {
    try {
      const email = row.email;
      const name = row.name;
      const roleName = row.role.toLowerCase();
      const institutionId = row.institution_id || selectedInstitutionId;

      if (!email || !name || !roleName || !institutionId) {
        throw new Error("Missing required fields (name, email, role, or institution_id)");
      }

      const roleId = rolesMap.get(roleName);
      if (!roleId) {
        throw new Error(
          `Invalid role: '${row.role}'. Allowed: super_admin, institution_admin, teacher, trainer, mentor, student, public.`
        );
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .schema("core")
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      let userId = existingUser?.id;

      if (!userId) {
        // Create pre-provisioned user in core.users
        const { data: newUser, error: userError } = await supabase
          .schema("core")
          .from("users")
          .insert({
            full_name: name,
            email: email,
            tenant_id: institutionId,
            status: "invited",
            onboarding_source: "excel_import",
          })
          .select("id")
          .single();

        if (userError) throw userError;
        userId = newUser.id;

        // Assign core.user_roles role map
        const { error: roleLinkError } = await supabase
          .schema("core")
          .from("user_roles")
          .insert({
            user_id: userId,
            role_id: roleId,
          });

        if (roleLinkError) throw roleLinkError;
      } else {
        // If user already exists in core.users, update their tenant_id
        await supabase
          .schema("core")
          .from("users")
          .update({ tenant_id: institutionId })
          .eq("id", userId);
      }

      // Determine invitation type
      let invitationType = "student_onboarding";
      if (roleName === "institution_admin") {
        invitationType = "institution_admin_invite";
      } else if (roleName === "teacher" || roleName === "trainer") {
        invitationType = "trainer_onboarding";
      } else if (roleName === "mentor") {
        invitationType = "mentor_invite";
      }

      // Create onboarding invitation token record
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days expiry
      const token = crypto.randomUUID();

      const { error: inviteError } = await supabase
        .schema("core")
        .from("user_invitations")
        .insert({
          user_id: userId,
          tenant_id: institutionId,
          token: token,
          invited_by: invitedByUserId,
          expires_at: expiresAt,
          status: "pending",
          invitation_type: invitationType,
        });

      if (inviteError) throw inviteError;

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const link = `${appUrl}/onboarding/verify?token=${token}&email=${encodeURIComponent(email)}`;
      results.push({ email, status: "success", link });
    } catch (err: any) {
      results.push({
        email: row.email || "unknown",
        status: "error",
        error: err.message,
      });
    }
  }

  return results;
}

export async function verifyInvitation(token: string, email: string) {
  const supabase = await createClient();

  const { data: invitation, error } = await supabase
    .schema("core")
    .from("user_invitations")
    .select(`
      id,
      token,
      expires_at,
      status,
      invitation_type,
      user:user_id (
        id,
        full_name,
        email,
        tenant_id
      )
    `)
    .eq("token", token)
    .maybeSingle();

  if (error || !invitation) {
    return { valid: false, error: "Invitation not found or invalid token." };
  }

  const user = invitation.user as any;
  if (!user || user.email.toLowerCase() !== email.toLowerCase()) {
    return { valid: false, error: "Invitation email mismatch." };
  }

  if (
    invitation.status !== "pending" &&
    invitation.status !== "created" &&
    invitation.status !== "sent"
  ) {
    return { valid: false, error: `Invitation has already been ${invitation.status}.` };
  }

  if (new Date(invitation.expires_at) < new Date()) {
    // Update invitation status to expired
    await supabase
      .schema("core")
      .from("user_invitations")
      .update({ status: "expired" })
      .eq("id", invitation.id);

    return { valid: false, error: "Invitation token has expired." };
  }

  // Fetch institution name
  let institutionName = "Hynox Campus";
  if (user.tenant_id) {
    const { data: inst } = await supabase
      .schema("institution")
      .from("institutions")
      .select("name")
      .eq("id", user.tenant_id)
      .maybeSingle();

    if (inst) {
      institutionName = inst.name;
    }
  }

  return {
    valid: true,
    invitation: {
      id: invitation.id,
      token: invitation.token,
      invitationType: invitation.invitation_type,
      fullName: user.full_name,
      email: user.email,
      institutionName,
    },
  };
}
