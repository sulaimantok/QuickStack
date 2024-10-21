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
import React from "react";
import LoadingSpinner from "../ui/loading-spinner";
import { set } from "date-fns";

export function InputDialog({
  children,
  title,
  description,
  fieldName,
  OKButton = 'OK',
  CancelButton = 'Cancel',
  onResult
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  fieldName: string;
  OKButton?: string;
  CancelButton?: string;
  onResult: (result: string | undefined) => boolean | Promise<boolean>;
}) {

  const [value, setValue] = React.useState<string>("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string>("");

  const submit = async () => {
    try {
      if (!value) {
        return;
      }
      setIsLoading(true);
      setErrorMessages("");
      const result = await onResult(value);
      if (result === true) {
        setIsOpen(false);
        setValue("");
      } else {
        setErrorMessages(result || "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isO) => setIsOpen(isO)}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={fieldName} className="text-right">
              {fieldName}
            </Label>
            <Input disabled={isLoading} id={fieldName}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  submit();
                }
              }}
              className="col-span-3"
            />
          </div>
        </div>
        <p className="text-sm text-right text-red-500">{errorMessages}</p>
        <DialogFooter>
          <Button disabled={isLoading} onClick={submit}>{isLoading ? <LoadingSpinner /> : OKButton}</Button>
          <Button disabled={isLoading} variant="secondary" onClick={() => {
            onResult(undefined);
            setValue("");
            setIsOpen(false);
          }}>{CancelButton}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
