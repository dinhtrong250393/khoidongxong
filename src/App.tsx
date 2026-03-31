import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Calculator, CheckCircle2, CircleDashed, Users, Sparkles, RotateCcw } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io();

type VoteType = 'math' | 'lit' | 'both' | 'neither';

const OPTIONS = [
  { id: 'math', label: 'Thích học Toán', icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', active: 'border-blue-500 ring-4 ring-blue-500/20' },
  { id: 'lit', label: 'Thích học Văn', icon: BookOpen, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', active: 'border-rose-500 ring-4 ring-rose-500/20' },
  { id: 'both', label: 'Thích cả 2 môn', icon: CheckCircle2, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', active: 'border-violet-500 ring-4 ring-violet-500/20' },
  { id: 'neither', label: 'Không thích cả 2', icon: CircleDashed, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', active: 'border-slate-500 ring-4 ring-slate-500/20' },
] as const;

const MAX_STUDENTS = 39;

export default function App() {
  const [counts, setCounts] = useState({ math: 0, lit: 0, both: 0, neither: 0 });
  const [selectedVote, setSelectedVote] = useState<VoteType | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    socket.on('stateUpdate', (newCounts) => {
      setCounts(newCounts);
    });

    return () => {
      socket.off('stateUpdate');
    };
  }, []);

  const totalVotes = counts.math + counts.lit + counts.both + counts.neither;
  const isFull = totalVotes >= MAX_STUDENTS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVote || isFull) return;

    socket.emit('vote', selectedVote);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
      setSelectedVote(null);
    }, 1500);
  };

  const resetSurvey = () => {
    if (window.confirm('Bạn có chắc chắn muốn làm lại khảo sát từ đầu?')) {
      socket.emit('reset');
      setSelectedVote(null);
    }
  };

  const hasBoth = counts.both > 0;
  const noNeither = counts.neither === 0 && totalVotes > 0;
  
  // Venn Diagram calculations
  let r = 130;
  let mathCx = 220;
  let litCx = 380;
  let mathTextX = 160;
  let litTextX = 440;

  if (noNeither) {
    // Tràn ra tới hình chữ nhật luôn
    if (hasBoth) {
      r = 190; // Chạm mép trên/dưới (chiều cao 380 -> r = 190)
      mathCx = 200; // Chạm mép trái (10 + 190)
      litCx = 400; // Chạm mép phải (590 - 190)
      mathTextX = 110; // Giữa phần không giao nhau
      litTextX = 490;
    } else {
      r = 140; // Tràn ra 2 bên mép trái/phải
      mathCx = 150; // 10 + 140
      litCx = 450; // 590 - 140
      mathTextX = 150;
      litTextX = 450;
    }
  } else {
    // Kích thước bình thường để chừa chỗ cho phần "Không thích cả 2"
    if (hasBoth) {
      r = 130;
      mathCx = 220;
      litCx = 380;
      mathTextX = 160;
      litTextX = 440;
    } else {
      r = 120;
      mathCx = 150;
      litCx = 450;
      mathTextX = 150;
      litTextX = 450;
    }
  }
  const cy = 200;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-50 via-white to-cyan-50 text-slate-900 font-sans selection:bg-indigo-100">
      <header className="bg-white/60 backdrop-blur-md border-b border-white/40 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                Khảo sát Sở thích
              </h1>
              <p className="text-xs font-medium text-slate-500">Toán học & Văn học</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full shadow-sm">
            <Users className="w-4 h-4" />
            <span>Lớp 11A4: {totalVotes}/{MAX_STUDENTS}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Voting Form */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-2xl shadow-slate-200/50 relative overflow-hidden">
              {/* Decorative blob */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
              
              <div className="relative z-10 mb-8">
                <h2 className="text-2xl font-bold mb-2 text-slate-800">Bạn thích môn nào?</h2>
                <p className="text-slate-500 mb-6">
                  Hãy chọn sở thích của bạn để xem biểu đồ thay đổi trực tiếp nhé!
                </p>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-slate-600">Tiến độ khảo sát</span>
                    <span className={isFull ? "text-emerald-600 font-bold" : "text-indigo-600"}>
                      {totalVotes} / {MAX_STUDENTS}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${isFull ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(totalVotes / MAX_STUDENTS) * 100}%` }}
                      transition={{ type: "spring", stiffness: 50, damping: 15 }}
                    />
                  </div>
                </div>
              </div>

              {isFull ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative z-10 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-800 mb-2">Đã hoàn thành!</h3>
                  <p className="text-emerald-600 mb-6">
                    Khảo sát đã thu thập đủ ý kiến của 39 học sinh lớp 11A4.
                  </p>
                  <button 
                    type="button"
                    onClick={resetSurvey}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-emerald-700 font-semibold rounded-xl shadow-sm hover:bg-emerald-100 transition-colors border border-emerald-200"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Làm lại khảo sát
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const isSelected = selectedVote === option.id;
                      return (
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          key={option.id}
                          type="button"
                          onClick={() => !isSuccess && setSelectedVote(option.id)}
                          disabled={isSuccess}
                          className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                            isSelected
                              ? `bg-white ${option.active}`
                              : `bg-white/50 border-slate-100 hover:border-slate-300 hover:bg-white hover:shadow-md`
                          } ${isSuccess ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className={`p-3 rounded-full mb-3 ${isSelected ? option.bg : 'bg-slate-50'} transition-colors duration-300`}>
                            <Icon className={`w-7 h-7 ${isSelected ? option.color : 'text-slate-400'}`} />
                          </div>
                          <span className={`font-semibold text-sm ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                            {option.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="relative h-14">
                    <AnimatePresence mode="wait">
                      {!isSuccess ? (
                        <motion.button
                          key="submit"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          type="submit"
                          disabled={!selectedVote}
                          className="absolute inset-0 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-indigo-500/30 flex items-center justify-center text-lg"
                        >
                          Gửi bình chọn
                        </motion.button>
                      ) : (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute inset-0 w-full bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 text-lg"
                        >
                          <CheckCircle2 className="w-6 h-6" />
                          <span>Thành công!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Venn Diagram */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-2xl shadow-slate-200/50 h-full flex flex-col">
              <div className="mb-8 text-center relative">
                <h2 className="text-2xl font-bold mb-2 text-slate-800">Biểu đồ Tập hợp (Venn)</h2>
                <p className="text-slate-500">
                  Mô phỏng trực quan tập hợp học sinh dựa trên sở thích
                </p>
                {isFull && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200"
                  >
                    Đã thu thập đủ 39/39
                  </motion.div>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <div className="relative w-full max-w-[600px] aspect-[3/2]">
                  <svg viewBox="0 0 600 400" className="w-full h-full drop-shadow-sm">
                    <defs>
                      <linearGradient id="mathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.4" />
                      </linearGradient>
                      <linearGradient id="litGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#fb7185" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>

                    {/* Universal Set Rectangle */}
                    <rect 
                      x="10" y="10" width="580" height="380" rx="24" 
                      fill="#f8fafc" 
                      stroke="#cbd5e1" 
                      strokeWidth="3" 
                      strokeDasharray="12 12" 
                    />
                    
                    {/* Universal Set Label */}
                    <text x="30" y="45" className="text-sm font-bold fill-slate-400 uppercase tracking-widest">
                      Tập hợp học sinh lớp 11A4
                    </text>

                    {/* Neither Label inside Universal Set but outside circles */}
                    <motion.g
                      initial={false}
                      animate={{ opacity: counts.neither > 0 ? 1 : 0.4 }}
                    >
                      <rect x="30" y="330" width="180" height="40" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                      <text x="120" y="355" textAnchor="middle" className="text-sm font-bold fill-slate-600">
                        Không thích cả 2: {counts.neither}
                      </text>
                    </motion.g>

                    {/* Math Circle */}
                    <motion.circle
                      animate={{ cx: mathCx, r: r }}
                      cy={cy}
                      fill="url(#mathGrad)"
                      stroke="#2563eb"
                      strokeWidth="2"
                      style={{ mixBlendMode: 'multiply' }}
                      transition={{ type: "spring", stiffness: 50, damping: 12 }}
                    />

                    {/* Lit Circle */}
                    <motion.circle
                      animate={{ cx: litCx, r: r }}
                      cy={cy}
                      fill="url(#litGrad)"
                      stroke="#e11d48"
                      strokeWidth="2"
                      style={{ mixBlendMode: 'multiply' }}
                      transition={{ type: "spring", stiffness: 50, damping: 12 }}
                    />

                    {/* Math Label */}
                    <motion.text
                      animate={{ x: mathTextX }}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-5xl font-black fill-white drop-shadow-md"
                      transition={{ type: "spring", stiffness: 50, damping: 12 }}
                    >
                      {counts.math}
                    </motion.text>
                    <motion.text
                      animate={{ x: mathTextX }}
                      y={cy - 50}
                      textAnchor="middle"
                      className="text-base font-bold fill-blue-900 uppercase tracking-widest drop-shadow-sm"
                      transition={{ type: "spring", stiffness: 50, damping: 12 }}
                    >
                      Toán
                    </motion.text>

                    {/* Lit Label */}
                    <motion.text
                      animate={{ x: litTextX }}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-5xl font-black fill-white drop-shadow-md"
                      transition={{ type: "spring", stiffness: 50, damping: 12 }}
                    >
                      {counts.lit}
                    </motion.text>
                    <motion.text
                      animate={{ x: litTextX }}
                      y={cy - 50}
                      textAnchor="middle"
                      className="text-base font-bold fill-rose-900 uppercase tracking-widest drop-shadow-sm"
                      transition={{ type: "spring", stiffness: 50, damping: 12 }}
                    >
                      Văn
                    </motion.text>

                    {/* Both Label */}
                    <AnimatePresence>
                      {hasBoth && (
                        <motion.g
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ type: "spring", stiffness: 50, damping: 12 }}
                        >
                          <text
                            x="300"
                            y={cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-4xl font-black fill-white drop-shadow-md"
                          >
                            {counts.both}
                          </text>
                          <text
                            x="300"
                            y={cy - 40}
                            textAnchor="middle"
                            className="text-sm font-bold fill-violet-950 uppercase tracking-widest drop-shadow-sm"
                          >
                            Cả 2
                          </text>
                        </motion.g>
                      )}
                    </AnimatePresence>
                  </svg>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium bg-slate-50/50 py-4 px-6 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
                  <span className="text-slate-700">Chỉ thích Toán</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-rose-500 shadow-sm shadow-rose-200"></div>
                  <span className="text-slate-700">Chỉ thích Văn</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-violet-500 shadow-sm shadow-violet-200"></div>
                  <span className="text-slate-700">Thích cả 2</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-md border-2 border-slate-300 border-dashed bg-slate-100"></div>
                  <span className="text-slate-700">Không thích cả 2</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
