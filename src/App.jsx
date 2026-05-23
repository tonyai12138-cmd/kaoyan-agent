import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Chat from "./pages/Chat";
import Diagnosis from "./pages/Diagnosis";
import Home from "./pages/Home";
import Plan from "./pages/Plan";
import Report from "./pages/Report";
import Review from "./pages/Review";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

function NotFound() {
  return (
    <main className="page-shell flex min-h-[60vh] items-center justify-center py-16">
      <div className="surface-card max-w-lg p-10 text-center">
        <p className="section-kicker">404</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-950">页面尚未规划</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          当前演示版本仅开放核心备考流程页面，请回到首页开始体验。
        </p>
        <Link className="button-primary mt-8 inline-flex" to="/">
          返回首页
        </Link>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <div className="min-h-screen text-slate-800">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Diagnosis />} path="/diagnosis" />
        <Route element={<Report />} path="/report" />
        <Route element={<Plan />} path="/plan" />
        <Route element={<Chat />} path="/chat" />
        <Route element={<Review />} path="/review" />
        <Route element={<About />} path="/about" />
        <Route element={<NotFound />} path="*" />
      </Routes>
      <Footer />
    </div>
  );
}
