import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { wishlistService } from "../services/travelmateApi";
import { useDataStore } from "../store/useDataStore";

export const WishlistPage = () => {
  const { wishlist, setWishlist } = useDataStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [form, setForm] = useState({ destination: "", country: "", tags: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (wishlist.length) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const items = await wishlistService.list();
        if (!cancelled) {
          setWishlist(items);
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [setWishlist, wishlist.length]);

  const planned = wishlist.filter((item) => !item.visited).length;
  const complete = wishlist.length - planned;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const created = await wishlistService.create({
        destination: form.destination,
        country: form.country,
        notes: form.notes,
        tags,
      });
      setWishlist([created, ...wishlist]);
      setForm({ destination: "", country: "", tags: "", notes: "" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleVisited = async (id: string, visited: boolean) => {
    try {
      const updated = await wishlistService.update(id, { visited: !visited });
      setWishlist(wishlist.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await wishlistService.remove(id);
      setWishlist(wishlist.filter((item) => item.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h1 className="page-title">Wishlist</h1>
      <Panel>
        <div className="stat-grid">
          <StatCard label="Planned" value={planned} accent="#f97316" />
          <StatCard label="Visited" value={complete} accent="#10b981" />
        </div>
      </Panel>
      <Panel title="Add a location" subtitle="Tags help group ideas by theme or season.">
        <form className="form-grid two-cols" onSubmit={handleSubmit}>
          <label>
            Destination
            <input value={form.destination} onChange={(event) => setForm((prev) => ({ ...prev, destination: event.target.value }))} required />
          </label>
          <label>
            Country
            <input value={form.country} onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))} />
          </label>
          <label>
            Tags (comma separated)
            <input value={form.tags} onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))} />
          </label>
          <label>
            Notes
            <textarea value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
          </label>
          <button className="primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </Panel>
      <Panel title="Wishlist" subtitle="Mark items visited or remove them when plans change.">
        {error && <div className="alert">{error}</div>}
        {loading ? (
          <p>Loading wishlist...</p>
        ) : wishlist.length === 0 ? (
          <p>No wishlist items yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Destination</th>
                <th>Tags</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {wishlist.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.destination}</strong>
                    {item.country && <p className="text-muted">{item.country}</p>}
                    {item.notes && <p className="text-muted">{item.notes}</p>}
                  </td>
                  <td>
                    {item.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => toggleVisited(item.id, item.visited)}
                    >
                      {item.visited ? "Visited" : "Mark visited"}
                    </button>
                  </td>
                  <td>
                    <button type="button" className="secondary" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
};
