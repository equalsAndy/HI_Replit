import { useLogout } from "@/hooks/use-logout";

export function LogoutButton() {
  const appLogout = useLogout();
  return (
    <button
      onClick={() => appLogout.mutate()}
    >
      Log out
    </button>
  );
}

export default LogoutButton;
