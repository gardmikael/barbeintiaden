"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Gallery, Item } from "react-photoswipe-gallery";
import type PhotoSwipe from "photoswipe";
import "photoswipe/dist/photoswipe.css";
import type { Photo } from "@/lib/db/photos";

interface PhotoGalleryProps {
  readonly initialPhotos: Photo[];
  readonly initialYears: number[];
}

interface PhotoThumbnailProps {
  readonly photo: Photo;
  readonly ref: (node: HTMLButtonElement | null) => void;
  readonly open: (e: React.MouseEvent) => void;
}

function PhotoThumbnail({ photo, ref, open }: PhotoThumbnailProps) {
  const handleClick = (e: React.MouseEvent) => {
    open(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const syntheticEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      }) as unknown as React.MouseEvent;
      open(syntheticEvent);
    }
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      type="button"
      className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 p-0 border-0 w-full"
    >
      <Image
        src={photo.url}
        alt={photo.title || "Bilde"}
        fill
        className="object-cover transition-transform group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      {photo.title && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white font-medium">{photo.title}</p>
          </div>
        </div>
      )}
    </button>
  );
}

function buildCaption(photo: Photo): string {
  const parts: string[] = [];
  if (photo.title) {
    parts.push(`<p style="font-weight: 500; color: white; margin-bottom: 0.5rem;">${photo.title}</p>`);
  }
  if (photo.description) {
    parts.push(`<p style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">${photo.description}</p>`);
  }
  return parts.join("");
}

interface YearSectionProps {
  readonly year: number;
  readonly photos: Photo[];
}

function YearSection({ year, photos }: YearSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-black dark:text-zinc-50">{year}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <Item
            key={photo.id}
            original={photo.url}
            thumbnail={photo.url}
            width="1600"
            height="1600"
            caption={buildCaption(photo)}
          >
            {({ ref, open }) => (
              <PhotoThumbnail photo={photo} ref={ref} open={open} />
            )}
          </Item>
        ))}
      </div>
    </div>
  );
}

export function PhotoGallery({ initialPhotos, initialYears }: PhotoGalleryProps) {
  const router = useRouter();
  const photoMapRef = useRef<Map<string, Photo>>(new Map());

  // Lag et map for rask oppslag av photo ID
  useEffect(() => {
    initialPhotos.forEach((photo) => {
      photoMapRef.current.set(photo.url, photo);
    });
  }, [initialPhotos]);

  if (initialPhotos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          Ingen bilder enda. Vær den første til å dele et bilde!
        </p>
      </div>
    );
  }

  // Grupper bilder etter årstall
  const photosByYear = initialPhotos.reduce((acc, photo) => {
    if (!acc[photo.year]) {
      acc[photo.year] = [];
    }
    acc[photo.year].push(photo);
    return acc;
  }, {} as Record<number, Photo[]>);

  const addCommentsButton = (pswpInstance: PhotoSwipe) => {
    const currentSlide = pswpInstance.currSlide;
    if (currentSlide) {
      const imgSrc = currentSlide.data?.src;
      const photo = imgSrc ? photoMapRef.current.get(imgSrc) : null;

      if (photo) {
        // Fjern eksisterende knapp hvis den finnes
        const existingButton = document.querySelector(".pswp-comments-button");
        if (existingButton) {
          existingButton.remove();
        }

        // Opprett ny knapp
        const button = document.createElement("button");
        button.className = "pswp-comments-button";
        button.textContent = "Se kommentarer";
        button.style.cssText = `
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          padding: 0.5rem 1rem;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          cursor: pointer;
          z-index: 10000;
          transition: background-color 0.2s;
        `;
        button.onmouseover = () => {
          button.style.backgroundColor = "#1d4ed8";
        };
        button.onmouseout = () => {
          button.style.backgroundColor = "#2563eb";
        };
        button.onclick = (e: MouseEvent) => {
          e.stopPropagation();
          pswpInstance.close();
          router.push(`/photos/${photo.id}`);
        };

        const pswpContainer = document.querySelector(".pswp");
        if (pswpContainer) {
          pswpContainer.appendChild(button);
        }
      }
    }
  };

  const removeCommentsButton = () => {
    const button = document.querySelector(".pswp-comments-button");
    if (button) {
      button.remove();
    }
  };

  return (
    <Gallery
      withCaption
      options={{
        spacing: 0.1,
        loop: false,
        maxZoomLevel: 4,
        initialZoomLevel: "fit",
        pinchToClose: false,
        close: true,
        escKey: true,
        arrowKeys: true,
        returnFocus: true,
        clickToCloseNonZoomable: true,
      }}
      onOpen={(pswpInstance) => {
        addCommentsButton(pswpInstance);

        // Legg til knapp når slide endres
        pswpInstance.on("change", () => {
          addCommentsButton(pswpInstance);
        });

        // Fjern knapp når lightbox lukkes
        pswpInstance.on("close", () => {
          removeCommentsButton();
        });
      }}
    >
      <div className="space-y-12">
        {initialYears.map((year) => {
          const yearPhotos = photosByYear[year] || [];
          return <YearSection key={year} year={year} photos={yearPhotos} />;
        })}
      </div>
    </Gallery>
  );
}
