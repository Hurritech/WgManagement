import { CalendarDays, Check, Clock3, LayoutGrid, Package } from 'lucide-react';
import './Sidebar.css';

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'tasks', label: 'Tasks', icon: Check },
  { id: 'stock', label: 'Stock', icon: Package },
  { id: 'laundry', label: 'Laundry', icon: Clock3 },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
];

function Sidebar({ activeView, onViewChange, urgentTaskCount, requestedStockCount }) {
  return (
    <aside>
      <div className="brand">
        <span className="brand-mark">WG</span>
        <span>WG</span>
      </div>

      <nav>
        {navigationItems.map(({ id, label, icon: Icon }) => (
          <button
            className={activeView === id ? 'active' : ''}
            key={id}
            onClick={() => onViewChange(id)}
            type="button"
          >
            <Icon size={18} />
            {label}
            {id === 'tasks' && (
              <span className={`sidebar-counter ${urgentTaskCount > 0 ? 'is-warning' : ''}`}>
                {urgentTaskCount}
              </span>
            )}
            {id === 'stock' && (
              <span className={`sidebar-counter ${requestedStockCount > 0 ? 'is-warning' : ''}`}>
                {requestedStockCount}
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
