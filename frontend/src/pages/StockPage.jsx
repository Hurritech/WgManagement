import { Minus, Package, Plus, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import { api } from "../api";
import "./StockPage.css";

function StockPage({ stock, setStock, requests, setRequests }) {
  const [itemName, setItemName] = useState("");
  const [itemUnit, setItemUnit] = useState("");
  const [itemCategory, setItemCategory] = useState(stock[0]?.id ?? "");
  const [isManaging, setIsManaging] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  function addItem(event) {
    event.preventDefault();
    const name = itemName.trim();
    if (!name) return;
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    setConfirmation({
      message: `Add “${name}” to stock?`,
      action: () => {
        setStock((current) =>
          current.map((category) =>
            category.id === itemCategory
              ? {
                  ...category,
                  items: [...category.items, { id, name, quantity: 0, unit: itemUnit.trim() || "items" }],
                }
              : category,
          ),
        );
        api("stock/", { method: "POST", body: JSON.stringify({ id, name, categoryId: itemCategory, unit: itemUnit.trim() || "items" }) }).catch(console.error);
        setItemName("");
        setItemUnit("items");
      },
    });
  }

  function removeItem(itemId) {
    const item = stock.flatMap((category) => category.items).find(({ id }) => id === itemId);
    setConfirmation({
      message: `Remove “${item.name}” from stock?`,
      action: () => {
        setStock((current) =>
          current.map((category) => ({
            ...category,
            items: category.items.filter((item) => item.id !== itemId),
          })),
        );
        setRequests((current) => {
          const next = { ...current };
          delete next[itemId];
          return next;
        });
        api(`stock/${itemId}/`, { method: "DELETE" }).catch(console.error);
      },
    });
  }

  function changeQuantity(itemId, amount) {
    setStock((current) => {
      const next = current.map((category) => ({
        ...category,
        items: category.items.map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + amount) }
            : item,
        ),
      }));
      const quantity = next.flatMap((category) => category.items).find((item) => item.id === itemId).quantity;
      api(`stock/${itemId}/`, { method: "PATCH", body: JSON.stringify({ quantity }) }).catch(console.error);
      return next;
    });

    if (amount > 0) {
      setRequests((current) => ({ ...current, [itemId]: false }));
    }
  }

  function requestMore(itemId) {
    setRequests((current) => {
      const requested = !current[itemId];
      api(`stock/${itemId}/`, { method: "PATCH", body: JSON.stringify({ requested }) }).catch(console.error);
      return { ...current, [itemId]: requested };
    });
  }

  return (
    <section className="content stock-page">
      <p className="eyebrow">SHARED HOUSEHOLD</p>
      <h1>Stock</h1>
      <p className="sub">
        Keep track of shared items and update quantities as they change.
      </p>

      <button className="management-button" onClick={() => setIsManaging((current) => !current)} type="button">
        <Settings size={15} /> {isManaging ? "Done managing" : "Manage stock"}
      </button>

      {isManaging && (
        <form className="add-item-form stock-add-form" onSubmit={addItem}>
          <input
            onChange={(event) => setItemName(event.target.value)}
            placeholder="Item name"
            value={itemName}
            maxLength={60}
            required
          />
          <input
            onChange={(event) => setItemUnit(event.target.value)}
            placeholder="Unit"
            value={itemUnit}
            maxLength={20}
            required
          />
          <select onChange={(event) => setItemCategory(event.target.value)} value={itemCategory}>
            {stock.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <button type="submit"><Plus size={15} /> Add item</button>
        </form>
      )}

      <div className="stock-categories">
        {stock.map((category) => (
          <section className="stock-category" key={category.id}>
            <div className="stock-category-heading">
              <h2>{category.name}</h2>
              <span>{category.items.length} items</span>
            </div>
            <div className="stock-grid">
              {category.items.map((item) => (
                <article
                  className={`stock-card ${item.quantity === 0 ? "stock-card--empty" : ""}`}
                  key={item.id}
                >
                  <div className="stock-icon">
                    <Package size={19} />
                  </div>
                  <div className="stock-info">
                    <strong>{item.name}</strong>
                    <small>
                      {item.quantity === 0
                        ? "Out of stock"
                        : `${item.quantity} ${item.unit}`}
                    </small>
                  </div>
                  <div className="stock-controls">
                    <button
                      onClick={() => changeQuantity(item.id, -1)}
                      type="button"
                      aria-label={`Remove one ${item.name}`}
                    >
                      <Minus size={15} />
                    </button>
                    <b>{item.quantity}</b>
                    <button
                      onClick={() => changeQuantity(item.id, 1)}
                      type="button"
                      aria-label={`Add one ${item.name}`}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <button
                    className={`request-button ${requests[item.id] ? "is-requested" : ""}`}
                    onClick={() => requestMore(item.id)}
                    type="button"
                  >
                    {requests[item.id] ? "Requested" : "Request more"}
                  </button>
                  {isManaging && (
                    <button
                      className="remove-stock-button"
                      onClick={() => removeItem(item.id)}
                      type="button"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
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

export default StockPage;

