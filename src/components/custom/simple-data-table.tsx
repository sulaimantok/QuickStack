"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/column-header"
import { ReactNode, useEffect, useState } from "react"
import { DefaultDataTable } from "./default-data-table"
import { usePathname, useRouter } from "next/navigation"
import FullLoadingSpinner from "../ui/full-loading-spinnter"



export function SimpleDataTable<TData>({
    tableIdentifier,
    columns,
    data,
    actionCol,
    onItemClick,
    onItemClickLink,
    hideSearchBar = false,
}: {
    tableIdentifier?: string,
    columns: ([string, string, boolean, (item: TData) => ReactNode] | [string, string, boolean])[],
    data: TData[],
    hideSearchBar?: boolean,
    onItemClick?: (selectedItem: TData) => void,
    onItemClickLink?: (selectedItem: TData) => string,
    actionCol?: (selectedItem: TData) => ReactNode
}) {

    const router = useRouter();
    const pathName = usePathname();
    const [columnsWithVisability, setColumnsWithVisability] = useState<(([string, string, boolean, (item: TData) => ReactNode] | [string, string, boolean])[]) | undefined>(undefined);
    const [columnInputData, setColumnInputData] = useState<TData[] | undefined>(undefined);

    const setUserVisabilityForColumns = function <TData>(columns: ([string, string, boolean, (item: TData) => ReactNode] | [string, string, boolean])[]) {
        if (!columns) {
            return;
        }
        const configFromLocalstorage = window.localStorage.getItem(`tableConfig-${tableIdentifier ?? pathName}`) || undefined;
        let parsedConfig: [string, boolean][] = [];
        if (!!configFromLocalstorage) {
            parsedConfig = JSON.parse(configFromLocalstorage);
        }
        for (const col of columns) {
            const [accessorKey, header, isVisible] = col;
            const storedConfig = parsedConfig.find(([key]) => key === accessorKey);
            if (storedConfig) {
                col[2] = storedConfig[1];
            }
        }
    }

    const updateVisabilityConfig = (visabilityConfig: [string, boolean][]) => {
        window.localStorage.setItem(`tableConfig-${tableIdentifier ?? pathName}`, JSON.stringify(visabilityConfig));
    }

    useEffect(() => {
        setUserVisabilityForColumns(columns);
        setColumnsWithVisability(columns);
    }, [columns]);

    useEffect(() => {
        const outData = data.map((item) => {
            for (const [accessorKey, headerName, isVisible, customRowDefinition] of columns) {
                if (!customRowDefinition) {
                    continue;
                }
                (item as any)[accessorKey + '_generated'] = customRowDefinition(item);
            }
            return item;
        });
        setColumnInputData(outData);
    }, [data, columns]);

    if (!columnsWithVisability || !columnInputData) {
        return <FullLoadingSpinner />;
    }

    const globalFilterFn = (row: Row<TData>, columnHeaderNameNotWorking: string, searchTerm: string) => {
        if (!searchTerm || Array.isArray(searchTerm)) {
            return true;
        }
        const allCellValues = row.getAllCells().map(cell => {
            const headerName = cell.column.id;
            // if there is a custom column definition --> use it for filtering
            const columnDefinitionForFilter = columns.find(col => col[0] === headerName);
            if (columnDefinitionForFilter && columnDefinitionForFilter[3]) {
                const columnValue = columnDefinitionForFilter[3](row.original);
                if (typeof columnValue === 'string') {
                    return columnValue.toLowerCase();
                }
                return '';
            }
            // use default column value for filtering
            return String(cell.getValue() ?? '').toLowerCase();
        });
        return allCellValues.join(' ').includes(searchTerm.toLowerCase());
    };

    const indexOfFirstVisibleColumn = columnsWithVisability.findIndex(([_, __, isVisible]) => isVisible);
    const dataColumns = columnsWithVisability.map(([accessorKey, header, isVisible, customRowDefinition], columnIndex) => {

        const dataCol = {
            accessorKey,
            isVisible,
            headerName: header,
            filterFn: (row, searchTerm) => {
                const columnValue = ((customRowDefinition ? customRowDefinition(row.original) : (row.original as any)[accessorKey] as unknown as string) ?? '');
                console.log(columnValue)
                if (typeof columnValue === 'string') {
                    return columnValue.toLowerCase().includes(searchTerm.toLowerCase());
                }
                return false;
            },
            header: ({ column }: { column: any }) => header && (
                <DataTableColumnHeader column={column} title={header} />
            )
        } as ColumnDef<TData>;

        if (customRowDefinition) {
            dataCol.cell = ({ row }) => customRowDefinition(row.original);
        }

        if (onItemClick && columnIndex === indexOfFirstVisibleColumn) {
            dataCol.cell = ({ row }) => {
                const item = row.original;
                return (
                    <div className="cursor-pointer" onClick={() => onItemClick(item)}>
                        {customRowDefinition ? customRowDefinition(item) : (row.original as any)[accessorKey] as unknown as string}
                    </div>
                );
            };
        }

        if (onItemClickLink && columnIndex === indexOfFirstVisibleColumn) {
            dataCol.cell = ({ row }) => {
                const item = row.original;
                return (
                    <div className="cursor-pointer" onClick={() => router.push(onItemClickLink(item))}>
                        {customRowDefinition ? customRowDefinition(item) : (row.original as any)[accessorKey] as unknown as string}
                    </div>
                );
            };
        }

        return dataCol;
    });

    const finalCols: ColumnDef<TData>[] = [
        ...dataColumns
    ];

    if (actionCol) {
        finalCols.push({
            id: "actions",
            cell: ({ row }) => {
                const property = row.original;
                return actionCol(property);
            },
        });
    }

    return <DefaultDataTable globalFilterFn={globalFilterFn} columns={finalCols} data={columnInputData} hideSearchBar={hideSearchBar} onColumnVisabilityUpdate={updateVisabilityConfig} />
}
