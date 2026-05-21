import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { TechStack } from "./components/TechStack";
import { Projects } from "./components/Projects";
import { Contact } from "./components/Contact";
import { profile } from "./data/portfolio";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />
      <main>
        <Hero />
        <TechStack />
        <Projects />
        <Contact />
      </main>
      <footer className="mx-auto w-full max-w-5xl border-t border-[var(--color-border)] px-6 py-10 text-xs text-[var(--color-muted)] sm:px-8">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span className="font-mono">
            built with Vite · React · Tailwind
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
