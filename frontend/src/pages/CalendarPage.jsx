import { CalendarDays, Plus, X } from "lucide-react";
import { useState } from "react";
import { formatDateInput, formatTimeInput } from "../utils/inputFormatting";
import "./CalendarPage.css";
import { api } from "../api";

function CalendarPage({ entries, setEntries }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedNote, setSelectedNote] = useState("");

  function addDate(event) {
    event.preventDefault();
    const dateParts = selectedDate.split("/");
    if (dateParts.length !== 3) return;

    const [day, month, year] = dateParts;
    const isoDate = `${year}-${month}-${day}`;
    const parsedDate = new Date(`${isoDate}T00:00:00`);
    const isValidDate =
      /^\d{2}\/\d{2}\/\d{4}$/.test(selectedDate) &&
      parsedDate.getFullYear() === Number(year) &&
      parsedDate.getMonth() + 1 === Number(month) &&
      parsedDate.getDate() === Number(day);

    const note = selectedNote.trim();
    if (!isValidDate || !note || entries.some((entry) => entry.date === isoDate)) return;
    setEntries((current) =>
      [...current, { date: isoDate, time: selectedTime, note }].sort(
        (first, second) => first.date.localeCompare(second.date),
      ),
    );
    api("calendar/", { method: "POST", body: JSON.stringify({ date: isoDate, time: selectedTime, note }) }).catch(console.error);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedNote("");
  }

  return (
    <section className="content calendar-page">
      <p className="eyebrow">SHARED CALENDAR</p>
      <h1>Calendar</h1>
      <p className="sub">Keep important household dates in one place.</p>

      <form className="calendar-form" onSubmit={addDate}>
        <CalendarDays size={18} />
        <input
          inputMode="numeric"
          onChange={(event) => setSelectedDate(formatDateInput(event.target.value))}
          pattern="\d{2}/\d{2}/\d{4}"
          placeholder="dd/mm/yyyy"
          type="text"
          value={selectedDate}
          required
        />
        <input
          aria-label="Time"
          onChange={(event) => setSelectedTime(formatTimeInput(event.target.value))}
          pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
          placeholder="hh:mm"
          type="text"
          inputMode="numeric"
          value={selectedTime}
        />
        <input
          aria-label="Note"
          maxLength={120}
          onChange={(event) => setSelectedNote(event.target.value)}
          placeholder="Note"
          required
          type="text"
          value={selectedNote}
        />
        <button type="submit"><Plus size={15} /> Add date</button>
      </form>

      <div className="calendar-list">
        {entries.length === 0 && <p className="calendar-empty">No dates added yet.</p>}
        {entries.map((entry) => (
          <div className="calendar-date" key={entry.date}>
            <div>
              <strong>{entry.date.split("-").reverse().join("/")}</strong>
              {entry.time && <span>{entry.time}</span>}
              {entry.note && <p>{entry.note}</p>}
            </div>
            <button onClick={() => { setEntries((current) => current.filter((item) => item.date !== entry.date)); api(`calendar/${entry.date}/`, { method: "DELETE" }).catch(console.error); }} type="button" aria-label="Remove date">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CalendarPage;
