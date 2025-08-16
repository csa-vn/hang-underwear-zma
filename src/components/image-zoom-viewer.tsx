import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface ImageZoomViewerProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

interface ZoomModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

function ZoomModal({ src, alt, onClose }: ZoomModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle zoom
  const handleZoom = (delta: number, clientX?: number, clientY?: number) => {
    const newScale = Math.max(0.5, Math.min(5, scale + delta));

    if (
      clientX !== undefined &&
      clientY !== undefined &&
      containerRef.current
    ) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Zoom to cursor position
      const scaleRatio = newScale / scale;
      setPosition((prev) => ({
        x: prev.x * scaleRatio + x * (1 - scaleRatio),
        y: prev.y * scaleRatio + y * (1 - scaleRatio),
      }));
    }

    setScale(newScale);
  };

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(delta, e.clientX, e.clientY);
  };

  // Handle touch zoom (pinch)
  const [touchDistance, setTouchDistance] = useState(0);

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setTouchDistance(getTouchDistance(e.touches));
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 2 && touchDistance > 0) {
      // Pinch zoom
      const newDistance = getTouchDistance(e.touches);
      const delta = (newDistance - touchDistance) * 0.01;
      handleZoom(delta);
      setTouchDistance(newDistance);
    } else if (e.touches.length === 1 && isDragging) {
      // Pan
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchDistance(0);
  };

  // Handle mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset zoom
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoom(0.2);
          }}
          className="bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition"
        >
          ➕
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoom(-0.2);
          }}
          className="bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition"
        >
          ➖
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            resetZoom();
          }}
          className="bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition"
        >
          🔄
        </button>
        <button
          onClick={onClose}
          className="bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition"
        >
          ❌
        </button>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-none max-h-none transition-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            userSelect: "none",
            pointerEvents: "none",
          }}
          draggable={false}
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 p-2 rounded">
        <p>🖱️ Cuộn để zoom • 👆 Kéo để di chuyển</p>
        <p>📱 Pinch để zoom • ESC để đóng</p>
      </div>
    </div>,
    document.body
  );
}

export default function ImageZoomViewer({
  src,
  alt,
  className,
  onClick,
}: ImageZoomViewerProps) {
  const [showZoom, setShowZoom] = useState(false);

  const handleImageClick = () => {
    if (onClick) {
      onClick();
    }
    setShowZoom(true);
  };

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className} cursor-zoom-in transition-opacity hover:opacity-90`}
        onClick={handleImageClick}
      />
      {showZoom && (
        <ZoomModal src={src} alt={alt} onClose={() => setShowZoom(false)} />
      )}
    </>
  );
}
