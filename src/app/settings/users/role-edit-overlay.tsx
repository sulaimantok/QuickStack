'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useFormState } from 'react-dom'
import { useEffect, useState } from "react";
import { FormUtils } from "@/frontend/utils/form.utilts";
import { SubmitButton } from "@/components/custom/submit-button";
import { ServerActionResult } from "@/shared/model/server-action-error-return.model"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { saveRole } from "./actions"
import { RoleExtended } from "@/shared/model/role-extended.model.ts"
import { RoleEditModel, roleEditZodModel } from "@/shared/model/role-edit.model"


export default function RoleEditOverlay({ children, role }: {
  children: React.ReactNode;
  role?: RoleExtended;
}) {

  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const form = useForm<RoleEditModel>({
    resolver: zodResolver(roleEditZodModel),
    defaultValues: role
  });

  const [state, formAction] = useFormState((state: ServerActionResult<any, any>,
    payload: RoleEditModel) =>
      saveRole(state, {
      ...payload,
      id: role?.id
    }), FormUtils.getInitialFormState<typeof roleEditZodModel>());

  useEffect(() => {
    if (state.status === 'success') {
      form.reset();
      toast.success('Role saved successfully');
      setIsOpen(false);
    }
    FormUtils.mapValidationErrorsToForm<typeof roleEditZodModel>(state, form);
  }, [state]);

  useEffect(() => {
    if (role) {
      form.reset(role);
    }
  }, [role]);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>
      <Dialog open={!!isOpen} onOpenChange={(isOpened) => setIsOpen(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{role?.id ? 'Edit' : 'Create'} Role</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="px-2">
              <Form {...form}>
                <form action={(e) => form.handleSubmit((data) => {
                  return formAction(data);
                })()}>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />


                    <p className="text-red-500">{state.message}</p>
                    <SubmitButton>Save</SubmitButton>
                  </div>
                </form>
              </Form >
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )



}