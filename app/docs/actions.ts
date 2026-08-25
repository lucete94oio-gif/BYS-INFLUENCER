"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

export async function createDocument(formData: FormData) {
  const name = str(formData, "name");
  if (!name) return;

  const influencerId = str(formData, "influencerId");
  await prisma.document.create({
    data: {
      name,
      type: str(formData, "type") || "기타",
      location: str(formData, "location") || "-",
      influencerId: influencerId || null,
    },
  });
  revalidatePath("/docs");
  redirect("/docs");
}

export async function deleteDocument(id: string) {
  await prisma.document.delete({ where: { id } });
  revalidatePath("/docs");
  redirect("/docs");
}
