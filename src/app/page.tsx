import { redirect } from "next/navigation";
import { getSessionIdentity } from "@/server/auth/session";
export default async function Home() {
    redirect((await getSessionIdentity()) ? "/dashboard" : "/login");
}
