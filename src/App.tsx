import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

// 再現パターン
//  A: threshold 0.1 / true のときだけ報告      → 隣のセクションが少し見えただけで切り替わる
//  B: rootMargin + threshold 0 / true のときだけ報告 → ゆっくり進んで戻ると、現在地が戻らない
//  C: true/false 両方を報告し、親が一覧を持つ   → 直った版
type Mode = 'A' | 'B' | 'C';

const NOT_FOUND = 3;

const SECTIONS = ['history', 'apps', 'about'] as const;
const SectionMap = new Map<string, number> (
  SECTIONS.map((item, index) => [item, index])
);

const COLORS = ['#fde68a', '#bfdbfe', '#bbf7d0'];

const MODES: Record<Mode, { label: string; threshold: number; rootMargin: string }> = {
  A: { label: 'A: threshold 0.1', threshold: 0.1, rootMargin: '0px' },
  B: { label: 'B: rootMargin -40%, threshold 0', threshold: 0, rootMargin: '-40% 0px' },
  C: { label: 'C: 直した版（rootMargin + 一覧管理）', threshold: 0, rootMargin: '-40% 0px' },
};

// 表示用の説明文
const DESC: Record<Mode, string> = {
  A: '隣のセクションが少し見えると切り替わり、戻ると現在地が正しく更新されない',
  B: 'rootMargin で切り替わるタイミングを調整しても、戻ると現在地が正しく更新されない',
  C: 'true / false の通知を使い、監視範囲内のセクションを一覧管理する',
};

const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";
const HEADER_H = 148;
const NAV_W = 180;

type SectionProps = {
  id: string;
  color: string;
  mode: Mode;
  onInView: (id: string, inView: boolean) => void;
};

function Section({ id, color, mode, onInView }: SectionProps) {
  const { threshold, rootMargin } = MODES[mode];
  const { ref } = useInView({
    threshold,
    rootMargin,
    onChange(inView) {
      if (mode === 'C') {
        onInView(id, inView);
      } else if (inView) {
        onInView(id, true); // A/B は true のときしか報告しない
      }
    },
  });

  return (
    <section id={id} style={{ background: color, margin: 0, scrollMarginTop: HEADER_H }}>
      {/* 高さは画面より大きくする（収まらないセクションの再現） */}
      <div ref={ref} style={{ height: '130vh', padding: 24, fontSize: 28, fontWeight: 500, boxSizing: 'border-box' }}>
        {id}
      </div>
    </section>
  );
};

const sortSections = (sections: string[]): string[] => {
  return [...sections].sort((a, b) => {
    const itemA = SectionMap.get(a) ?? NOT_FOUND;
    const itemB = SectionMap.get(b) ?? NOT_FOUND;

    return itemA - itemB;
  });
};

export default function App() {
  const [mode, setMode] = useState<Mode>('A');
  const [currentId, setCurrentId] = useState<string>('(none)');
  const [visible, setVisible] = useState<string[]>([]);

  // モードを切り替えたら状態を初期化
  useEffect(() => {
    setCurrentId('(none)');
    setVisible([]);
  }, [mode]);

  const handle = (id: string, inView: boolean) => {
    if (mode !== 'C') {
      setCurrentId(id);
      return;
    }
    setVisible((prev) => [
      ...new Set(
        inView ? [...prev, id] : prev.filter((p) => p !== id)
      )
    ]);
  };

  // C: 見えている一覧のうち、ページ上でいちばん上のものを現在地にする
  useEffect(() => {
    if (mode === 'C' && visible.length > 0) {
      setCurrentId(sortSections(visible)[0]);
    }
  }, [mode, visible]);

  const isFull = mode === 'A';

  return (
    <>
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10, height: HEADER_H, boxSizing: 'border-box',
          background: '#fafaf8', color: '#1a1a1a', padding: '18px 24px',
          borderBottom: '1px solid #e2e0db', display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
          <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap' }}>useInView repro</div>
          <div style={{ fontSize: 14, color: '#6b6964' }}>{DESC[mode]}</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                marginLeft: -1, fontFamily: MONO, fontSize: 14, padding: '8px 14px', cursor: 'pointer',
                border: '1px solid #1a1a1a', borderRadius: 0, whiteSpace: 'nowrap',
                background: m === mode ? '#1a1a1a' : 'transparent',
                color: m === mode ? '#fff' : '#1a1a1a',
              }}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 17, display: 'flex', gap: 28, whiteSpace: 'nowrap' }}>
          <span>現在地: <b>{currentId}</b></span>
          <span style={{ color: '#6b6964' }}>見えている: [{visible.join(', ')}]</span>
        </div>
      </div>

      <div style={{ display: 'flex', paddingTop: HEADER_H }}>
        <nav
          style={{
            position: 'sticky', top: HEADER_H, alignSelf: 'flex-start', height: `calc(100vh - ${HEADER_H}px)`,
            width: NAV_W, flexShrink: 0, padding: 24, boxSizing: 'border-box',
            borderRight: '1px solid #e2e0db', display: 'flex', flexDirection: 'column', gap: 16,
          }}
        >
          {SECTIONS.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              style={{
                fontSize: 18, display: 'flex', gap: 10, alignItems: 'center', textDecoration: 'none',
                color: id === currentId ? '#1a1a1a' : '#8a8780', fontWeight: id === currentId ? 700 : 400,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: id === currentId ? '#1a1a1a' : 'transparent' }} />
              {id}
            </a>
          ))}
        </nav>

        {/* key を変えて、モード切替時に observer を作り直す */}
        <main key={mode} style={{ flex: 1, minWidth: 0 }}>
          {SECTIONS.map((id, i) => (
            <Section key={id} id={id} color={COLORS[i]} mode={mode} onInView={handle} />
          ))}
        </main>
      </div>

      {/* 監視範囲の可視化（表示のみ。rootMargin はビューポート基準） */}
      <div
        style={{
          position: 'fixed', left: NAV_W, right: 0, top: isFull ? 0 : '40%', bottom: isFull ? 0 : '40%', zIndex: 5,
          borderTop: '1px dashed #1a1a1a', borderBottom: '1px dashed #1a1a1a',
          background: 'rgba(26, 26, 26, 0.04)', pointerEvents: 'none',
        }}
      >
        <span
          style={{
            position: 'absolute', right: 8, top: isFull ? HEADER_H + 6 : 6, whiteSpace: 'nowrap',
            fontFamily: MONO, fontSize: 13, background: '#fafaf8', padding: '2px 8px',
          }}
        >
          監視範囲 rootMargin {MODES[mode].rootMargin}
        </span>
      </div>
    </>
  );
}
