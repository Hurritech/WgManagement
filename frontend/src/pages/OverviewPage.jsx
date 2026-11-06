import { ArrowUpRight, CirclePlus, Plus, X } from "lucide-react";
import { useState } from "react";
import { people } from "../data/tasks";
import "./OverviewPage.css";
import { api } from "../api";

const formattedDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})
  .format(new Date())

function OverviewPage({
  api,
  taskState,
  laundryFinishTime,
  calendarEntries,
  onViewChange,
  tasks,
  notes,
  setNotes,
}) {
  const [noteText, setNoteText] = useState("");
  const taskCounts = Object.values(taskState).reduce(
    (counts, task) => {
      if (task.status === "urgent") counts.urgent += 1;
      if (task.status === "todo" || task.status === "urgent") counts.pending += 1;
      return counts;
    },
    { pending: 0, urgent: 0 },
  );
  const hausdienst = tasks.find((task) => task.id === "hausdienst");
  const hausdienstState = taskState[hausdienst.id];
  const scheduledDate = hausdienstState.schedule.todo[0]?.date;
  const hausdienstDate = scheduledDate
    ? new Date(scheduledDate.split("/").reverse().join("-"))
    : null;
  const daysUntilHausdienst = hausdienstDate
    ? Math.max(0, Math.ceil((hausdienstDate - new Date()) / 86400000))
    : null;
  const pendingTasks = tasks.filter(
    (task) => taskState[task.id].status === "todo" || taskState[task.id].status === "urgent",
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const upcomingDates = calendarEntries.filter((entry) => {
    const [year, month, day] = entry.date.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date >= today && date <= nextWeek;
  });

  function addNote(event) {
    event.preventDefault();
    const text = noteText.trim();
    if (!text) return;
    const id = crypto.randomUUID();
    setNotes((current) => [...current, { id, text }]);
    api("notes/", { method: "POST", body: JSON.stringify({ id, text }) }).catch(console.error);
    setNoteText("");
  }

  return (
    <section className="content overview-page">
      <div className="overview-intro">
        <div>
          <p className="eyebrow">{formattedDate}</p>
          <h1>Good morning <span>✦</span></h1>
          <p className="sub">Here is the current state of your shared home.</p>
        </div>
      </div>

      <div className="overview-status">
        <span className="pulse"></span>
        <div>
          <strong>{api}</strong>
          <small>Everything is running normally</small>
        </div>
        <span className="status-detail">Updated just now</span>
      </div>

      <div className="overview-grid">
        <article className="overview-card">
          <div className="card-label">OPEN TASKS</div>
          <strong className="metric">{taskCounts.pending}</strong>
          <div className="metric-note metric-note--warm">
            {taskCounts.urgent} urgent {taskCounts.urgent === 1 ? "item" : "items"}
          </div>
          <button className="card-footer" onClick={() => onViewChange("tasks")} type="button">
            View task list <ArrowUpRight size={15} />
          </button>
        </article>
        <article className="overview-card">
          <div className="card-label">NEXT HAUSDIENST</div>
          <strong className="metric">
            {daysUntilHausdienst ?? "—"}{" "}
            <small>{daysUntilHausdienst === null ? "not scheduled" : "days"}</small>
          </strong>
          <div className="metric-note">
            {hausdienst.title} · {hausdienstState.status}
          </div>
          <button className="card-footer" onClick={() => onViewChange("tasks")} type="button">
            Plan ahead <ArrowUpRight size={15} />
          </button>
        </article>
        <article className="overview-card">
          <div className="card-label">WASHING MACHINE</div>
          <strong className="machine-state">
            {laundryFinishTime || "Available"}
          </strong>
          <div className="metric-note">
            {laundryFinishTime ? "Finishing time today" : "No wash scheduled"}
          </div>
          <button className="card-footer" onClick={() => onViewChange("laundry")} type="button">
            Open laundry view <ArrowUpRight size={15} />
          </button>
        </article>
      </div>

      <div className="overview-lower-grid">
      <section className="overview-panel task-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">ACTION NEEDED</p>
            <h2>Tasks to complete</h2>
          </div>
          <span className="task-count">{pendingTasks.length} open</span>
        </div>
        <div className="overview-task-list">
          {pendingTasks.length === 0 && <p className="empty-overview-tasks">Nothing needs attention right now.</p>}
          {pendingTasks.map((task) => {
            const person = people[taskState[task.id].personIndex];
            const isUrgent = taskState[task.id].status === "urgent";
            return (
              <div className={`overview-task ${isUrgent ? "is-urgent" : ""}`} key={task.id}>
                <span className="overview-task-marker"></span>
                <strong>{task.title}</strong>
                <span className="overview-task-person">{person.name}</span>
                {isUrgent && <span className="overview-task-status">Urgent</span>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="overview-panel notes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">SHARED NOTES</p>
            <h2>Notes</h2>
          </div>
        </div>
        <form className="note-form" onSubmit={addNote}>
          <input
            maxLength={120}
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="Add a short note..."
            value={noteText}
          />
          <button type="submit"><Plus size={15} /> Add</button>
        </form>
        <div className="notes-list">
          {notes.map((note) => (
            <div className="note-row" key={note.id}>
              <span>{note.text}</span>
              <button onClick={() => { setNotes((current) => current.filter((item) => item.id !== note.id)); api(`notes/${note.id}/`, { method: "DELETE" }).catch(console.error); }} type="button" aria-label="Remove note">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="overview-panel upcoming-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">NEXT 7 DAYS</p>
            <h2>Upcoming dates</h2>
          </div>
          <span className="task-count">{upcomingDates.length}</span>
        </div>
        <div className="overview-task-list">
          {upcomingDates.length === 0 && <p className="empty-overview-tasks">No upcoming dates.</p>}
          {upcomingDates.map((entry) => (
            <div className="overview-task" key={entry.date}>
              <span className="overview-task-marker"></span>
              <strong>{entry.date.split("-").reverse().join("/")}</strong>
              {entry.time && <span className="overview-task-person">{entry.time}</span>}
              {entry.note && <span className="overview-task-person">{entry.note}</span>}
            </div>
          ))}
        </div>
      </section>
      </div>
    </section>
  );
}

export default OverviewPage;

