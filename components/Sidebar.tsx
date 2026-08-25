"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/roster", idx: "01", label: "인플루언서 명단" },
  { href: "/training", idx: "02", label: "인플루언서 훈련률 및 결석률" },
  { href: "/onboarding", idx: "03", label: "온보딩" },
  { href: "/posts", idx: "04", label: "게시물 모니터링" },
  { href: "/referrals", idx: "05", label: "유입 수강생" },
  { href: "/docs", idx: "06", label: "자료실" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar" aria-label="목차">
      <div className="sidebar-label">목차</div>
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={"nav-item" + (pathname?.startsWith(item.href) ? " active" : "")}
        >
          <span className="idx">{item.idx}</span>
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
