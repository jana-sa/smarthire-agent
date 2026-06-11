import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser, updateProfile } from "@/lib/api";
import { toast } from "sonner";

const Profile = () => {
  const user = getCurrentUser();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [company, setCompany] = useState(user?.company ?? "");
  const [role, setRole] = useState(user?.role ?? "");
  const [saving, setSaving] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const initials = (fullName || "U").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName, company, role });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Profile & Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account preferences.</p>
      </div>

      <Card className="p-6 shadow-elegant">
        <div className="mb-6 flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary-soft">
            <AvatarFallback className="bg-gradient-hero text-lg font-bold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{fullName || "Your name"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Recruiter" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save changes
          </Button>
        </div>
      </Card>

      <Card className="p-6 shadow-elegant">
        <h2 className="mb-1 font-semibold">Notifications</h2>
        <p className="mb-4 text-sm text-muted-foreground">Choose what updates you want to receive.</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-md border border-border p-4">
            <div>
              <p className="text-sm font-medium">Email when screening completes</p>
              <p className="text-xs text-muted-foreground">Get notified the moment results are ready.</p>
            </div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-4">
            <div>
              <p className="text-sm font-medium">Weekly hiring digest</p>
              <p className="text-xs text-muted-foreground">Summary of pipeline activity every Monday.</p>
            </div>
            <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
          </div>
        </div>
      </Card>

      <Card className="border-destructive/30 p-6">
        <h2 className="mb-1 font-semibold text-destructive">Danger zone</h2>
        <p className="mb-4 text-sm text-muted-foreground">Permanently delete your account and all screening data.</p>
        <Button variant="destructive" size="sm" onClick={() => toast.error("Demo: account deletion disabled")}>Delete account</Button>
      </Card>
    </div>
  );
};

export default Profile;
