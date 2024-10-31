import { SimpleDataTable } from "@/components/custom/simple-data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format.utils";
import { AppExtendedModel } from "@/model/app-extended.model";
import { BuildJobModel } from "@/model/build-job";

export default function BuildsTab({
    app,
    appBuilds
}: {
    app: AppExtendedModel;
    appBuilds: BuildJobModel[];
}) {

    if (app.sourceType === 'container') {
        return <></>;
    }

    return <>
        <Card>
            <CardHeader>
                <CardTitle>Container Builds</CardTitle>
                <CardDescription>This is an overview of the last container builds for this App.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <SimpleDataTable columns={[
                    ['name', 'Name', false],
                    ['status', 'Status', true],
                    ["startTime", "Started At", true, (item) => formatDateTime(item.startTime)],
                ]}
                    data={appBuilds}
                    hideSearchBar={true}
                    actionCol={(item) =>
                        <>
                            <div className="flex">
                                <div className="flex-1"></div>
                                <div>TODO BUTTON</div>
                            </div>
                        </>}
                />

            </CardContent>
        </Card >
    </>;
}
