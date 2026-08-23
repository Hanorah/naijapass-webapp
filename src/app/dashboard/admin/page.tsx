import { redirect } from "next/navigation";

/** Admin lives at /admin — keep this route for old bookmarks. */
export default function LegacyAdminRedirect() {
  redirect("/admin");
}
