import { prisma } from "@/lib/prisma";
import { toggleOnboardingItem } from "./actions";

function initials(name: string) {
  return name.slice(0, 1);
}

export default async function OnboardingPage() {
  const influencers = await prisma.influencer.findMany({
    include: { onboardingItems: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <section>
      <div className="page-head">
        <h2>온보딩</h2>
        <p>등록 시 거치는 체크리스트입니다. 항목을 클릭하면 바로 체크됩니다.</p>
      </div>

      <div className="onboarding-grid">
        {influencers.map((inf) => {
          const items = inf.onboardingItems;
          const doneCount = items.filter((i) => i.done).length;
          const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

          return (
            <div className="t-card" key={inf.id}>
              <div className="t-card-head">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="t-avatar">{initials(inf.name)}</div>
                  <div className="name">{inf.name}</div>
                </div>
              </div>

              <div className="ring-wrap">
                <div className="ring" style={{ ["--pct" as string]: pct }}>
                  <div className="ring-inner tnum">{pct}%</div>
                </div>
                <div className="ring-label">
                  <div className="big tnum">
                    {doneCount}/{items.length}
                  </div>
                  <div className="small">항목 완료</div>
                </div>
              </div>

              <ul className="checklist">
                {items.map((item) => (
                  <li key={item.id} className={item.done ? "done" : ""}>
                    <form action={toggleOnboardingItem.bind(null, item.id, item.done)}>
                      <button type="submit">
                        <span className="box">{item.done ? "✓" : ""}</span>
                        <span className="t">{item.label}</span>
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
