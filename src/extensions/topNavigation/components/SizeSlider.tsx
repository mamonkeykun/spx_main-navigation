import * as React from 'react';
import styles from './SizeSlider.module.css';

interface SizeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export const SizeSlider: React.FC<SizeSliderProps> = ({
  label,
  value,
  min,
  max,
  onChange,
}) => (
  <div className={styles.wrapper}>
    <span className={styles.label}>{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className={styles.slider}
      aria-label={label}
    />
    <span className={styles.value}>{value}</span>
  </div>
);
