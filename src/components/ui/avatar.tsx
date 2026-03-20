"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
  {
    variants: {
      size: {
        sm: "size-7 text-xs",
        md: "size-9 text-sm",
        lg: "size-11 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

interface AvatarProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof avatarVariants> {
  src?: string | null
  alt?: string
  fallback?: string
}

function Avatar({
  className,
  size,
  src,
  alt = "",
  fallback,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)

  React.useEffect(() => {
    setImgError(false)
  }, [src])

  const showImage = src && !imgError
  const initials = fallback?.charAt(0).toUpperCase()

  return (
    <span className={cn(avatarVariants({ size }), className)} {...props}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="size-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="flex size-full items-center justify-center bg-linear-to-br from-sky-400 to-blue-600 font-semibold text-white">
          {initials ?? (
            <svg
              className="size-[60%] text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          )}
        </span>
      )}
    </span>
  )
}

export { Avatar, avatarVariants }
