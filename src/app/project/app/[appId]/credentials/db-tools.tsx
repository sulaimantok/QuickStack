import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppExtendedModel } from "@/shared/model/app-extended.model";
import DbGateDbTool from "./db-gate-db-tool";
import PhpMyAdminDbTool from "./phpmyadmin-db-tool";

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
            <CardContent className="space-y-4">
                <DbGateDbTool app={app} />
                {['MYSQL', 'MARIADB'].includes(app.appType) && <PhpMyAdminDbTool app={app} />}
            </CardContent>
        </Card >
    </>;
}
