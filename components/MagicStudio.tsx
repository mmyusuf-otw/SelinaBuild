
import React from 'react';
import { 
  Camera, 
  Sparkles, 
  Wand2, 
  Download, 
  Trash2, 
  RefreshCw, 
  Upload, 
  Zap, 
  Play, 
  Pause, 
  Volume2, 
  Mic2, 
  ChevronRightSquare, 
  Wand, 
  TrendingUp, 
  Clapperboard as MovieIcon,
  Check,
  AlertTriangle,
  Copy,
  Smartphone,
  RectangleHorizontal,
  RectangleVertical,
  Square as SquareIcon,
  X,
  Layers,
  Layout,
  Maximize2,
  Image as ImageIcon,
  User,
  Users,
  Music,
  Wind,
  ShieldCheck,
  Star,
  Activity,
  Instagram,
  Facebook,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import WinningMagic from './WinningMagic';

// Helper: Decode base64 to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64.split(',')[1] || base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper: Decode Raw PCM to AudioBuffer
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate = 24000, numChannels = 1): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createWavBlob(pcmData: Uint8Array, sampleRate = 24000) {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  view.setUint32(0, 0x52494646, false); 
  view.setUint32(4, 36 + pcmData.length, true); 
  view.setUint32(8, 0x57415645, false); 
  view.setUint32(12, 0x666d7420, false); 
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); 
  view.setUint16(22, 1, true); 
  view.setUint32(24, sampleRate, true); 
  view.setUint32(28, sampleRate * 2, true); 
  view.setUint16(32, 2, true); 
  view.setUint16(34, 16, true); 
  view.setUint32(36, 0x64617461, false); 
  view.setUint32(40, pcmData.length, true); 
  return new Blob([header, pcmData], { type: 'audio/wav' });
}

const TONES = [
  { id: 'calm', label: 'Calm & Reassuring', desc: 'Tenang & Percaya Diri', icon: <ShieldCheck size={18} /> },
  { id: 'confident', label: 'Confident & Authoritative', desc: 'Tegas & Berwibawa', icon: <Zap size={18} /> },
  { id: 'warm', label: 'Warm & Friendly', desc: 'Ramah & Enak Didengar', icon: <Users size={18} /> },
  { id: 'luxury', label: 'Luxury & Elegant', desc: 'Pelan & Berkelas', icon: <Star size={18} /> },
];

const VOICE_TALENTS = [
  { id: 'Arini', name: 'Arini', gender: 'Wanita', engine: 'Kore', type: 'Sweet' },
  { id: 'Budi', name: 'Budi', gender: 'Pria', engine: 'Puck', type: 'Deep' },
];

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: <Instagram size={18} />, ratio: '1:1', desc: 'Square Aesthetic' },
  { id: 'tiktok', label: 'TikTok', icon: <Smartphone size={18} />, ratio: '9:16', desc: 'Full Portrait' },
  { id: 'facebook', label: 'Facebook', icon: <Facebook size={18} />, ratio: '4:3', desc: 'Clean Landscape' },
];

export default function MagicStudio() {
  const [activeTool, setActiveTool] = React.useState<'photo' | 'voice' | 'video' | 'post' | 'winning'>('winning');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingMsg, setProcessingMsg] = React.useState('');
  
  // Post Magic States
  const [postImage, setPostImage] = React.useState<string | null>(null);
  const [postName, setPostName] = React.useState('');
  const [postDesc, setPostDesc] = React.useState('');
  const [postPlatform, setPostPlatform] = React.useState('instagram');
  const [postResult, setPostResult] = React.useState<{ images: string[], caption: string } | null>(null);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  // Voice States
  const [voiceScript, setVoiceScript] = React.useState('');
  const [selectedTone, setSelectedTone] = React.useState('warm');
  const [selectedVoice, setSelectedVoice] = React.useState('Arini');
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const currentSourceRef = React.useRef<AudioBufferSourceNode | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePostMagic = async () => {
    if (!postImage || !postName) return;
    setIsProcessing(true);
    setProcessingMsg("Menganalisis Produk Juragan...");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const platform = PLATFORMS.find(p => p.id === postPlatform);
      
      // 1. Generate Concepts and Captions
      setProcessingMsg("Meracik Strategi Konten...");
      const brainResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: postImage.split(',')[1] } },
              { text: `Produk ini bernama "${postName}". Deskripsi singkat: "${postDesc}". 
                       Buatlah 5 konsep visual prompt untuk iklan carousel di ${postPlatform}. 
                       Konsep harus mencakup: 1. Hero Shot mewah, 2. Close up detail produk, 3. Lifestyle (produk digunakan), 4. Benefit utama, 5. Call to Action.
                       Serta buatkan 1 caption iklan AIDA yang sangat persuasif untuk ${postPlatform} lengkap dengan emoji dan hashtag.
                       Output harus dalam format JSON.` }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              prompts: { type: Type.ARRAY, items: { type: Type.STRING } },
              caption: { type: Type.STRING }
            }
          }
        }
      });

      const data = JSON.parse(brainResponse.text);
      const generatedImages: string[] = [];

      // 2. Generate 5 Images Sequentially to update UI progress
      for (let i = 0; i < data.prompts.length; i++) {
        setProcessingMsg(`Menghasilkan Gambar AI ${i + 1}/5...`);
        const imgResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: [{ parts: [{ text: `High quality professional commercial photography for ${postPlatform}, optimized for carousel. Concept: ${data.prompts[i]}. Follow the lighting and product details of the source: ${postName}.` }] }],
          config: {
            imageConfig: {
              aspectRatio: platform?.ratio as any || '1:1'
            }
          }
        });

        for (const part of imgResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            generatedImages.push(`data:image/png;base64,${part.inlineData.data}`);
          }
        }
      }

      setPostResult({
        images: generatedImages,
        caption: data.caption
      });
      setCurrentSlide(0);

    } catch (e) {
      console.error(e);
      alert("Waduh, koneksi AI sibuk. Silakan coba lagi sebentar lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceMagic = async () => {
    if (!voiceScript.trim()) return;
    setIsProcessing(true);
    setProcessingMsg("Menyintesis Suara AI HD...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const talent = VOICE_TALENTS.find(v => v.id === selectedVoice);
      const tone = TONES.find(t => t.id === selectedTone);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Bacakan dengan emosi ${tone?.label}: ${voiceScript}` }] }],
        config: {
          responseModalalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: talent?.engine || 'Kore' } } }
        }
      });
      const base64Data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Data) {
        const rawBytes = decode(base64Data);
        const wavBlob = createWavBlob(rawBytes, 24000);
        setAudioBlob(wavBlob);
        setAudioUrl(URL.createObjectURL(wavBlob));
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menghasilkan suara.");
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = async () => {
    if (!audioBlob) return;
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      setIsPlaying(false);
      currentSourceRef.current = null;
      return;
    }
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const rawPcmBytes = new Uint8Array(arrayBuffer.slice(44));
      const audioBuffer = await decodeAudioData(rawPcmBytes, ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => { setIsPlaying(false); currentSourceRef.current = null; };
      source.start();
      currentSourceRef.current = source;
      setIsPlaying(true);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'winning', label: 'Winning Magic', icon: <TrendingUp size={18} /> },
          { id: 'post', label: 'Post Magic', icon: <ChevronRightSquare size={18} /> },
          { id: 'photo', label: 'Photo Magic', icon: <Camera size={18} /> },
          { id: 'voice', label: 'Voice Magic', icon: <Mic2 size={18} /> },
          { id: 'video', label: 'Video Magic', icon: <MovieIcon size={18} /> },
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => { setActiveTool(t.id as any); setIsProcessing(false); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shrink-0 ${activeTool === t.id ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bento-card bg-white p-8 border border-slate-100 shadow-sm space-y-6 sticky top-24">
            
            {activeTool === 'post' && (
              <>
                <div className="space-y-1">
                   <h3 className="text-xl font-black flex items-center gap-2"><Sparkles className="text-indigo-500" /> Post Magic 4.0</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Carousel Generator</p>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Foto Produk</label>
                      <div className="relative aspect-video border-2 border-dashed border-slate-100 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center group cursor-pointer">
                         <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setPostImage)} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                         {postImage ? <img src={postImage} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-slate-300"><Upload size={24} /><span className="text-[10px] font-bold mt-2">Pilih Foto</span></div>}
                      </div>
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Produk</label>
                      <input 
                        type="text" 
                        value={postName} 
                        onChange={(e) => setPostName(e.target.value)}
                        placeholder="Contoh: Selina Serum Glowing" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
                      />
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi Singkat</label>
                      <textarea 
                        value={postDesc}
                        onChange={(e) => setPostDesc(e.target.value)}
                        placeholder="Keunggulan utama produk Anda..." 
                        className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white transition-all resize-none"
                      />
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Platform</label>
                      <div className="grid grid-cols-3 gap-2">
                         {PLATFORMS.map(p => (
                           <button 
                             key={p.id}
                             onClick={() => setPostPlatform(p.id)}
                             className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${postPlatform === p.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}
                           >
                              {p.icon}
                              <span className="text-[8px] font-black uppercase">{p.label}</span>
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                <button 
                  onClick={handlePostMagic}
                  disabled={!postImage || !postName || isProcessing}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" /> : <Wand2 size={16} />}
                  Generate Carousel
                </button>
              </>
            )}

            {activeTool === 'winning' && (
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Info</p>
                <p className="text-xs text-indigo-900 mt-1">Gunakan Winning Magic untuk meriset kompetitor sebelum membuat konten.</p>
              </div>
            )}
            
            {/* Other sidebars omitted for brevity in this specific update */}
          </div>
        </div>

        {/* Main Display Area */}
        <div className="lg:col-span-8">
          {isProcessing || postResult ? (
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col items-center min-h-[600px] animate-in zoom-in-95">
               {isProcessing ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 w-full max-w-sm">
                    <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                      <Sparkles className="text-white" size={48} />
                    </div>
                    <div className="space-y-4">
                       <p className="text-xl font-black text-slate-900 tracking-tight">{processingMsg}</p>
                       <div className="flex justify-center items-center gap-1 h-8">
                          {[...Array(12)].map((_, i) => (
                             <div 
                               key={i} 
                               className="w-1.5 bg-indigo-500 rounded-full animate-pulse" 
                               style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}
                             />
                          ))}
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="w-full space-y-10 animate-in fade-in duration-700">
                    <div className="flex flex-col md:flex-row gap-10">
                       {/* Carousel Visual */}
                       <div className="flex-1 space-y-4">
                          <div className="relative group">
                             <div className="aspect-[4/5] rounded-[40px] overflow-hidden bg-slate-100 border border-slate-100 shadow-2xl">
                                <img 
                                  src={postResult?.images[currentSlide]} 
                                  className="w-full h-full object-cover animate-in fade-in duration-500" 
                                  alt="AI Content" 
                                />
                             </div>
                             
                             <button 
                               onClick={() => setCurrentSlide(prev => (prev === 0 ? 4 : prev - 1))}
                               className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 hover:text-white"
                             >
                                <ChevronLeft size={24} />
                             </button>
                             <button 
                               onClick={() => setCurrentSlide(prev => (prev === 4 ? 0 : prev + 1))}
                               className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 hover:text-white"
                             >
                                <ChevronRight size={24} />
                             </button>

                             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                {postResult?.images.map((_, i) => (
                                  <div 
                                    key={i} 
                                    className={`h-1.5 rounded-full transition-all ${currentSlide === i ? 'w-8 bg-indigo-600' : 'w-2 bg-white/50'}`} 
                                  />
                                ))}
                             </div>
                          </div>

                          <div className="flex items-center justify-between px-2">
                             <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><ImageIcon size={16}/></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gambar {currentSlide + 1} dari 5</span>
                             </div>
                             <a 
                               href={postResult?.images[currentSlide]} 
                               download={`selina-post-${currentSlide+1}.png`}
                               className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                             >
                                <Download size={14} /> Simpan Gambar
                             </a>
                          </div>
                       </div>

                       {/* Caption Side */}
                       <div className="w-full md:w-80 space-y-6">
                          <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-4">
                             <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Caption Strategist</h4>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(postResult?.caption || '');
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                  }}
                                  className={`p-2 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 hover:text-indigo-600 shadow-sm'}`}
                                >
                                   {copied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                             </div>
                             <div className="text-xs text-slate-600 leading-relaxed font-medium max-h-[400px] overflow-y-auto pr-2 no-scrollbar whitespace-pre-line">
                                {postResult?.caption}
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                             <button 
                               onClick={() => setPostResult(null)}
                               className="py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2"
                             >
                                <RefreshCw size={14} /> Buat Ulang
                             </button>
                             <button 
                               className="py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2"
                             >
                                <Share size={14} /> Bagikan
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          ) : (
            activeTool === 'winning' ? (
              <WinningMagic onAutoFillPrompt={(p) => { 
                setActiveTool('post'); 
                // Set initial prompt to post magic if needed
              }} />
            ) : (
              <div className="h-full min-h-[600px] border-4 border-dashed border-slate-100 rounded-[64px] flex flex-col items-center justify-center text-slate-200 gap-6">
                <Wand size={64} />
                <div className="text-center space-y-1">
                  <p className="font-black uppercase tracking-[0.3em] text-sm text-slate-300">Magic Studio Siap</p>
                  <p className="text-xs font-medium text-slate-300">Pilih alat di sidebar untuk mulai meracik konten viral.</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Add missing icon
const Share = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);
