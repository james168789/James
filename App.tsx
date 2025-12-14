import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import CardResult from './components/CardResult';
import { generateThaiGreetings, generateFestiveBackground } from './services/gemini';
import { CardData, GenerationStep } from './types';

function App() {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [step, setStep] = useState<GenerationStep>(GenerationStep.IDLE);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleGenerate = async () => {
    if (!userImage) return;

    setStep(GenerationStep.GENERATING_TEXT);
    setCards([]);
    setLoadingMessage('Consulting the spirits for the perfect blessings...');

    try {
      // 1. Generate 5 Text Messages
      const greetings = await generateThaiGreetings(userPrompt);
      
      setStep(GenerationStep.GENERATING_IMAGES);
      setLoadingMessage('Weaving festive magic into the backgrounds...');

      // 2. Prepare Card Placeholders
      const newCards: CardData[] = greetings.map((msg, i) => ({
        id: `card-${Date.now()}-${i}`,
        message: msg,
        userImageBase64: userImage,
        backgroundBase64: '', // To be filled
        isGenerating: true
      }));
      setCards(newCards);

      // 3. Generate Backgrounds in Parallel
      // We generate one background per card to ensure uniqueness
      const bgPromises = newCards.map(async (card, index) => {
         // Vary the prompt slightly for diversity
         const variations = ['traditional pattern', 'modern fireworks', 'floral elegant', 'temple glow', 'golden sparkles'];
         const variation = variations[index % variations.length];
         const combinedPrompt = `${userPrompt} ${variation}`;
         
         const bgUrl = await generateFestiveBackground(combinedPrompt);
         
         setCards(prev => prev.map(c => 
           c.id === card.id ? { ...c, backgroundBase64: bgUrl, isGenerating: false } : c
         ));
      });

      await Promise.all(bgPromises);
      
      setStep(GenerationStep.COMPLETED);

    } catch (error) {
      console.error(error);
      setStep(GenerationStep.ERROR);
    }
  };

  const reset = () => {
    setStep(GenerationStep.IDLE);
    setCards([]);
    // userImage remains for convenience
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black font-sans text-slate-100 pb-20">
      
      {/* Header */}
      <header className="pt-12 pb-8 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-600 font-thai tracking-tight mb-4">
          Siam Greetings AI
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Create beautiful, personalized International New Year cards with grammatically correct Thai blessings using Gemini AI.
        </p>
      </header>

      <main className="container mx-auto px-4">
        
        {/* Input Section */}
        {step === GenerationStep.IDLE && (
          <div className="max-w-2xl mx-auto bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center text-gold-400">Create Your Cards</h2>
            
            <ImageUpload 
              onImageSelected={setUserImage} 
              selectedImage={userImage} 
            />

            <div className="mb-8">
              <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">
                Card Theme / Style (Optional)
              </label>
              <input
                type="text"
                id="prompt"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="e.g., Traditional Thai, Modern Neon, Funny, Business Professional"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!userImage}
              className={`
                w-full py-4 rounded-xl font-bold text-lg tracking-wide shadow-lg transition-all transform
                ${userImage 
                  ? 'bg-gradient-to-r from-gold-600 to-gold-400 text-black hover:scale-[1.02] hover:shadow-gold-500/20' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
              `}
            >
              Generate 5 Cards ✨
            </button>
          </div>
        )}

        {/* Loading State */}
        {(step === GenerationStep.GENERATING_TEXT || step === GenerationStep.GENERATING_IMAGES) && (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
             <div className="relative w-24 h-24 mb-8">
               <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-t-gold-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
             </div>
             <h3 className="text-2xl font-bold text-gold-400 mb-2 animate-pulse">{step === GenerationStep.GENERATING_TEXT ? 'Writing Blessings...' : 'Painting Backgrounds...'}</h3>
             <p className="text-slate-400 text-center max-w-md">{loadingMessage}</p>
             
             {step === GenerationStep.GENERATING_IMAGES && (
               <div className="mt-8 grid grid-cols-5 gap-2 w-full max-w-md">
                 {cards.map((card, i) => (
                   <div key={card.id} className={`h-1.5 rounded-full transition-all duration-500 ${!card.isGenerating ? 'bg-gold-500' : 'bg-slate-800'}`}></div>
                 ))}
               </div>
             )}
          </div>
        )}

        {/* Results */}
        {(step === GenerationStep.COMPLETED || step === GenerationStep.GENERATING_IMAGES) && cards.length > 0 && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-4">
               <div>
                  <h2 className="text-3xl font-bold text-white">Your Collection</h2>
                  <p className="text-slate-400 mt-1">Ready to download and share.</p>
               </div>
               {step === GenerationStep.COMPLETED && (
                 <button 
                  onClick={reset}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors"
                 >
                   Create New Batch
                 </button>
               )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 justify-items-center">
               {cards.map((card, index) => (
                 card.backgroundBase64 ? (
                   <CardResult key={card.id} data={card} index={index} />
                 ) : (
                   <div key={card.id} className="w-full max-w-[300px] aspect-[4/5] bg-slate-900/50 rounded-xl animate-pulse border border-slate-800 flex items-center justify-center">
                     <span className="text-slate-600">Generating...</span>
                   </div>
                 )
               ))}
             </div>
          </div>
        )}

        {step === GenerationStep.ERROR && (
           <div className="text-center py-20">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 text-red-500 mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
               </svg>
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
             <p className="text-slate-400 mb-6">We couldn't generate your cards at this time.</p>
             <button 
               onClick={reset}
               className="bg-gold-600 hover:bg-gold-500 text-black font-bold py-2 px-6 rounded-lg transition-colors"
             >
               Try Again
             </button>
           </div>
        )}

      </main>
    </div>
  );
}

export default App;