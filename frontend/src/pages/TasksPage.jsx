import { AlertTriangle, Plus, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import TaskItem from "../components/TaskItem";
import ConfirmDialog from "../components/ConfirmDialog";
import "./TasksPage.css";
import { people } from "../data/tasks";
import { api } from "../api";

const nextStatus = {
  normal: "todo",
  todo: "urgent",
  urgent: "normal",
};

function TasksPage({ tasks, setTasks, taskState, setTaskState }) {
  const [taskTitle, setTaskTitle] = useState("");
  const [initialPerson, setInitialPerson] = useState(0);
  const [isManaging, setIsManaging] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  function addTask(event) {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    const id = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    setConfirmation({
      message: `Add the task “${title}” for ${people[initialPerson].name}?`,
      action: () => {
        setTasks((current) => [...current, { id, title }]);
        setTaskState((current) => ({
          ...current,
          [id]: { personIndex: initialPerson, status: "normal", schedule: { todo: [] } },
        }));
        api("tasks/", { method: "POST", body: JSON.stringify({ id, title, personIndex: initialPerson }) }).catch(console.error);
        setTaskTitle("");
      },
    });
  }

  function removeTask(taskId) {
    const task = tasks.find((item) => item.id === taskId);
    setConfirmation({
      message: `Remove the task “${task.title}”?`,
      action: () => {
        setTasks((current) => current.filter((item) => item.id !== taskId));
        setTaskState((current) => {
          const next = { ...current };
          delete next[taskId];
          return next;
        });
        api(`tasks/${taskId}/`, { method: "DELETE" }).catch(console.error);
      },
    });
  }
  function finishTask(taskId) {
    setTaskState((current) => {
      const next = {
      ...current,
      [taskId]: {
        personIndex: (current[taskId].personIndex + 1) % people.length,
        status: "normal",
        schedule: { todo: [] },
      },
      };
      api(`tasks/${taskId}/state/`, { method: "PUT", body: JSON.stringify(next[taskId]) }).catch(console.error);
      return next;
    });
  }

  function cycleStatus(taskId) {
    setTaskState((current) => {
      const next = {
      ...current,
      [taskId]: {
        ...current[taskId],
        status: nextStatus[current[taskId].status],
      },
      };
      api(`tasks/${taskId}/state/`, { method: "PUT", body: JSON.stringify(next[taskId]) }).catch(console.error);
      return next;
    });
  }

  function saveSchedule(taskId, schedule) {
    setTaskState((current) => {
      const next = {
      ...current,
      [taskId]: { ...current[taskId], schedule },
      };
      api(`tasks/${taskId}/state/`, { method: "PUT", body: JSON.stringify(next[taskId]) }).catch(console.error);
      return next;
    });
  }

  return (
    <section className="content tasks-page">
      <div className="page-heading">
        <p className="eyebrow">HOUSE ROTATION</p>
        <h1>Tasks</h1>
        <p className="sub">
          Finish a task to pass it to the next person. Cycle its status when
          something needs attention.
        </p>
      </div>

      <div className="task-legend">
        <span>Normal</span>
        <span>To-do</span>
        <span>
          <AlertTriangle size={13} /> Urgent
        </span>
      </div>

      <button className="management-button" onClick={() => setIsManaging((current) => !current)} type="button">
        <Settings size={15} /> {isManaging ? "Done managing" : "Manage tasks"}
      </button>

      {isManaging && (
        <form className="add-item-form" onSubmit={addTask}>
          <input
            onChange={(event) => setTaskTitle(event.target.value)}
            placeholder="Add a task"
            value={taskTitle}
            maxLength={80}
          />
          <select onChange={(event) => setInitialPerson(Number(event.target.value))} value={initialPerson}>
            {people.map((person, index) => (
              <option key={person.name} value={index}>{person.name}</option>
            ))}
          </select>
          <button type="submit"><Plus size={15} /> Add task</button>
        </form>
      )}

      <div className="task-sections">
        {people.map((person, personIndex) => {
          const assignedTasks = tasks.filter(
            (task) => taskState[task.id].personIndex === personIndex,
          );

          return (
            <section className="person-task-section" key={person.name}>
              <div className="person-heading">
                <div className="task-person">
                  <span className={`avatar ${person.color}`}>
                    {person.initials}
                  </span>
                  <div>
                    <strong>{person.name}</strong>
                    <small>{assignedTasks.length} tasks assigned</small>
                  </div>
                </div>
              </div>

              <div className="person-task-list">
                {assignedTasks.length === 0 && (
                  <p className="empty-tasks">No tasks assigned right now.</p>
                )}

                {assignedTasks.map((task) => {
                  const status = taskState[task.id].status;
                  return (
                    <div className="task-entry" key={task.id}>
                      <TaskItem
                        onCycleStatus={() => cycleStatus(task.id)}
                        onFinish={() => finishTask(task.id)}
                        onSaveSchedule={(schedule) =>
                          saveSchedule(task.id, schedule)
                        }
                        schedule={taskState[task.id].schedule}
                        status={status}
                        task={task}
                      />
                      {isManaging && (
                        <button
                          className="remove-task-button"
                          onClick={() => removeTask(task.id)}
                          type="button"
                        >
                          <Trash2 size={13} /> Remove task
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      <ConfirmDialog
        message={confirmation?.message}
        onCancel={() => setConfirmation(null)}
        onConfirm={() => {
          confirmation.action();
          setConfirmation(null);
        }}
      />
    </section>
  );
}

export default TasksPage;
