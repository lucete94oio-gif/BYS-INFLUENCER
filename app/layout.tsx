import type { Metadata } from "next";
import { Gowun_Batang, IBM_Plex_Sans_KR, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getKpis } from "@/lib/kpi";

const heading = Gowun_Batang({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-heading",
  display: "swap",
});

const body = IBM_Plex_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "인플루언서 매니지먼트 — BYS",
  description: "2026 3학기 BYS 인플루언서 관리 페이지",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const kpi = await getKpis();

  return (
    <html lang="ko" className={`${heading.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <div className="dashboard">
          <header className="topbar">
            <div className="brand-mark">IR</div>
            <div className="brand">
              <h1>인플루언서 매니지먼트</h1>
              <p>2026 3학기 BYS 인플루언서 — 명단·훈련·게시물·유입 수강생 관리 페이지</p>
            </div>
          </header>

          <section className="kpi-strip" aria-label="요약 지표">
            <div className="kpi-tile">
              <div className="label">등록 인플루언서</div>
              <div className="value tnum">{kpi.total}명</div>
              <div className="kpi-split">
                <span>
                  추천인 참여 <b className="tnum">{kpi.referralProgram}</b>명
                </span>
                <span>
                  미참여 <b className="tnum">{kpi.total - kpi.referralProgram}</b>명
                </span>
              </div>
            </div>
            <div className="kpi-tile">
              <div className="label">평균 출석률</div>
              <div className="value tnum">{kpi.avgTrainingRate}%</div>
              <div className="sub">출석·지각·무단지각 인정 기준</div>
            </div>
            <div className="kpi-tile">
              <div className="label">총 수강 신청 인원</div>
              <div className="value tnum">{kpi.totalReferred}명</div>
              <div className="kpi-split">
                <span>
                  24기 <b className="tnum">{kpi.cohort24}</b>명
                </span>
                <span>
                  25기 <b className="tnum">{kpi.cohort25}</b>명
                </span>
              </div>
            </div>
            <div className="kpi-tile">
              <div className="label">실제 등록 전환</div>
              <div className="value tnum up">{kpi.enrolled}명</div>
              <div className="sub up">전환율 {kpi.enrolledRate}%</div>
            </div>
          </section>

          <div className="shell">
            <Sidebar />
            <main className="content">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
