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
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

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

  // Render preview to canvas continuously
  useEffect(() => {
    const renderPreview = () => {
      if (!previewCanvasRef.current || !imageRef.current || !imageRef.current.complete) {
        animationFrameRef.current = requestAnimationFrame(renderPreview);
        return;
      }

      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = imageRef.current;
      const containerSize = 300;

      // Clear canvas
      ctx.clearRect(0, 0, containerSize, containerSize);

      // Calculate base display size
      const imgAspect = img.naturalWidth / img.naturalHeight;
      let baseWidth, baseHeight;
      
      if (imgAspect > 1) {
        baseWidth = containerSize;
        baseHeight = containerSize / imgAspect;
      } else {
        baseHeight = containerSize;
        baseWidth = containerSize * imgAspect;
      }

      // Apply zoom
      const displayWidth = baseWidth * zoom;
      const displayHeight = baseHeight * zoom;

      // Calculate position (centered + offset)
      const x = (containerSize - displayWidth) / 2 + position.x;
      const y = (containerSize - displayHeight) / 2 + position.y;

      // Draw image
      ctx.drawImage(img, x, y, displayWidth, displayHeight);

      animationFrameRef.current = requestAnimationFrame(renderPreview);
    };

    if (isOpen) {
      renderPreview();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, zoom, position]);

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
    if (!previewCanvasRef.current || !outputCanvasRef.current) return;

    const outputCanvas = outputCanvasRef.current;
    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return;

    // Set output size
    const outputSize = 300;
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;

    // Draw circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Copy from preview canvas (which shows exactly what user sees)
    ctx.drawImage(previewCanvasRef.current, 0, 0);

    ctx.restore();

    // Convert to base64
    const croppedImageUrl = outputCanvas.toDataURL('image/jpeg', 0.9);
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
            {/* Hidden image for loading */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Source"
              className="hidden"
            />

            {/* Preview canvas - shows exactly what will be cropped */}
            <canvas
              ref={previewCanvasRef}
              width={300}
              height={300}
              className="absolute inset-0"
              style={{ zIndex: 1 }}
            />

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

          {/* Hidden canvas for generating final output */}
          <canvas ref={outputCanvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
