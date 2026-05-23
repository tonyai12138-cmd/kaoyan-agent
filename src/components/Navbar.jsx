import { NavLink } from "react-router-dom";
import { useDemo } from "../lib/demoState";

const navItems = [
  { to: "/", label: "首页" },
  { to: "/diagnosis", label: "画像诊断" },
  { to: "/report", label: "择校报告" },
  { to: "/plan", label: "备考计划" },
  { to: "/chat", label: "智能问答" },
  { to: "/review", label: "每日复盘" },
  { to: "/about", label: "项目说明" },
];

export default function Navbar() {
  const { resetDemo } = useDemo();

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <div className="page-shell flex flex-wrap items-center justify-between gap-4 py-4">
        <NavLink className="flex items-center gap-3" to="/">
          <span className="brand-orb">研</span>
          <span>
            <span className="block text-base font-bold text-slate-950">
              研途智伴 Agent
            </span>
            <span className="block text-[11px] tracking-[0.2em] text-slate-500">
              MOCK EXPERIENCE
            </span>
          </span>
        </NavLink>
        <nav className="order-3 flex w-full flex-wrap justify-center gap-1 rounded-2xl bg-slate-100/80 p-1 lg:order-2 lg:w-auto">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
              key={item.to}
              to={item.to}
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="button-secondary order-2 px-4 py-2 text-sm lg:order-3"
          onClick={resetDemo}
          type="button"
        >
          重置演示
        </button>
      </div>
    </header>
  );
}
