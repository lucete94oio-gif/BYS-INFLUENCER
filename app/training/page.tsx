import { prisma } from "@/lib/prisma";

const ATTEND = new Set(["출석", "지각", "무단지각"]);

function statusClass(status: string | null) {
  if (!status) return "";
  if (status === "출석") return "attend";
  if (status === "지각" || status === "무단지각") return "late";
  if (status === "결석") return "absent";
  return "other"; // 상담완료 등 5개 분류 외 기록
}

function initials(name: string) {
  return name.slice(0, 1);
}

export default async function TrainingPage() {
  const influencers = await prisma.influencer.findMany({
    include: { trainingWeeks: { orderBy: { weekNumber: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <section>
      <div className="page-head">
        <h2>인플루언서 훈련률 및 결석률</h2>
        <p>BYS 수업 출석 데이터를 구글시트에서 그대로 가져와 10주차 흐름으로 보여줍니다. (출석·지각·무단지각은 출석률에 포함)</p>
      </div>

      <div className="training-grid">
        {influencers.map((inf) => {
          const weeks = inf.trainingWeeks;
          // 출석/결석/지각/무단지각/조퇴만 "경과 주차"로 집계 — 상담완료 등은 표에는 보이되 통계에서는 제외
          const KNOWN = new Set(["출석", "결석", "지각", "무단지각", "조퇴"]);
          const recorded = weeks.filter((w) => w.status && KNOWN.has(w.status));
          const attended = recorded.filter((w) => ATTEND.has(w.status!)).length;
          const absent = recorded.filter((w) => w.status === "결석").length;
          const rate = recorded.length ? Math.round((attended / recorded.length) * 100) : 0;
          const absentRate = recorded.length ? Math.round((absent / recorded.length) * 100) : 0;

          return (
            <div className="t-card" key={inf.id}>
              <div className="t-card-head">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="t-avatar">{initials(inf.name)}</div>
                  <div>
                    <div className="name">{inf.name}</div>
                    <div className="cell-sub">{inf.classSheet ?? "반 정보 없음"}</div>
                  </div>
                </div>
              </div>

              <div className="t-stats">
                <div>
                  경과 <b className="tnum">{recorded.length}</b>주차
                </div>
                <div>
                  출석률 <b className="tnum">{rate}%</b>
                </div>
                <div>
                  결석률 <b className="tnum">{absentRate}%</b>
                </div>
              </div>

              <div className="rate-bar-row">
                <div className="rate-track">
                  <div className="rate-fill" style={{ width: `${rate}%` }} />
                </div>
              </div>

              <div className="week-grid">
                {weeks.map((w) => (
                  <div key={w.weekNumber} className={"week-cell " + statusClass(w.status)}>
                    <span className="n">{w.weekNumber}주</span>
                    {w.status ? w.status.slice(0, 2) : "-"}
                  </div>
                ))}
              </div>

              <div className="t-stats" style={{ marginTop: 2, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                <div>
                  훈련률 <b className="tnum">{inf.dailyMissionRate ?? "-"}{inf.dailyMissionRate != null ? "%" : ""}</b>
                </div>
                <div className="cell-sub">일기·영상·위클리 미션 완료율</div>
              </div>
              <div className="rate-bar-row">
                <div className="rate-track">
                  <div className="rate-fill" style={{ width: `${inf.dailyMissionRate ?? 0}%`, background: "var(--info)" }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
