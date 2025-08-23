import React from 'react';

interface GarbageBarChartProps {
  currentValue: number;
  goalValue: number;
  title: string;
  unit?: string;
}

const GarbageBarChart: React.FC<GarbageBarChartProps> = ({
  currentValue,
  goalValue,
  title,
  unit = 'トン', // デフォルトは「トン」
}) => {
  // 達成率を計算 (0%〜100%の範囲に収める)
  const progress = Math.max(0, Math.min((currentValue / goalValue) * 100, 100));
  const onTrack = currentValue <= goalValue;

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200/50">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-1">{title}</h2>
      <p className="text-sm text-gray-500 text-center mb-5">
        目標: {goalValue.toLocaleString()}{unit}
      </p>

      <div className="space-y-2">
        {/* バー */}
        <div className="relative w-full h-10 bg-gray-200/80 rounded-full shadow-inner overflow-hidden">
          <div
            className={`absolute h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3
              ${onTrack ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-amber-500 to-red-500'}`}
            style={{ width: `${progress}%` }}
          >
             <span className="text-white text-xs font-bold drop-shadow-md">{progress.toFixed(0)}%</span>
          </div>
        </div>

        {/* ラベル */}
        <div className="flex justify-between items-end pt-1">
          <div className="text-left">
            <div className="text-2xl font-extrabold text-gray-800 tracking-tight">
              {currentValue.toLocaleString()}
              <span className="text-base font-medium ml-1">{unit}</span>
            </div>
            <div className="text-xs text-gray-500">現在の排出量</div>
          </div>
          <div className={`text-right font-bold text-sm ${onTrack ? 'text-green-600' : 'text-red-600'}`}>
            {onTrack
              ? `目標まであと ${(goalValue - currentValue).toLocaleString()} ${unit}`
              : `目標を ${(currentValue - goalValue).toLocaleString()} ${unit} 超過`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GarbageBarChart;
