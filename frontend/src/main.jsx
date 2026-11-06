import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { people, tasks } from "./data/tasks";
import OverviewPage from "./pages/OverviewPage";
import TasksPage from "./pages/TasksPage";
import StockPage from "./pages/StockPage";
import LaundryPage from "./pages/LaundryPage";
import CalendarPage from "./pages/CalendarPage";
import "./styles.css";
import { stockCategories } from "./data/stock";
import { api as apiRequest } from "./api";

function App() {
  const [api, setApi] = useState("Connecting…");
  const [activeView, setActiveView] = useState("overview");
  const [laundryFinishTime, setLaundryFinishTime] = useState("");
  const [taskDefinitions, setTaskDefinitions] = useState(tasks);
  const [taskState, setTaskState] = useState(() => Object.fromEntries(
    tasks.map((task, index) => [task.id, {
      personIndex: index % people.length,
      status: "normal",
      schedule: { todo: [] },
    }]),
  ));
  const [stock, setStock] = useState(stockCategories);
  const [stockRequests, setStockRequests] = useState({});
  const [calendarEntries, setCalendarEntries] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetch("/api/status/")
      .then((response) => response.json())
      .then((data) => setApi(data.message))
      .catch(() => setApi("API unavailable"));
  }, []);

  useEffect(() => {
    Promise.all([apiRequest("tasks/"), apiRequest("stock/"), apiRequest("laundry/"), apiRequest("calendar/"), apiRequest("notes/")])
      .then(([taskData, stockData, laundryData, calendarData, notesData]) => {
        setTaskDefinitions(taskData.tasks ?? tasks);
        setTaskState(taskData.taskState ?? {});
        setStock(stockData.stock ?? stockCategories);
        setStockRequests(stockData.stockRequests ?? {});
        setLaundryFinishTime(laundryData.finishTime ?? "");
        setCalendarEntries(calendarData.entries ?? []);
        setNotes(notesData.notes ?? []);
      })
      .catch(() => setApi("API unavailable"));
  }, []);

  const pageTitle = {
    overview: "Overview",
    tasks: "Tasks",
    stock: "Stock",
    laundry: "Laundry",
    calendar: "Calendar",
  }[activeView];

  return (
    <div className="shell">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        urgentTaskCount={Object.values(taskState).filter(
          (task) => task.status === "urgent",
        ).length}
        requestedStockCount={Object.values(stockRequests).filter(Boolean).length}
      />

      <main>
        <Header pageTitle={pageTitle} />

        {activeView === "overview" && (
          <OverviewPage
            api={api}
            laundryFinishTime={laundryFinishTime}
            calendarEntries={calendarEntries}
            onViewChange={setActiveView}
            tasks={taskDefinitions}
            taskState={taskState}
            notes={notes}
            setNotes={setNotes}
          />
        )}
        {activeView === "tasks" && (
          <TasksPage
            tasks={taskDefinitions}
            setTasks={setTaskDefinitions}
            taskState={taskState}
            setTaskState={setTaskState}
          />
        )}
        {activeView === "stock" && (
          <StockPage
            stock={stock}
            setStock={setStock}
            requests={stockRequests}
            setRequests={setStockRequests}
          />
        )}
        {activeView === "laundry" && (
          <LaundryPage
            finishTime={laundryFinishTime}
            setFinishTime={setLaundryFinishTime}
          />
        )}
        {activeView === "calendar" && (
          <CalendarPage entries={calendarEntries} setEntries={setCalendarEntries} />
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
