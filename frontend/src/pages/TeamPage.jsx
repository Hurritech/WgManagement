function TeamPage() {
  const members = [
    ['JD', 'Jordan Davis', 'Admin'],
    ['AM', 'Alex Morgan', 'Designer'],
    ['SK', 'Sam Kim', 'Developer'],
  ];

  return (
    <section className="content">
      <p className="eyebrow">WORKSPACE</p>
      <h1>Team</h1>
      <p className="sub">See who is working across your workspace.</p>
      <div className="team-grid">
        {members.map(([initials, name, role]) => (
          <article className="team-card" key={name}>
            <span className="avatar blue">{initials}</span>
            <div><strong>{name}</strong><small>{role}</small></div>
            <span className="online">Online</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TeamPage;
