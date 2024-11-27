'use client';

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppExtendedModel } from "@/shared/model/app-extended.model";



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