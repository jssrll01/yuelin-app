import { Loader2 } from 'lucide-react';

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
export const Spinner = () => <div className="center" style={{ padding: 40 }}><Loader2 className="spin" color="#d4af37" /></div>;
export const Empty = ({ icon: Icon, title, text }) => (
  <div className="card center" style={{ padding: 36 }}>
    {Icon && <span className="ico" style={{ margin: '0 auto 12px' }}><Icon size={22} /></span>}
    <h3>{title}</h3><p className="dim" style={{ marginTop: 6 }}>{text}</p>
  </div>
);
