'use client';

import { SubmitButton } from "@/components/custom/submit-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormUtils } from "@/lib/form.utilts";
import { AppSourceInfoInputModel, appSourceInfoInputZodModel } from "@/model/app-source-info.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useFormState } from "react-dom";
import { ServerActionResult } from "@/model/server-action-error-return.model";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { AppRateLimitsModel, appRateLimitsZodModel } from "@/model/app-rate-limits.model";
import { App } from "@prisma/client";
import { useEffect } from "react";
import { toast } from "sonner";
import { AppEnvVariablesModel, appEnvVariablesZodModel } from "@/model/env-edit.model";
import { Textarea } from "@/components/ui/textarea";
import { AppExtendedModel } from "@/model/app-extended.model";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckIcon, CrossIcon, DeleteIcon, EditIcon, TrashIcon, XIcon } from "lucide-react";
import DialogEditDialog from "./storage-edit-overlay";
import { Toast } from "@/lib/toast.utils";
import { deleteVolume } from "./actions";
import { getPvcUsage } from "./actions";
import pvcStatusService from "@/server/services/pvc.status.service";


export default function MonitoringList({ app }: {
    app: AppExtendedModel
}) {
    return <>
        <Card>
            <CardHeader>
                <CardTitle>Monitoring</CardTitle>
                <CardDescription>Hier wird das Monitoring angezeigt</CardDescription>
            </CardHeader>
        </Card >

    </>;
}