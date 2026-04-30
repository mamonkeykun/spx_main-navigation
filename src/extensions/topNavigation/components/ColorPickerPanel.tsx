import * as React from 'react';
import styles from './ColorPicker.module.css';
import { hsvToRgb, rgbToHex, type HSV, type RGB } from '../utils/colorUtils';

interface ColorPickerPanelProps {
  hsv: HSV;
  rgb: RGB;
  hexInput: string;
  onCanvasClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onHueChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onHexInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChannelChange: (channel: 'r' | 'g' | 'b', value: number) => void;
  label: string;
}

const CHANNEL_LABELS = {
  r: '赤',
  g: '緑',
  b: '青',
} as const;

const CHANNELS = ['r', 'g', 'b'] as const;

/**
 * カラーピッカーのパネル本体。
 */
export const ColorPickerPanel: React.FC<ColorPickerPanelProps> = ({
  hsv,
  rgb,
  hexInput,
  onCanvasClick,
  onHueChange,
  onHexInput,
  onChannelChange,
  label,
}) => {
  const hueRgb = hsvToRgb({ h: hsv.h, s: 1, v: 1 });
  const hueColor = rgbToHex(hueRgb.r, hueRgb.g, hueRgb.b);

  return (
    <div className={styles.picker} role="dialog" aria-label={`${label}カラーピッカー`}>
      <div
        className={styles.canvas}
        onClick={onCanvasClick}
        style={{
          background: `linear-gradient(to bottom, #fff, #000), linear-gradient(to right, #fff, ${hueColor})`,
          backgroundBlendMode: 'multiply, normal',
        }}
      >
        <div
          className={styles.cursor}
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
          }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={360}
        value={Math.round(hsv.h * 360)}
        onChange={onHueChange}
        className={styles.hueSlider}
        aria-label="色相"
      />
      <div className={styles.inputs}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>16進数</label>
          <input
            className={styles.inputField}
            value={hexInput}
            onChange={onHexInput}
            maxLength={6}
            aria-label="16進数カラーコード"
          />
        </div>
        {CHANNELS.map((channel) => (
          <div key={channel} className={styles.inputGroup}>
            <label className={styles.inputLabel}>{CHANNEL_LABELS[channel]}</label>
            <input
              className={styles.inputField}
              value={Math.round(rgb[channel])}
              onChange={(event) => onChannelChange(channel, Number(event.target.value))}
              type="number"
              min={0}
              max={255}
              aria-label={`${CHANNEL_LABELS[channel]}チャンネル`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
