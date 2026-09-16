import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Paperclip, Loader2, Bot, User, Zap, Brain, Image as ImageIcon, X, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { streamMessage, generateSpeech, generateImage, ChatMessage, ChatMode } from '../services/gemini';

// Add type definition for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Chat({ isPublic = false }: { isPublic?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('astra_chat_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved chat session', e);
      }
    }
    return [
      { role: 'model', content: isPublic ? "👋 *System Online.* **NEXORA AI Public Access** activated. How can I assist you today?" : "👋 *System Online.* **NEXORA vX.0** activated. Cognitive core synchronized. I am ready to operate as your futuristic AI operating system." }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState<ChatMode>('smart');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<number | null>(null);
  
  // Security: Basic Rate Limiting for Public Link
  const [requestTimestamps, setRequestTimestamps] = useState<number[]>([]);
  const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  const MAX_PUBLIC_REQUESTS = 15;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isImageGenerating]);

  // Save chat session on tab switch or page exit
  useEffect(() => {
    const saveSession = () => {
      localStorage.setItem('astra_chat_session', JSON.stringify(messages));
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveSession();
      }
    };

    window.addEventListener('beforeunload', saveSession);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', saveSession);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US'; // Default to English, but it often auto-detects or we can toggle

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakMessage = async (text: string, index: number) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // If clicking the same message that is currently speaking, just stop it
    if (speakingMessageId === index) {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    setAudioLoadingId(index);

    try {
      // Strip out image generation commands or markdown for speech
      const cleanText = text.replace(/\[GENERATE_IMAGE:.*?\]/g, 'Generating image...').replace(/!\[.*?\]\(.*?\)/g, 'Image');
      const audioData = await generateSpeech(cleanText);
      const audio = new Audio(audioData);
      
      audio.onended = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        setAudioLoadingId(null);
        console.error("Audio playback error");
      };

      audioRef.current = audio;
      await audio.play();
      setIsSpeaking(true);
      setSpeakingMessageId(index);
    } catch (error) {
      console.error("Failed to generate speech:", error);
    } finally {
      setAudioLoadingId(null);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedImage) || isLoading || isStreaming) return;

    if (isPublic) {
      const now = Date.now();
      const recentRequests = requestTimestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
      
      if (recentRequests.length >= MAX_PUBLIC_REQUESTS) {
        setMessages(prev => [...prev, { 
          role: 'model', 
          content: "⚠️ **429 Too Many Requests**\n\nPublic rate limit exceeded (15 req/min). Please wait a moment to prevent abuse." 
        }]);
        return;
      }
      setRequestTimestamps([...recentRequests, now]);
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      image: attachedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      // Force Smart mode if image is attached as per requirements for image analysis
      const effectiveMode = attachedImage ? 'smart' : mode;
      
      const history = messages; // Current messages before this new one
      
      // Super fast response - no artificial delay
      const stream = streamMessage(userMessage.content, history, effectiveMode, userMessage.image);
      
      setIsLoading(false);
      setIsStreaming(true);
      
      setMessages(prev => [...prev, { role: 'model', content: '' }]);
      
      let response = '';
      for await (const chunk of stream) {
        response += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          // Add a cursor block while typing
          newMessages[newMessages.length - 1] = { role: 'model', content: response + '▍' };
          return newMessages;
        });
      }

      // Ensure the full final response is set without the cursor
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: 'model', content: response };
        return newMessages;
      });
      
      setIsStreaming(false);
      
      // Check for image generation command after stream completes
      const imageMatch = response.match(/\[GENERATE_IMAGE:\s*(.*?)\]/);
      if (imageMatch) {
        const prompt = imageMatch[1];
        setIsImageGenerating(true);
        // Replace the raw command with a placeholder message for the image generation
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', content: `🎨 **Generating image:** ${prompt}...` };
          return newMessages;
        });
        
        try {
          const imageUrl = await generateImage(prompt, '1K');
          // Replace the placeholder with the actual image markdown
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { 
              role: 'model', 
              content: `Here is your image for: **${prompt}**\n\n![Generated Image](${imageUrl})` 
            };
            return newMessages;
          });
        } catch (imgError) {
          setMessages(prev => {
             const newMessages = [...prev];
             newMessages[newMessages.length - 1] = { 
               role: 'model', 
               content: `Sorry, I failed to generate the image for: **${prompt}**` 
             };
             return newMessages;
          });
        } finally {
          setIsImageGenerating(false);
        }
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Bot className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100">NEXORA</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Online
            </div>
          </div>
        </div>

        <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
          <button
            onClick={() => setMode('smart')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
              mode === 'smart' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Smart</span>
          </button>
          <button
            onClick={() => setMode('fast')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
              mode === 'fast' 
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Fast</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' 
                  ? 'bg-slate-700 text-slate-300' 
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.image && (
                  <div className="rounded-xl overflow-hidden border border-slate-700 max-w-sm">
                    <img src={msg.image} alt="User upload" className="w-full h-auto" />
                  </div>
                )}
                <div className={`px-6 py-5 rounded-3xl text-lg leading-relaxed relative group shadow-xl ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-white/95 text-slate-900 border border-white/20 rounded-tl-sm backdrop-blur-xl'
                }`}>
                  <div className={`markdown-body prose max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className={`mb-4 text-[18px] leading-8 ${msg.role === 'user' ? 'text-white/90' : 'text-slate-900 font-medium'}`} {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-4xl font-extrabold mb-6 mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-3xl font-bold mb-4 mt-8 text-slate-900 border-b-2 border-indigo-100 pb-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-2xl font-bold mb-3 mt-6 text-indigo-900" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-3 marker:text-indigo-500" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-3 marker:text-indigo-500 font-semibold" {...props} />,
                        li: ({node, ...props}) => <li className="text-[18px] leading-8 pl-2" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-6 py-2 my-6 bg-indigo-50/50 rounded-r-lg italic text-slate-700" {...props} />,
                        pre: ({node, ...props}) => <div className="overflow-auto w-full my-6 bg-slate-900 p-4 rounded-xl shadow-inner border border-slate-800"><pre className="text-sm" {...props} /></div>,
                        code: ({node, ...props}) => <code className={`${props.className?.includes('language-') ? 'text-sm' : 'bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono text-base font-bold border border-indigo-200'}`} {...props} />,
                        strong: ({node, ...props}) => <strong className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600" {...props} />,
                        img: ({node, ...props}) => (
                          <div className="relative group inline-block my-4 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                            <img {...props} className="max-w-full h-auto transform transition-transform duration-500 group-hover:scale-105" />
                            <a 
                              href={props.src} 
                              download={`nexora-image-${Date.now()}.png`}
                              className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-110"
                              title="Download Image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            </a>
                          </div>
                        )
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  
                  {msg.role === 'model' && (
                    <button
                      onClick={() => speakMessage(msg.content, index)}
                      className={`absolute -bottom-6 left-0 p-1 transition-all ${
                        speakingMessageId === index || audioLoadingId === index
                          ? 'text-indigo-400 opacity-100' 
                          : 'text-slate-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100'
                      }`}
                      title="Read aloud"
                      disabled={audioLoadingId !== null && audioLoadingId !== index}
                    >
                      {audioLoadingId === index ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : speakingMessageId === index ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="bg-slate-800/80 px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-700/50 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/80 border-t border-slate-800">
        {attachedImage && (
          <div className="mb-2 relative inline-block">
            <div className="relative rounded-lg overflow-hidden border border-slate-700 w-20 h-20 group">
              <img src={attachedImage} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => setAttachedImage(null)}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 items-end bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            title="Attach image"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message NEXORA..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-500 resize-none py-2 max-h-32 min-h-[44px]"
            rows={1}
            style={{ height: 'auto', minHeight: '44px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
          
          <button
            onClick={toggleListening}
            className={`p-2 rounded-lg transition-all ${
              isListening
                ? 'bg-red-500/20 text-red-400 animate-pulse'
                : 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10'
            }`}
            title="Voice Input"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={handleSend}
            disabled={(!input.trim() && !attachedImage) || isLoading || isStreaming}
            className={`p-2 rounded-lg transition-all ${
              (!input.trim() && !attachedImage) || isLoading || isStreaming
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
            }`}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <div className="text-center mt-2">
           <p className="text-[10px] text-slate-500">
             NEXORA can make mistakes. Check important info.
           </p>
        </div>
      </div>
    </div>
  );
}
