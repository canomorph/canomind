import { ICONS } from "../icons";
export const Icon = ({ name, size = 18 }: { name: string; size?: number }) => (
  <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: ICONS[name] ?? "" }} />
);
