'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import React from "react";
import { useConfirmDialog } from "@/lib/zustand.states";

export function ConfirmDialog() {
  const { isDialogOpen, data, closeDialog } = useConfirmDialog();
  if (!data) {
    return <></>;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{data.title}</DialogTitle>
          <DialogDescription>
            {data.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => closeDialog(true)}>{data.yesButton ?? 'OK'}</Button>
          <Button variant="secondary" onClick={() => closeDialog(false)}>{data.noButton ?? 'Cancel'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
