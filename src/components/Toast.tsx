interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#141417] border border-[#F5B82E] text-white text-xs font-semibold shadow-2xl shadow-black/80">
        <span className="material-symbols-outlined text-[#F5B82E] text-[18px]">
          check_circle
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
}
