'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { BarChart3, Activity, TrendingUp, Trophy, Users, Swords } from 'lucide-react'

interface Props {
  runDistribution: Record<string, number>
  matchStatusCounts: Record<string, number>
  totalBalls: number
  globalStats: { tournaments: number; matches: number; players: number }
}

const STATUS_COLORS: Record<string, string> = {
  live: '#ef4444', scheduled: '#3b82f6', completed: '#22c55e',
  innings_break: '#f59e0b', toss: '#a855f7',
}

const RUN_COLORS: Record<string, string> = {
  '0': '#374151', '1': '#4b5563', '2': '#6b7280', '3': '#9ca3af',
  '4': '#22c55e', '6': '#16a34a', 'W': '#ef4444', 'Extras': '#f59e0b',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-arena-card border border-arena-border rounded-lg px-3 py-2 text-sm">
        <span className="text-gray-400">{label}: </span>
        <span className="text-white font-bold">{payload[0].value}</span>
      </div>
    )
  }
  return null
}

export default function AnalyticsDashboard({ runDistribution, matchStatusCounts, totalBalls, globalStats }: Props) {
  const runData = Object.entries(runDistribution).map(([name, value]) => ({ name, value }))
  const statusData = Object.entries(matchStatusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
    value,
    color: STATUS_COLORS[name] || '#6b7280',
  }))

  const totalRuns = runData
    .filter(d => !['W','Extras'].includes(d.name))
    .reduce((s, d) => s + (d.value * (parseInt(d.name) || 0)), 0)

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-display text-white tracking-wide">
          SYSTEM <span className="gradient-text">ANALYTICS</span>
        </h1>
        <p className="text-gray-500 mt-1">Real-time statistics across all matches</p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tournaments', value: globalStats.tournaments, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Total Matches', value: globalStats.matches, icon: Swords, color: 'text-pitch-400', bg: 'bg-pitch-500/10' },
          { label: 'Players', value: globalStats.players, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Balls Recorded', value: totalBalls.toLocaleString(), icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div className="text-3xl font-display text-white">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Run Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-pitch-400" /> Run Distribution
          </h3>
          {totalBalls > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={runData} barSize={32}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {runData.map((entry, i) => <Cell key={i} fill={RUN_COLORS[entry.name] || '#6b7280'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-600 text-sm">No delivery data yet</div>
          )}
        </motion.div>

        {/* Match Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={16} className="text-amber-400" /> Match Status Breakdown
          </h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '12px' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-600 text-sm">No matches yet</div>
          )}
        </motion.div>
      </div>

      {/* Scoring rates */}
      {totalBalls > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Scoring Rates <span className="text-gray-500 font-normal text-sm">(last {totalBalls.toLocaleString()} deliveries)</span></h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Dot ball %', value: ((runDistribution['0'] || 0) / totalBalls * 100).toFixed(1) + '%', color: 'text-gray-400' },
              { label: 'Boundary %', value: (((runDistribution['4'] || 0) + (runDistribution['6'] || 0)) / totalBalls * 100).toFixed(1) + '%', color: 'text-pitch-400' },
              { label: 'Wicket %',   value: ((runDistribution['W'] || 0) / totalBalls * 100).toFixed(1) + '%', color: 'text-crimson-400' },
              { label: 'Extras %',  value: ((runDistribution['Extras'] || 0) / totalBalls * 100).toFixed(1) + '%', color: 'text-amber-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-arena-dark rounded-xl p-4 text-center">
                <div className={`text-2xl font-display ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
