import { useCallback, useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { StateMessage } from "../components/ui/StateMessage";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAuth } from "../features/auth/useAuth";
import { ApiError, api, type SiteSettings } from "../services/api";

export function SettingsPage() {
  const { user } = useAuth();
  const canWrite = user?.permissions.includes("settings.write") ?? false;

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onToggleMaintenance(next: boolean) {
    if (!canWrite || saving) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const data = await api.updateSettings({ maintenanceMode: next });
      setSettings(data);
      setMessage(
        next
          ? "Maintenance mode is on — the storefront shows the coming soon page."
          : "Maintenance mode is off — the storefront is live.",
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Settings</h1>
          <p>Control storefront availability and site-wide options.</p>
        </div>
      </header>

      {loading ? (
        <StateMessage title="Loading settings" description="Fetching site configuration…" />
      ) : error && !settings ? (
        <StateMessage title="Settings unavailable" description={error} />
      ) : settings ? (
        <Card
          title="Storefront"
          actions={
            <StatusBadge tone={settings.maintenanceMode ? "warning" : "success"}>
              {settings.maintenanceMode ? "Maintenance" : "Live"}
            </StatusBadge>
          }
        >
          <div className="settings-row">
            <div className="settings-copy">
              <h3>Maintenance mode</h3>
              <p>
                When enabled, visitors see the Wastro coming soon image instead of the shop,
                cart, and account pages.
              </p>
              {message ? <p className="settings-feedback">{message}</p> : null}
              {error ? <p className="settings-error">{error}</p> : null}
            </div>

            <label className={`settings-switch ${canWrite ? "" : "is-disabled"}`.trim()}>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                disabled={!canWrite || saving}
                onChange={(event) => void onToggleMaintenance(event.target.checked)}
              />
              <span className="settings-switch-track" aria-hidden="true">
                <span className="settings-switch-thumb" />
              </span>
              <span className="settings-switch-label">
                {settings.maintenanceMode ? "On" : "Off"}
              </span>
            </label>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
