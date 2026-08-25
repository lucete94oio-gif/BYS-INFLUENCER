"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

export async function createPost(formData: FormData) {
  const influencerId = str(formData, "influencerId");
  if (!influencerId) return;

  await prisma.post.create({
    data: {
      influencerId,
      date: new Date(str(formData, "date") || new Date().toISOString().slice(0, 10)),
      type: str(formData, "type") || "릴스",
      summary: str(formData, "summary"),
      tag: str(formData, "tag") || "유",
      tone: str(formData, "tone") || "상",
      link: str(formData, "link") || null,
    },
  });
  revalidatePath("/posts");
  redirect("/posts");
}

export async function updatePost(id: string, formData: FormData) {
  const influencerId = str(formData, "influencerId");
  if (!influencerId) return;

  await prisma.post.update({
    where: { id },
    data: {
      influencerId,
      date: new Date(str(formData, "date")),
      type: str(formData, "type"),
      summary: str(formData, "summary"),
      tag: str(formData, "tag"),
      tone: str(formData, "tone"),
      link: str(formData, "link") || null,
    },
  });
  revalidatePath("/posts");
  redirect("/posts");
}

export async function deletePost(id: string) {
  await prisma.post.delete({ where: { id } });
  revalidatePath("/posts");
  redirect("/posts");
}
