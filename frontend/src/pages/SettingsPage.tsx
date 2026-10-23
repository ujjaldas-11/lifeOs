import { useState, type FormEvent } from "react";
import {
  User as UserIcon,
  Download,
  Lock,
  CheckCircle2,
  AlertCircle,
  Database,
  Terminal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { updateProfileApi, exportDataApi } from "../api/auth";

export function SettingsPage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    if (newPassword && newPassword !== confirmNewPassword) {
      setProfileErrorMsg("New passwords do not match");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setProfileErrorMsg("New password must be at least 6 characters long");
      return;
    }

    if (newPassword && !currentPassword) {
      setProfileErrorMsg("Please provide your current password to set a new password");
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const updated = await updateProfileApi({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      updateUser(updated);
      setProfileSuccessMsg("Profile and credentials updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setProfileErrorMsg(err.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleExportWorkspace = async () => {
    try {
      setIsExporting(true);
      setExportSuccessMsg(null);
      const data = await exportDataApi();

      // Trigger client-side file download
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      const dateStr = new Date().toISOString().split("T")[0];
      downloadAnchor.setAttribute("download", `lifeos-workspace-backup-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportSuccessMsg("Workspace data exported to JSON successfully!");
    } catch (err: any) {
      console.error("Failed to export data:", err);
      alert("Failed to export workspace backup");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#e6edf3]">
          Account & Workspace Settings
        </h2>
        <p className="text-xs text-[#8b949e] mt-1 font-mono">
          Manage your developer profile credentials and download full workspace JSON backups
        </p>
      </div>

      {/* Developer Profile Card */}
      <Card className="border-[#222736] bg-[#13161f]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-blue-400" />
            <CardTitle className="text-sm font-semibold text-[#e6edf3]">
              Developer Profile & Credentials
            </CardTitle>
          </div>
          <CardDescription>
            Update your display name, login email, or change your account password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {profileSuccessMsg && (
              <div className="flex items-center gap-2 rounded-md bg-[#152744] border border-[#1f4277] p-3 text-xs text-[#58a6ff]">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div className="flex items-center gap-2 rounded-md bg-[#3c1e22] border border-[#67252b] p-3 text-xs text-[#f85149]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="pt-2 border-t border-[#222736]">
              <h4 className="text-xs font-semibold text-[#e6edf3] mb-3 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Change Password (Leave blank to keep current)</span>
              </h4>

              <div className="space-y-3">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Enter current password to verify"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isUpdatingProfile}>
                <span>Save Profile Changes</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Data Backup & Export Card */}
      <Card className="border-[#222736] bg-[#13161f]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400" />
            <CardTitle className="text-sm font-semibold text-[#e6edf3]">
              Data Export & Workspace Backup
            </CardTitle>
          </div>
          <CardDescription>
            Export an offline JSON snapshot containing all your tasks, habits, events, notes, projects, and focus logs
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-xs text-[#8b949e]">
            Your data is stored locally in PostgreSQL. You can download an entire portable JSON backup at any time for data sovereignty, offline storage, or migration.
          </p>

          {exportSuccessMsg && (
            <div className="flex items-center gap-2 rounded-md bg-[#162a1c] border border-[#224b2b] p-3 text-xs text-[#3fb950]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{exportSuccessMsg}</span>
            </div>
          )}

          <div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleExportWorkspace}
              isLoading={isExporting}
            >
              <Download className="h-4 w-4 mr-2 text-emerald-400" />
              <span>Download Workspace JSON Backup</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System & Architecture Info */}
      <Card className="border-[#222736] bg-[#13161f]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-purple-400" />
            <CardTitle className="text-sm font-semibold text-[#e6edf3]">
              System Environment & Architecture
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-[#8b949e]">
            <div className="p-2.5 rounded bg-[#0d0f14] border border-[#222736]">
              <div className="text-[10px] text-[#57606a] uppercase">Version</div>
              <div className="font-semibold text-[#e6edf3] mt-0.5">3.0.0 (Phase 3)</div>
            </div>
            <div className="p-2.5 rounded bg-[#0d0f14] border border-[#222736]">
              <div className="text-[10px] text-[#57606a] uppercase">UI Theme</div>
              <div className="font-semibold text-[#e6edf3] mt-0.5">Antigravity Flat Dark</div>
            </div>
            <div className="p-2.5 rounded bg-[#0d0f14] border border-[#222736]">
              <div className="text-[10px] text-[#57606a] uppercase">Database</div>
              <div className="font-semibold text-[#e6edf3] mt-0.5">PostgreSQL + Prisma</div>
            </div>
            <div className="p-2.5 rounded bg-[#0d0f14] border border-[#222736]">
              <div className="text-[10px] text-[#57606a] uppercase">Shortcut</div>
              <div className="font-semibold text-[#e6edf3] mt-0.5">Cmd + K / Ctrl + K</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
