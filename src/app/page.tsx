import ProjectPage from "./projects/project-page";
import paramService, { ParamService } from "@/server/services/param.service";
import HostnameCheck from "./settings/server/hostname-check";

export default async function Home() {
  return <>
    <ProjectPage />
    <HostnameCheck />
  </>;
}
