'use client'

import { toast } from "sonner";

export function Code({ children, copieable = true }: { children: string | null | undefined, copieable?: boolean }) {
    return (children &&
        <code className={'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold ' + (copieable ? 'cursor-pointer' : '')}
            onClick={() => {
                if (!copieable) return;
                navigator.clipboard.writeText(children || '');
                toast.success('Copied to clipboard');
            }}>
            {children}
        </code>
    )
}