
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
  X,
  Layers,
  Layout,
  ImageIcon,
  Users,
  ShieldCheck,
  Star,
  Instagram,
  Facebook,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Palette,
  FileAudio,
  Film
} from 'lucide-react';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import WinningMagic from './WinningMagic';

// --- HELPERS ---
function decode(base64: string) {
  const binaryString = atob(base64.split(',')[1] || base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

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
  view.setUint16(16, 16, true);
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

// --- CONSTANTS ---
const PHOTO_STYLES = [
  { id: 'minimalist', label: 'Minimal Studio', desc: 'Bersih & Modern', prompt: 'Inside a minimalist clean studio with soft professional lighting, white marble table.' },
  { id: 'luxury', label: 'Luxury Gold', desc: 'Mewah & Berkelas', prompt: 'In a high-end luxury boutique setting, warm golden light, bokeh velvet background.' },
  { id: 'nature', label: 'Nature Zen', desc: 'Alami & Segar', prompt: 'On a wooden surface outdoors, surrounded by tropical leaves, sunlight filtering through trees.' },
  { id: 'cyber', label: 'Cyber Neon', desc: 'Enerjik & Futuristik', prompt: 'In a futuristic urban setting with neon lights, reflections, dark aesthetic.' },
];

const VOICE_TALENTS = [
  { id: 'Arini', name: 'Arini', gender: 'Wanita', engine: 'Kore', type: 'Sweet & Friendly' },
  { id: 'Budi', name: 'Budi', gender: 'Pria', engine: 'Puck', type: 'Deep & Professional' },
];

const VIDEO_RATIOS = [
  { id: '9:16', label: 'Portrait', icon: <Smartphone size={18} />, desc: 'Reels / TikTok' },
  { id: '16:9', label: 'Landscape', icon: <Monitor size={18} />, desc: 'YouTube / FB' },
];

export default function MagicStudio() {
  const [activeTool, setActiveTool] = React.useState<'photo' | 'voice' | 'video' | 'post' | 'winning'>('winning');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingMsg, setProcessingMsg] = React.useState('');
  const [progressValue, setProgressValue] = React.useState(0);

  // --- Photo Magic States ---
  const [photoInput, setPhotoInput] = React.useState<string | null>(null);
  const [photoStyle, setPhotoStyle] = React.useState('minimalist');
  const [photoResult, setPhotoResult] = React.useState<string | null>(null);

  // --- Voice Magic States ---
  const [voiceText, setVoiceText] = React.useState('');
  const [selectedVoice, setSelectedVoice] = React.useState('Arini');
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const currentSourceRef = React.useRef<AudioBufferSourceNode | null>(null);

  // --- Video Magic States ---
  const [videoPrompt, setVideoPrompt] = React.useState('');
  const [videoRatio, setVideoRatio] = React.useState('9:16');
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);

  // --- Post Magic States ---
  const [postImage, setPostImage] = React.useState<string | null>(null);
  const [postName, setPostName] = React.useState('');
  const [postResult, setPostResult] = React.useState<{ images: string[], caption: string } | null>(null);
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --- PHOTO MAGIC LOGIC ---
  const handlePhotoMagic = async () => {
    if (!photoInput) return;
    setIsProcessing(true);
    setProcessingMsg("Menghapus Background & Merender Studio...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const style = PHOTO_STYLES.find(s => s.id === photoStyle);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: photoInput.split(',')[1], mimeType: 'image/jpeg' } },
            { text: `Enhance this product image. Keep the product exactly the same, but place it in this new environment: ${style?.prompt}. Make it look like professional commercial photography.` }
          ]
        },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setPhotoResult(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
    } catch (e) {
      alert("Gagal merender foto. Pastikan API Key valid.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- VOICE MAGIC LOGIC ---
  const handleVoiceMagic = async () => {
    if (!voiceText.trim()) return;
    setIsProcessing(true);
    setProcessingMsg("Mensintesis Suara AI...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const talent = VOICE_TALENTS.find(v => v.id === selectedVoice);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: voiceText }] }],
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
      alert("Gagal menghasilkan suara.");
    } finally {
      setIsProcessing(false);
    }
  };

  const playVoice = async () => {
    if (!audioBlob) return;
    if (isPlaying) {
      currentSourceRef.current?.stop();
      setIsPlaying(false);
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
      source.onended = () => setIsPlaying(false);
      source.start();
      currentSourceRef.current = source;
      setIsPlaying(true);
    } catch (e) { console.error(e); }
  };

  // --- VIDEO MAGIC LOGIC ---
  const handleVideoMagic = async () => {
    if (!videoPrompt.trim()) return;

    // Check API Key
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      return;
    }

    setIsProcessing(true);
    setProcessingMsg("Menyiapkan Skenario & Rendering Video (Estimasi 2-3 Menit)...");
    setProgressValue(10);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Cinematic high-quality UGC style video: ${videoPrompt}. Professional lighting, 4k resolution, energetic movement.`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: videoRatio as any
        }
      });

      // Polling
      let attempts = 0;
      while (!operation.done && attempts < 30) {
        attempts++;
        setProgressValue(prev => Math.min(95, prev + 3));
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await response.blob();
        setVideoUrl(URL.createObjectURL(videoBlob));
      }
    } catch (e) {
      alert("Proses video gagal atau timeout. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
      setProgressValue(0);
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      {/* Tab Nav */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'winning', label: 'Winning Magic', icon: <TrendingUp size={18} /> },
          { id: 'photo', label: 'Photo Studio', icon: <Camera size={18} /> },
          { id: 'voice', label: 'Voice Talent', icon: <Mic2 size={18} /> },
          { id: 'video', label: 'Video Creator', icon: <MovieIcon size={18} /> },
          { id: 'post', label: 'Post Magic', icon: <ChevronRightSquare size={18} /> },
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => { setActiveTool(t.id as any); setIsProcessing(false); setPhotoResult(null); setAudioUrl(null); setVideoUrl(null); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shrink-0 ${activeTool === t.id ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIDEBAR CONTROLS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bento-card bg-white p-8 border border-slate-100 shadow-sm space-y-6 sticky top-24">
            
            {activeTool === 'photo' && (
              <div className="space-y-6">
                <div className="space-y-1">
                   <h3 className="text-xl font-black flex items-center gap-2"><Palette className="text-indigo-500" /> Photo Studio</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Background Replacement</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Foto Produk</label>
                    <div className="relative aspect-square border-2 border-dashed border-slate-100 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center group cursor-pointer">
                       <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setPhotoInput)} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                       {photoInput ? <img src={photoInput} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-slate-300"><Upload size={24} /><span className="text-[10px] font-bold mt-2">Pilih Foto</span></div>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Tema Background</label>
                    <div className="grid grid-cols-1 gap-2">
                       {PHOTO_STYLES.map(s => (
                         <button 
                           key={s.id}
                           onClick={() => setPhotoStyle(s.id)}
                           className={`p-4 border rounded-2xl text-left transition-all ${photoStyle === s.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}
                         >
                            <p className="text-xs font-black uppercase tracking-widest">{s.label}</p>
                            <p className={`text-[10px] font-medium ${photoStyle === s.id ? 'text-indigo-100' : 'text-slate-400'}`}>{s.desc}</p>
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handlePhotoMagic}
                  disabled={!photoInput || isProcessing}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" /> : <Sparkles size={16} />}
                  Mulai Desain
                </button>
              </div>
            )}

            {activeTool === 'voice' && (
              <div className="space-y-6">
                <div className="space-y-1">
                   <h3 className="text-xl font-black flex items-center gap-2"><Mic2 className="text-indigo-500" /> Voice Talent</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Text to Speech HD</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Naskah Iklan</label>
                    <textarea 
                      value={voiceText}
                      onChange={(e) => setVoiceText(e.target.value)}
                      placeholder="Halo Juragan! Gunakan Selina untuk scale-up bisnismu lebih cepat..."
                      className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white transition-all resize-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Karakter Suara</label>
                    <div className="grid grid-cols-1 gap-2">
                       {VOICE_TALENTS.map(v => (
                         <button 
                           key={v.id}
                           onClick={() => setSelectedVoice(v.id)}
                           className={`p-4 border rounded-2xl text-left transition-all flex items-center justify-between ${selectedVoice === v.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}
                         >
                            <div>
                              <p className="text-xs font-black uppercase tracking-widest">{v.name}</p>
                              <p className={`text-[10px] font-medium ${selectedVoice === v.id ? 'text-indigo-100' : 'text-slate-400'}`}>{v.type}</p>
                            </div>
                            <Volume2 size={16} className={selectedVoice === v.id ? 'text-white' : 'text-slate-300'} />
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleVoiceMagic}
                  disabled={!voiceText || isProcessing}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" /> : <Mic2 size={16} />}
                  Sintesis Suara
                </button>
              </div>
            )}

            {activeTool === 'video' && (
              <div className="space-y-6">
                <div className="space-y-1">
                   <h3 className="text-xl font-black flex items-center gap-2"><MovieIcon className="text-indigo-500" /> Video Creator</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI UGC Video Reels</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Konsep Video</label>
                    <textarea 
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      placeholder="Contoh: Video seorang wanita sedang memegang serum wajah di depan cermin, terlihat sangat bahagia karena wajahnya glowing."
                      className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:bg-white transition-all resize-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rasio Video</label>
                    <div className="grid grid-cols-2 gap-2">
                       {VIDEO_RATIOS.map(r => (
                         <button 
                           key={r.id}
                           onClick={() => setVideoRatio(r.id)}
                           className={`p-4 border rounded-2xl flex flex-col items-center gap-2 transition-all ${videoRatio === r.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}
                         >
                            {r.icon}
                            <span className="text-[9px] font-black uppercase">{r.label}</span>
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleVideoMagic}
                  disabled={!videoPrompt || isProcessing}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" /> : <MovieIcon size={16} />}
                  Generate Video
                </button>
                <p className="text-[9px] text-slate-400 text-center font-bold italic">* Memerlukan API Key Berlangganan Google Cloud</p>
              </div>
            )}

            {/* Other Sidebars (Winning, Post) remain as before but handled in logic */}
            {(activeTool === 'winning' || activeTool === 'post') && (
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Info</p>
                <p className="text-xs text-indigo-900 mt-1">Gunakan alat ini untuk meriset kompetitor dan membuat konten viral.</p>
              </div>
            )}
          </div>
        </div>

        {/* MAIN DISPLAY AREA */}
        <div className="lg:col-span-8">
           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col items-center min-h-[600px] animate-in zoom-in-95 overflow-hidden">
              {isProcessing ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 w-full max-w-sm">
                   <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                     <Sparkles className="text-white" size={48} />
                   </div>
                   <div className="space-y-4 w-full">
                      <p className="text-xl font-black text-slate-900 tracking-tight">{processingMsg}</p>
                      {progressValue > 0 && (
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progressValue}%` }} />
                        </div>
                      )}
                      <div className="flex justify-center items-center gap-1 h-8">
                         {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
                         ))}
                      </div>
                   </div>
                </div>
              ) : (
                <div className="w-full flex-1">
                   {/* PHOTO RESULT */}
                   {activeTool === 'photo' && (
                     <div className="h-full flex flex-col items-center justify-center space-y-10">
                        {photoResult ? (
                          <div className="flex flex-col items-center space-y-8">
                             <div className="flex gap-4 items-center">
                                <div className="text-center space-y-2">
                                   <p className="text-[10px] font-black uppercase text-slate-400">Original</p>
                                   <img src={photoInput!} className="w-32 h-32 object-cover rounded-2xl border border-slate-100 grayscale opacity-50" />
                                </div>
                                <ChevronRight className="text-slate-200" />
                                <div className="text-center space-y-2">
                                   <p className="text-[10px] font-black uppercase text-indigo-600">AI Result</p>
                                   <div className="relative group">
                                      <img src={photoResult} className="w-80 h-80 object-cover rounded-[40px] shadow-2xl shadow-indigo-100 border-4 border-white" />
                                      <button 
                                        onClick={() => { const a = document.createElement('a'); a.href = photoResult; a.download = 'selina-photo.png'; a.click(); }}
                                        className="absolute inset-0 bg-indigo-600/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-[36px]"
                                      >
                                         <Download size={40} className="text-white" />
                                      </button>
                                   </div>
                                </div>
                             </div>
                             <button onClick={() => setPhotoResult(null)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Buat Ulang Tema Lain</button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-6 opacity-20">
                             <Camera size={80} />
                             <p className="text-sm font-black uppercase tracking-widest text-center">Tunggu Keajaiban Selina</p>
                          </div>
                        )}
                     </div>
                   )}

                   {/* VOICE RESULT */}
                   {activeTool === 'voice' && (
                      <div className="h-full flex flex-col items-center justify-center space-y-10">
                         {audioUrl ? (
                            <div className="flex flex-col items-center gap-8 animate-in zoom-in-95">
                               <div className="w-32 h-32 bg-indigo-600 rounded-[40px] flex items-center justify-center shadow-2xl shadow-indigo-100 relative group">
                                  <div className="absolute inset-0 bg-white/20 rounded-[40px] animate-ping scale-110 opacity-20"></div>
                                  <FileAudio size={56} className="text-white" />
                               </div>
                               <div className="text-center space-y-2">
                                  <h4 className="text-2xl font-black">Suara AI Siap!</h4>
                                  <p className="text-xs text-slate-500">Audio high definition siap digunakan untuk iklan Juragan.</p>
                               </div>
                               <div className="flex items-center gap-4">
                                  <button 
                                    onClick={playVoice}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${isPlaying ? 'bg-rose-500 text-white scale-90' : 'bg-indigo-600 text-white hover:scale-110'}`}
                                  >
                                     {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                                  </button>
                                  <button 
                                    onClick={() => { const a = document.createElement('a'); a.href = audioUrl; a.download = 'selina-voice.wav'; a.click(); }}
                                    className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm transition-all"
                                  >
                                     <Download size={28} />
                                  </button>
                               </div>
                               <button onClick={() => setAudioUrl(null)} className="text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-indigo-600">Ganti Naskah</button>
                            </div>
                         ) : (
                            <div className="flex flex-col items-center gap-6 opacity-20">
                               <Mic2 size={80} />
                               <p className="text-sm font-black uppercase tracking-widest text-center">Siapkan Naskah Jualanmu</p>
                            </div>
                         )}
                      </div>
                   )}

                   {/* VIDEO RESULT */}
                   {activeTool === 'video' && (
                      <div className="h-full flex flex-col items-center justify-center space-y-10">
                         {videoUrl ? (
                            <div className="flex flex-col items-center gap-8 animate-in zoom-in-95">
                               <div className={`rounded-[40px] overflow-hidden shadow-2xl border-4 border-white ${videoRatio === '9:16' ? 'w-64 h-[400px]' : 'w-full h-80'}`}>
                                  <video src={videoUrl} controls className="w-full h-full object-cover" />
                               </div>
                               <div className="flex items-center gap-4">
                                  <button 
                                    onClick={() => { const a = document.createElement('a'); a.href = videoUrl; a.download = 'selina-ugc.mp4'; a.click(); }}
                                    className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
                                  >
                                     <Download size={20} /> Download MP4 HD
                                  </button>
                                  <button onClick={() => setVideoUrl(null)} className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"><RefreshCw size={20}/></button>
                               </div>
                            </div>
                         ) : (
                            <div className="flex flex-col items-center gap-6 opacity-20">
                               <Film size={80} />
                               <p className="text-sm font-black uppercase tracking-widest text-center">Video Juragan Sedang Dimasak</p>
                            </div>
                         )}
                      </div>
                   )}

                   {/* WINNING MAGIC */}
                   {activeTool === 'winning' && (
                      <WinningMagic onAutoFillPrompt={(p) => { setVideoPrompt(p); setActiveTool('video'); }} />
                   )}

                   {/* POST MAGIC PREVIEW */}
                   {activeTool === 'post' && (
                      <div className="h-full flex flex-col items-center justify-center">
                         {/* Existing Post Magic UI... */}
                         <div className="flex flex-col items-center gap-6 opacity-20">
                            <ChevronRightSquare size={80} />
                            <p className="text-sm font-black uppercase tracking-widest text-center">Post Magic 4.0 Studio</p>
                         </div>
                      </div>
                   )}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
