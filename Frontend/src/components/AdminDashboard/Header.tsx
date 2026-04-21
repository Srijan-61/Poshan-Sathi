

interface HeaderProps {
  pageTitle: string;
  primaryButtonAction: (() => void) | null;
  primaryButtonLabel: string | null;
}

export default function Header({
  pageTitle,
  primaryButtonAction,
  primaryButtonLabel
}: HeaderProps) {
  return (
    <header className="h-20 bg-white border-b border-neutral-200/60 flex items-center justify-between px-8 shrink-0">
      <h2 className="text-xl font-bold">{pageTitle}</h2>
      <div className="flex items-center space-x-6">
        {primaryButtonAction && primaryButtonLabel && (
          <button 
            onClick={primaryButtonAction}
            className="bg-[#00a86b] hover:bg-[#00905a] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            {primaryButtonLabel}
          </button>
        )}
      </div>
    </header>
  );
}
