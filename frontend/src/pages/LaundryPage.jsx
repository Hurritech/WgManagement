import { Check, Clock, WashingMachine } from "lucide-react";
import { formatTimeInput } from "../utils/inputFormatting";
import "./LaundryPage.css";
import { api } from "../api";

function LaundryPage({ finishTime, setFinishTime }) {

  function scheduleLaundry(event) {
    event.preventDefault();
    setFinishTime(event.currentTarget.elements.finishTime.value);
    api("laundry/", { method: "PUT", body: JSON.stringify({ finishTime: event.currentTarget.elements.finishTime.value }) }).catch(console.error);
  }

  const formattedFinishTime = finishTime || null;

  return (
    <section className="content laundry-page">
      <p className="eyebrow">SHARED UTILITY</p>
      <h1>Laundry</h1>
      <p className="sub">Let everyone know when the washing machine will be free.</p>

      <div className="laundry-card">
        <div className="laundry-icon"><WashingMachine size={26} /></div>
        <div>
          <strong>Washing machine</strong>
          <small>{formattedFinishTime ? `Running until ${formattedFinishTime}` : "Currently available"}</small>
        </div>
        <span className={formattedFinishTime ? "laundry-status is-running" : "laundry-status"}>
          {formattedFinishTime ? "In use" : "Available"}
        </span>
      </div>

      <form className="laundry-form" onSubmit={scheduleLaundry}>
        <label htmlFor="finishTime">Finishing time</label>
        <div className="laundry-input-row">
          <Clock size={17} />
          <input
            id="finishTime"
            name="finishTime"
            pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
            placeholder="hh:mm"
            required
            type="text"
            inputMode="numeric"
            onChange={(event) => {
              event.target.value = formatTimeInput(event.target.value);
            }}
            defaultValue={finishTime}
          />
          <button disabled={Boolean(formattedFinishTime)} type="submit">
            <Check size={16} /> Schedule
          </button>
        </div>
      </form>

      {formattedFinishTime && (
        <button className="laundry-clear" onClick={() => { setFinishTime(""); api("laundry/", { method: "PUT", body: JSON.stringify({ finishTime: "" }) }).catch(console.error); }} type="button">
          Mark machine available
        </button>
      )}
    </section>
  );
}

export default LaundryPage;
