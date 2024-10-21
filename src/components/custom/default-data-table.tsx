"use client"
import * as React from "react"

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
    getPaginationRowModel,
    VisibilityState,
    getSortedRowModel,
    filterFns,
    FilterFnOption
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/ui/pagignation"
import { DataTableViewOptions } from "@/components/ui/column-toggle"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DefaultDataTable<TData, TValue>({
    columns,
    data,
    globalFilterFn,
    hideSearchBar = false,
    onColumnVisabilityUpdate
}: DataTableProps<TData, TValue> & {
    hideSearchBar?: boolean,
    onColumnVisabilityUpdate?: (visabilityConfig: [string, boolean][]) => void
    globalFilterFn?: FilterFnOption<any> | undefined
}) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    );
    const [globalFilter, setGlobalFilter] = React.useState<any>([])

    const initialVisabilityState = columns.filter(col => (col as any).isVisible === false).reduce((acc, col) => {
        acc[(col as any).accessorKey] = false;
        return acc;
    }, {} as VisibilityState);

    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>(initialVisabilityState);

    React.useEffect(() => {
        if (onColumnVisabilityUpdate) {
            onColumnVisabilityUpdate(table.getAllColumns().filter(x => (x.columnDef as any).accessorKey).map(x => [(x.columnDef as any).accessorKey, x.getIsVisible()]));
        }
    }, [columnVisibility]);


    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        enableGlobalFilter: true,
        globalFilterFn: globalFilterFn ?? filterFns.includesString,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            globalFilter
        },
    })

    return (
        <div>
            <div className="flex items-center py-4">
                {!hideSearchBar && <Input
                    placeholder="Search..."
                    value={globalFilter ?? ""}
                    onChange={(event: any) =>
                        table.setGlobalFilter(String(event.target.value))
                    }
                    className="max-w-sm"
                />}
                <DataTableViewOptions table={table} />

            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No elements to show.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="mt-4">
                <DataTablePagination table={table} />
            </div>
        </div>
    )
}
