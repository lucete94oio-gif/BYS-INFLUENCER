"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ONBOARDING_LABELS = [
  "브랜드 가이드 교육",
  "제품/커리큘럼 숙지 테스트",
  "콘텐츠 가이드라인 서명",
  "추천코드 발급 및 안내",
];

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

export async function createInfluencer(formData: FormData) {
  const code = str(formData, "code");
  const name = str(formData, "name");
  if (!name) return;

  await prisma.influencer.create({
    data: {
      code: code || null,
      name,
      handle: str(formData, "handle") || `@${name}`,
      followers: str(formData, "followers") ? Number(str(formData, "followers")) : null,
      note: str(formData, "note"),
      classSheet: str(formData, "classSheet") || null,
      onboardingItems: {
        create: ONBOARDING_LABELS.map((label, order) => ({ label, order, done: false })),
      },
      trainingWeeks: {
        create: Array.from({ length: 10 }, (_, i) => ({ weekNumber: i + 1, status: null })),
      },
    },
  });
  revalidatePath("/roster");
  redirect("/roster");
}

export async function updateInfluencer(id: string, formData: FormData) {
  const code = str(formData, "code");
  const name = str(formData, "name");
  if (!name) return;

  await prisma.influencer.update({
    where: { id },
    data: {
      code: code || null,
      name,
      handle: str(formData, "handle") || `@${name}`,
      followers: str(formData, "followers") ? Number(str(formData, "followers")) : null,
      note: str(formData, "note"),
      classSheet: str(formData, "classSheet") || null,
    },
  });
  revalidatePath("/roster");
  redirect("/roster");
}

export async function deleteInfluencer(id: string) {
  await prisma.influencer.delete({ where: { id } });
  revalidatePath("/roster");
  redirect("/roster");
}
