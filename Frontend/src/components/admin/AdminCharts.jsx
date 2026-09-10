
import React, { useState } from "react";
import { FiTrendingUp } from "react-icons/fi";

const AdminCharts = ({
  data,
  loading,
  type = "revenue",
  subtitle,
  title,
  unitLabel = "orders",
  metricLabel,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const emptyChartData = {
    labels: [],
    revenue: [],
    orders: [],
    growth: 0,
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
        <div className="mb-4 h-6 w-1/3 animate-pulse rounded-full bg-sky-100" />
        <div className="h-48 animate-pulse rounded-xl bg-sky-50" />
      </div>
    );
  }

  const chartData = data || emptyChartData;
  const labels = chartData.labels || [];
  const rawDataset =
    (type === "revenue" ? chartData.revenue : chartData.orders) || [];
  const dataset = rawDataset.map((value) => Number(value) || 0);
  const dataMax = dataset.length ? Math.max(...dataset) : 0;

  const AXIS_DIVISIONS = 4;

  const getRevenueStep = (value) => {
    if (value <= 0) return 25000;

    const roughStep = value / AXIS_DIVISIONS;
    const magnitude = 10 ** Math.floor(Math.log10(roughStep));
    const normalized = roughStep / magnitude;
    const niceMultipliers = [1, 2.5, 5, 10];
    const multiplier =
      niceMultipliers.find((candidate) => normalized <= candidate) || 10;

    return multiplier * magnitude;
  };

  const ORDER_STEP = 10;

  let step;
  let axisMax;

  if (type === "revenue") {
    // Agar data 1L se kam hai to fixed scale: 0, 25k, 50k, 75k, 1.0L
    if (dataMax <= 100000) {
      step = 25000;
      axisMax = 100000;
    } else {
      step = getRevenueStep(dataMax);
      axisMax = step * AXIS_DIVISIONS;
    }
  } else {
    step = ORDER_STEP;
    axisMax = Math.max(
      ORDER_STEP * AXIS_DIVISIONS,
      Math.ceil(dataMax / ORDER_STEP) * ORDER_STEP,
    );
  }

  const stepsCount = Math.max(1, Math.round(axisMax / step));
  const yAxisSteps = Array.from(
    { length: stepsCount + 1 },
    (_, index) => axisMax - step * index,
  );

  const maxValue = axisMax;

  const plotVars =
    "[--axis-top:22px] [--axis-bottom:25px] sm:[--axis-top:26px] sm:[--axis-bottom:28px]";

  const plotTop = (value) =>
    `calc(var(--axis-top) + (100% - var(--axis-top) - var(--axis-bottom)) * ${
      axisMax ? 1 - value / axisMax : 1
    })`;

    const formatCurrency = (value) => {
    const num = Number(value) || 0;
    const hasDecimals = Math.abs(num % 1) > 0.004;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: hasDecimals ? 1 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).format(num);
  };


  const formatAxisLabel = (value) => {
    if (value === 0) return "0";

    if (type === "revenue") {
      if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
      if (value >= 1000) return `₹${Math.round(value / 1000)}k`;
      return `₹${Number(value.toFixed(2))}`;

    }

    if (value >= 1000) return `${Math.round(value / 1000)}k`;
    return `₹${Number(value.toFixed(2))}`;

  };

  const getBarGradient = (value) => {
    const percentage = (value / maxValue) * 100;

    if (percentage > 80) return "from-blue-700 via-blue-600 to-sky-400";
    if (percentage > 60) return "from-blue-600 via-blue-500 to-sky-300";
    if (percentage > 40) return "from-sky-500 to-sky-300";
    return "from-sky-400 to-sky-200";
  };

  const total = dataset.reduce((sum, value) => sum + value, 0);
  const resolvedMetricLabel =
    metricLabel || (type === "revenue" ? "Revenue" : "Orders");

  const barsMinWidthClass =
    labels.length > 8 ? "min-w-[640px] sm:min-w-0" : "min-w-0";

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-sky-100 sm:p-5">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-sky-400 to-blue-600" />

        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-800 sm:text-base">
            {title || (type === "revenue" ? "Revenue Overview" : "Order Overview")}
          </h3>

          <p className="mt-0.5 truncate text-[11px] text-slate-400 sm:text-xs">
            {resolvedMetricLabel} • {subtitle}
          </p>
        </div>
      </div>

      <div className={`flex gap-2 sm:gap-3 ${plotVars}`}>
        <div className="relative h-44 w-11 shrink-0 text-right text-[9px] font-medium leading-none text-slate-400 sm:h-56 sm:w-12 sm:text-[10px]">
          {yAxisSteps.map((value, index) => (
            <span
              key={index}
              className="absolute right-0 -translate-y-1/2"
              style={{ top: plotTop(value) }}
            >
              {formatAxisLabel(value)}
            </span>
          ))}
        </div>

        <div className="-mx-1 flex-1 overflow-x-auto px-1">
          <div
            className={`relative h-44 rounded-xl bg-gradient-to-b from-sky-50/60 to-white px-1.5 sm:h-56 ${barsMinWidthClass}`}
          >
            {yAxisSteps
              .filter((value) => value > 0)
              .map((value, index) => (
                <div
                  key={`grid-${index}`}
                  className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-slate-200"
                  style={{ top: plotTop(value) }}
                />
              ))}

            {labels.length === 0 && (
              <p className="w-full py-10 text-center text-xs font-medium text-slate-400">
                No chart data available
              </p>
            )}

            <div className="absolute left-1.5 right-1.5 top-[var(--axis-top)] bottom-[var(--axis-bottom)] flex items-end gap-1.5 sm:gap-2">
              {labels.map((label, index) => {
                const value = dataset[index] || 0;
                const height =
                  value > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
                const isHovered = hoveredIndex === index;

                return (
                  <div
                    key={`${label}-${index}`}
                    className="group relative flex h-full min-w-0 flex-1 items-end justify-center"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {isHovered && (
                      <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
                        {type === "revenue"
                          ? formatCurrency(value)
                          : `${value} ${unitLabel}`}
                      </div>
                    )}

                    {value > 0 && (
                      <div
                        className={`w-full cursor-pointer rounded-t-lg bg-gradient-to-t transition-all duration-300 ${getBarGradient(
                          value,
                        )} ${
                          isHovered
                            ? "brightness-110 shadow-lg shadow-sky-200"
                            : "opacity-90"
                        }`}
                        style={{ height: `${Math.max(height, 4)}%` }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="absolute left-1.5 right-1.5 bottom-0 flex h-[var(--axis-bottom)] items-end gap-1.5 sm:gap-2">
              {labels.map((label, index) => {
                const isHovered = hoveredIndex === index;

                return (
                  <div
                    key={`${label}-axis-${index}`}
                    className="min-w-0 flex-1 text-center"
                  >
                    <span
                      className={`text-[9px] font-semibold transition-colors sm:text-[10px] ${
                        isHovered ? "text-blue-700" : "text-slate-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sky-100 pt-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-600" />
            <span className="text-xs font-medium text-slate-600">
              {resolvedMetricLabel}
            </span>
          </div>

          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            Total: {type === "revenue" ? formatCurrency(total) : total}
          </span>
        </div>

        {chartData.growth != null && (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1">
            <FiTrendingUp className="h-3.5 w-3.5 text-emerald-600" />

            <span className="text-[11px] font-bold text-emerald-600">
              {`${chartData.growth > 0 ? "+" : ""}${chartData.growth}%`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCharts;
