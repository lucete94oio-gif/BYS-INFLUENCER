import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createPost, updatePost, deletePost } from "./actions";
import ConfirmSubmit from "@/components/ConfirmSubmit";

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function displayDate(d: Date) {
  return toInputDate(d).replaceAll("-", ".");
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.filter ?? "all";
  const editId = sp.edit;

  const [posts, influencers] = await Promise.all([
    prisma.post.findMany({ include: { influencer: true }, orderBy: { date: "desc" } }),
    prisma.influencer.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rows = posts.filter((p) => (filter === "all" ? true : p.tag === filter));
  const editing = editId && editId !== "new" ? posts.find((p) => p.id === editId) : null;
  const showForm = editId === "new" || !!editing;

  const FILTERS = [
    ["all", "전체"],
    ["유", "BYS 언급 O"],
    ["무", "BYS 언급 X"],
  ] as const;

  return (
    <section>
      <div className="page-head">
        <h2>게시물 모니터링</h2>
        <p>인플루언서가 올린 게시물을 등록·수정·삭제합니다.</p>
      </div>

      <div className="toolbar">
        {FILTERS.map(([key, label]) => (
          <Link key={key} href={`/posts?filter=${key}`} className={"filter-chip" + (filter === key ? " active" : "")}>
            {label}
          </Link>
        ))}
        <Link href="/posts?edit=new" className="filter-chip add-btn">
          + 게시물 추가
        </Link>
        <span className="count tnum">{rows.length}건</span>
      </div>

      {showForm && (
        <form className="mgmt-form" action={editing ? updatePost.bind(null, editing.id) : createPost}>
          <div className="mgmt-form-grid">
            <label>
              인플루언서
              <select name="influencerId" defaultValue={editing?.influencerId ?? influencers[0]?.id} required>
                {influencers.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              유형
              <select name="type" defaultValue={editing?.type ?? "릴스"}>
                <option>릴스</option>
                <option>스토리</option>
                <option>캐러셀</option>
                <option>피드</option>
              </select>
            </label>
            <label>
              게시일
              <input type="date" name="date" defaultValue={editing ? toInputDate(editing.date) : ""} />
            </label>
            <label>
              내용요약
              <input type="text" name="summary" defaultValue={editing?.summary ?? ""} />
            </label>
            <label>
              BYS 언급
              <select name="tag" defaultValue={editing?.tag ?? "유"}>
                <option value="유">유</option>
                <option value="무">무</option>
              </select>
            </label>
            <label>
              톤 적합도
              <select name="tone" defaultValue={editing?.tone ?? "상"}>
                <option value="상">상</option>
                <option value="중">중</option>
                <option value="하">하</option>
              </select>
            </label>
            <label>
              링크
              <input type="url" name="link" defaultValue={editing?.link ?? ""} placeholder="https://..." />
            </label>
          </div>
          <div className="mgmt-form-actions">
            <span className="mgmt-form-hint">{editing ? "게시물을 수정합니다." : "새 게시물을 추가합니다."}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/posts" className="filter-chip">
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
              <th>인플루언서</th>
              <th>유형</th>
              <th>게시일</th>
              <th>내용요약</th>
              <th>BYS 언급</th>
              <th>톤 적합도</th>
              <th>링크</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="cell-name">{p.influencer.name}</td>
                <td>{p.type}</td>
                <td className="date">{displayDate(p.date)}</td>
                <td className="cell-caption">{p.summary}</td>
                <td>
                  <span className={"status-chip " + (p.tag === "유" ? "active" : "none")}>{p.tag}</span>
                </td>
                <td>
                  <span className={"tone-chip " + p.tone}>{p.tone}</span>
                </td>
                <td>
                  {p.link ? (
                    <a href={p.link} target="_blank" rel="noopener noreferrer">
                      보기
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="row-actions">
                  <Link href={`/posts?edit=${p.id}`} className="link-btn">
                    수정
                  </Link>
                  <form action={deletePost.bind(null, p.id)}>
                    <ConfirmSubmit message="이 게시물 기록을 삭제할까요?" className="link-btn danger">
                      삭제
                    </ConfirmSubmit>
                  </form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>
                  일치하는 게시물이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
