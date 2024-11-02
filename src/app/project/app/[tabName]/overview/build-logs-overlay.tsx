import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { useEffect } from "react";
import { set } from "date-fns";
import { DeploymentInfoModel } from "@/model/deployment-info.model";
import LogsStreamed from "./logs-streamed";
import { formatDate } from "@/lib/format.utils";
import { podLogsSocket } from "@/lib/sockets";

export function BuildLogsDialog({
  deploymentInfo,
  onClose
}: {
  deploymentInfo?: DeploymentInfoModel;
  onClose: () => void;
}) {

  if (!deploymentInfo) {
    return <></>;
  }

  return (
    <Dialog open={!!deploymentInfo} onOpenChange={(isO) => {
      podLogsSocket.emit('leavePodLog', { streamKey: deploymentInfo.buildJobName });
      onClose();
    }}>
      <DialogContent className="w-[70%]">
        <DialogHeader>
          <DialogTitle>Build Logs</DialogTitle>
          <DialogDescription>
            View the build logs for the selected deployment {formatDate(deploymentInfo.createdAt)}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!deploymentInfo.buildJobName && 'For this build is no log available'}
          {deploymentInfo.buildJobName && <LogsStreamed buildJobName={deploymentInfo.buildJobName} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
