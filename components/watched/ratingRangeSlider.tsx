import React, { useCallback, useRef, useState } from "react";
import { StarRow, TOTAL_STARS } from "./ratingStars";

export interface RatingRange {
  min: number;
  max: number;
}

interface RatingRangeSliderProps {
  value: RatingRange | null;
  onChange: (value: RatingRange) => void;
}

const STEP = 0.5;
const MIN_VALUE = 0.5;
const MAX_VALUE = TOTAL_STARS;

const clampToStep = (raw: number): number => {
  const stepped = Math.round(raw / STEP) * STEP;
  return Math.min(Math.max(stepped, MIN_VALUE), MAX_VALUE);
};

const valueFromClientX = (clientX: number, rect: DOMRect): number => {
  if (rect.width === 0) return MIN_VALUE;
  const fraction = (clientX - rect.left) / rect.width;
  const raw = Math.min(Math.max(fraction, 0), 1) * MAX_VALUE;
  return clampToStep(raw);
};

const RatingRangeSlider: React.FC<RatingRangeSliderProps> = ({
  value,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<number | null>(null);
  const [previewRange, setPreviewRange] = useState<RatingRange | null>(null);
  const [keyboardAnchor, setKeyboardAnchor] = useState<number | null>(null);

  const displayValue = previewRange ?? value;

  const commit = useCallback(
    (range: RatingRange) => {
      onChange(range);
    },
    [onChange],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const point = valueFromClientX(event.clientX, rect);
      anchorRef.current = point;
      setKeyboardAnchor(null);
      setPreviewRange({ min: point, max: point });
      containerRef.current?.setPointerCapture(event.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (anchorRef.current === null) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const point = valueFromClientX(event.clientX, rect);
      const anchor = anchorRef.current;
      setPreviewRange({
        min: Math.min(anchor, point),
        max: Math.max(anchor, point),
      });
    },
    [],
  );

  const settlePointerInteraction = useCallback(() => {
    if (anchorRef.current === null) return;
    anchorRef.current = null;

    setPreviewRange((current) => {
      if (current) commit(current);
      return null;
    });
  }, [commit]);

  const finishPointerInteraction = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (anchorRef.current === null) return;
      containerRef.current?.releasePointerCapture(event.pointerId);
      settlePointerInteraction();
    },
    [settlePointerInteraction],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const base = displayValue ?? { min: MIN_VALUE, max: MIN_VALUE };
      let step = 0;

      if (event.key === "ArrowRight" || event.key === "ArrowUp") step = STEP;
      else if (event.key === "ArrowLeft" || event.key === "ArrowDown")
        step = -STEP;
      else if (event.key === "Home") {
        event.preventDefault();
        setKeyboardAnchor(null);
        setPreviewRange({ min: MIN_VALUE, max: MIN_VALUE });
        return;
      } else if (event.key === "End") {
        event.preventDefault();
        setKeyboardAnchor(null);
        setPreviewRange({ min: MAX_VALUE, max: MAX_VALUE });
        return;
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (previewRange) commit(previewRange);
        setKeyboardAnchor(null);
        return;
      } else if (event.key === "Escape") {
        event.stopPropagation();
        setPreviewRange(null);
        setKeyboardAnchor(null);
        return;
      } else {
        return;
      }

      event.preventDefault();
      const anchor = event.shiftKey ? (keyboardAnchor ?? base.min) : null;
      const cursor =
        anchor === null || base.min === base.max
          ? base.max
          : anchor === base.min
            ? base.max
            : base.min;
      const nextPoint = Math.min(Math.max(cursor + step, MIN_VALUE), MAX_VALUE);

      if (anchor !== null) {
        setKeyboardAnchor(anchor);
        setPreviewRange({
          min: Math.min(anchor, nextPoint),
          max: Math.max(anchor, nextPoint),
        });
      } else {
        setKeyboardAnchor(null);
        setPreviewRange({ min: nextPoint, max: nextPoint });
      }
    },
    [commit, displayValue, keyboardAnchor, previewRange],
  );

  const rangeStart =
    displayValue && displayValue.min !== displayValue.max
      ? displayValue.min
      : 0;
  const rangeEnd = displayValue ? displayValue.max : 0;
  const leftInset = (rangeStart / MAX_VALUE) * 100;
  const rightInset = 100 - (rangeEnd / MAX_VALUE) * 100;

  const ariaLabel = displayValue
    ? displayValue.min === displayValue.max
      ? `Nota ${displayValue.min} de ${MAX_VALUE}`
      : `Notas entre ${displayValue.min} e ${displayValue.max} de ${MAX_VALUE}`
    : `Escolha uma nota de ${MIN_VALUE} a ${MAX_VALUE}`;

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={MIN_VALUE}
      aria-valuemax={MAX_VALUE}
      aria-valuenow={displayValue?.max ?? MIN_VALUE}
      aria-valuetext={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerInteraction}
      onPointerCancel={finishPointerInteraction}
      onLostPointerCapture={settlePointerInteraction}
      onKeyDown={handleKeyDown}
      className="relative inline-block w-max cursor-pointer touch-none select-none leading-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a16]"
    >
      <StarRow dimension="h-7 w-7" tone="text-white/15" />
      {displayValue && (
        <span
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${rightInset}% 0 ${leftInset}%)` }}
        >
          <StarRow dimension="h-7 w-7" tone="text-amber-400" />
        </span>
      )}
    </div>
  );
};

export default RatingRangeSlider;
