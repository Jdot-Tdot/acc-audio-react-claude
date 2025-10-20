

interface SettingRowProps {
  label: string;
  value: string | number;
  onChange: (arg0: React.ChangeEvent<HTMLInputElement>) => void;
  min: string | number;
  max: string | number;
  step: string | number;
}

// Making this a new file will help with the "any" type errors.
// I've made this a new file with refactor tool.
export const SettingRow = ({ label, value, onChange, min, max, step }: SettingRowProps) => {
  return (
    <div className="flex justify-between items-center p-2">
      <span className="text-sm font-bold text-white">{label}</span>
      <input
        type="number"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="" />
    </div>
  );
};

export default SettingRow