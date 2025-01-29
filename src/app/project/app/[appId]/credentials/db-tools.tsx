import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppExtendedModel } from "@/shared/model/app-extended.model";
import DbGateDbTool from "./db-gate";

export default function DbToolsCard({
    app
}: {
    app: AppExtendedModel;
}) {

    return <>
        <Card>
            <CardHeader>
                <CardTitle>Database Access</CardTitle>
                <CardDescription>Activate one of the following tools to access the database through your browser.</CardDescription>
            </CardHeader>
            <CardContent>
                <DbGateDbTool app={app} />
            </CardContent>
        </Card >
    </>;
}
