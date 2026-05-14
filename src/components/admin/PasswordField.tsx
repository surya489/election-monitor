import { PasswordInput } from "@/components/shared/PasswordInput";

type PasswordFieldProps = {
  showPassword: boolean;
  value: string;
  onChange: (value: string) => void;
  onToggle: () => void;
};

export function PasswordField({
  showPassword,
  value,
  onChange,
  onToggle,
}: PasswordFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#52615d]">Password</span>
      <span className="relative mt-2 block">
        <PasswordInput
          className="bg-transparent placeholder:text-current"
          onChange={onChange}
          onToggle={onToggle}
          showPassword={showPassword}
          value={value}
        />
      </span>
    </label>
  );
}
