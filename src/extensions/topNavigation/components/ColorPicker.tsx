import * as React from 'react';
import { useCallback, useRef, useState } from 'react';
import { ColorPickerPanel } from './ColorPickerPanel';
import styles from './ColorPicker.module.css';
import {
  hexToRgb,
  hsvToRgb,
  rgbToHex,
  rgbToHsv,
  type HSV,
} from '../utils/colorUtils';

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  label: string;
}

/**
 * HSVカラーピッカーのトリガー部分。
 * パネル本体と色変換ロジックは別ファイルへ分割している。
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label }) => {
  const [open, setOpen] = useState(false);
  const [localHsv, setLocalHsv] = useState<HSV>(() => rgbToHsv(hexToRgb(value)));
  const [hexInput, setHexInput] = useState(value.replace('#', ''));
  const wrapperRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setLocalHsv(rgbToHsv(hexToRgb(value)));
    setHexInput(value.replace('#', ''));
  }, [value]);

  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handler = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const applyHsv = useCallback(
    (nextHsv: HSV) => {
      setLocalHsv(nextHsv);
      const nextRgb = hsvToRgb(nextHsv);
      const nextHex = rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b);
      setHexInput(nextHex.replace('#', ''));
      onChange(nextHex);
    },
    [onChange]
  );

  const currentRgb = hsvToRgb(localHsv);
  const currentHex = rgbToHex(currentRgb.r, currentRgb.g, currentRgb.b);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.row}>
        <span className={styles.label}>{label}</span>
        <button
          type="button"
          className={styles.swatch}
          style={{ background: currentHex }}
          onClick={() => setOpen((current) => !current)}
          aria-label={`${label}を選択`}
          aria-expanded={open}
        />
      </div>
      {open ? (
        <ColorPickerPanel
          hsv={localHsv}
          rgb={currentRgb}
          hexInput={hexInput}
          label={label}
          onCanvasClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const s = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
            const v = Math.max(0, Math.min(1, 1 - (event.clientY - rect.top) / rect.height));
            applyHsv({ ...localHsv, s, v });
          }}
          onHueChange={(event) => {
            applyHsv({ ...localHsv, h: Number(event.target.value) / 360 });
          }}
          onHexInput={(event) => {
            const nextValue = event.target.value.replace('#', '');
            setHexInput(nextValue);
            if (nextValue.length === 6) {
              applyHsv(rgbToHsv(hexToRgb(`#${nextValue}`)));
            }
          }}
          onChannelChange={(channel, nextValue) => {
            const nextRgb = {
              r: currentRgb.r,
              g: currentRgb.g,
              b: currentRgb.b,
            };
            nextRgb[channel] = nextValue;
            applyHsv(rgbToHsv(nextRgb));
          }}
        />
      ) : null}
    </div>
  );
};
