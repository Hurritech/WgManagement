import "./ConfirmDialog.css";

function ConfirmDialog({ message, onCancel, onConfirm }) {
  if (!message) return null;

  return (
    <dialog className="confirm-dialog" open aria-modal="true" aria-labelledby="confirm-dialog-title">
      <h2 id="confirm-dialog-title">Are you sure?</h2>
      <p>{message}</p>
      <div className="confirm-dialog-actions">
        <button onClick={onCancel} type="button">Cancel</button>
        <button className="confirm-button" onClick={onConfirm} type="button">Confirm</button>
      </div>
    </dialog>
  );
}

export default ConfirmDialog;
