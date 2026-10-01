import React, { useMemo } from 'react';
import { generateCode128 } from '../utils/code128';

interface CategoryBarcodeProps {
  categoryName: string;
  barcodeNumber: string;
  className?: string;
  showDigitsBelow?: boolean;
}

export const CategoryBarcode: React.FC<CategoryBarcodeProps> = ({
  categoryName,
  barcodeNumber,
  className = '',
  showDigitsBelow = false,
}) => {
  const cleanNumber = (barcodeNumber || '1796938').trim() || '1796938';
  const cleanName = (categoryName || 'LUNCH').toUpperCase().trim();

  // Generate mathematically exact ISO/IEC 15417 Code 128 barcode vectors
  const barcode = useMemo(() => {
    return generateCode128(cleanNumber, 1.8, 44, 14);
  }, [cleanNumber]);

  return (
    <div
      className={`bg-white text-slate-900 rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-4 w-full select-none overflow-hidden transition-all hover:border-slate-300 dark:border-slate-700/80 ${className}`}
      title={`Código 128: ${cleanName} - Ref ${cleanNumber}`}
    >
      {/* LEFT: Standard Code 128 Barcode with quiet zones and crisp pixel edges */}
      <div className="flex-1 min-w-0 flex items-center justify-start overflow-hidden">
        <svg
          viewBox={`0 0 ${barcode.totalWidth} ${barcode.height}`}
          className="h-10 sm:h-11 w-auto max-w-[210px] sm:max-w-[260px] block"
          style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated' }}
          role="img"
          aria-label={`Código de barras Code 128 para ${cleanName} (${cleanNumber})`}
        >
          {/* White Quiet Zone background */}
          <rect
            x="0"
            y="0"
            width={barcode.totalWidth}
            height={barcode.height}
            fill="#ffffff"
          />
          {/* Exact Code 128 Black Bars */}
          {barcode.bars.map((bar, idx) => (
            <rect
              key={idx}
              x={bar.x}
              y="0"
              width={bar.width}
              height={barcode.height}
              fill="#000000"
            />
          ))}
        </svg>
      </div>

      {/* RIGHT: Thin Vertical Divider + Category Name & Reference Number (Matches physical card spec) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-[1.5px] h-8 sm:h-9 bg-slate-200 dark:bg-slate-300 shrink-0" />
        <div className="text-right flex flex-col justify-center min-w-[70px]">
          <span className="text-xs sm:text-sm font-black text-slate-900 tracking-wider uppercase leading-tight truncate max-w-[130px]">
            {cleanName}
          </span>
          <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-600 tracking-widest leading-tight mt-0.5">
            {cleanNumber}
          </span>
        </div>
      </div>
    </div>
  );
};
