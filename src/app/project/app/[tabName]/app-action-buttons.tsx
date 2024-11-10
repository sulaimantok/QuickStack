'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deploy, startApp, stopApp } from "./action";
import { AppExtendedModel } from "@/model/app-extended.model";
import { Toast } from "@/lib/toast.utils";
import AppStatus from "./app-status";

export default function AppActionButtons({
    app
}: {
    app: AppExtendedModel;
}) {
    return <Card>
        <CardContent className="p-4 flex gap-4">
            <div className="self-center"><AppStatus appId={app.id} /></div>
            <Button onClick={() => Toast.fromAction(() => deploy(app.id))}>Deploy</Button>
            <Button onClick={() => Toast.fromAction(() => startApp(app.id))} variant="secondary">Start</Button>
            <Button onClick={() => Toast.fromAction(() => stopApp(app.id))} variant="secondary">Stop</Button>
            <Button variant="secondary">Rebuild</Button>
        </CardContent>
    </Card >;
}