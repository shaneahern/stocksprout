import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut } from "lucide-react";

interface PhotoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (croppedImageUrl: string) => void;
  title?: string;
}

export default function PhotoEditorModal({
  isOpen,
  onClose,
  imageUrl,
  onSave,
  title = "Edit Photo"
}: PhotoEditorModalProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load image and reset position/zoom when modal opens
  useEffect(() => {
    if (isOpen && imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        setPosition({ x: 0, y: 0 });
        setZoom(1);
      };
    }
  }, [isOpen, imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for output
    const outputSize = 300;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const img = imageRef.current;
    const containerSize = 300; // Preview container size

    // Calculate the base display size (before zoom) - how the image fits in the container
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let baseDisplayWidth, baseDisplayHeight;
    
    if (imgAspect > 1) {
      // Wider image - constrained by width
      baseDisplayWidth = containerSize;
      baseDisplayHeight = containerSize / imgAspect;
    } else {
      // Taller image - constrained by height
      baseDisplayHeight = containerSize;
      baseDisplayWidth = containerSize * imgAspect;
    }

    // Apply zoom to get actual display size
    const displayWidth = baseDisplayWidth * zoom;
    const displayHeight = baseDisplayHeight * zoom;

    // Calculate where the top-left corner of the image is displayed
    // The image is centered, then offset by position
    const imageDisplayX = (containerSize - displayWidth) / 2 + position.x;
    const imageDisplayY = (containerSize - displayHeight) / 2 + position.y;

    // We want to crop the part of the image that's visible in the circle (entire 300x300 container)
    // Convert display coordinates to source image coordinates
    const pixelScale = img.naturalWidth / displayWidth; // How many source pixels per display pixel

    // Calculate source coordinates
    // sourceX = how far into the source image does the left edge of the crop area (x=0) correspond to
    const sourceX = (0 - imageDisplayX) * pixelScale;
    const sourceY = (0 - imageDisplayY) * pixelScale;
    const sourceSize = containerSize * pixelScale;

    // Clamp to image bounds
    const clampedSourceX = Math.max(0, Math.min(sourceX, img.naturalWidth));
    const clampedSourceY = Math.max(0, Math.min(sourceY, img.naturalHeight));
    const clampedSourceWidth = Math.min(sourceSize, img.naturalWidth - clampedSourceX);
    const clampedSourceHeight = Math.min(sourceSize, img.naturalHeight - clampedSourceY);

    // Calculate destination position if we had to clamp
    const destX = clampedSourceX > sourceX ? (clampedSourceX - sourceX) / pixelScale : 0;
    const destY = clampedSourceY > sourceY ? (clampedSourceY - sourceY) / pixelScale : 0;
    const destWidth = clampedSourceWidth / pixelScale;
    const destHeight = clampedSourceHeight / pixelScale;

    // Draw circular clipped image
    ctx.save();
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Draw the cropped portion
    ctx.drawImage(
      img,
      clampedSourceX,
      clampedSourceY,
      clampedSourceWidth,
      clampedSourceHeight,
      destX,
      destY,
      destWidth,
      destHeight
    );

    ctx.restore();

    // Convert to base64
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSave(croppedImageUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview Area */}
          <div 
            ref={containerRef}
            className="relative w-[300px] h-[300px] mx-auto bg-gray-100 rounded-lg overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {/* Image Layer */}
            <div className="absolute inset-0" style={{ zIndex: 1 }}>
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Preview"
                className="absolute select-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: 'center',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-50%',
                  marginTop: '-50%'
                }}
                draggable={false}
              />
            </div>

            {/* Circular Overlay - ON TOP */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
              <svg width="300" height="300" className="absolute inset-0">
                <defs>
                  <mask id="circleMask">
                    <rect width="300" height="300" fill="white" />
                    <circle cx="150" cy="150" r="145" fill="black" />
                  </mask>
                </defs>
                <rect width="300" height="300" fill="rgba(0,0,0,0.5)" mask="url(#circleMask)" />
                <circle cx="150" cy="150" r="145" fill="none" stroke="white" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[zoom]}
                onValueChange={(values) => setZoom(values[0])}
                min={0.5}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Drag to reposition • Slide to zoom
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Photo
            </Button>
          </div>

          {/* Hidden canvas for generating final image */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
