import { useState, ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

const DetailsTabs = ({ tabs }: { tabs: Tab[] }) => {
  const [active, setActive] = useState(tabs[0]?.id);
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className="w-full">
      <div
        className="grid mb-4"
        style={{
          gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
          border: "1px solid hsl(0 0% 88%)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="py-3 text-[11px] uppercase tracking-[0.14em] font-medium transition-colors duration-200"
              style={{
                backgroundColor: isActive ? "hsl(0 0% 12%)" : "transparent",
                color: isActive ? "hsl(0 0% 100%)" : "hsl(0 0% 35%)",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div>{activeTab?.content}</div>
    </div>
  );
};

export default DetailsTabs;
