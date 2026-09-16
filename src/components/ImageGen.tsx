import { useState } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Download, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { generateImage, ImageSize } from '../services/gemini';

export default function ImageGen() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImage(null);

    try {
      const result = await generateImage(prompt, size);
      setImage(result);
    } catch (err) {
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `nexora-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/80">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
          <Wand2 className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-100">NEXORA Vision</h2>
          <p className="text-xs text-slate-400">Powered by Gemini Pro Vision</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            What would you like to create?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic city with neon lights, cyberpunk style..."
            className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Image Size
          </label>
          <div className="flex gap-4">
            {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`flex-1 py-3 px-4 rounded-xl border transition-all font-medium ${
                  size === s
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isLoading}
          className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
            !prompt.trim() || isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Magic...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Image
            </>
          )}
        </button>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group rounded-2xl overflow-hidden border border-slate-700 shadow-2xl"
          >
            <img src={image} alt="Generated" className="w-full h-auto" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6">
              <button
                onClick={handleDownload}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Image
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
