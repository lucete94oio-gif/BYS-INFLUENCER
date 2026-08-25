import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ONBOARDING_LABELS = [
  "브랜드 가이드 교육",
  "제품/커리큘럼 숙지 테스트",
  "콘텐츠 가이드라인 서명",
  "추천코드 발급 및 안내",
];

// 주차별 출결 흐름 — Apps Script로 구글시트('참여자체크' 반별 탭)에서 직접 추출한 실데이터.
// null = 아직 그 주차가 오지 않았거나 기록 없음.
type Week = string | null;
const w = (...arr: Week[]): Week[] => {
  const out = [...arr];
  while (out.length < 10) out.push(null);
  return out;
};

const influencers = [
  {
    code: "BYS202603A", name: "박지현", handle: "@dallstyle_designer", followers: 71000,
    note: "김보연 취소", classSheet: "금저녁2.5", dailyMissionRate: 26,
    weeks: w("무단지각", "결석", "지각"),
    posts: [
      { date: "2026-07-04", type: "릴스", summary: "발음 변화 + 할인코드 댓글", tag: "유", tone: "상", link: "https://www.instagram.com/reel/DaSnpd7hZVJ/" },
    ],
    referrals: [
      { name: "곽운용", status: "done", cohort: "24기" },
      { name: "유한나", status: "pending", cohort: "24기" },
      { name: "김보연", status: "done", cohort: "24기" }, // 24기 신청서 기준: 합격/완납 — 비고의 "김보연 취소"와 다름, 확인 필요
    ],
  },
  {
    code: "BYS202603B", name: "김다은", handle: "@danjjing_keys", followers: 20000,
    note: "", classSheet: "금오전2.5", dailyMissionRate: 25,
    weeks: w("결석", "출석", "출석"),
    posts: [] as any[],
    referrals: [] as any[],
  },
  {
    code: "BYS202603C", name: "고형우", handle: "@_hyoungwoo_", followers: 3630,
    note: "", classSheet: "화오전3.0A", dailyMissionRate: 28,
    weeks: w("출석", "출석", "출석", "출석"),
    posts: [
      { date: "2026-07-26", type: "릴스", summary: "트레이닝 영상 + 할인코드", tag: "유", tone: "상", link: "https://www.instagram.com/reel/DbOG2x3TysW/" },
    ],
    referrals: [{ name: "고영학", status: "done", cohort: "24기" }],
  },
  {
    code: "BYS202603E", name: "최은솔", handle: "@youth_is_yourss", followers: 32000,
    note: "", classSheet: "월저녁3.0B", dailyMissionRate: 31,
    weeks: w("출석", "출석", "출석", "무단지각"),
    posts: [] as any[],
    referrals: [] as any[],
  },
  {
    code: "BYS202603F", name: "박은정", handle: "@evapark___", followers: 13000,
    note: "", classSheet: "Tue 6.5 PM", dailyMissionRate: 31,
    weeks: w("출석", "출석", "결석", "지각"), // 영어 트랙 (Attendance/Absence/Late Arrival 라벨)
    posts: [
      { date: "2026-07-08", type: "스토리", summary: "BYS 할인코드 관련", tag: "유", tone: "상", link: null },
      { date: "2026-07-22", type: "스토리", summary: "트레이닝 영상", tag: "유", tone: "상", link: null },
    ],
    referrals: [
      { name: "문미예", status: "awaiting", cohort: "24기" },
      { name: "박은주", status: "done", cohort: "24기" },
    ],
  },
  {
    code: "BYS202603G", name: "이수지", handle: "@1998_suji_ya", followers: 189000,
    note: "바이오에 bys 추천코드", classSheet: "수오전 1.5", dailyMissionRate: 13,
    weeks: w("출석", "결석", "출석", "출석"),
    posts: [
      { date: "2026-07-13", type: "릴스", summary: "그동안의 영어성장 + 할인코드", tag: "유", tone: "상", link: "https://www.instagram.com/reel/Dau9Cjpyd05/" },
      { date: "2026-07-30", type: "릴스", summary: "일상 기록 중 10시 영어수업 듣는장면 등장", tag: "무", tone: "상", link: "https://www.instagram.com/reel/DbZ_Bz7xCJF/" },
    ],
    referrals: [
      { name: "신윤하", status: "pending", cohort: "24기" },
      { name: "김원영", status: "cancelled", cohort: "24기" },
      { name: "이은율", status: "cancelled", cohort: "24기" },
      { name: "서영하", status: "pending", cohort: "25기" },
    ],
  },
  {
    code: "BYS202603H", name: "이정연", handle: "@grami.___", followers: 2087,
    note: "", classSheet: "금오전2.0", dailyMissionRate: 0,
    weeks: w("지각", "결석", "출석", "결석"),
    posts: [] as any[],
    referrals: [] as any[],
  },
  {
    code: "BYS202603I", name: "김지민", handle: "@mini_j0220", followers: 13000,
    note: "", classSheet: "목오후1.5", dailyMissionRate: 30,
    weeks: w("출석", "출석", "결석", "출석", "출석"),
    posts: [
      { date: "2026-03-20", type: "릴스", summary: "영어인터뷰 후기", tag: "무", tone: "중", link: "https://www.instagram.com/reel/DWGyNprgYCw/" },
      { date: "2026-06-28", type: "릴스", summary: "트레이닝 모음", tag: "유", tone: "상", link: "https://www.instagram.com/reel/DaHzoEbx8D0/" },
      { date: "2026-07-09", type: "캐러셀", summary: "본인서사+할인코드 공유", tag: "유", tone: "상", link: "https://www.instagram.com/p/DakijjZGr75/" },
      { date: "2026-07-09", type: "스토리", summary: "할인코드 요청이 많다는 내용", tag: "무", tone: "상", link: null },
    ],
    referrals: [
      { name: "윤자연", status: "done", cohort: "24기" },
      { name: "이예진", status: "cancelled", cohort: "24기" },
      { name: "주샤론", status: "cancelled", cohort: "24기" },
      { name: "심혜경", status: "cancelled", cohort: "24기" },
      { name: "김하음", status: "cancelled", cohort: "24기" },
      { name: "김민하", status: "pending", cohort: "24기" },
      { name: "김민지", status: "cancelled", cohort: "24기" },
      { name: "서승범", status: "cancelled", cohort: "24기" },
      { name: "최진아", status: "cancelled", cohort: "24기" },
      { name: "임예나", status: "pending", cohort: "24기" },
      { name: "조가영", status: "pending", cohort: "25기" },
    ],
  },
  {
    code: null, name: "채선혜", handle: "@chae_sh", followers: null,
    note: "추천인 제도 미참여", classSheet: "월저녁 2.0", dailyMissionRate: 2,
    weeks: w("출석", "결석", "결석", "출석"),
    posts: [] as any[],
    referrals: [] as any[],
  },
  {
    code: null, name: "이은미", handle: "@lee_em", followers: null,
    note: "추천인 제도 미참여", classSheet: "금오전2.5", dailyMissionRate: 25,
    weeks: w("출석", "출석", "출석"),
    posts: [] as any[],
    referrals: [] as any[],
  },
];

const documents = [
  { name: "[인플루언서] 추천인제도 계약서(용역)", type: "계약서", influencerName: null as string | null, location: "BYS/3) 인플루언서/1. 계약서/", date: "2026-08-07" },
];

async function main() {
  await prisma.trainingWeek.deleteMany();
  await prisma.onboardingItem.deleteMany();
  await prisma.post.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.document.deleteMany();
  await prisma.influencer.deleteMany();

  for (const inf of influencers) {
    const created = await prisma.influencer.create({
      data: {
        code: inf.code,
        name: inf.name,
        handle: inf.handle,
        followers: inf.followers,
        note: inf.note,
        classSheet: inf.classSheet,
        dailyMissionRate: inf.dailyMissionRate,
        trainingLastSyncedAt: new Date(),
        onboardingItems: {
          create: ONBOARDING_LABELS.map((label, order) => ({ label, order, done: false })),
        },
        trainingWeeks: {
          create: inf.weeks.map((status, idx) => ({ weekNumber: idx + 1, status })),
        },
        posts: {
          create: inf.posts.map((p) => ({
            date: new Date(p.date),
            type: p.type,
            summary: p.summary,
            tag: p.tag,
            tone: p.tone,
            link: p.link,
          })),
        },
        referrals: {
          create: inf.referrals.map((r) => ({ name: r.name, status: r.status, cohort: r.cohort })),
        },
      },
    });
    console.log("seeded", created.name);
  }

  for (const doc of documents) {
    const influencer = doc.influencerName
      ? await prisma.influencer.findFirst({ where: { name: doc.influencerName } })
      : null;
    await prisma.document.create({
      data: {
        name: doc.name,
        type: doc.type,
        location: doc.location,
        date: new Date(doc.date),
        influencerId: influencer?.id,
      },
    });
  }

  console.log("done seeding");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
