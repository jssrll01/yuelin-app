import { useCallback, useEffect, useState } from 'react';

export default function useAsync(fn, deps) {
  const [s, setS] = useState({ loading: true, data: null, error: null, missing: false });
  const run = useCallback(async () => {
    setS((x) => ({ ...x, loading: true }));
    const r = await fn();
    setS({ loading: false, data: r.data, error: r.error, missing: r.missing });
  }, deps); // eslint-disable-line
  useEffect(() => { run(); }, [run]);
  return { ...s, reload: run };
}
