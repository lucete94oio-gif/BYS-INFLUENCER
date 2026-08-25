import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createDocument, deleteDocument } from "./actions";
import ConfirmSubmit from "@/components/ConfirmSubmit";

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const sp = await searchParams;
  const showForm = sp.edit === "new";

  const [docs, influencers] = await Promise.all([
    prisma.document.findMany({ include: { influencer: true }, orderBy: { date: "desc" } }),
    prisma.influencer.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <section>
      <div className="page-head">
        <h2>자료실</h2>
        <p>계약서 등 인플루언서 관련 자료를 정리해두는 곳입니다.</p>
      </div>
      <div className="empty-banner">
        실제 파일은 이 서버에 저장되지 않습니다. 파일은 정해진 로컬/공유 폴더에 저장하고, 여기엔 무엇이 어디 있는지 목록만 기록하세요.
      </div>

      <div className="toolbar">
        <Link href="/docs?edit=new" className="filter-chip add-btn">
          + 문서 추가
        </Link>
        <span className="count tnum">{docs.length}건</span>
      </div>

      {showForm && (
        <form className="mgmt-form" action={createDocument}>
          <div className="mgmt-form-grid">
            <label>
              문서명
              <input type="text" name="name" required placeholder="예: 김지민 활동 정산서" />
            </label>
            <label>
              유형
              <select name="type" defaultValue="계약서">
                <option>계약서</option>
                <option>정산자료</option>
                <option>활동자료</option>
                <option>기타</option>
              </select>
            </label>
            <label>
              인플루언서
              <select name="influencerId" defaultValue="">
                <option value="">전체 공통</option>
                {influencers.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              저장 위치
              <input type="text" name="location" defaultValue="BYS/3) 인플루언서/" />
            </label>
          </div>
          <div className="mgmt-form-actions">
            <span className="mgmt-form-hint">파일은 위 폴더 경로에 직접 저장하고, 여기엔 기록만 남기세요.</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/docs" className="filter-chip">
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
              <th>문서명</th>
              <th>유형</th>
              <th>인플루언서</th>
              <th>저장 위치</th>
              <th>등록일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id}>
                <td className="cell-name">{d.name}</td>
                <td>{d.type}</td>
                <td>{d.influencer?.name ?? "전체 공통"}</td>
                <td className="cell-sub">{d.location}</td>
                <td className="date">{toInputDate(d.date).replaceAll("-", ".")}</td>
                <td className="row-actions">
                  <form action={deleteDocument.bind(null, d.id)}>
                    <ConfirmSubmit message="이 자료 기록을 삭제할까요?" className="link-btn danger">
                      삭제
                    </ConfirmSubmit>
                  </form>
                </td>
              </tr>
            ))}
            {docs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>
                  등록된 자료가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
