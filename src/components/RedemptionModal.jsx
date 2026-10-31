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
      setError('Authentication expired. Please log in again.');
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 text-xs text-neutral-100 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-serif text-amber-100 mb-1">Confirm Redemption</h3>
        <p className="text-neutral-400 mb-4 text-[11px]">Review details before deducting points from your account balance.</p>

        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center gap-3 mb-4">
          {reward.image_url && (
            <img src={reward.image_url} alt={reward.name} className="w-14 h-14 object-cover rounded-lg bg-neutral-900 flex-shrink-0" />
          )}
          <div>
            <h4 className="font-semibold text-neutral-200 text-xs">{reward.name}</h4>
            <p className="text-amber-400 font-bold text-xs mt-0.5">{pts(cost)}</p>
          </div>
        </div>

        <div className="space-y-2 border-t border-b border-neutral-800/80 py-3 mb-4 text-[11px]">
          <div className="flex justify-between text-neutral-400">
            <span>Current Balance:</span>
            <span className="text-neutral-200 font-mono">{pts(userPoints)}</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Points Cost:</span>
            <span className="text-amber-400 font-mono font-semibold">-{pts(cost)}</span>
          </div>
          <div className="flex justify-between text-neutral-200 font-medium pt-1 border-t border-neutral-800/60">
            <span>Projected Balance:</span>
            <span className={`font-mono ${projected < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {pts(projected)}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-200 rounded-lg text-[11px] mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="flex-1 py-2.5 font-medium text-neutral-400 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy || projected < 0}
            className="flex-1 py-2.5 font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-xl transition text-xs"
          >
            {busy ? 'Processing...' : 'Confirm Redemption'}
          </button>
        </div>
      </div>
    </div>
  );
}
