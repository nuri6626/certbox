import type { Certificate } from "../../types/certificate";
import BottomTabBar from "./BottomTabBar";

type CareerHomeProps = {
  certificates: Certificate[];
  filteredCertificates: Certificate[];
  upcomingExamEvents: {
    id: string;
    examName: string;
    label: string;
    date: string;
  }[];
  getExpiryText: (expiryDate: string) => string;
  getDdayText: (date: string) => string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  setScreen: (screen: "home" | "upload" | "result" | "detail" | "schedule" | "vault") => void;
  setSelectedCertificate: (certificate: Certificate) => void;
  setIsEditing: (value: boolean) => void;
  handleLogout: () => void;
};

const Icon = {
  plus: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" />
      <path d="M9 14h.01M15 14h.01M12 17h.01" strokeLinecap="round" />
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H10l2 2h5.5A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 11a4 4 0 1 0-8 0" />
      <path d="M5 20a7 7 0 0 1 14 0" />
      <path d="M18 9a3 3 0 0 1 3 3M3 12a3 3 0 0 1 3-3" strokeLinecap="round" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" className="mx-auto h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5Z" />
    </svg>
  ),
  folderSmall: (
    <svg viewBox="0 0 24 24" className="mx-auto h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H10l2 2h5.5A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
    </svg>
  ),
  calendarSmall: (
    <svg viewBox="0 0 24 24" className="mx-auto h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" />
    </svg>
  ),
  usersSmall: (
    <svg viewBox="0 0 24 24" className="mx-auto h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2" />
      <path d="M4 19a5 5 0 0 1 10 0" />
      <path d="M15 19a4 4 0 0 1 5-3" />
    </svg>
  ),
  userSmall: (
    <svg viewBox="0 0 24 24" className="mx-auto h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  ),
};

export default function CareerHome({
  certificates,
  filteredCertificates,
  upcomingExamEvents,
  getDdayText,
  searchTerm,
  setSearchTerm,
  setScreen,
  setSelectedCertificate,
  setIsEditing,
  handleLogout,
}: CareerHomeProps) {
  const recentCertificates = filteredCertificates.slice(0, 3);

  const eventColor = (label: string) => {
    if (label.includes("접수")) return "orange";
    if (label.includes("시험")) return "rose";
    if (label.includes("발표")) return "violet";
    return "blue";
  };

  const colorClass = {
    orange: "bg-orange-50 text-orange-500",
    rose: "bg-rose-50 text-rose-500",
    violet: "bg-violet-50 text-violet-500",
    blue: "bg-blue-50 text-blue-500",
  };

  return (
    <>
      <header className="mb-7 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl text-violet-400">✦</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">커리어스</h1>
          </div>
          <p className="mt-3 text-base text-gray-500">오늘도 커리어를 쌓아볼까요? 😊</p>
        </div>

        <button onClick={handleLogout} className="rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-500 shadow-sm">
          로그아웃
        </button>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-4">
        <button onClick={() => setScreen("upload")} className="rounded-[28px] bg-violet-50 p-5 text-left shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 text-white">{Icon.plus}</div>
          <p className="font-bold text-gray-950">인증서 등록</p>
          <p className="mt-1 text-sm text-gray-500">보유 자격증 추가</p>
        </button>

        <button onClick={() => setScreen("schedule")} className="rounded-[28px] bg-emerald-50 p-5 text-left shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">{Icon.calendar}</div>
          <p className="font-bold text-gray-950">시험 일정 추가</p>
          <p className="mt-1 text-sm text-gray-500">시험 일정 관리</p>
        </button>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-950">오늘의 알림</h2>
          <button className="text-sm text-gray-400">전체보기 〉</button>
        </div>

        <div className="space-y-3">
          {upcomingExamEvents.slice(0, 2).map((event) => {
            const c = eventColor(event.label);
            return (
              <div key={event.id} className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorClass[c]}`}>
                   <span
  className={`h-3 w-3 rounded-full ${
    c === "orange"
      ? "bg-orange-400"
      : c === "rose"
      ? "bg-rose-400"
      : "bg-violet-400"
  }`}
/>
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${c === "orange" ? "text-orange-500" : c === "rose" ? "text-rose-500" : "text-violet-500"}`}>
                      {event.label} 임박
                    </p>
                    <p className="font-bold text-gray-950">{event.examName}</p>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${c === "orange" ? "text-orange-500" : c === "rose" ? "text-rose-500" : "text-violet-500"}`}>
                  {getDdayText(event.date)}
                </p>
              </div>
            );
          })}

          {upcomingExamEvents.length === 0 && (
            <div className="rounded-3xl bg-white p-5 text-sm text-gray-500 shadow-sm">다가오는 일정이 없습니다.</div>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-extrabold text-gray-950">내 커리어 요약</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[26px] bg-violet-50 p-4 text-center shadow-sm">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-violet-500">{Icon.folder}</div>
            <p className="mt-2 text-2xl font-extrabold text-violet-500">{certificates.length}</p>
            <p className="text-sm font-medium text-gray-700">보유 인증서</p>
          </div>
          <div className="rounded-[26px] bg-emerald-50 p-4 text-center shadow-sm">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-500">
  {Icon.calendar}
</div>
            <p className="mt-2 text-2xl font-extrabold text-emerald-500">3</p>
            <p className="text-sm font-medium text-gray-700">준비중 시험</p>
          </div>
          <div className="rounded-[26px] bg-orange-50 p-4 text-center shadow-sm">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500">
  {Icon.folder}
</div>
            <p className="mt-2 text-2xl font-extrabold text-orange-500">1</p>
            <p className="text-sm font-medium text-gray-700">만료 예정</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-950">이번 달 일정</h2>
          <button onClick={() => setScreen("schedule")} className="text-sm text-gray-400">전체 캘린더 〉</button>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 grid grid-cols-7 text-center text-xs font-bold text-gray-400">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => <span key={day}>{day}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-sm font-bold text-gray-800">
            {[18, 19, 20, 21, 22, 23, 24].map((day) => (
              <div key={day} className={`relative rounded-full py-2 ${day === 21 ? "bg-gray-950 text-white" : ""}`}>
                {day}
                <span className={`absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                  day === 21 ? "bg-blue-400" : day === 22 ? "bg-rose-400" : day === 24 ? "bg-violet-400" : "bg-transparent"
                }`} />
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {upcomingExamEvents.slice(0, 3).map((event) => {
              const c = eventColor(event.label);
              return (
                <div key={event.id} className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      c === "orange" ? "bg-orange-400" : c === "rose" ? "bg-rose-400" : "bg-violet-400"
                    }`} />
                    <div>
                      <p className={`text-xs font-bold ${c === "orange" ? "text-orange-500" : c === "rose" ? "text-rose-500" : "text-violet-500"}`}>
                        {event.label}
                      </p>
                      <p className="mt-1 text-sm font-bold text-gray-900">{event.examName}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{event.date}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-950">최근 등록 인증서</h2>
          <button className="text-sm text-gray-400">전체보기 〉</button>
        </div>

        <div className="mb-4">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="자격증명, 기관, 이름, 번호 검색"
            className="w-full rounded-3xl bg-white px-5 py-4 text-base shadow-sm outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {recentCertificates.map((cert) => (
            <article
              key={cert.id}
              onClick={() => {
                setSelectedCertificate(cert);
                setIsEditing(false);
                setScreen("detail");
              }}
              className="cursor-pointer rounded-3xl bg-white p-3 text-center shadow-sm active:scale-[0.99]"
            >
              {cert.imageUrl ? (
                <img src={cert.imageUrl} alt={cert.title} className="mx-auto mb-3 h-14 w-14 rounded-2xl object-cover" />
              ) : (
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-xs font-bold text-violet-500">CERT</div>
              )}
              <p className="line-clamp-2 text-sm font-bold text-gray-950">{cert.title}</p>
              <p className="mt-1 text-xs text-gray-400">{cert.issueDate || "날짜 없음"}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-extrabold text-gray-950">바로가기</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            ["자격증 보관함", "내 인증서를 한눈에 관리해요", Icon.folder, "text-violet-500", "bg-violet-50"],
            ["시험 캘린더", "전체 일정을 캘린더로 확인해요", Icon.calendar, "text-emerald-500", "bg-emerald-50"],
            ["AI 추천", "나에게 맞는 자격증과 학습 추천해요", Icon.spark, "text-blue-500", "bg-blue-50"],
            ["커뮤니티", "정보를 나누고 함께 성장해요", Icon.users, "text-orange-500", "bg-orange-50"],
          ].map(([title, desc, icon, color, bg]) => (
            <button key={String(title)} className={`rounded-[28px] ${bg} p-5 text-left shadow-sm`}>
              <div className={`mb-4 ${color}`}>{icon}</div>
              <p className="font-extrabold text-gray-950">{title}</p>
              <p className="mt-2 text-sm leading-5 text-gray-600">{desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-950">임박 일정</h2>
          <button className="text-sm text-gray-400">전체보기 〉</button>
        </div>
        <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
          {upcomingExamEvents.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <p className="font-bold text-gray-900">{event.examName}</p>
              <p className="text-sm text-gray-400">{event.date}</p>
              <p className="font-extrabold text-orange-500">{getDdayText(event.date)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-950">커뮤니티 인기글</h2>
          <button className="text-sm text-gray-400">전체보기 〉</button>
        </div>
        <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
          {["비전공자도 SQLD 가능할까요?", "컴활 2급 독학 2주 합격 후기", "토익 900점 이상 공부법 공유해요!"].map((title, i) => (
            <div key={title} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="font-bold text-gray-900">{title}</p>
                <p className="mt-1 text-xs text-gray-400">{i === 0 ? "자격증 고민 · 댓글 24" : i === 1 ? "합격 후기 · 댓글 18" : "스터디 모집 · 댓글 31"}</p>
              </div>
              <div className="h-12 w-16 rounded-2xl bg-gray-100" />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-[28px] bg-violet-100 p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-950">AI가 추천하는<br />맞춤 자격증과 학습 플랜</p>
        <button className="mt-4 rounded-full bg-gray-950 px-5 py-2 text-sm font-bold text-white">추천 받기</button>
      </section>

  
    </>
  );
}