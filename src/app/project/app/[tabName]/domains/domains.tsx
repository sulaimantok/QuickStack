'use client';

import { SubmitButton } from "@/components/custom/submit-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AppExtendedModel } from "@/model/app-extended.model";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckIcon, CrossIcon, DeleteIcon, EditIcon, TrashIcon, XIcon } from "lucide-react";
import DialogEditDialog from "./domain-edit-overlay";
import { Toast } from "@/lib/toast.utils";
import { deleteDomain } from "./actions";
import { ListUtils } from "@/server/utils/list.utils";
import { StringUtils } from "@/server/utils/string.utils";
import { Code } from "@/components/custom/code";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OpenInNewWindowIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";


export default function DomainsList({ app }: {
    app: AppExtendedModel
}) {
    return <>
        <Card>
            <CardHeader>
                <CardTitle>Domains</CardTitle>
                <CardDescription>Add custom domains to your application. If your app has a domain configured, it will be public and accessible via the internet.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableCaption>{app.appDomains.length} Domains</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Port</TableHead>
                            <TableHead>SSL</TableHead>
                            <TableHead>Redirect HTTP to HTTPS</TableHead>
                            <TableHead className="w-[100px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {app.appDomains.map(domain => (
                            <TableRow key={domain.hostname}>
                                <TableCell className="font-medium flex gap-2">
                                    <Code>{domain.hostname}</Code>
                                    <div className="self-center cursor-pointer" onClick={() => window.open((domain.useSsl ? 'https://' : 'http://') + domain.hostname, '_blank')}>
                                        <OpenInNewWindowIcon />
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{domain.port}</TableCell>
                                <TableCell className="font-medium">{domain.useSsl ? <CheckIcon /> : <XIcon />}</TableCell>
                                <TableCell className="font-medium">{domain.useSsl && domain.redirectHttps ? <CheckIcon /> : <XIcon />}</TableCell>
                                <TableCell className="font-medium flex gap-2">
                                    <DialogEditDialog appId={app.id} domain={domain}>
                                        <Button variant="ghost"><EditIcon /></Button>
                                    </DialogEditDialog>
                                    <Button variant="ghost" onClick={() => Toast.fromAction(() => deleteDomain(domain.id))}>
                                        <TrashIcon />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <DialogEditDialog appId={app.id}>
                    <Button>Add Domain</Button>
                </DialogEditDialog>
            </CardFooter>
        </Card >

    </>;
}