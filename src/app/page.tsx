import ProjectPage from "./projects/project-page";
import paramService, { ParamService } from "@/server/services/param.service";
import HostnameCheck from "../components/custom/hostname-check";

export default async function Home() {
  const configuredDomain = await paramService.getString(ParamService.QS_SERVER_HOSTNAME);
  return <>
    <ProjectPage />
    <HostnameCheck serverParamHostname={configuredDomain} />
  </>;
}
