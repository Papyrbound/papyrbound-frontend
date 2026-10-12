import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
<<<<<<< HEAD
      className={cn("animate-pulse rounded-2xl bg-muted", className)}
=======
      className={cn("animate-pulse rounded-md bg-muted", className)}
>>>>>>> ffc4d700659f5630b3cf220aaac2e7c869e897f7
      {...props}
    />
  )
}

export { Skeleton }
