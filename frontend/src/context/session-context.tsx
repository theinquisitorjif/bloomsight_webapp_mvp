import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../supabase/index";
import { type Session } from "@supabase/supabase-js";

const SessionContext = createContext<{
  session: Session | null;
}>({
  session: null,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

type Props = { children: React.ReactNode };
export const SessionProvider = ({ children }: Props) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStateListener = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);
        setIsLoading(false);
      }
    );

    return () => {
      authStateListener.data.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  return (
    <SessionContext.Provider value={{ session }}>
      {isLoading ? <div>Loading...</div> : children}
    </SessionContext.Provider>
  );
};
