'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deploy } from "./action";
import { AppExtendedModel } from "@/model/app-extended.model";

export default function AppActionButtons({
    app
}: {
    app: AppExtendedModel;
}) {

    return <Card>
        <CardContent className="p-4 flex gap-4">
            <Button onClick={() => deploy(app.id)}>Deploy</Button>
            <Button variant="secondary">Start</Button>
            <Button variant="secondary">Rebuild</Button>
        </CardContent>
    </Card >;
}