import Link, { type LinkProps } from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonLinkProps extends Omit<LinkProps, "className"> {
  readonly children: ReactNode;
  readonly variant?: "primary" | "outline" | "danger" | "success";
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
}

const variantStyles = {
  primary:
    "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm hover:shadow-md",
  outline:
    "border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md",
  success:
    "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
  lg: "px-6 py-3 text-lg",
};

export function ButtonLink({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-block rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
