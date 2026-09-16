import { useState } from 'react';
import { Code2, Copy, Check, Loader2, Terminal } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Codex() {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCode = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setCode('');
    
    try {
      const result = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{
          role: 'user',
          parts: [{
            text: `You are Codex, an expert coding assistant. Generate high-quality, commented code for: "${prompt}". 
            Provide ONLY the code block(s) and brief explanation if necessary. Use Markdown.`
          }]
        }]
      });
      
      setCode(result.text || '');
    } catch (error) {
      console.error("Failed to generate code", error);
      setCode("Error generating code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/80">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
          <Terminal className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-100">Codex</h2>
          <p className="text-xs text-slate-400">AI Code Generator</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            What do you want to code?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A React component for a responsive navbar..."
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none font-mono text-sm"
            />
            <button
              onClick={generateCode}
              disabled={isLoading || !prompt.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Code2 className="w-5 h-5" />}
              Generate
            </button>
          </div>
        </div>

        {code && (
          <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-3 bg-slate-900 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-mono">Generated Output</span>
              <button
                onClick={copyToClipboard}
                className="text-slate-400 hover:text-white transition-colors"
                title="Copy Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="markdown-body prose prose-invert prose-sm max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre: ({node, ...props}) => <pre className="bg-transparent p-0" {...props} />,
                    code: ({node, ...props}) => <code className="bg-transparent font-mono text-sm" {...props} />
                  }}
                >
                  {code}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
