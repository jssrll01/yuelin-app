import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Award, CheckCircle2, Target, Zap } from 'lucide-react';
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
    <div className="space-y-6 pb-12">
      <PageTitle title="Mission Center" subtitle="Complete ecosystem tasks to earn bonus loyalty points." />

      <div className="flex gap-2 border-b border-neutral-800 pb-3 overflow-x-auto text-xs">
        {['daily', 'weekly', 'special', 'seasonal'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl capitalize font-medium transition ${
              category === cat
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-lg shadow-amber-400/10'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <p className="text-neutral-500 py-12 text-center text-xs">No active {category} missions right now.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => {
            const target = m.target_count || 1;
            const progress = m.progress || 0;
            const percent = Math.min(100, Math.round((progress / target) * 100));

            return (
              <div key={m.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs">
                <div className="flex-grow space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-100 text-sm">{m.title}</span>
                    <span className="bg-amber-500/10 text-amber-400 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-amber-500/20">
                      +{pts(m.reward_points || 50)}
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs">{m.description}</p>

                  <div className="max-w-sm pt-1">
                    <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
                      <span>Progress</span>
                      <span>{progress} / {target}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                      <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>

                <div>
                  {m.is_completed ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3 py-1.5 rounded-xl font-medium text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : (
                    <span className="text-neutral-500 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs">
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
