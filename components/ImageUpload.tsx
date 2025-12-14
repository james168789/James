import React, { useRef } from 'react';

interface ImageUploadProps {
  onImageSelected: (base64: string) => void;
  selectedImage: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected, selectedImage }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="w-full max-w-md mx-auto mb-6"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div 
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-300
          flex flex-col items-center justify-center h-64 overflow-hidden group
          ${selectedImage ? 'border-gold-500 bg-gray-900' : 'border-gray-600 hover:border-gold-400 hover:bg-gray-800'}
        `}
      >
        <input 
          type="file" 
          ref={inputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        {selectedImage ? (
          <div className="relative w-full h-full flex items-center justify-center">
             <img 
               src={selectedImage} 
               alt="Uploaded" 
               className="max-h-full max-w-full object-contain rounded-lg shadow-lg z-10" 
             />
             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
               <span className="text-white font-medium">Click to change</span>
             </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 group-hover:text-gold-400 group-hover:bg-gray-700/50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-gray-300 font-medium text-center">Upload your photo</p>
            <p className="text-gray-500 text-sm mt-2 text-center">Click or drag & drop</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;