
export function PageTitle({ icon: Icon, eyebrow, title, sub }) {
  return (
    <div className="row" style={{ marginBottom: 20 }}>
      {Icon && <span className="ico"><Icon size={22} /></span>}
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {sub && <p className="dim" style={{ marginTop: 4 }}>{sub}</p>}
      </div>
    </div>
  );
}
export function Field({ label, icon: Icon, ro, ...props }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className={'input' + (ro ? ' ro' : '')}>
        {Icon && <Icon size={18} />}
        <input {...props} readOnly={ro} />
      </div>
    </div>
  );
}
export const Msg = ({ kind = 'bad', children }) => (children ? <div className={'msg ' + kind} role="alert">{children}</div> : null);
export const Spinner = () => <PageSkeleton variant="list" />;
export const Empty = ({ icon: Icon, title, text }) => (
  <div className="card center" style={{ padding: 36 }}>
    {Icon && <span className="ico" style={{ margin: '0 auto 12px' }}><Icon size={22} /></span>}
    <h3>{title}</h3><p className="dim" style={{ marginTop: 6 }}>{text}</p>
  </div>
);

export const Sk = ({ w = '100%', h = 14, r = 8, style }) => <span className="sk" aria-hidden="true" style={{ width: w, height: h, borderRadius: r, ...style }} />;

export function SkCard({ rows = 2 }) {
  return (
    <div className="card stack" style={{ gap: 12 }} aria-hidden="true">
      <div className="row"><Sk w={46} h={46} r={15} /><div className="stack" style={{ gap: 8, flex: 1 }}><Sk w="55%" h={16} /><Sk w="30%" h={12} /></div></div>
      {Array.from({ length: rows }, (_, i) => <Sk key={i} w={i === rows - 1 ? '70%' : '100%'} h={12} />)}
    </div>
  );
}

export function PageSkeleton({ variant = 'list', n = 4 }) {
  let body;
  if (variant === 'grid') body = <div className="grid2">{Array.from({ length: n }, (_, i) => <SkCard key={i} rows={2} />)}</div>;
  else if (variant === 'form') body = <><div className="card stack" aria-hidden="true"><Sk w="30%" h={10} /><Sk w="45%" h={34} /></div><div className="card stack" aria-hidden="true">{Array.from({ length: 4 }, (_, i) => <Sk key={i} h={44} r={14} />)}</div></>;
  else if (variant === 'home') body = <><div className="card stack center" style={{ alignItems: 'center' }} aria-hidden="true"><Sk w="40%" h={10} /><Sk w="75%" h={34} /><Sk w="60%" h={12} /><Sk w={160} h={46} r={16} /></div><div className="grid2"><SkCard /><SkCard /></div></>;
  else body = <div className="card list" aria-hidden="true">{Array.from({ length: n }, (_, i) => <div key={i} className="row between"><div className="stack" style={{ gap: 8, flex: 1 }}><Sk w="50%" h={14} /><Sk w="30%" h={10} /></div><Sk w={56} h={20} /></div>)}</div>;
  return (
    <div className="stack" role="status" aria-busy="true" aria-label="Loading">
      <div className="row" style={{ marginBottom: 4 }} aria-hidden="true"><Sk w={46} h={46} r={15} /><div className="stack" style={{ gap: 8, flex: 1 }}><Sk w={70} h={10} /><Sk w="50%" h={24} /></div></div>
      {body}
      <span className="sr">Loading…</span>
    </div>
  );
}
