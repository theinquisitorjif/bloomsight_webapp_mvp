import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/context/session-context";
import {
  Mail,
  Plus,
  Trash,
  Edit,
  Shield,
  User,
  Database,
  Calendar,
  Clock,
} from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { Navigate } from "react-router-dom";

const SettingsPage = () => {
  const { session } = useSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col items-center pt-10 pb-20">
      <main className="container p-2 xl:max-w-[1000px] space-y-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-blue-500 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your account preferences and security settings
          </p>
        </div>

        {/* Account Information Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
              Account Information
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm border border-border overflow-hidden">
            {/* Profile Picture Section */}
            <div className="p-6 border-b border-border">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex flex-col gap-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                    Profile Picture
                  </h3>
                  <div className="flex items-center gap-4">
                    <img
                      src={session.user.user_metadata.picture}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-4 border-white shadow-sm object-cover"
                    />
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Change Picture
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash className="w-4 h-4" />
                          Remove
                        </Button>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        JPG, PNG max 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Name Section */}
            <div className="p-6 border-b border-border">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={session.user.user_metadata.name || "Not provided"}
                    readOnly
                    className="max-w-md bg-slate-50 dark:bg-slate-700"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            </div>

            {/* Email Section */}
            <div className="p-6 border-b border-border">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={session.user.email}
                    readOnly
                    className="max-w-md bg-slate-50 dark:bg-slate-700"
                  />
                  {session.user.email_confirmed_at && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Verified
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Authentication Providers */}
            <div className="p-6 border-b border-border">
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Connected Accounts
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                {session.user.app_metadata.providers.map(
                  (provider: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg border border-border dark:border-slate-600"
                    >
                      {provider === "email" ? (
                        <Mail className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      ) : (
                        <FaGoogle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {provider}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Account Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">
                    User ID
                  </label>
                  <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded font-mono">
                    {session.user.id}
                  </code>
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">
                    Account Created
                  </label>
                  <p className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(session.user.created_at)}
                  </p>
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">
                    Last Updated
                  </label>
                  <p className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDate(session.user.updated_at)}
                  </p>
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">
                    Last Sign In
                  </label>
                  <p className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDate(session.user.last_sign_in_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
              Data Management
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm border border-border overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Your Reviews
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    View, edit, or delete all your reviews and ratings
                  </p>
                </div>
                <Button className="flex items-center gap-2" variant={"brand"}>
                  <Database className="w-4 h-4" />
                  Manage Reviews
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
              Security & Privacy
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm border border-border overflow-hidden">
            {/* Password Recovery */}
            <div className="p-6 border-b border-border">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Password Recovery
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Send a secure password reset link to your email address
                  </p>
                </div>
                <Button variant="brand" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Send Password Recovery
                </Button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                    Delete Account
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Trash className="w-4 h-4" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
