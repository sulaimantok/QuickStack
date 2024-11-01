import { redirect } from "next/navigation";

// redirects to default route "general" for the app
export async function GET(request: Request) {
    const url = new URL(request.url);
    redirect(`/project/app/overview?appId=${url.searchParams.get("appId")}`);
}