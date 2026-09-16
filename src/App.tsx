import { useState } from 'react';
import { MessageSquare, Image as ImageIcon, Settings, Menu, X, Sparkles, MoreVertical, Share2, Plus, Box, Code2, History, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Chat from './components/Chat';
import ImageGen from './components/ImageGen';
import ProjectGen from './components/ProjectGen';
import Codex from './components/Codex';
import logoPath from './assets/images/logo.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'project' | 'codex' | 'history'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0); // Used to reset chat
  const [showToast, setShowToast] = useState(false);

  // Check if current route is a public shareable link
  const isPublicRoute = ['/chat', '/astra', '/use-astra', '/assistant/astra'].includes(window.location.pathname);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNewChat = () => {
    localStorage.removeItem('astra_chat_session');
    setChatKey(prev => prev + 1);
    setActiveTab('chat');
  };

  const handleShare = async () => {
    // Generate a unique shareable link (using /astra for simplicity)
    const shareUrl = `${window.location.origin}/astra`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NEXORA AI Assistant',
          text: 'Chat with NEXORA AI - The Next-Gen AI Companion!',
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (isPublicRoute) {
    return (
      <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
        {/* 3D Animated Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950 z-0"></div>
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen"
          />
          <motion.div 
            animate={{ y: [0, 30, 0], x: [0, 20, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"
          />
        </div>

        <header className="relative z-10 p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden">
              <img src={logoPath} alt="NEXORA Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                NEXORA AI
              </h1>
              <p className="text-xs text-slate-500 font-medium">Public Access</p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share NEXORA</span>
          </button>
        </header>

        <main className="flex-1 relative z-10 p-4 md:p-6 max-w-5xl mx-auto w-full">
          <Chat isPublic={true} />
        </main>

        <footer className="relative z-10 p-3 text-center border-t border-slate-800/50 bg-slate-900/80 backdrop-blur-md">
          <p className="text-xs text-slate-500 font-medium">Powered by NEXORA AI</p>
        </footer>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium"
            >
              <Share2 className="w-4 h-4" />
              Link copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Mobile Menu Button */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800/80 backdrop-blur-md rounded-lg border border-slate-700 text-slate-300"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed md:relative z-40 w-72 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col shadow-2xl md:shadow-none md:translate-x-0`}
          >
            <div className="p-6 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden">
                  <img src={logoPath} alt="NEXORA Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    NEXORA
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">vX.0 • NEXORA OS</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <button
                onClick={() => { setActiveTab('chat'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  activeTab === 'chat'
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <MessageSquare className={`w-5 h-5 ${activeTab === 'chat' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="font-medium">Assistant Chat</span>
              </button>

              <button
                onClick={() => { setActiveTab('image'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  activeTab === 'image'
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <ImageIcon className={`w-5 h-5 ${activeTab === 'image' ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="font-medium">Image Studio</span>
              </button>

              <button
                onClick={() => { setActiveTab('project'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  activeTab === 'project'
                    ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Box className={`w-5 h-5 ${activeTab === 'project' ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="font-medium">Project Builder</span>
              </button>

              <button
                onClick={() => { setActiveTab('codex'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  activeTab === 'codex'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Code2 className={`w-5 h-5 ${activeTab === 'codex' ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="font-medium">Codex</span>
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              >
                <Share2 className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
                <span className="font-medium">Share NEXORA</span>
              </button>
            </nav>

            <div className="p-4 border-t border-slate-800/50">
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">System Status</p>
                    <p className="text-xs text-emerald-400">All Systems Operational</p>
                  </div>
                </div>
                <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 h-full relative overflow-hidden flex flex-col">
        {/* Top Bar for Actions */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="p-2 bg-slate-800/80 backdrop-blur-md rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 bg-slate-800/80 backdrop-blur-md rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            title="Share NEXORA"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 bg-slate-800/80 backdrop-blur-md rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
              title="More Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Three Dot Menu Dropdown */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-12 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-2 space-y-1">
                    <button onClick={() => { setActiveTab('image'); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
                      <ImageIcon className="w-4 h-4 text-purple-400" /> Image Studio
                    </button>
                    <button onClick={() => { setActiveTab('project'); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
                      <Box className="w-4 h-4 text-emerald-400" /> Project Builder
                    </button>
                    <button onClick={() => { setActiveTab('codex'); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
                      <Code2 className="w-4 h-4 text-blue-400" /> Codex
                    </button>
                    <div className="h-px bg-slate-800 my-1" />
                    <button onClick={() => { setActiveTab('history'); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
                      <History className="w-4 h-4 text-slate-400" /> Chat History
                    </button>
                    <div className="h-px bg-slate-800 my-1" />
                    <button onClick={() => { handleShare(); setIsMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
                      <Share2 className="w-4 h-4 text-slate-400" /> Share NEXORA
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 3D Animated Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Deep Space Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950 z-0"></div>
          
          {/* Floating Orbs / Shapes */}
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen"
          />
          
          <motion.div 
            animate={{ 
              y: [0, 30, 0],
              x: [0, 20, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"
          />

          <motion.div 
            animate={{ 
              rotate: [0, 360],
            }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full opacity-20"
          />
           <motion.div 
            animate={{ 
              rotate: [360, 0],
            }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full opacity-20"
          />
        </div>

        <div className="relative h-full p-4 md:p-6 max-w-7xl mx-auto w-full pt-16 md:pt-6">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div
                key={`chat-${chatKey}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Chat />
              </motion.div>
            )}
            {activeTab === 'image' && (
              <motion.div
                key="image"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ImageGen />
              </motion.div>
            )}
            {activeTab === 'project' && (
              <motion.div
                key="project"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ProjectGen />
              </motion.div>
            )}
            {activeTab === 'codex' && (
              <motion.div
                key="codex"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Codex />
              </motion.div>
            )}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full flex items-center justify-center text-slate-500"
              >
                <div className="text-center">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chat History feature coming soon...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium"
            >
              <Share2 className="w-4 h-4" />
              Link copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
