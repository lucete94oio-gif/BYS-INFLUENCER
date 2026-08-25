import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createReferral, updateReferralStatus, deleteReferral } from "./actions";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import AutoSubmitSelect from "@/components/AutoSubmitSelect";

const STATUS_LABEL: Record<string, string> = {
  done: "등록완료",
  awaiting: "완납대기",
  pending: "상담중",
  cancelled: "취소",
};
const STATUS_OPTIONS = Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }));

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.filter ?? "all";
  const showForm = sp.edit === "new";

  const [referrals, influencers] = await Promise.all([
    prisma.referral.findMany({ include: { influencer: true }, orderBy: { createdAt: "desc" } }),
    prisma.influencer.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rows = referrals.filter((r) => (filter === "all" ? true : r.status === filter));

  const REWARD_PER_STUDENT = 70000;
  const WEEK_THRESHOLD = 10;
  const eligible = referrals.filter((r) => r.status === "done" && r.weeksAttended >= WEEK_THRESHOLD);
  const rewardByInfluencer = new Map<string, { name: string; count: number }>();
  for (const r of eligible) {
    const cur = rewardByInfluencer.get(r.influencerId) ?? { name: r.influencer.name, count: 0 };
    cur.count += 1;
    rewardByInfluencer.set(r.influencerId, cur);
  }

  const FILTERS = [
    ["all", "전체"],
    ["done", "등록완료"],
    ["awaiting", "완납대기"],
    ["pending", "상담중"],
    ["cancelled", "취소"],
  ] as const;

  return (
    <section>
      <div className="page-head">
        <h2>유입 수강생</h2>
        <p>추천으로 들어온 수강생을 등록하고, 상태를 표에서 바로 바꿀 수 있습니다.</p>
      </div>

      <div className="t-card" style={{ marginBottom: 16 }}>
        <div className="t-card-head">
          <div className="name">보상 정산 (학기 말 지급)</div>
        </div>
        <p className="cell-note" style={{ margin: 0 }}>
          1인당 {REWARD_PER_STUDENT.toLocaleString("ko-KR")}원 · 등록완료 + {WEEK_THRESHOLD}주차까지 훈련 완료한 수강생 기준
        </p>
        {eligible.length === 0 ? (
          <p className="empty-banner" style={{ marginTop: 10, marginBottom: 0 }}>
            아직 {WEEK_THRESHOLD}주차 출석 데이터가 연동되지 않아 대상자가 0명으로 표시됩니다. 학기가 진행되어 유입 수강생 출석 동기화가 붙으면 자동으로 채워집니다.
          </p>
        ) : (
          <ul className="checklist" style={{ marginTop: 10 }}>
            {[...rewardByInfluencer.values()].map((v) => (
              <li key={v.name}>
                {v.name} — {v.count}명 × {REWARD_PER_STUDENT.toLocaleString("ko-KR")}원 ={" "}
                <b className="tnum">{(v.count * REWARD_PER_STUDENT).toLocaleString("ko-KR")}원</b>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="toolbar">
        {FILTERS.map(([key, label]) => (
          <Link key={key} href={`/referrals?filter=${key}`} className={"filter-chip" + (filter === key ? " active" : "")}>
            {label}
          </Link>
        ))}
        <Link href="/referrals?edit=new" className="filter-chip add-btn">
          + 수강생 추가
        </Link>
        <span className="count tnum">{rows.length}명</span>
      </div>

      {showForm && (
        <form className="mgmt-form" action={createReferral}>
          <div className="mgmt-form-grid">
            <label>
              인플루언서
              <select name="influencerId" defaultValue={influencers[0]?.id} required>
                {influencers.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              수강생 이름
              <input type="text" name="name" required />
            </label>
            <label>
              상태
              <select name="status" defaultValue="pending">
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              기수
              <select name="cohort" defaultValue="25기">
                <option value="24기">24기</option>
                <option value="25기">25기</option>
              </select>
            </label>
          </div>
          <div className="mgmt-form-actions">
            <span className="mgmt-form-hint">새 수강생을 추가합니다.</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/referrals" className="filter-chip">
                취소
              </Link>
              <button type="submit" className="filter-chip add-btn">
                추가
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>수강생</th>
              <th>인플루언서</th>
              <th>기수</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="cell-name">{r.name}</td>
                <td>{r.influencer.name}</td>
                <td className="cell-sub">{r.cohort}</td>
                <td>
                  <form action={updateReferralStatus.bind(null, r.id)}>
                    <AutoSubmitSelect name="status" defaultValue={r.status} options={STATUS_OPTIONS} className="status-select" />
                  </form>
                </td>
                <td className="row-actions">
                  <form action={deleteReferral.bind(null, r.id)}>
                    <ConfirmSubmit message={`${r.name} 기록을 삭제할까요?`} className="link-btn danger">
                      삭제
                    </ConfirmSubmit>
                  </form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>
                  일치하는 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
