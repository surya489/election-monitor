import type { Toast } from "./types";

type ToastMessageProps = {
  toast: Toast | null;
};

const toastToneClasses: Record<Toast["tone"], string> = {
  success: "border-[#bce7d3] bg-[#effcf6] text-[#14513d]",
  error: "border-[#f3c4c4] bg-[#fff1f1] text-[#8d1d1d]",
  info: "border-[#c9d8f0] bg-[#f3f7ff] text-[#243f6b]",
};

export function ToastMessage({ toast }: ToastMessageProps) {
  if (!toast) {
    return null;
  }

  return (
    <div
      className={`fixed left-5 right-5 top-5 z-50 rounded-md border px-4 py-3 text-sm shadow-lg sm:left-auto sm:max-w-sm ${toastToneClasses[toast.tone]}`}
      role="status"
    >
      {toast.message}
    </div>
  );
}

