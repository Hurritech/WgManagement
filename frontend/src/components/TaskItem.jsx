import { AlertTriangle, Check, Pencil } from "lucide-react";
import { useState } from "react";
import { formatDateInput } from "../utils/inputFormatting";

function TaskItem({
  task,
  status,
  onFinish,
  onCycleStatus,
  schedule,
  onSaveSchedule,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(schedule);

  function updateTodo(index, value) {
    setDraft((current) => ({
      todo: current.todo.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, date: value } : entry,
      ),
    }));
  }

  function addTodo() {
    setDraft((current) => ({
      todo: [...current.todo, { date: "", urgentDate: "" }],
    }));
  }

  function updateUrgent(todoIndex, value) {
    setDraft((current) => ({
      todo: current.todo.map((entry, entryIndex) =>
        entryIndex === todoIndex ? { ...entry, urgentDate: value } : entry,
      ),
    }));
  }

  function save() {
    onSaveSchedule({
      todo: draft.todo
        .filter((entry) => entry.date)
        .map((entry) => ({
          date: entry.date,
          urgentDate: entry.urgentDate || "",
        })),
    });
    setIsEditing(false);
  }

  return (
    <article className={`task-item task-item--${status}`}>
      <button
        className="task-toggle"
        onClick={onFinish}
        type="button"
        aria-label={`Finish ${task.title}`}
      >
        <Check size={15} />
      </button>
      <div className="task-details">
        <strong>{task.title}</strong>
        <small>
          {status === "urgent"
            ? "Urgent"
            : status === "todo"
              ? "To-do"
              : "Normal"}
        </small>
      </div>
      <button
        className="edit-task"
        onClick={() => {
          setDraft(schedule);
          setIsEditing(true);
        }}
        type="button"
        aria-label={`Edit ${task.title} schedule`}
      >
        <Pencil size={14} />
      </button>
      <button
        className="status-toggle"
        onClick={onCycleStatus}
        type="button"
        aria-label="Change task status"
      >
        {status === "urgent" && <AlertTriangle size={14} />}
        {status}
      </button>

      {isEditing && (
        <dialog
          className="schedule-dialog"
          open
          aria-label={`Schedule ${task.title}`}
        >
          <h3>Schedule task</h3>
          <p>{task.title}</p>
          <div className="schedule-group">
            <strong>To-do dates</strong>
            {draft.todo.map((entry, todoIndex) => (
              <div className="schedule-todo-entry" key={`todo-${todoIndex}`}>
                <input
                  inputMode="numeric"
                  onChange={(event) =>
                    updateTodo(todoIndex, formatDateInput(event.target.value))
                  }
                  pattern="\\d{2}/\\d{2}/\\d{4}"
                  placeholder="dd/mm/yyyy"
                  type="text"
                  value={entry.date}
                />
                <div className="schedule-urgent-dates">
                  <small>Urgent dates for this task</small>
                  <input
                    inputMode="numeric"
                    onChange={(event) =>
                      updateUrgent(todoIndex, formatDateInput(event.target.value))
                    }
                    pattern="\\d{2}/\\d{2}/\\d{4}"
                    placeholder="dd/mm/yyyy"
                    type="text"
                    value={entry.urgentDate}
                  />
                </div>
              </div>
            ))}
            <button onClick={addTodo} type="button">
              Add todo date
            </button>
          </div>
          <div className="schedule-actions">
            <button onClick={() => setIsEditing(false)} type="button">
              Cancel
            </button>
            <button onClick={save} type="button">
              Save
            </button>
          </div>
        </dialog>
      )}
    </article>
  );
}

export default TaskItem;
