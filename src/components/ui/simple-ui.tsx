import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        const variants: Record<string, string> = {
            default: "bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90",
            destructive: "bg-red-500 text-slate-50 shadow-sm hover:bg-red-500/90",
            outline: "border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900",
            secondary: "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-100/80",
            ghost: "hover:bg-slate-100 hover:text-slate-900",
            link: "text-slate-900 underline-offset-4 hover:underline",
        };
        const sizes: Record<string, string> = {
            default: "h-9 px-4 py-2",
            sm: "h-8 rounded-md px-3 text-xs",
            lg: "h-10 rounded-md px-8",
            icon: "h-9 w-9",
        };
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

// --- Card ---
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("rounded-xl border bg-card text-card-foreground shadow", className)} {...props} />
    )
)
Card.displayName = "Card"

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
    )
)
CardHeader.displayName = "CardHeader"

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
    )
)
CardTitle.displayName = "CardTitle"

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
    )
)
CardContent.displayName = "CardContent"

// --- Badge ---
export const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" | "outline" | "secondary" | "success" }>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            default: "border-transparent bg-slate-900 text-slate-50 shadow hover:bg-slate-900/80",
            secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
            destructive: "border-transparent bg-red-500 text-slate-50 shadow hover:bg-red-500/80",
            success: "border-transparent bg-green-500 text-slate-50 shadow hover:bg-green-500/80",
            outline: "text-slate-950 border-slate-200",
        }
        return (
            <div ref={ref} className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2", variants[variant], className)} {...props} />
        )
    }
)
Badge.displayName = "Badge"

// --- Alert ---
export const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" }>(
    ({ className, variant = "default", ...props }, ref) => (
        <div
            ref={ref}
            role="alert"
            className={cn(
                "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
                variant === "destructive" && "border-red-500/50 text-red-500 dark:border-red-500 [&>svg]:text-red-500",
                className
            )}
            {...props}
        />
    )
)
Alert.displayName = "Alert"

export const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
    )
)
AlertTitle.displayName = "AlertTitle"

export const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
    )
)
AlertDescription.displayName = "AlertDescription"
