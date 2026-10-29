import { createClient } from '@supabase/supabase-js';
// Publishable key: safe in the browser. Row-level security protects the data.
export const supabase = createClient(
  'https://adwhomwupgnwxowmutuy.supabase.co',
  'sb_publishable_20ahxTHpPdtCfyQFq89EJQ_-z4oyrsp'
);
