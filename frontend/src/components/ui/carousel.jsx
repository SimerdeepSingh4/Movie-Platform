import * as React from "react"
import useEmblaCarousel from "embla-carousel-react";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

const CarouselContext = React.createContext(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}) {
  const [carouselRef, api] = useEmblaCarousel({
    align: "start",
    slidesToScroll: "auto",
    ...opts,
    axis: orientation === "horizontal" ? "x" : "y",
  }, plugins)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback((event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      scrollPrev()
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      scrollNext()
    }
  }, [scrollPrev, scrollNext])

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)
    api.on("scroll", onSelect)
    api.on("settle", onSelect)

    return () => {
      api?.off("select", onSelect)
      api?.off("scroll", onSelect)
      api?.off("settle", onSelect)
    };
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}>
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({
  className,
  ...props
}) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content">
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props} />
    </div>
  );
}

function CarouselItem({
  className,
  ...props
}) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props} />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  // JioHotstar edge gradient paddle style
  if (variant === "edge") {
    if (!canScrollPrev) return null

    return (
      <button
        type="button"
        data-slot="carousel-previous"
        aria-label="Previous slide"
        onClick={scrollPrev}
        className={cn(
          "hidden md:flex absolute top-0 bottom-0 left-0 z-30 w-16 sm:w-20 items-center justify-start pl-2 sm:pl-3 bg-gradient-to-r from-black/90 via-black/40 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 cursor-pointer focus:outline-none pointer-events-none group-hover/row:pointer-events-auto",
          className
        )}
        {...props}
      >
        <ChevronLeftIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] transition-transform duration-200 hover:scale-125" />
      </button>
    )
  }

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn("absolute touch-manipulation rounded-full", orientation === "horizontal"
        ? "top-1/2 -left-12 -translate-y-1/2"
        : "-top-12 left-1/2 -translate-x-1/2 rotate-90", className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}>
      <ChevronLeftIcon />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  // JioHotstar edge gradient paddle style
  if (variant === "edge") {
    if (!canScrollNext) return null

    return (
      <button
        type="button"
        data-slot="carousel-next"
        aria-label="Next slide"
        onClick={scrollNext}
        className={cn(
          "hidden md:flex absolute top-0 bottom-0 right-0 z-30 w-16 sm:w-20 items-center justify-end pr-2 sm:pr-3 bg-gradient-to-l from-black/90 via-black/40 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 cursor-pointer focus:outline-none pointer-events-none group-hover/row:pointer-events-auto",
          className
        )}
        {...props}
      >
        <ChevronRightIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] transition-transform duration-200 hover:scale-125" />
      </button>
    )
  }

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn("absolute touch-manipulation rounded-full", orientation === "horizontal"
        ? "top-1/2 -right-12 -translate-y-1/2"
        : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90", className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}>
      <ChevronRightIcon />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, useCarousel };
