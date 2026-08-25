import { prisma } from "@/lib/prisma";

export async function getKpis() {
  const influencers = await prisma.influencer.findMany({
    include: { referrals: true, trainingWeeks: true },
  });

  const total = influencers.length;
  const referralProgram = influencers.filter((i) => i.code).length;

  const ATTEND = new Set(["출석", "지각", "무단지각"]);
  const KNOWN = new Set(["출석", "결석", "지각", "무단지각", "조퇴"]);
  let trainingSum = 0;
  let trainingCount = 0;
  for (const inf of influencers) {
    const recorded = inf.trainingWeeks.filter((w) => w.status && KNOWN.has(w.status));
    if (recorded.length === 0) continue;
    const attended = recorded.filter((w) => ATTEND.has(w.status!)).length;
    trainingSum += attended / recorded.length;
    trainingCount += 1;
  }
  const avgTrainingRate = trainingCount ? Math.round((trainingSum / trainingCount) * 100) : 0;

  const referrals = influencers.flatMap((i) => i.referrals);
  const cohort24 = referrals.filter((r) => r.cohort === "24기").length;
  const cohort25 = referrals.filter((r) => r.cohort === "25기").length;
  const totalReferred = referrals.length;
  const enrolled = referrals.filter((r) => r.status === "done").length;
  const enrolledRate = totalReferred ? Math.round((enrolled / totalReferred) * 100) : 0;

  return {
    total,
    referralProgram,
    avgTrainingRate,
    totalReferred,
    cohort24,
    cohort25,
    enrolled,
    enrolledRate,
  };
}
