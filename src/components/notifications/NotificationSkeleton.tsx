import { Skeleton } from '@/components/ui/skeleton'


export function NotificationSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border bg-background p-3">
                    <div className="flex gap-3">
                        <Skeleton className="h-9 w-9 rounded-2xl" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="mt-2 h-4 w-full" />
                            <Skeleton className="mt-2 h-4 w-2/3" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}