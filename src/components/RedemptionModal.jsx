import React, { useState } from 'react';
import { supabase } from '../supabase';
import { AlertCircle, X } from 'lucide-react';
import { pts } from '../format.js';

export default function RedemptionModal({ reward, userPoints = 0, isOpen, onClose, onSuccess }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !reward) return null;

  const cost = Number(reward.cost_points || reward.points_required || 0);
  const projected = userPoints - cost;

  async function handleConfirm() {
    setBusy(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Session expired. Please log in again.');
      setBusy(false);
      return;
    }

    const idempotencyKey = `RED-${reward.id}-${Date.now()}`;
    const { data, error: rpcErr } = await supabase.rpc('fn_redeem_reward_atomic', {
      p_user_id: user.id,
      p_reward_id: reward.id,
      p_quantity: 1,
      p_idempotency_key: idempotencyKey,
    });

    if (rpcErr) {
      const { error: redErr } = await supabase.from('redemptions').insert({
        user_id: user.id,
        reward_id: reward.id,
        points_spent: cost,
        status: 'pending',
        reference_code: idempotencyKey,
      });

      if (redErr) {
        setError(redErr.message || 'Redemption failed.');
        setBusy(false);
        return;
      }
    }

    setBusy(false);
    if (onSuccess) onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 text-sm text-slate-800 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1 transition">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">Confirm Redemption</h3>
        <p className="text-slate-500 mb-6 text-xs">Review details before deducting points from your balance.</p>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 mb-6 shadow-inner">
          {reward.image_url ? (
            <img src={reward.image_url} alt={reward.name} className="w-12 h-12 object-cover rounded-xl shadow-sm flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 flex-shrink-0">
              <span className="text-xl">🎁</span>
            </div>
          )}
          <div>
            <h4 className="font-bold text-slate-800 text-sm leading-tight">{reward.name}</h4>
            <p className="text-amber-500 font-extrabold text-xs mt-1">{pts(cost)}</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-b border-slate-100 py-4 mb-6 text-xs font-medium">
          <div className="flex justify-between text-slate-500">
            <span>Current Balance</span>
            <span className="text-slate-800 font-bold">{pts(userPoints)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Points Cost</span>
            <span className="text-amber-500 font-bold">-{pts(cost)}</span>
          </div>
          <div className="flex justify-between text-slate-800 font-bold pt-2 border-t border-slate-100">
            <span>Projected Balance</span>
            <span className={projected < 0 ? 'text-red-500' : 'text-emerald-500'}>
              {pts(projected)}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={busy}
            className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy || projected < 0}
            className="flex-1 py-3 font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:bg-amber-200 rounded-2xl transition shadow-sm text-sm"
          >
            {busy ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
