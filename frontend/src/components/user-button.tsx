import { useSession } from "@/context/session-context";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { GeneratedAvatar } from "./generated-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import { LogOutIcon } from "lucide-react";
import supabase from "@/supabase";

const UserButton = () => {
  const { session } = useSession();

  if (!session) {
    return <Skeleton className="size-9 rounded-full" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        {session.user.user_metadata.picture ? (
          <Avatar className="size-9">
            <AvatarImage src={session.user.user_metadata.picture} />
            <AvatarFallback>{session.user.user_metadata.name}</AvatarFallback>
          </Avatar>
        ) : (
          <GeneratedAvatar
            seed={session.user.user_metadata.name || "B"}
            className="size-9 mr-3"
          />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium truncate">
              {session.user.user_metadata.name || "User"}
            </span>
            <span className="font-normal text-sm text-muted-foreground truncate">
              {session.user.email || "Email"}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            supabase.auth.signOut();
          }}
          className="cursor-pointer flex items-center justify-between"
        >
          Logout <LogOutIcon className="size-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
