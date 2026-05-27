"use server";

import { getCurrentUser } from "@/services/auth";
import { 
  createInstitution, 
  assignInstitutionAdmin,
  listInstitutionUsers
} from "@/services/institution";
import { 
  processCsvOnboarding,
  listOnboardingInvitations,
  regenerateInvitation,
  onboardSingleUser
} from "@/services/onboarding";
import { revalidatePath } from "next/cache";

export async function createNewInstitutionAction(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const code = formData.get("code") as string;
  const type = formData.get("type") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const website = formData.get("website") as string;

  if (!name || !slug || !code || !type) {
    return { error: "Name, slug, code, and type are required." };
  }

  try {
    const userDetails = await getCurrentUser();
    if (!userDetails || userDetails.primaryRole !== "super_admin") {
      return { error: "Access denied. Only super administrators can perform this action." };
    }

    const institution = await createInstitution({
      name,
      slug,
      institution_code: code,
      institution_type: type,
      email,
      phone,
      address,
      website,
      created_by: userDetails.user.id,
    });

    revalidatePath("/admin");
    return { success: true, institution };
  } catch (error: any) {
    return { error: error.message || "Failed to create institution." };
  }
}

export async function assignAdminAction(institutionId: string, email: string) {
  if (!institutionId || !email) {
    return { error: "Institution ID and admin email are required." };
  }

  try {
    const userDetails = await getCurrentUser();
    if (!userDetails || userDetails.primaryRole !== "super_admin") {
      return { error: "Access denied." };
    }

    await assignInstitutionAdmin(institutionId, email, userDetails.user.id);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to assign administrator." };
  }
}

export async function uploadCsvOnboardingAction(institutionId: string, csvContent: string) {
  if (!institutionId || !csvContent) {
    return { error: "Institution ID and CSV content are required." };
  }

  try {
    const userDetails = await getCurrentUser();
    if (!userDetails || userDetails.primaryRole !== "super_admin") {
      return { error: "Access denied." };
    }

    const results = await processCsvOnboarding(csvContent, institutionId, userDetails.user.id);
    revalidatePath("/admin");
    return { success: true, results };
  } catch (error: any) {
    return { error: error.message || "Failed to process CSV onboarding." };
  }
}

export async function listInvitationsAction() {
  try {
    const userDetails = await getCurrentUser();
    if (!userDetails || userDetails.primaryRole !== "super_admin") {
      return { error: "Access denied." };
    }

    const invitations = await listOnboardingInvitations();
    return { success: true, invitations };
  } catch (error: any) {
    return { error: error.message || "Failed to list invitations." };
  }
}

export async function regenerateInvitationAction(invitationId: string) {
  if (!invitationId) {
    return { error: "Invitation ID is required." };
  }

  try {
    const userDetails = await getCurrentUser();
    if (!userDetails || userDetails.primaryRole !== "super_admin") {
      return { error: "Access denied." };
    }

    const res = await regenerateInvitation(invitationId, userDetails.user.id);
    revalidatePath("/admin");
    return { success: true, invitation: res };
  } catch (error: any) {
    return { error: error.message || "Failed to regenerate invitation." };
  }
}

export async function listInstitutionUsersAction(institutionId: string) {
  if (!institutionId) {
    return { error: "Institution ID is required." };
  }

  try {
    const userDetails = await getCurrentUser();
    if (!userDetails || userDetails.primaryRole !== "super_admin") {
      return { error: "Access denied." };
    }

    const users = await listInstitutionUsers(institutionId);
    return { success: true, users };
  } catch (error: any) {
    return { error: error.message || "Failed to list institution users." };
  }
}

export async function onboardSingleUserAction(params: {
  email: string;
  name: string;
  role: string;
  institutionId: string;
}) {
  const { email, name, role, institutionId } = params;
  if (!email || !name || !role || !institutionId) {
    return { error: "All fields (email, name, role, institution) are required." };
  }

  try {
    const userDetails = await getCurrentUser();
    if (!userDetails || userDetails.primaryRole !== "super_admin") {
      return { error: "Access denied." };
    }

    const result = await onboardSingleUser({
      email,
      name,
      role,
      institutionId,
      invitedByUserId: userDetails.user.id,
    });

    revalidatePath("/admin");
    return { success: true, result };
  } catch (error: any) {
    return { error: error.message || "Failed to onboard user." };
  }
}



