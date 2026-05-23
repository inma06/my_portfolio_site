import { useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Projects } from "./components/Projects";
import { TechStack } from "./components/TechStack";
import { Contact } from "./components/Contact";
import { ImageLightbox } from "./components/ImageLightbox";
import { useVisitorLogger } from "./hooks/useVisitorLogger";

// 전역 라이트박스 상태를 위한 타입 정의
interface GlobalLightboxState {
  urls: string[];
  alt: string;
  index: number;
}

export default function App() {
  useVisitorLogger();

  // 스크린샷 전체화면 모달 상태
  const [lightbox, setLightbox] = useState<GlobalLightboxState | null>(null);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased transition-colors duration-300">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
        <Hero />
        {/* 💡 Projects 컴포넌트에 전역 라이트박스를 열 수 있는 핸들러 함수를 주입합니다. */}
        <Projects
          onOpenGlobalLightbox={(urls, alt, index) =>
            setLightbox({ urls, alt, index })
          }
        />
        <TechStack />
        <Contact />
      </main>

      {/* 💡 프로젝트 카드를 벗어나 전역 최상위 레이어에서 모달을 띄우므로 충돌이 절대 발생하지 않습니다. */}
      {lightbox && (
        <ImageLightbox
          urls={lightbox.urls}
          alt={lightbox.alt}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onPrev={() =>
            setLightbox((prev) =>
              prev
                ? {
                    ...prev,
                    index: (prev.index - 1 + prev.urls.length) % prev.urls.length,
                  }
                : null
            )
          }
          onNext={() =>
            setLightbox((prev) =>
              prev
                ? { ...prev, index: (prev.index + 1) % prev.urls.length }
                : null
            )
          }
        />
      )}
    </div>
  );
}