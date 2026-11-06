import { Bell, Search, Users } from 'lucide-react';

function Header({ pageTitle }) {
  return (
    <header>
      <div className="crumb">
        Workspace / <b>{pageTitle}</b>
      </div>
    </header>
  );
}

export default Header;
