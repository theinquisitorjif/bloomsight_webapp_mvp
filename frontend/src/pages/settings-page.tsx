import { useDeleteUser, useUpdateUser } from "@/api/account";
import PageTitle from "@/components/page-title";
import EditableName from "@/components/settings/editable-name";
import EditableProfilePicture from "@/components/settings/editable-picture";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/context/session-context";
import supabase from "@/supabase";
import {
  Mail,
  Trash,
  Shield,
  User,
  Database,
  Calendar,
  Clock,
} from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SettingsPage = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUser.mutateAsync();
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateUser = async (data: {
    username?: string;
    picture?: string | File;
  }) => {
    try {
      await updateUser.mutateAsync(data);
      supabase.auth.refreshSession();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center pt-10 pb-20">
      <main className="container p-2 xl:max-w-[1000px] space-y-4">
        {/* Header */}
        <div className="mb-8">
          <PageTitle>Settings</PageTitle>
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
            <EditableProfilePicture
              initialPicture={session.user.user_metadata.picture}
              onUpdate={(picture) =>
                handleUpdateUser({ picture: picture ?? undefined })
              }
              initialSeed={session.user.user_metadata.name}
              isLoading={updateUser.isPending}
            />

            {/* Name Section */}
            <EditableName
              initialName={session.user.user_metadata.full_name}
              onUpdate={(name) => handleUpdateUser({ username: name })}
              isLoading={updateUser.isPending}
            />

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
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
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
                    {formatDate(
                      session.user.updated_at || session.user.created_at
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">
                    Last Sign In
                  </label>
                  <p className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDate(
                      session.user.last_sign_in_at || session.user.created_at
                    )}
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
                <Link to="/comments">
                  <Button className="flex items-center gap-2" variant={"brand"}>
                    <Database className="w-4 h-4" />
                    Manage Reviews
                  </Button>
                </Link>
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
            {session.user.app_metadata.providers.includes("email") && (
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
                  <Button
                    onClick={() => {
                      if (!session.user.email) return;
                      supabase.auth.resetPasswordForEmail(session.user.email, {
                        redirectTo:
                          import.meta.env.VITE_FRONTEND_URL +
                          "/auth/reset-password",
                      });
                      toast.success("Password reset link sent successfully!");
                    }}
                    variant="brand"
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Reset Password
                  </Button>
                </div>
              </div>
            )}

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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <Trash className="w-4 h-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="!text-red-500 !text-lg !font-semibold">
                        Are you sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your account. All data such
                        as reviews and pictures will be deleted.
                      </AlertDialogDescription>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={deleteUser.isPending}
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete Account
                          </Button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogHeader>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
