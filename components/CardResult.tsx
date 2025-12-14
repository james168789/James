import React, { useEffect, useRef, useState } from 'react';
import { CardData } from '../types';

interface CardResultProps {
  data: CardData;
  index: number;
}

const CardResult: React.FC<CardResultProps> = ({ data, index }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(true);

  // Canvas Dimensions
  const WIDTH = 600;
  const HEIGHT = 750;

  useEffect(() => {
    if (!canvasRef.current || !data.userImageBase64) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawCard = async () => {
      setIsDrawing(true);
      
      // 1. Load Images
      const loadImg = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

      try {
        const [bgImg, userImg] = await Promise.all([
          loadImg(data.backgroundBase64),
          loadImg(data.userImageBase64!)
        ]);

        // 2. Clear Canvas
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // 3. Draw Background (Cover)
        // Calculate aspect ratio to cover
        const bgRatio = bgImg.width / bgImg.height;
        const canvasRatio = WIDTH / HEIGHT;
        let drawWidth = WIDTH;
        let drawHeight = HEIGHT;
        let offsetX = 0;
        let offsetY = 0;

        if (bgRatio > canvasRatio) {
          drawWidth = HEIGHT * bgRatio;
          offsetX = -(drawWidth - WIDTH) / 2;
        } else {
          drawHeight = WIDTH / bgRatio;
          offsetY = -(drawHeight - HEIGHT) / 2;
        }
        ctx.drawImage(bgImg, offsetX, offsetY, drawWidth, drawHeight);

        // 4. Add a subtle dark overlay at the bottom for text readability
        const gradient = ctx.createLinearGradient(0, HEIGHT * 0.4, 0, HEIGHT);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.6, 'rgba(0,0,0,0.6)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.85)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // 5. Draw User Image (Circular in center-top)
        const userSize = 240;
        const userX = (WIDTH - userSize) / 2;
        const userY = 100;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(WIDTH / 2, userY + userSize / 2, userSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        // Draw user image centered in circle
        const uRatio = userImg.width / userImg.height;
        let uW = userSize;
        let uH = userSize;
        let uOX = 0;
        let uOY = 0;
        
        if (uRatio > 1) {
            uW = userSize * uRatio;
            uOX = -(uW - userSize) / 2;
        } else {
            uH = userSize / uRatio;
            uOY = -(uH - userSize) / 2;
        }
        ctx.drawImage(userImg, userX + uOX, userY + uOY, uW, uH);
        ctx.restore();

        // 6. Draw Gold Border around User Image
        ctx.beginPath();
        ctx.arc(WIDTH / 2, userY + userSize / 2, userSize / 2, 0, Math.PI * 2);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#FACC15'; // Gold 400
        ctx.stroke();

        // 7. Draw Decorative Frame (Simple border)
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, WIDTH - 40, HEIGHT - 40);

        // 8. Draw Text
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        
        // Title
        ctx.font = 'bold 36px Sarabun';
        ctx.fillStyle = '#FACC15'; // Gold
        ctx.fillText("สวัสดีปีใหม่", WIDTH / 2, HEIGHT - 220);

        // Message body
        ctx.font = '400 28px Sarabun';
        ctx.fillStyle = '#F8FAFC'; // Slate 50
        
        // Wrap text
        const words = data.message.split(' ');
        let line = '';
        let y = HEIGHT - 160;
        const maxWidth = WIDTH - 80;
        const lineHeight = 45;

        // Since Thai doesn't use spaces between words often, the split(' ') might not work perfectly for wrapping.
        // However, for this simplified version, we'll assume the generated text might have some spaces or we just break by character count roughly if needed.
        // A better approach for Thai is canvas-txt or manual measuring.
        // Let's use a simpler approach: Draw the message line by line if it has newlines, otherwise try to wrap roughly.
        // Gemini usually returns conversational sentences. Let's force simple wrapping.

        const chars = data.message.split('');
        line = '';
        
        for(let i = 0; i < chars.length; i++) {
          const testLine = line + chars[i];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, WIDTH / 2, y);
            line = chars[i];
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, WIDTH / 2, y);

        // 9. Watermark
        ctx.font = '300 16px Sarabun';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText("Created with SiamGreetings AI", WIDTH / 2, HEIGHT - 30);

        // Prepare download
        setDownloadUrl(canvas.toDataURL('image/jpeg', 0.9));
        setIsDrawing(false);

      } catch (e) {
        console.error("Canvas drawing error", e);
        setIsDrawing(false);
      }
    };

    drawCard();
  }, [data]);

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.download = `siam-greetings-card-${index + 1}.jpg`;
      link.href = downloadUrl;
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center animate-fade-in-up">
      <div className="relative group rounded-xl overflow-hidden shadow-2xl shadow-gold-900/20 border border-gray-700">
        <canvas 
          ref={canvasRef} 
          width={WIDTH} 
          height={HEIGHT} 
          className="w-full h-auto max-w-[300px] md:max-w-[340px] block"
          style={{ aspectRatio: `${WIDTH}/${HEIGHT}` }}
        />
        {isDrawing && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
           <button 
            onClick={handleDownload}
            disabled={!downloadUrl}
            className="bg-gold-500 hover:bg-gold-400 text-black font-bold py-3 px-6 rounded-full transform hover:scale-105 transition-all flex items-center gap-2"
           >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 9.75V3m0 0 4.5 4.5M12 3 7.5 7.5" />
             </svg>
             Download JPG
           </button>
        </div>
      </div>
      <div className="mt-4 text-center px-4">
        <p className="text-gray-400 text-sm font-thai line-clamp-2">{data.message}</p>
      </div>
    </div>
  );
};

export default CardResult;