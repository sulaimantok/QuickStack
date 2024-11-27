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
import { DeploymentInfoModel } from "@/shared/model/deployment-info.model";

import { formatDateTime } from "@/frontend/utils/format.utils";
import LogsStreamed from "@/components/custom/logs-streamed";

export function LogsDialog({
  namespace,
  podName,
  onClose,
  children
}: {
  namespace: string;
  podName: string;
  onClose?: () => void;
  children: React.ReactNode;
}) {

  const [linesCountInput, setLinesCountInput] = React.useState<number>(100);
  const [linesCount, setLinesCount] = React.useState<number>(100);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={(isO) => {
      setIsOpen(isO);
      if (onClose && !isO) {
        onClose();
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1300px]">
        <DialogHeader>
          <DialogTitle>Logs</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Lines showed (default 100)" value={linesCountInput} onChange={(e) => setLinesCountInput(parseInt(e.target.value || '0'))}
            onBlur={(e) => {
              const value = parseInt(e.target.value || '0');
              if (value > 0) {
                setLinesCount(value);
              }
            }} />
          {(namespace && podName) ? <LogsStreamed namespace={namespace} podName={podName} linesCount={linesCount} fullHeight={true} /> : 'Currently there are no Logs available'}
        </div>
      </DialogContent>
    </Dialog>
  )
}
