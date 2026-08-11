import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  RotateCcw, 
  Settings, 
  Activity, 
  Users, 
  Zap, 
  TrendingUp, 
  Info,
  ChevronRight,
  Terminal,
  Store,
  Cpu,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { SmartStoreEnv, QLearningAgent } from './lib/rl-engine';
import { ACTIONS, Action, StoreState } from './types';
import { cn } from './lib/utils'; // I'll create this helper if needed, or just use template strings

// Types and helper constants
type AppStep = 'welcome' | 'training' | 'simulation';

export default function App() {
  const [step, setStep] = useState<AppStep>('welcome');
  const [agent, setAgent] = useState<QLearningAgent | null>(null);
  const [episodes, setEpisodes] = useState<number>(0);
  const [totalEpisodes] = useState(300);
  const [trainingRewards, setTrainingRewards] = useState<number[]>([]);

  // Simulation State
  const [env] = useState(() => new SmartStoreEnv());
  const [currentState, setCurrentState] = useState<StoreState>(env.getState());
  const [totalReward, setTotalReward] = useState(0);
  const [stepReward, setStepReward] = useState(0);
  const [simulationHistory, setSimulationHistory] = useState<{ step: number; reward: number; wait: number }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastAction, setLastAction] = useState<Action | null>(null);
  const [speed, setSpeed] = useState(400);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Handlers ---

  const startTraining = () => {
    setStep('training');
    const newAgent = new QLearningAgent();
    let currentEp = 0;
    const rewards: number[] = [];

    const trainInterval = setInterval(() => {
      if (currentEp >= totalEpisodes) {
        clearInterval(trainInterval);
        newAgent.epsilon = 0.05; // Set to very low for simulation
        setAgent(newAgent);
        setStep('simulation');
        return;
      }

      // Fast training loop for 5 episodes per tick
      for (let i = 0; i < 5; i++) {
        if (currentEp >= totalEpisodes) break;
        
        let state = env.reset();
        let epReward = 0;
        let done = false;

        while (!done) {
          const action = newAgent.chooseAction(state);
          const { state: nextState, reward, done: isDone } = env.step(action);
          newAgent.update(state, action, reward, nextState);
          state = nextState;
          epReward += reward;
          done = isDone;
        }
        rewards.push(epReward);
        currentEp++;
      }

      setEpisodes(currentEp);
      setTrainingRewards([...rewards]);
    }, 50);
  };

  const handleStep = () => {
    if (!agent) return;
    const action = agent.chooseAction(currentState, true);
    setLastAction(action);
    const { state: nextState, reward, done } = env.step(action);
    
    setStepReward(reward);
    setTotalReward(prev => prev + reward);
    setCurrentState(nextState);
    
    setSimulationHistory(prev => [
      ...prev, 
      { step: nextState.timeStep, reward: reward, wait: nextState.queues.reduce((a,b) => a+b, 0) }
    ].slice(-50));

    if (done) {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    env.reset();
    setCurrentState(env.getState());
    setTotalReward(0);
    setStepReward(0);
    setLastAction(null);
    setSimulationHistory([]);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(handleStep, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, speed, currentState, agent]);

  // --- Renderers ---

  if (step === 'welcome') {
    return <WelcomeView onStart={startTraining} />;
  }

  if (step === 'training') {
    return (
      <TrainingView 
        episodes={episodes} 
        totalEpisodes={totalEpisodes} 
        rewards={trainingRewards} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#06060f] text-slate-200 font-sans selection:bg-pink-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#06060f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">SmartStore <span className="text-neon-pink">AI</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Q-Learning Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 px-4 py-1.5 rounded-full bg-slate-900/50 border border-white/5 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse" />
                <span className="text-slate-400">ε:</span>
                <span className="text-neon-purple">{agent?.epsilon.toFixed(3)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
                <span className="text-slate-400">MODEL:</span>
                <span className="text-neon-blue">Q-V1.0</span>
              </div>
            </div>
            <button 
              onClick={() => setStep('welcome')}
              className="px-4 py-2 text-xs font-medium rounded-lg hover:bg-white/5 transition-colors border border-white/10"
            >
              Restart
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Stats & Controls */}
        <div className="lg:col-span-3 space-y-6">
          <section className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-sm space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Zap className="w-3 h-3 text-neon-pink" /> 
              Metrics & Control
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Cashiers" value={currentState.openCashiers} color="border-neon-green" />
              <StatCard label="Queue" value={currentState.queues.reduce((a, b) => a + b, 0)} color="border-yellow-400" />
              <StatCard label="Reward" value={stepReward.toFixed(1)} color="border-neon-pink" highlight={stepReward > 0} />
              <StatCard label="Total" value={totalReward.toFixed(0)} color="border-neon-purple" />
            </div>

            <div className="pt-4 space-y-3 border-t border-white/5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Simulation Speed</label>
                <input 
                  type="range" 
                  min="50" 
                  max="1000" 
                  step="50"
                  value={1050 - speed} 
                  onChange={(e) => setSpeed(1050 - parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-pink"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setIsRunning(!isRunning)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl",
                    isRunning 
                      ? "bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30" 
                      : "bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30"
                  )}
                >
                  {isRunning ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isRunning ? 'Stop' : 'Auto Run'}
                </button>
                <button 
                  onClick={handleStep}
                  disabled={isRunning}
                  className="px-4 py-3 rounded-xl bg-neon-blue/20 text-neon-blue border border-neon-blue/30 hover:bg-neon-blue/30 disabled:opacity-50 font-bold transition-all active:scale-95"
                >
                  Step
                </button>
              </div>

              <button 
                onClick={resetSimulation}
                className="w-full py-2 hover:bg-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-lg"
              >
                Reset Simulation
              </button>
            </div>
          </section>

          <section className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-sm space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Agent Action</h2>
            <div className={cn(
              "p-4 rounded-xl border transition-all duration-500",
              lastAction !== null ? `bg-opacity-10 shadow-lg` : 'bg-slate-800/20 border-white/5'
            )}
            style={{ 
              borderColor: lastAction !== null ? ACTIONS[lastAction].color + '40' : undefined,
              backgroundColor: lastAction !== null ? ACTIONS[lastAction].color + '10' : undefined
            }}
            >
              {lastAction !== null ? (
                <div className="space-y-1">
                  <p className="text-xs font-mono font-bold uppercase" style={{ color: ACTIONS[lastAction].color }}>
                    {ACTIONS[lastAction].name}
                  </p>
                  <p className="text-[11px] text-slate-400">{ACTIONS[lastAction].description}</p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">Waiting for simulation...</p>
              )}
            </div>
          </section>
        </div>

        {/* Center: Store Visualization */}
        <div className="lg:col-span-6 space-y-6">
          <section className="relative overflow-hidden p-6 rounded-3xl bg-slate-900/40 border border-white/5 backdrop-blur-md min-h-[500px] flex flex-col justify-end">
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Store Front</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                   <span className="text-[10px] font-mono text-neon-green uppercase tracking-tighter">Live Monitor</span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-slate-400">
                Step: {currentState.timeStep} / 100
              </div>
            </div>

            {/* Grid Decoration */}
            <div className="absolute inset-0 z-[-1] opacity-20" style={{ 
              backgroundImage: 'radial-gradient(circle, #ff2d78 1px, transparent 1px)', 
              backgroundSize: '32px 32px' 
            }} />

            <div className="grid grid-cols-5 gap-4 relative">
              {currentState.queues.map((q, idx) => {
                const isOpen = idx < currentState.openCashiers;
                const statusColor = q < 5 ? '#34d399' : q < 10 ? '#fbbf24' : '#ef4444';
                return (
                  <div key={idx} className="flex flex-col items-center gap-4">
                    {/* Queue */}
                    <div className="flex flex-col-reverse gap-1.5 h-64 w-full px-2 overflow-hidden items-center group">
                      <AnimatePresence>
                        {Array.from({ length: q }).map((_, i) => (
                          <motion.div 
                            key={i}
                            initial={{ scale: 0, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="w-10 h-10 rounded-full border-2 border-yellow-400/50 bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-yellow-400/5"
                          >
                            <Users className="w-5 h-5 text-yellow-500" />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {/* Overflow badge */}
                      {q > 6 && (
                        <div className="text-[9px] font-bold text-slate-500 mb-2">+ {q - 6} more</div>
                      )}
                    </div>
                    
                    {/* Cashier Station */}
                    <div className={cn(
                      "w-full p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2",
                      isOpen 
                        ? "bg-slate-800/40 border-white/10 shadow-xl" 
                        : "bg-black/40 border-slate-900 grayscale opacity-40"
                    )}>
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center">
                        <MonitorIcon className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Desk {idx + 1}</p>
                        <p className="text-[9px] font-mono mt-0.5" style={{ color: isOpen ? statusColor : '#475569' }}>
                          {isOpen ? `WAIT: ${q}` : 'CLOSED'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Progress bar */}
            <div className="mt-8 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-neon-pink shadow-[0_0_10px_#ff2d78]"
                 animate={{ width: `${currentState.timeStep}%` }}
               />
            </div>
          </section>
        </div>

        {/* Right Side: Evaluation & History */}
        <div className="lg:col-span-3 space-y-6">
          <section className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-sm space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <BarChart3 className="w-3 h-3 text-neon-blue" />
              Evaluation History
            </h2>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationHistory}>
                  <defs>
                    <linearGradient id="colorReward" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '10px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="reward" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReward)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-2">
              <span>Performance</span>
              <span className="text-neon-blue">Live Update</span>
            </div>
          </section>

          <section className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-sm space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-neon-purple" />
              Queue Wait Time
            </h2>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationHistory}>
                  <defs>
                    <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff2d78" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff2d78" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="wait" stroke="#ff2d78" fillOpacity={1} fill="url(#colorWait)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-sm space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Logs</h2>
            <div className="max-h-40 overflow-y-auto font-mono text-[9px] space-y-1.5 custom-scrollbar bg-black/20 p-3 rounded-lg border border-white/5">
              {simulationHistory.slice().reverse().map((h, i) => (
                <div key={i} className="flex items-center gap-2 border-b border-white/5 pb-1 last:border-0 opacity-70">
                  <span className="text-slate-600">[{h.step.toString().padStart(3, '0')}]</span>
                  <span className={h.reward > 0 ? 'text-neon-green' : 'text-slate-400'}>RW: {h.reward.toFixed(1)}</span>
                  <span className="text-slate-500 ml-auto">W: {h.wait}</span>
                </div>
              ))}
              {simulationHistory.length === 0 && <p className="text-slate-600 italic">No logs yet...</p>}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// Sub-components

function StatCard({ label, value, color, highlight }: { label: string; value: string | number; color: string; highlight?: boolean }) {
  return (
    <div className={cn("p-3 bg-slate-800/20 border-l-2 rounded-r-xl transition-all", color)}>
      <p className="text-[9px] font-bold uppercase tracking-tight text-slate-500">{label}</p>
      <p className={cn("text-lg font-mono font-bold mt-1", highlight ? 'text-neon-green' : 'text-white')}>{value}</p>
    </div>
  );
}

function WelcomeView({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-[#06060f] flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full text-center space-y-12 relative z-10"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900 border border-white/10 text-xs font-mono tracking-widest text-[#ff2d78] mb-6 shadow-2xl"
          >
            <Cpu className="w-4 h-4 animate-spin-slow" /> STO-RL ENGINE V1.0
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-tight"
          >
            SMART <br /> <span className="bg-gradient-to-r from-[#ff2d78] via-[#a855f7] to-[#3b82f6] bg-clip-text text-transparent underline-offset-8">COMMERCE</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-slate-400 font-medium max-w-lg mx-auto leading-relaxed"
          >
            Optimizing retail operations using self-learning Reinforcement Learning agents. 
            Reduce wait times by 40% through intelligent cashier allocation.
          </motion.p>
        </div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(255, 45, 120, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="group relative px-12 py-5 bg-[#ff2d78] text-white rounded-2xl font-black text-xl tracking-tight transition-all"
        >
          Initialize AI Core
          <div className="absolute inset-0 rounded-2xl bg-white/20 scale-0 group-hover:scale-100 transition-transform origin-center" />
        </motion.button>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center gap-8 pt-8 border-t border-white/5 opacity-50"
        >
          <div className="text-center">
             <p className="text-2xl font-bold text-white">500+</p>
             <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Scenarios</p>
          </div>
          <div className="text-center">
             <p className="text-2xl font-bold text-white">99%</p>
             <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Efficiency</p>
          </div>
          <div className="text-center">
             <p className="text-2xl font-bold text-white">2k</p>
             <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Policies</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function TrainingView({ episodes, totalEpisodes, rewards }: { episodes: number; totalEpisodes: number; rewards: number[] }) {
  const progress = (episodes / totalEpisodes) * 100;
  
  return (
    <div className="min-h-screen bg-[#06060f] flex flex-col items-center justify-center p-6 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">Deep Training in Progress</h2>
        <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Episode Cluster: {Math.floor(episodes/5)} / {totalEpisodes/5}</p>
      </div>

      <div className="w-full max-w-xl space-y-8">
        <div className="h-64 w-full bg-slate-900/50 rounded-2xl border border-white/5 p-4 overflow-hidden relative">
           <div className="absolute inset-0 opacity-10">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={rewards.slice(-100).map((r, i) => ({ i, r }))}>
                    <Line type="monotone" dataKey="r" stroke="#ff2d78" dot={false} strokeWidth={3} isAnimationActive={false} />
                 </LineChart>
              </ResponsiveContainer>
           </div>
           
           <div className="relative z-10 h-full flex flex-col items-center justify-center">
              <span className="text-6xl font-black text-white tabular-nums">{Math.floor(progress)}%</span>
              <p className="text-xs font-mono text-neon-pink mt-2 animate-pulse uppercase tracking-[0.2em]">Synthesizing optimal policy...</p>
           </div>
        </div>

        <div className="space-y-3">
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-slate-600">
            <span>Neural Genesis</span>
            <span>Convergence: {Math.max(...rewards.slice(-50) || [0]).toFixed(0)}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-8 text-center max-w-xl w-full">
         <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5">
            <p className="text-xl font-bold text-white tabular-nums">{episodes}</p>
            <p className="text-[9px] font-mono text-slate-600 uppercase">Experiences</p>
         </div>
         <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5">
            <p className="text-xl font-bold text-white tabular-nums">{rewards.length > 0 ? (rewards.reduce((a,b)=>a+b,0)/rewards.length).toFixed(0) : 0}</p>
            <p className="text-[9px] font-mono text-slate-600 uppercase">Avg Reward</p>
         </div>
         <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5">
            <p className="text-xl font-bold text-white tabular-nums">1.0s</p>
            <p className="text-[9px] font-mono text-slate-600 uppercase">Training Time</p>
         </div>
      </div>
    </div>
  );
}

// Icons
function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
