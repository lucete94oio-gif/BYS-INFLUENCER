"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

export async function createReferral(formData: FormData) {
  const influencerId = str(formData, "influencerId");
  const name = str(formData, "name");
  if (!influencerId || !name) return;

  await prisma.referral.create({
    data: {
      influencerId,
      name,
      status: str(formData, "status") || "pending",
      cohort: str(formData, "cohort") || "25기",
    },
  });
  revalidatePath("/referrals");
  redirect("/referrals");
}

export async function updateReferralStatus(id: string, formData: FormData) {
  const status = str(formData, "status");
  if (!status) return;
  await prisma.referral.update({ where: { id }, data: { status } });
  revalidatePath("/referrals");
}

export async function deleteReferral(id: string) {
  await prisma.referral.delete({ where: { id } });
  revalidatePath("/referrals");
  redirect("/referrals");
}
