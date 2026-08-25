"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleOnboardingItem(itemId: string, current: boolean) {
  await prisma.onboardingItem.update({
    where: { id: itemId },
    data: { done: !current },
  });
  revalidatePath("/onboarding");
}
