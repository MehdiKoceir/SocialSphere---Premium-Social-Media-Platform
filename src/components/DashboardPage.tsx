import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, TrendingUp, Users, Activity, Eye, Percent, ArrowUpRight, Share2 } from 'lucide-react';
import { inkPressAudio } from '../utils/audio';

export default function DashboardPage() {
  const [activeMetricTab, setActiveMetricTab] = useState<'engagement' | 'impressions'>('engagement');
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // Executive Telemetry Cards
  const stats = [
    { label: "Core Impressions", val: "142,809", diff: "+12.4%", desc: "vs. previous cycle", icon: <Eye className="text-cyber-blue" size={16} /> },
    { label: "Platform Engagement", val: "8.42%", diff: "+1.8%", desc: "average interact-rate", icon: <Activity className="text-cyber-purple" size={16} /> },
    { label: "Channel Conversion", val: "3.24%", diff: "-0.4%", desc: "direct monograph clicks", icon: <Percent className="text-cyber-pink" size={16} /> },
    { label: "Direct Relays", val: "24", diff: "+6", desc: "active secure DM tunnels", icon: <Users className="text-cyber-green" size={16} /> }
  ];

  // SVG Area Chart Data points
  const engagementPoints = [35, 45, 30, 80, 55, 90, 70, 95, 80, 110, 90, 120];
  const impressionsPoints = [120, 140, 110, 180, 160, 240, 210, 280, 250, 310, 290, 340];
  const activePoints = activeMetricTab === 'engagement' ? engagementPoints : impressionsPoints;
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Generating SVG path coordinates
  const svgWidth = 600;
  const svgHeight = 200;
  const maxVal = Math.max(...activePoints) * 1.1;

  const pointsCoords = activePoints.map((val, idx) => {
    const x = (idx / (activePoints.length - 1)) * svgWidth;
    const y = svgHeight - (val / maxVal) * svgHeight;
    return { x, y, val };
  });

  const linePath = pointsCoords.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaPath = `${linePath} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  // Matrix Heatmap Simulation (Contribution style)
  const heatmapRows = 7;
  const heatmapCols = 24;
  const heatmapData = Array.from({ length: heatmapRows * heatmapCols }, () => Math.floor(Math.random() * 4));

  const handleBarHover = (idx: number | null) => {
    if (idx !== null) {
      inkPressAudio.playClack();
    }
    setHoveredDataIndex(idx);
  };

  return (
    <div className="flex-1 flex flex-col gap-8">
      {/* Overview stats layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, idx) => (
          <div
            key={idx}
            className="glass-card hover:border-zinc-800 p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                {st.label}
              </span>
              <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                {st.icon}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="font-sans font-extrabold text-2xl text-zinc-100 tracking-tight leading-none">
                {st.val}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`font-mono text-[10px] font-bold ${st.diff.startsWith('+') ? 'text-cyber-green' : 'text-cyber-pink'}`}>
                  {st.diff}
                </span>
                <span className="font-sans text-[10px] text-zinc-600">
                  {st.desc}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Interactive SVG Chart Area */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800/80 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div className="flex flex-col">
            <h3 className="font-sans font-extrabold text-sm text-zinc-100 tracking-tight flex items-center gap-2">
              <BarChart size={15} className="text-cyber-purple" />
              Impression Analytics
            </h3>
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
              Historical reach mapping in real-time
            </span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 p-1 border border-zinc-900 rounded-xl w-fit">
            <button
              onClick={() => {
                inkPressAudio.playClack();
                setActiveMetricTab('engagement');
              }}
              className={`px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-widest transition-all rounded-lg cursor-pointer ${
                activeMetricTab === 'engagement'
                  ? 'bg-zinc-900 text-cyber-blue border border-zinc-800'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              Engagement Index
            </button>
            <button
              onClick={() => {
                inkPressAudio.playClack();
                setActiveMetricTab('impressions');
              }}
              className={`px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-widest transition-all rounded-lg cursor-pointer ${
                activeMetricTab === 'impressions'
                  ? 'bg-zinc-900 text-cyber-purple border border-zinc-800'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              Impressions count
            </button>
          </div>
        </div>

        {/* Custom SVG Interactive Chart */}
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={activeMetricTab === 'engagement' ? '#06b6d4' : '#a855f7'} stopOpacity="0.18" />
                <stop offset="100%" stopColor={activeMetricTab === 'engagement' ? '#06b6d4' : '#a855f7'} stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1={svgHeight * 0.25} x2={svgWidth} y2={svgHeight * 0.25} stroke="rgba(255,255,255,0.02)" strokeDasharray="4" />
            <line x1="0" y1={svgHeight * 0.5} x2={svgWidth} y2={svgHeight * 0.5} stroke="rgba(255,255,255,0.02)" strokeDasharray="4" />
            <line x1="0" y1={svgHeight * 0.75} x2={svgWidth} y2={svgHeight * 0.75} stroke="rgba(255,255,255,0.02)" strokeDasharray="4" />

            {/* Filled Area */}
            <motion.path
              initial={{ d: areaPath }}
              animate={{ d: areaPath }}
              transition={{ duration: 0.5 }}
              fill="url(#chartGradient)"
            />

            {/* Line Path */}
            <motion.path
              initial={{ d: linePath }}
              animate={{ d: linePath }}
              transition={{ duration: 0.5 }}
              fill="none"
              stroke={activeMetricTab === 'engagement' ? '#06b6d4' : '#a855f7'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Dots and interactive zones */}
            {pointsCoords.map((pt, idx) => (
              <g key={idx}>
                {/* Visual Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredDataIndex === idx ? "5" : "3.5"}
                  fill="#030303"
                  stroke={activeMetricTab === 'engagement' ? '#06b6d4' : '#a855f7'}
                  strokeWidth="2"
                  className="transition-all duration-150 pointer-events-none"
                />

                {/* Interactive Overlay bar */}
                <rect
                  x={pt.x - 20}
                  y="0"
                  width="40"
                  height={svgHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => handleBarHover(idx)}
                  onMouseLeave={() => handleBarHover(null)}
                />
              </g>
            ))}
          </svg>

          {/* Interactive Tooltip Card overlay */}
          <AnimatePresence>
            {hoveredDataIndex !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 left-6 bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex flex-col shadow-xl font-mono text-[10px]"
              >
                <span className="text-zinc-500 uppercase">MONTH: {labels[hoveredDataIndex]}</span>
                <span className="text-zinc-200 font-bold text-xs mt-1">
                  METRIC VALUE: <strong className={activeMetricTab === 'engagement' ? 'text-cyber-blue font-extrabold' : 'text-cyber-purple font-extrabold'}>
                    {activePoints[hoveredDataIndex]}
                  </strong>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Labels bar */}
        <div className="flex justify-between font-mono text-[9px] text-zinc-600 px-1 border-t border-zinc-900 pt-4">
          {labels.map((lbl, idx) => (
            <span key={idx} className={hoveredDataIndex === idx ? 'text-cyber-blue font-bold transition-all' : ''}>
              {lbl}
            </span>
          ))}
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800/80 flex flex-col gap-4">
        <div className="flex flex-col">
          <h4 className="font-sans font-extrabold text-xs tracking-tight text-zinc-100 uppercase">
            Hourly Node Activity Index
          </h4>
          <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
            Neural packet relay density mapped across current workspace cycles
          </p>
        </div>

        {/* Pixel contribution grid */}
        <div className="flex flex-col gap-2 overflow-x-auto pb-2">
          <div className="grid grid-flow-col gap-1 w-max">
            {Array.from({ length: heatmapCols }).map((_, col) => (
              <div key={col} className="grid grid-rows-7 gap-1">
                {Array.from({ length: heatmapRows }).map((_, row) => {
                  const val = heatmapData[col * heatmapRows + row];
                  const colorClass = [
                    'bg-zinc-900/30 border-transparent',
                    'bg-emerald-950/40 border-emerald-900/20',
                    'bg-emerald-800/50 border-emerald-700/20',
                    'bg-cyber-green/80 border-cyber-green/40'
                  ][val];

                  return (
                    <div
                      key={row}
                      className={`w-3.5 h-3.5 rounded-sm border ${colorClass} transition-all hover:scale-110 cursor-pointer`}
                      title={`Relay Density State: Level ${val}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-zinc-600 font-mono text-[8px] uppercase border-t border-zinc-900 pt-3">
          <span>Less Relays</span>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 bg-zinc-900/30 rounded-sm" />
            <div className="w-3 h-3 bg-emerald-950/40 rounded-sm" />
            <div className="w-3 h-3 bg-emerald-800/50 rounded-sm" />
            <div className="w-3 h-3 bg-cyber-green/80 rounded-sm" />
          </div>
          <span>More Relays</span>
        </div>
      </div>
    </div>
  );
}
