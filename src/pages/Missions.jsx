import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { CheckCircle2 } from 'lucide-react';
import { PageTitle, Spinner } from '../components/Ui.jsx';
import { pts } from '../format.js';

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [category, setCategory] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMissions() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { data: mData } = await supabase
        .from('missions')
        .select('*')
        .eq('is_active', true);

      if (user && mData) {
        const { data: pData } = await supabase
          .from('user_mission_progress')
          .select('*')
          .eq('user_id', user.id);

        const merged = mData.map((m) => {
          const prog = pData?.find((p) => p.mission_id === m.id);
          return {
            ...m,
            progress: prog ? prog.current_count : 0,
            is_completed: prog ? prog.is_completed : false,
          };
        });
        setMissions(merged);
      } else if (mData) {
        setMissions(mData);
      }
      setLoading(false);
    }
    loadMissions();
  }, []);

  const filtered = missions.filter((m) => m.category === category);

  return (
    <div className="space-y-6 pb-12 text-slate-800 bg-slate-50/30 min-h-screen">
      <div className="px-4 pt-4">
         <h1 className="text-2xl font-extrabold tracking-tight">Mission Center</h1>
         <p className="text-slate-500 text-sm mt-1">Complete tasks to earn bonus points.</p>
      </div>

      <div className="flex gap-2 px-4 overflow-x-auto pb-2 scrollbar-hide">
        {['daily', 'weekly', 'special', 'seasonal'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-5 py-2 rounded-full capitalize font-bold text-sm whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-slate-800 text-white shadow-md'
                : 'bg-white text-slate-500 border border-slate-200 shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="pt-10"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <p className="text-slate-400 py-12 text-center text-sm font-medium">No active {category} missions right now.</p>
      ) : (
        <div className="space-y-4 px-4">
          {filtered.map((m) => {
            const target = m.target_count || 1;
            const progress = m.progress || 0;
            const percent = Math.min(100, Math.round((progress / target) * 100));

            return (
              <div key={m.id} className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{m.title}</h3>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{m.description}</p>
                  </div>
                  <span className="bg-amber-50 text-amber-600 font-extrabold px-3 py-1.5 rounded-xl text-xs whitespace-nowrap border border-amber-100">
                    +{pts(m.reward_points || 50)}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
                    <span>Progress</span>
                    <span className={m.is_completed ? 'text-emerald-500' : 'text-slate-600'}>
                      {progress} / {target}
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${m.is_completed ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  {m.is_completed ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-2xl font-bold text-xs border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </span>
                  ) : (
                    <span className="text-slate-500 font-bold px-4 py-2 rounded-2xl text-xs bg-slate-50 border border-slate-100">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
