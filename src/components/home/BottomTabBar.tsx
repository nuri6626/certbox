type ScreenType = "home" | "upload" | "result" | "detail" | "schedule" | "vault";

type Props = {
  activeTab: "home" | "vault" | "calendar" | "community" | "mypage";
  setScreen: (screen: ScreenType) => void;
};

export default function BottomTabBar({ activeTab, setScreen }: Props) {
  const iconClass = "h-[18px] w-[18px]";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md rounded-t-[28px] bg-white px-6 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-5 text-[10px] font-medium text-gray-400">
        <button
          onClick={() => setScreen("vault")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "home" ? "text-gray-950" : "text-gray-400"
          }`}
        >
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 11.5L12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />
          </svg>
          <span>홈</span>
        </button>

        <button
          onClick={() => setScreen("vault")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "vault" ? "text-gray-950" : "text-gray-400"
          }`}
        >
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H10l2 2h5.5A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
          </svg>
          <span>보관함</span>
        </button>

        <button
          onClick={() => setScreen("schedule")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "calendar" ? "text-gray-950" : "text-gray-400"
          }`}
        >
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="5" width="16" height="15" rx="3" />
            <path d="M8 3v4M16 3v4M4 10h16" />
          </svg>
          <span>캘린더</span>
        </button>

        <button
          onClick={() => setScreen("home")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "community" ? "text-gray-950" : "text-gray-400"
          }`}
        >
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="8" r="3" />
            <circle cx="17" cy="10" r="2" />
            <path d="M4 19a5 5 0 0 1 10 0" />
            <path d="M15 19a4 4 0 0 1 5-3" />
          </svg>
          <span>커뮤니티</span>
        </button>

        <button
          onClick={() => setScreen("home")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "mypage" ? "text-gray-950" : "text-gray-400"
          }`}
        >
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M5 20a7 7 0 0 1 14 0" />
          </svg>
          <span>마이페이지</span>
        </button>
      </div>
    </nav>
  );
}