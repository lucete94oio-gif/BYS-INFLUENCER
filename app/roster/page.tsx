import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createInfluencer, updateInfluencer, deleteInfluencer } from "./actions";
import ConfirmSubmit from "@/components/ConfirmSubmit";

function fmt(n: number | null) {
  return n == null ? "-" : n.toLocaleString("ko-KR");
}

export default async function RosterPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.filter ?? "all";
  const editId = sp.edit;

  const influencers = await prisma.influencer.findMany({
    include: { posts: true, referrals: true },
    orderBy: { createdAt: "asc" },
  });

  const rows = influencers.filter((i) => {
    if (filter === "active") return i.posts.length > 0;
    if (filter === "none") return i.posts.length === 0;
    return true;
  });

  const editing = editId && editId !== "new" ? influencers.find((i) => i.id === editId) : null;
  const showForm = editId === "new" || !!editing;

  const FILTERS = [
    ["all", "전체"],
    ["active", "활동중"],
    ["none", "게시물 없음"],
  ] as const;

  return (
    <section>
      <div className="page-head">
        <h2>인플루언서 명단</h2>
        <p>신규 등록, 정보 수정, 퇴출 처리를 여기서 관리합니다.</p>
      </div>

      <div className="toolbar">
        {FILTERS.map(([key, label]) => (
          <Link
            key={key}
            href={`/roster?filter=${key}`}
            className={"filter-chip" + (filter === key ? " active" : "")}
          >
            {label}
          </Link>
        ))}
        <Link href="/roster?edit=new" className="filter-chip add-btn">
          + 인플루언서 추가
        </Link>
        <span className="count tnum">{rows.length}명</span>
      </div>

      {showForm && (
        <form
          className="mgmt-form"
          action={editing ? updateInfluencer.bind(null, editing.id) : createInfluencer}
        >
          <div className="mgmt-form-grid">
            <label>
              코드 (없으면 비워두세요)
              <input type="text" name="code" defaultValue={editing?.code ?? ""} placeholder="예: BYS202603J" />
            </label>
            <label>
              이름
              <input type="text" name="name" defaultValue={editing?.name ?? ""} required />
            </label>
            <label>
              인스타그램
              <input type="text" name="handle" defaultValue={editing?.handle ?? ""} placeholder="@handle" />
            </label>
            <label>
              팔로워
              <input type="number" name="followers" min={0} defaultValue={editing?.followers ?? ""} />
            </label>
            <label>
              반(수업) 시트 코드
              <input type="text" name="classSheet" defaultValue={editing?.classSheet ?? ""} placeholder="예: 금저녁2.5" />
            </label>
            <label>
              비고
              <input type="text" name="note" defaultValue={editing?.note ?? ""} />
            </label>
          </div>
          <div className="mgmt-form-actions">
            <span className="mgmt-form-hint">
              {editing ? `${editing.name} 정보를 수정합니다.` : "새 인플루언서를 추가합니다."}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/roster" className="filter-chip">
                취소
              </Link>
              <button type="submit" className="filter-chip add-btn">
                {editing ? "수정 저장" : "추가"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>코드</th>
              <th>이름</th>
              <th>인스타그램</th>
              <th>팔로워</th>
              <th>활동 상태</th>
              <th>추천 성과</th>
              <th>비고</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => {
              const active = i.posts.length > 0;
              const enrolled = i.referrals.filter((r) => r.status === "done").length;
              const perf = i.referrals.length ? `${enrolled}/${i.referrals.length} 등록` : "-";
              return (
                <tr key={i.id}>
                  <td className="cell-sub">{i.code ?? "-"}</td>
                  <td className="cell-name">{i.name}</td>
                  <td>
                    <a href={`https://instagram.com/${i.handle.replace("@", "")}`} target="_blank" rel="noopener noreferrer">
                      {i.handle}
                    </a>
                  </td>
                  <td className="tnum">{fmt(i.followers)}</td>
                  <td>
                    <span className={"status-chip " + (active ? "active" : "none")}>
                      {active ? "활동중" : "게시물 없음"}
                    </span>
                  </td>
                  <td className="tnum">{perf}</td>
                  <td className="cell-note">{i.note || "-"}</td>
                  <td className="row-actions">
                    <Link href={`/roster?edit=${i.id}`} className="link-btn">
                      수정
                    </Link>
                    <form action={deleteInfluencer.bind(null, i.id)}>
                      <ConfirmSubmit
                        message={`${i.name}(${i.code ?? "코드 없음"})과(와) 연결된 게시물·유입 기록이 모두 함께 삭제됩니다. 계속할까요?`}
                        className="link-btn danger"
                      >
                        삭제
                      </ConfirmSubmit>
                    </form>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>
                  일치하는 인플루언서가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
