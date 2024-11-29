'use client'

import { useSession } from "@/hooks/use-session";

export default function ClientComponent() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please log in</div>;
  }

  return (
    <div className="bg-slate-100 m-4">
      <h1>This is from client component</h1>
      <h1>Session id: {session.userId}</h1>
    </div>
  );
}
