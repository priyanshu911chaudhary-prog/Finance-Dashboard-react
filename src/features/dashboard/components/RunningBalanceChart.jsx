import { useEffect, useMemo, useRef } from 'react';
import { eachDayOfInterval, format, parseISO, startOfDay } from 'date-fns';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../../utils/currency';

gsap.registerPlugin(ScrollTrigger);

function formatCompactINR(value) {
  const abs = Math.abs(value);
  if (abs >= 1e7) return `₹${(value / 1e7).toFixed(1)}Cr`;
  if (abs >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`;
  if (abs >= 1e3) return `₹${(value / 1e3).toFixed(1)}k`;
  return `₹${Math.round(value)}`;
}

export function RunningBalanceChart({ transactions = [], wallets = [], goals = [] }) {
  const chartRef = useRef(null);

  const { chartData, currentBalance } = useMemo(() => {
    const baseCapital = wallets.reduce((sum, w) => sum + Number(w.openingBalance || 0), 0);

    const nonTransfer = transactions
      .filter((tx) => tx && tx.date && tx.type !== 'transfer')
      .map((tx) => ({
        date: startOfDay(parseISO(`${tx.date}T00:00:00`)),
        amount: Number(tx.amount) || 0,
      }))
      .sort((a, b) => a.date - b.date);

    if (!nonTransfer.length) {
      const today = startOfDay(new Date());
      return {
        currentBalance: baseCapital,
        chartData: [{ date: format(today, 'MMM d'), balance: baseCapital, rawDate: today }],
      };
    }

    const dailyTotals = {};
    for (const tx of nonTransfer) {
      const key = format(tx.date, 'yyyy-MM-dd');
      dailyTotals[key] = (dailyTotals[key] || 0) + tx.amount;
    }

    const firstTxDate = nonTransfer[0].date;
    const today = startOfDay(new Date());
    const days = eachDayOfInterval({ start: firstTxDate, end: today });

    let current = baseCapital;
    const output = days.map((day) => {
      const key = format(day, 'yyyy-MM-dd');
      if (dailyTotals[key] !== undefined) {
        current += dailyTotals[key];
      }

      return {
        date: format(day, 'MMM d'),
        balance: current,
        rawDate: day,
      };
    });

    return {
      currentBalance: current,
      chartData: output,
    };
  }, [transactions, wallets]);

  useEffect(() => {
    const root = chartRef.current;
    if (!root) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return;

    const path = root.querySelector('.recharts-area-curve');
    if (!path || typeof path.getTotalLength !== 'function') return;

    const length = path.getTotalLength();
    if (!Number.isFinite(length) || length <= 0) return;

    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

    const tween = gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.25,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: root,
        start: 'top 85%',
        once: true,
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [chartData]);

  return (
    <div className="glass-panel p-6 rounded-2xl h-[400px] flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white tracking-tight">Running Balance</h3>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-muted">Current</p>
          <p className="text-2xl font-bold text-accent">{formatCurrency(currentBalance)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted">
        <span>{goals.length} active goals</span>
        <span>{chartData.length} days in ledger</span>
      </div>

      <div ref={chartRef} className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="runningBalanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#00f0ff" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tickLine={false}
              axisLine={false}
              minTickGap={26}
              fontSize={12}
            />

            <YAxis
              stroke="#9ca3af"
              tickLine={false}
              axisLine={false}
              width={64}
              fontSize={12}
              tickFormatter={formatCompactINR}
            />

            <Tooltip
              cursor={false}
              contentStyle={{
                backgroundColor: 'rgba(9,9,11,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
              }}
              labelFormatter={(label, payload) => {
                const point = payload?.[0]?.payload;
                const date = point?.rawDate;
                return date ? format(date, 'MMM d, yyyy') : label;
              }}
              formatter={(value) => [formatCurrency(value), 'Balance']}
            />

            <Area
              type="monotone"
              dataKey="balance"
              stroke="var(--color-accent)"
              strokeWidth={2.8}
              fill="url(#runningBalanceFill)"
              dot={false}
              activeDot={{ r: 4.5, stroke: '#fff', strokeWidth: 1.5, fill: 'var(--color-accent)' }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}