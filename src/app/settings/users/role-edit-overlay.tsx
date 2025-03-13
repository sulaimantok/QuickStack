'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
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
import { RolePermissionEnum } from "@/shared/model/role-extended.model.ts"
import { RoleEditModel, roleEditZodModel } from "@/shared/model/role-edit.model"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProjectExtendedModel } from "@/shared/model/project-extended.model"
import { UserRole } from "@/shared/model/sim-session.model"


type UiProjectPermission = {
  projectId: string;
  createApps: boolean;
  deleteApps: boolean;
  writeApps: boolean;
  readApps: boolean;
  roleAppPermissions: {
    appId: string;
    permission: RolePermissionEnum;
  }[];
};

export default function RoleEditOverlay({ children, role, projects }: {
  children: React.ReactNode;
  role?: UserRole;
  projects: ProjectExtendedModel[]
}) {

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [projectPermissions, setProjectPermissions] = useState<UiProjectPermission[]>([]);

  const form = useForm<RoleEditModel>({
    resolver: zodResolver(roleEditZodModel),
    defaultValues: role
  });

  const [state, formAction] = useFormState((state: ServerActionResult<any, any>,
    payload: RoleEditModel) =>
    saveRole(state, {
      ...payload,
      id: role?.id,
      /* roleProjectPermissions: projects.map((project) => ({
         projectId: project.id,
         createApps: appPermissions.some((perm) => perm.appId === project.id && perm.readwrite),
         deleteApps: appPermissions.some((perm) => perm.appId === project.id && perm.readwrite),
         writeApps: appPermissions.some((perm) => perm.appId === project.id && perm.readwrite),
         readApps: appPermissions.some((perm) => perm.appId === project.id && (perm.read || perm.readwrite)),
         roleAppPermissions: appPermissions
           .filter((perm) => perm.appId === project.id)
           .map((perm) => ({
             appId: perm.appId,
             permission: perm.readwrite ? RolePermissionEnum.READWRITE : (perm.read ? RolePermissionEnum.READ : '')
           }))
       }))*/
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
      // Initialize app permissions based on role data
      const initialPermissions = projects.map(project => {
        const existingPermission = role.roleProjectPermissions?.find(p => p.projectId === project.id);
        return {
          projectId: project.id,
          createApps: existingPermission?.createApps || false,
          deleteApps: existingPermission?.deleteApps || false,
          writeApps: existingPermission?.writeApps || false,
          readApps: existingPermission?.readApps || false,
          roleAppPermissions: existingPermission?.roleAppPermissions || []
        } as UiProjectPermission;
      });
      setProjectPermissions(initialPermissions);
    } else {
      // Initialize with all apps having no permissions
      const initialPermissions = projects.map(project => ({
        projectId: project.id,
        createApps: false,
        deleteApps: false,
        writeApps: false,
        readApps: false,
        roleAppPermissions: []
      } as UiProjectPermission));
      setProjectPermissions(initialPermissions);

    }
  }, [role, projects]);


  const handleReadChange = (projectId: string, checked: boolean) => {
    setProjectPermissions(prev => prev.map(perm => {
      if (perm.projectId === projectId) {
        // If read is being turned off, also turn off readwrite
        if (!checked) {
          return { ...perm, readApps: false, readwrite: false };
        }
        // If read is being turned on, just update read
        return { ...perm, readApps: checked };
      }
      return perm;
    }));
  };

  const handleReadWriteChange = (projectId: string, checked: boolean) => {
    setProjectPermissions(prev => prev.map(perm => {
      if (perm.projectId === projectId) {
        // If readwrite is being turned on, turn off read
        if (checked) {
          return { ...perm, readApps: true, writeApps: true } as UiProjectPermission;
        }
        // If readwrite is being turned off, just update read
        return { ...perm, readApps: perm.readApps, writeApps: checked } as UiProjectPermission;
      }
      return perm;
    }));
  };

  const handleCreateChange = (projectId: string, checked: boolean) => {
    setProjectPermissions(prev => prev.map(perm => {
      if (perm.projectId === projectId) {
        return { ...perm, createApps: checked };
      }
      return perm;
    }));
  };

  const handleDeleteChange = (projectId: string, checked: boolean) => {
    setProjectPermissions(prev => prev.map(perm => {
      if (perm.projectId === projectId) {
        return { ...perm, deleteApps: checked };
      }
      return perm;
    }));
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>
      <Dialog open={!!isOpen} onOpenChange={(isOpened) => setIsOpen(isOpened)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{role?.id ? 'Edit' : 'Create'} Role</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="px-3">
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

                    <FormField
                      control={form.control}
                      name="canAccessBackups"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Can access backups
                            </FormLabel>
                            <FormDescription>
                              If enabled, users can access the backups page and download backups from all apps.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="pt-3">
                      <h3 className="text-sm font-medium mb-2">App Permissions</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Project</TableHead>
                            <TableHead>Read Apps</TableHead>
                            <TableHead>Write Apps</TableHead>
                            <TableHead>Create Apps</TableHead>
                            <TableHead>Delete Apps</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {projects.map((project) => {
                            const permission = projectPermissions.find(p => p.projectId === project.id);
                            return (
                              <TableRow key={project.id}>
                                <TableCell>{project.name}</TableCell>
                                <TableCell>
                                  <Checkbox
                                    id={`read-${project.id}`}
                                    checked={permission?.readApps || false}
                                    onCheckedChange={(checked) => handleReadChange(project.id, !!checked)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Checkbox
                                    id={`write-${project.id}`}
                                    checked={permission?.writeApps || false}
                                    onCheckedChange={(checked) => handleReadWriteChange(project.id, !!checked)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Checkbox
                                    id={`create-${project.id}`}
                                    checked={permission?.createApps || false}
                                    onCheckedChange={(checked) => handleCreateChange(project.id, !!checked)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Checkbox
                                    id={`delete-${project.id}`}
                                    checked={permission?.deleteApps || false}
                                    onCheckedChange={(checked) => handleDeleteChange(project.id, !!checked)}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    <p className="text-red-500">{state.message}</p>
                    <SubmitButton>Save</SubmitButton>
                  </div>
                </form>
              </Form >
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog >
    </>
  )
}