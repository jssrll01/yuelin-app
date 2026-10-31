import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flame, Gem, Gift, LayoutGrid, PackageOpen, Star, Target, Filter, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth.jsx';
import { peso, pts, uid, when } from '../format.js';
import { Empty, Msg, PageTitle, Spinner } from '../components/Ui.jsx';
import { catIcon, groupRewards, nextGoal, soldOut } from '../lib/rewardsCat.js';
import RedemptionModal from '../components/RedemptionModal.jsx';

export default function Exchange() {
  const { profile, refresh } = useAuth();
  const [sp, setSp] = useSearchParams();
  const [rewards, setRewards] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [mine, setMine] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [minCost, setMinCost] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [affordability, setAffordability] = useState('all'); // 'all', 'affordable', 'unaffordable'

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const [a, b, w] = await Promise.all([
      supabase.from('rewards').select('*').eq('is_active', true).order('cost_points'),
      supabase.from('redemptions').select('*, rewards(name)').order('created_at', { ascending: false }).limit(20),
      user ? supabase.from('user_wishlists').select('reward_id').eq('user_id', user.id) : Promise.resolve({ data: [] }),
    ]);

    setRewards(a.data || []);
    setMine(b.data || []);
    if (w.data) setWishlist(w.data.map((item) => item.reward_id));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleWishlist = async (rewardId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (wishlist.includes(rewardId)) {
      await supabase.from('user_wishlists').delete().eq('user_id', user.id).eq('reward_id', rewardId);
      setWishlist(wishlist.filter((id) => id !== rewardId));
    } else {
      await supabase.from('user_wishlists').insert({ user_id: user.id, reward_id: rewardId });
      setWishlist([...wishlist, rewardId]);
    }
  };

  const bal = Number(profile?.points || 0);

  const filteredRewards = useMemo(() => {
    if (!rewards) return [];

    let list = rewards.filter((r) => {
      const cost = Number(r.cost_points || r.points_required || 0);
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (minCost && cost < Number(minCost)) return false;
      if (maxCost && cost > Number(maxCost)) return false;

      if (affordability === 'affordable' && cost > bal) return false;
      if (affordability === 'unaffordable' && cost <= bal) return false;

      return true;
    });

    list.sort((a, b) => {
      const costA = Number(a.cost_points || a.points_required || 0);
      const costB = Number(b.cost_points || b.points_required || 0);
      return sortOrder === 'asc' ? costA - costB : costB - costA;
    });

    return list;
  }, [rewards, search, minCost, maxCost, affordability, sortOrder, bal]);

  if (!rewards) return <Spinner />;

  const openRedeemModal = (r) => {
    setSelectedReward(r);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 text-xs">
      <PageTitle title="Exchange Rewards" subtitle="Redeem your YUÉLÍN points for exclusive perks, items, and vouchers." />

      {/* Filter Toolbar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search rewards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 outline-none focus:border-amber-400"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Pts"
              value={minCost}
              onChange={(e) => setMinCost(e.target.value)}
              className="w-1/2 bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 outline-none"
            />
            <input
              type="number"
              placeholder="Max Pts"
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              className="w-1/2 bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 outline-none"
            />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200 outline-none"
          >
            <option value="asc">Cost: Low to High</option>
            <option value="desc">Cost: High to Low</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2 border-t border-neutral-800/80 overflow-x-auto">
          {[
            { id: 'all', label: 'All Rewards' },
            { id: 'affordable', label: 'Affordable with Balance' },
            { id: 'unaffordable', label: 'Requires More Points' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setAffordability(f.id)}
              className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                affordability === f.id
                  ? 'bg-amber-400 text-neutral-950 font-bold'
                  : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rewards Grid */}
      {filteredRewards.length === 0 ? (
        <Empty msg="No rewards match your criteria." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRewards.map((item) => {
            const cost = Number(item.cost_points || item.points_required || 0);
            const deficit = cost - bal;
            const isSaved = wishlist.includes(item.id);

            return (
              <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3 bg-neutral-950 flex items-center justify-center">
                    <img src={item.image_url || '/placeholder-reward.png'} alt={item.name} className="object-cover h-full w-full" />
                    <button
                      onClick={() => toggleWishlist(item.id)}
                      className="absolute top-2 right-2 bg-neutral-950/80 p-2 rounded-full border border-neutral-800 text-amber-400 hover:scale-105 transition"
                    >
                      <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                  <h3 className="font-semibold text-neutral-100 text-sm">{item.name}</h3>
                  <p className="text-amber-400 font-bold text-sm mt-1">{pts(cost)}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800">
                  {deficit > 0 ? (
                    <p className="text-[11px] text-neutral-400 mb-2">
                      You need <span className="text-amber-300 font-semibold">{pts(deficit)} more</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald-400 font-medium mb-2">Eligible for Redemption</p>
                  )}
                  <button
                    onClick={() => openRedeemModal(item)}
                    className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl transition"
                  >
                    Redeem Reward
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Atomic Redemption Confirmation Dialog */}
      <RedemptionModal
        reward={selectedReward}
        userPoints={bal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refresh();
          load();
        }}
      />
    </div>
  );
}
