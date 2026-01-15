"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
}

export function LazyImage({ src, className, alt, ...props }: LazyImageProps) {
  const [inView, setInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // Reset loaded state when src changes
    setIsLoaded(false)
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Ensure the element has dimensions (is not hidden via display: none)
            if (entry.boundingClientRect.width > 0 || entry.boundingClientRect.height > 0) {
              setInView(true)
              observer.disconnect()
            }
          }
        })
      },
      {
        rootMargin: "50px", // Preload slightly before appearing
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [src])

  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/20 z-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      <img
        ref={imgRef}
        src={inView ? src : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"}
        alt={alt}
        className={cn(
          className,
          "transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={(e) => {
            // Only mark as loaded if it's the real image, not the placeholder
            const currentSrc = e.currentTarget.src;
            if (currentSrc !== "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7") {
                setIsLoaded(true)
            }
        }}
        {...props}
      />
    </>
  )
}
