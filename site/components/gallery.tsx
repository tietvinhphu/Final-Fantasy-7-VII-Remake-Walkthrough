import type { Img } from "@/lib/content";
import { withBase } from "@/lib/utils";

/**
 * Lưới ảnh minh họa. Ảnh đầu hiện bản lớn, các ảnh sau dùng ảnh thu nhỏ; bấm để xem bản gốc (lightbox).
 * Có sẵn width/height để không nhảy bố cục khi tải.
 */
export function Gallery({ images, group, caption, className = "" }: { images: Img[]; group: string; caption: string; className?: string }) {
  if (!images.length) return null;
  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`} role="group" aria-label={`Hình minh họa: ${caption}`}>
      {images.map((im, i) => {
        const first = i === 0;
        const odd = images.length > 2 && i === images.length - 1 && images.length % 2 === 0; // dòng cuối lẻ
        const useFull = first || !im.hasThumb;
        return (
          <a
            key={im.src}
            href={withBase(im.src)}
            data-lightbox=""
            data-gallery={group}
            data-cap={caption}
            className={`group relative block overflow-hidden rounded-md border border-line bg-panel-2 ${first || odd ? "col-span-2" : ""}`}
          >
            <img
              src={withBase(useFull ? im.src : im.thumb)}
              width={useFull ? 1024 : 560}
              height={useFull ? 576 : 315}
              loading="lazy"
              decoding="async"
              alt={`${caption}, hình ${i + 1} trên ${images.length}`}
              className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </a>
        );
      })}
    </div>
  );
}
