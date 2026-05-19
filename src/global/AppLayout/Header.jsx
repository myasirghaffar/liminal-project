import { Menu } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

function Header({ toggleSidebar }) {
  const location = useLocation();
  const currentRole = useSelector((state) => state.auth.user?.role);

  const getHeaderMeta = () => {
    if (location.pathname.includes("/dashboard")) {
      return {
        title: "Dashboard",
        subtitle: `${currentRole ? `${currentRole} ` : ""}overview and statistics`,
      };
    }

    return {
      title: "Dashboard",
      subtitle: "Admin overview and statistics",
    };
  };

  const headerMeta = getHeaderMeta();

  return (
    <header className="z-10 md:ml-[18.5625rem] md:w-[calc(100%-18.5625rem)] bg-white border-b border-gray-200">
      <div className="flex min-h-20 items-center justify-between px-4 md:px-8 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold leading-7 text-slate-900">
            {headerMeta.title}
          </h2>
          <p className="truncate text-sm font-normal leading-5 text-gray-600">
            {headerMeta.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="inline-flex md:hidden bg-[#171D41] hover:bg-[#2a3342] text-white rounded-lg p-2 border border-[#EDEDED33] transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
