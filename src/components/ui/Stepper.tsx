import Icon from './Icon';

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export default function Stepper({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  unit,
}: StepperProps) {
  const dec = () => onChange(Math.max(min, +(value - step).toFixed(2)));
  const inc = () => onChange(Math.min(max, +(value + step).toFixed(2)));
  return (
    <div className="stepper">
      <button type="button" onClick={dec} aria-label="decrease">
        <Icon name="remove" size={18} />
      </button>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (Number.isFinite(v)) onChange(Math.max(min, Math.min(max, v)));
          else onChange(0);
        }}
      />
      {unit && (
        <span className="text-xs font-bold opacity-70 mr-2" style={{ letterSpacing: 0.5 }}>
          {unit}
        </span>
      )}
      <button type="button" onClick={inc} aria-label="increase">
        <Icon name="add" size={18} />
      </button>
    </div>
  );
}
