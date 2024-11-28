import { FsUtils } from "@/server/utils/fs.utils";
import { PathUtils } from "@/server/utils/path.utils";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from 'fs/promises';

export const dynamic = 'force-dynamic' // defaults to auto

export async function GET(request: NextRequest) {
    try {
        const requestUrl = new URL(request.url);
        const fileName = requestUrl.searchParams.get('fileName');
        if (!fileName) {
            throw new Error('No file name provided.');
        }

        const dirOfTempDoanloadedData = PathUtils.tempVolumeDownloadPath;
        const tarPath = path.join(dirOfTempDoanloadedData, fileName);
        if (!await FsUtils.fileExists(tarPath)) {
            throw new Error(`File ${fileName} does not exist.`);
        }

        const buffer = await fs.readFile(tarPath);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="data.tar.gz"`,
            },
        });
    } catch (error) {
        console.error('Error while downloading data:', error);
        return new Response((error as Error)?.message ?? 'An unknown error occured.', { status: 500 });
    }
}