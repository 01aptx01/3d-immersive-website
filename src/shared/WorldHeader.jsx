import './world-ui.css';

/** Common chrome for every interactive world; actions remain world-specific. */
export default function WorldHeader({ className = '', children }) {
  return <header className={`world-header ${className}`}>{children}</header>;
}
