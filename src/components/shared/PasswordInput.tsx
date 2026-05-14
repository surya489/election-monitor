type PasswordInputProps = {
  value: string;
  showPassword: boolean;
  ariaLabel?: string;
  className?: string;
  minLength?: number;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
};

export function PasswordInput({
  value,
  showPassword,
  ariaLabel,
  className = "",
  minLength,
  placeholder,
  required,
  onChange,
  onToggle,
}: PasswordInputProps) {
  return (
    <div className="relative">
      <input
        aria-label={ariaLabel}
        className={`h-12 w-full rounded-md border border-[#d8e0db] bg-white px-4 pr-12 outline-none transition placeholder:text-[#899590] focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10 ${className}`}
        minLength={minLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={showPassword ? "text" : "password"}
        value={value}
      />
      <button
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-[#52615d] transition hover:bg-[#eefcf8] hover:text-[#14211f]"
        onClick={onToggle}
        type="button"
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 9 5 9 8a8.8 8.8 0 0 1-2.2 3.5" />
      <path d="M6.6 6.6C4.4 8.1 3 10.2 3 12c0 3 4 8 9 8a10.7 10.7 0 0 0 4.1-.8" />
    </svg>
  );
}

