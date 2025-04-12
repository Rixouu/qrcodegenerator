"use client";

import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QrCodeGeneratorProps {
  defaultValue?: string;
}

export function QrCodeGenerator({ defaultValue = "https://example.com" }: QrCodeGeneratorProps) {
  const [qrValue, setQrValue] = useState<string>(defaultValue);
  const [fgColor, setFgColor] = useState<string>("#000000");
  const [bgColor, setBgColor] = useState<string>("#FFFFFF");
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQrValue(e.target.value || defaultValue);
  };

  const handleFgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFgColor(e.target.value);
  };

  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBgColor(e.target.value);
  };

  const downloadQrCode = () => {
    if (!qrCodeRef.current) return;
    
    try {
      // Create a temporary canvas
      const canvas = document.createElement("canvas");
      const svg = qrCodeRef.current.querySelector("svg");
      
      if (!svg) {
        throw new Error("SVG element not found");
      }
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Unable to get canvas context");
        }
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `qrcode-${Date.now()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
        
        toast.success("QR Code Downloaded", {
          description: "Your QR code has been downloaded successfully",
        });
      };
      
      img.src = svgUrl;
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast.error("Download Failed", {
        description: "There was an error downloading your QR code",
      });
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">QR Code Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="qr-input" className="text-sm font-medium">
            Enter URL or text
          </label>
          <Input
            id="qr-input"
            value={qrValue}
            onChange={handleInputChange}
            placeholder="Enter URL or text"
            className="w-full"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="fg-color" className="text-sm font-medium">
              Foreground Color
            </label>
            <div className="flex items-center space-x-2">
              <Input
                id="fg-color"
                type="color"
                value={fgColor}
                onChange={handleFgColorChange}
                className="w-10 h-10 p-1 cursor-pointer"
              />
              <Input 
                value={fgColor}
                onChange={handleFgColorChange}
                maxLength={7}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label htmlFor="bg-color" className="text-sm font-medium">
              Background Color
            </label>
            <div className="flex items-center space-x-2">
              <Input
                id="bg-color"
                type="color"
                value={bgColor}
                onChange={handleBgColorChange}
                className="w-10 h-10 p-1 cursor-pointer"
              />
              <Input 
                value={bgColor}
                onChange={handleBgColorChange}
                maxLength={7}
                className="flex-1"
              />
            </div>
          </div>
        </div>
        
        <div 
          ref={qrCodeRef} 
          className="flex justify-center items-center p-4 rounded-md"
          style={{ backgroundColor: bgColor }}
        >
          <QRCode 
            value={qrValue} 
            size={200}
            bgColor={bgColor}
            fgColor={fgColor}
            level="L"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={downloadQrCode} 
          className="w-full"
        >
          Download QR Code
        </Button>
      </CardFooter>
    </Card>
  );
} 