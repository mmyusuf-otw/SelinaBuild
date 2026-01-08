
import React from 'react';
import { 
  Camera, 
  Music, 
  Video, 
  Sparkles, 
  Wand2, 
  Download, 
  Trash2, 
  RefreshCw, 
  Upload, 
  Maximize2, 
  CheckCircle2, 
  Image as ImageIcon,
  Zap,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Play,
  Pause,
  Volume2,
  Clapperboard,
  Clock,
  Mic2,
  User,
  ExternalLink,
  AlertTriangle,
  Lock,
  RectangleHorizontal,
  RectangleVertical,
  Square as SquareIcon,
  // Added missing Smartphone icon import
  Smartphone
} from 'lucide-react';
import { GoogleGenAI, Modality, VideoGenerationReferenceType } from "@google/genai";

// Helper functions for audio processing
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createWavBlob(pcmData: Uint8Array, sampleRate: number = 24000) {
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

const PROMPT_VARIANTS = [
  "Professional studio product photography, clean white background, commercial lighting, high-end look, sharp focus, 8k resolution.",
  "Product placed on a minimalist wooden table with soft morning sunlight, aesthetic lifestyle setting, blurred plants in background, highly realistic.",
  "Macro photography of the product, cinematic dramatic lighting, dark background, focus on texture and premium details, 8k.",
  "Product flat lay on a luxury marble surface with professional accessories like silk and flowers, balanced composition, bright and airy.",
  "Creative studio photoshoot, colorful neon backlighting, reflections, modern and vibrant atmosphere, commercial quality."
];

const VOICES = [
  { id: 'Zephyr', name: 'Zephyr', gender: 'Wanita', desc: 'Profesional & Formal' },
  { id: 'Kore', name: 'Kore', gender: 'Wanita', desc: 'Ramah & Ceria' },
  { id: 'Puck', name: 'Puck', gender: 'Pria', desc: 'Energetik & Muda' },
  { id: 'Charon', name: 'Charon', gender: 'Pria', desc: 'Tenang & Elegan' },
];

const VIDEO_TONES = [
  { id: 'ads', label: 'Hard Sell (Ads)', desc: 'Fokus konversi & CTA' },
  { id: 'edukasi', label: 'Edukasi', desc: 'Fokus manfaat & cara pakai' },
  { id: 'storytelling', label: 'Storytelling', desc: 'Narasi emosional & gaya hidup' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square', icon: <SquareIcon size={14} />, desc: 'Marketplace/Feed' },
  { id: '3:4', label: '3:4 Portrait', icon: <RectangleVertical size={14} />, desc: 'Instagram' },
  { id: '4:3', label: '4:3 Standard', icon: <RectangleHorizontal size={14} />, desc: 'Web Catalog' },
  { id: '9:16', label: '9:16 Stories', icon: <Smartphone size={14} />, desc: 'TikTok/Reels' },
  { id: '16:9', label: '16:9 Wide', icon: <RectangleHorizontal size={14} />, desc: 'Youtube/Banner' },
];

const MagicStudio: React.FC = () => {
  const [activeTool, setActiveTool] = React.useState<'photo' | 'voice' | 'video'>('photo');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = React.useState(false);
  const [hasVideoApiKey, setHasVideoApiKey] = React.useState<boolean | null>(null);
  
  // Photo States
  const [sourceImage, setSourceImage] = React.useState<string | null>(null);
  const [photoAspectRatio, setPhotoAspectRatio] = React.useState<string>('1:1');
  const [generatedResults, setGeneratedResults] = React.useState<string[]>([]);
  const [zoomImage, setZoomImage] = React.useState<string | null>(null);

  // Voice States
  const [voiceScript, setVoiceScript] = React.useState('');
  const [selectedVoice, setSelectedVoice] = React.useState('Kore');
  const [generatedAudioUrl, setGeneratedAudioUrl] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // UGC Video States
  const [videoProductImage, setVideoProductImage] = React.useState<string | null>(null);
  const [videoTalentImage, setVideoTalentImage] = React.useState<string | null>(null);
  const [videoTone, setVideoTone] = React.useState('ads');
  const [videoPrompt, setVideoPrompt] = React.useState('');
  const [generatedVideo, setGeneratedVideo] = React.useState<string | null>(null);
  const [videoStatus, setVideoStatus] = React.useState('');

  // Check Veo API Key status on tool change
  React.useEffect(() => {
    if (activeTool === 'video') {
      checkVideoKey();
    }
  }, [activeTool]);

  const checkVideoKey = async () => {
    try {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasVideoApiKey(hasKey);
    } catch (e) {
      setHasVideoApiKey(false);
    }
  };

  const handleOpenKeySelector = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Assume success as per instructions to avoid race conditions
      setHasVideoApiKey(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoMagic = async () => {
    if (!sourceImage) return alert("Upload foto produk Juragan dulu!");
    setIsProcessing(true);
    setGeneratedResults([]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = sourceImage.split(',')[1];
      const mimeType = sourceImage.split(';')[0].split(':')[1];
      const results: string[] = [];
      
      // Process variants one by one
      for (const variantPrompt of PROMPT_VARIANTS) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType: mimeType } },
              { text: `Transform this product into a professional photoshoot. ${variantPrompt} Keep the original product design exactly as is.` }
            ]
          },
          config: {
            imageConfig: {
              // @ts-ignore
              aspectRatio: photoAspectRatio
            }
          }
        });
        const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (imgPart?.inlineData) {
          results.push(`data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`);
          setGeneratedResults([...results]);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memproses foto.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!videoProductImage || !videoTalentImage) return alert("Upload foto produk DAN foto talent dulu ya!");
    setIsGeneratingScript(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analisa foto produk dan foto talent ini. Buat naskah video pendek (UGC style) berdurasi 6 detik dengan gaya ${videoTone}. 
      Naskah harus persuasif, dalam Bahasa Indonesia yang gaul/natural, dan fokus pada interaksi talent dengan produk. 
      Hasilkan HANYA teks naskah tanpa penjelasan lain.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: videoProductImage.split(',')[1], mimeType: videoProductImage.split(';')[0].split(':')[1] } },
            { inlineData: { data: videoTalentImage.split(',')[1], mimeType: videoTalentImage.split(';')[0].split(':')[1] } },
            { text: prompt }
          ]
        }
      });
      setVideoPrompt(response.text || '');
    } catch (err) {
      console.error(err);
      alert("Gagal generate naskah.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleVideoMagic = async () => {
    if (!videoPrompt.trim()) return alert("Masukkan naskah video dulu Juragan!");
    if (!videoProductImage || !videoTalentImage) return alert("Dibutuhkan foto produk dan talent sebagai referensi visual.");
    
    setIsProcessing(true);
    setVideoStatus('Menganalisa aset visual...');
    
    try {
      // Re-initialize AI right before call to use latest selected key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const referenceImagesPayload = [
        {
          image: {
            imageBytes: videoProductImage.split(',')[1],
            mimeType: videoProductImage.split(';')[0].split(':')[1],
          },
          referenceType: VideoGenerationReferenceType.ASSET,
        },
        {
          image: {
            imageBytes: videoTalentImage.split(',')[1],
            mimeType: videoTalentImage.split(';')[0].split(':')[1],
          },
          referenceType: VideoGenerationReferenceType.ASSET,
        }
      ];

      setVideoStatus('Memulai proses rendering Veo...');
      let operation;
      try {
        operation = await ai.models.generateVideos({
          model: 'veo-3.1-generate-preview',
          prompt: `UGC Style video: ${videoPrompt}. The talent in the reference photo is using the product in the other reference photo. Natural lighting, 4k, cinematic.`,
          config: {
            numberOfVideos: 1,
            referenceImages: referenceImagesPayload,
            resolution: '720p',
            aspectRatio: '16:9'
          }
        });
      } catch (e: any) {
        if (e.message?.includes("Requested entity was not found")) {
          setHasVideoApiKey(false);
          throw new Error("API Key tidak ditemukan atau belum aktif. Silakan pilih ulang API Key berbayar.");
        }
        throw e;
      }

      const statusMessages = [
        "AI sedang merangkai adegan...",
        "Mengintegrasikan produk Juragan...",
        "Menyesuaikan pencahayaan cinematic...",
        "Sentuhan akhir rendering...",
        "Hampir selesai, sedang mengekspor..."
      ];
      let msgIndex = 0;

      while (!operation.done) {
        setVideoStatus(statusMessages[msgIndex % statusMessages.length]);
        msgIndex++;
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setVideoStatus('Mengunduh hasil video...');
        const videoRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await videoRes.blob();
        setGeneratedVideo(URL.createObjectURL(blob));
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal generate video UGC. Pastikan project GCP Juragan memiliki billing aktif.");
    } finally {
      setIsProcessing(false);
      setVideoStatus('');
    }
  };

  const handleVoiceMagic = async () => {
    if (!voiceScript.trim()) return alert("Tulis naskah dulu Juragan!");
    setIsProcessing(true);
    if (generatedAudioUrl) URL.revokeObjectURL(generatedAudioUrl);
    setGeneratedAudioUrl(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: voiceScript }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const pcmData = decodeBase64(base64Audio);
        const wavBlob = createWavBlob(pcmData, 24000);
        setGeneratedAudioUrl(URL.createObjectURL(wavBlob));
      }
    } catch (err) {
      console.error(err);
      alert("Gagal generate suara.");
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `selina-magic-photo-${index + 1}.png`;
    link.click();
  };

  const getAspectClass = (ratio: string) => {
    switch(ratio) {
      case '1:1': return 'aspect-square';
      case '3:4': return 'aspect-[3/4]';
      case '4:3': return 'aspect-[4/3]';
      case '9:16': return 'aspect-[9/16]';
      case '16:9': return 'aspect-[16/9]';
      default: return 'aspect-square';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Tool Selector */}
      <div className="flex items-center gap-4 border-b pb-4 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => { setActiveTool('photo'); setIsProcessing(false); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shrink-0 ${activeTool === 'photo' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
        >
          <Camera size={18} /> Photo Magic
        </button>
        <button 
          onClick={() => { setActiveTool('voice'); setIsProcessing(false); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shrink-0 ${activeTool === 'voice' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
        >
          <Mic2 size={18} /> Voice Magic
        </button>
        <button 
          onClick={() => { setActiveTool('video'); setIsProcessing(false); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shrink-0 ${activeTool === 'video' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
        >
          <Clapperboard size={18} /> UGC Video Magic
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bento-card bg-white p-6 border border-slate-100 shadow-sm space-y-6">
            
            {activeTool === 'photo' && (
              <>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-amber-500" /> AI Photoshoot</h3>
                  <p className="text-xs text-slate-400">Ubah foto HP menjadi hasil jepretan studio profesional.</p>
                </div>
                
                <div className="space-y-4">
                  {/* Aspect Ratio Selector */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pilih Ukuran Output</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ASPECT_RATIOS.map(ratio => (
                        <button 
                          key={ratio.id}
                          onClick={() => setPhotoAspectRatio(ratio.id)}
                          className={`p-3 border rounded-xl text-left transition-all flex flex-col gap-1 ${photoAspectRatio === ratio.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                        >
                          <div className="flex items-center gap-2">
                            {ratio.icon}
                            <span className="text-xs font-bold">{ratio.label}</span>
                          </div>
                          <span className={`text-[8px] ${photoAspectRatio === ratio.id ? 'text-indigo-100' : 'text-slate-400'}`}>{ratio.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Foto Produk</label>
                    <div className="relative group">
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setSourceImage)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {sourceImage ? (
                        <div className={`relative ${getAspectClass(photoAspectRatio)} rounded-3xl overflow-hidden border-2 border-indigo-100`}>
                          <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-square border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 bg-slate-50 group-hover:bg-indigo-50/50 transition-all">
                          <Upload size={24} className="text-slate-400" />
                          <p className="text-xs font-bold text-slate-400">Upload Foto Produk</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!sourceImage || isProcessing}
                  onClick={handlePhotoMagic}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl disabled:opacity-50 transition-all active:scale-95"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" /> : <Zap size={20} />}
                  {isProcessing ? 'Generating...' : 'Mulai Photoshoot'}
                </button>
              </>
            )}

            {activeTool === 'voice' && (
              <>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Music className="text-indigo-500" /> Voiceover Iklan</h3>
                  <p className="text-xs text-slate-400">Generate suara profesional dari naskah Juragan.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Naskah (Script)</label>
                    <textarea 
                      value={voiceScript}
                      onChange={(e) => setVoiceScript(e.target.value)}
                      placeholder="Contoh: Dapatkan diskon 50% untuk produk kecantikan kami hari ini saja!"
                      className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pilih Karakter Suara</label>
                    <div className="grid grid-cols-1 gap-2">
                      {VOICES.map(v => (
                        <button 
                          key={v.id}
                          onClick={() => setSelectedVoice(v.id)}
                          className={`p-4 border rounded-2xl text-left transition-all flex items-center justify-between group ${selectedVoice === v.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl flex items-center justify-center ${selectedVoice === v.id ? 'bg-white/20' : v.gender === 'Wanita' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                              <User size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold flex items-center gap-2">{v.name} <span className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase ${selectedVoice === v.id ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>{v.gender}</span></p>
                              <p className={`text-[10px] mt-0.5 ${selectedVoice === v.id ? 'text-indigo-100' : 'text-slate-400'}`}>{v.desc}</p>
                            </div>
                          </div>
                          {selectedVoice === v.id && <CheckCircle2 size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button 
                  disabled={!voiceScript || isProcessing}
                  onClick={handleVoiceMagic}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl disabled:opacity-50 transition-all active:scale-95"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" /> : <Volume2 size={20} />}
                  {isProcessing ? 'Membaca Naskah...' : 'Generate Voiceover'}
                </button>
              </>
            )}

            {activeTool === 'video' && (
              <>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Clapperboard className="text-rose-500" /> UGC Video Generator</h3>
                  <p className="text-xs text-slate-400">Gabungkan produk & talent menjadi video marketing.</p>
                </div>

                {hasVideoApiKey === false ? (
                  <div className="p-6 bg-slate-900 rounded-[32px] text-white space-y-4 animate-in zoom-in-95">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500 rounded-xl"><Lock size={18} /></div>
                      <h4 className="font-bold text-sm">Aktivasi Video Premium</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Fitur video UGC menggunakan model <b>Veo 3.1</b> yang memerlukan API Key berbayar dari Google Cloud Juragan.
                    </p>
                    <div className="space-y-2 pt-2">
                      <button 
                        onClick={handleOpenKeySelector}
                        className="w-full py-3 bg-white text-slate-900 rounded-xl text-xs font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Zap size={14} className="fill-amber-500 text-amber-500" /> Pilih API Key
                      </button>
                      <a 
                        href="https://ai.google.dev/gemini-api/docs/billing" 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full py-3 border border-white/20 rounded-xl text-[10px] font-bold text-slate-400 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        Pelajari Billing <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">1. Foto Produk</label>
                          <div className="relative aspect-square border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50 group cursor-pointer">
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setVideoProductImage)} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                            {videoProductImage ? <img src={videoProductImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24} /></div>}
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">2. Foto Talent</label>
                          <div className="relative aspect-square border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50 group cursor-pointer">
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setVideoTalentImage)} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                            {videoTalentImage ? <img src={videoTalentImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={24} /></div>}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">3. Pilih Alur/Tone</label>
                       <div className="grid grid-cols-1 gap-2">
                          {VIDEO_TONES.map(t => (
                            <button 
                              key={t.id}
                              onClick={() => setVideoTone(t.id)}
                              className={`p-3 border rounded-xl text-left transition-all ${videoTone === t.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-indigo-300'}`}
                            >
                               <p className="text-xs font-bold">{t.label}</p>
                               <p className={`text-[8px] ${videoTone === t.id ? 'text-indigo-100' : 'text-slate-400'}`}>{t.desc}</p>
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">4. Naskah Video</label>
                        <button 
                          onClick={handleGenerateScript}
                          disabled={isGeneratingScript || !videoProductImage || !videoTalentImage}
                          className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline disabled:opacity-30"
                        >
                          {isGeneratingScript ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />} Generate AI
                        </button>
                      </div>
                      <textarea 
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        placeholder="Contoh: Model mengoleskan parfum ke leher sambil tersenyum ke kamera..."
                        className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button 
                      disabled={!videoPrompt || isProcessing}
                      onClick={handleVideoMagic}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl disabled:opacity-50 transition-all active:scale-95"
                    >
                      {isProcessing ? <RefreshCw className="animate-spin" /> : <Clapperboard size={20} />}
                      {isProcessing ? 'Rendering UGC...' : 'Generate Video UGC'}
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          <div className="bento-card bg-indigo-50 p-6 border border-indigo-100">
            <h4 className="font-bold text-indigo-900 text-sm mb-2">💡 Tips Selina</h4>
            <p className="text-[10px] text-indigo-700 leading-relaxed">
              Video UGC bekerja paling best jika foto talent memiliki ekspresi yang ceria dan pencahayaan yang mirip dengan produk.
            </p>
          </div>
        </div>

        {/* Output Gallery */}
        <div className="lg:col-span-8">
          {isProcessing || generatedResults.length > 0 || generatedAudioUrl || generatedVideo ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   Output Magic <Sparkles size={14} className="text-amber-500" />
                </h4>
              </div>

              {activeTool === 'photo' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {generatedResults.map((url, idx) => (
                    <div key={idx} className={`group relative ${getAspectClass(photoAspectRatio)} bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 animate-in zoom-in duration-500`}>
                      <img src={url} alt={`Result ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                         <div className="flex gap-2">
                            <button onClick={() => setZoomImage(url)} className="flex-1 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-slate-100"><Search size={12} /> Detail</button>
                            <button onClick={() => downloadImage(url, idx)} className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700"><Download size={14} /></button>
                         </div>
                      </div>
                      <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur shadow-sm rounded-lg text-[8px] font-bold text-slate-900 uppercase">Angle {idx + 1}</div>
                    </div>
                  ))}
                  {isProcessing && generatedResults.length < 5 && <div className={`${getAspectClass(photoAspectRatio)} bg-slate-100 rounded-[32px] flex flex-col items-center justify-center gap-3 animate-pulse border-2 border-dashed border-slate-200`}><RefreshCw className="text-slate-300 animate-spin" size={24} /><span className="text-[10px] text-slate-400 font-bold">Menyihir...</span></div>}
                </div>
              )}

              {activeTool === 'voice' && (
                <div className="bg-white border border-slate-100 rounded-[32px] p-10 flex flex-col items-center justify-center gap-8 animate-in slide-in-from-bottom-4">
                  {isProcessing ? (
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto animate-bounce"><Volume2 size={40} /></div>
                      <p className="text-lg font-black text-slate-900">Menyusun Suara Emas...</p>
                    </div>
                  ) : generatedAudioUrl ? (
                    <>
                      <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100 border-4 border-emerald-100 animate-in zoom-in duration-500"><Volume2 size={40} /></div>
                      <div className="text-center space-y-2">
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">Suara Berhasil Dibuat!</h4>
                      </div>
                      <div className="w-full max-w-md space-y-6">
                        <audio ref={audioRef} src={generatedAudioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                        <div className="bg-slate-900 p-6 rounded-[32px] shadow-2xl space-y-4 border border-slate-800">
                          <div className="flex items-center gap-6">
                            <button onClick={togglePlayAudio} className="w-16 h-16 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all active:scale-95">
                              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="ml-1" fill="currentColor" />}
                            </button>
                            <div className="flex-1 space-y-2">
                               <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div className={`h-full bg-indigo-500 transition-all duration-300 ${isPlaying ? 'w-full' : 'w-0'}`}></div></div>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => { const link = document.createElement('a'); link.href = generatedAudioUrl!; link.download = 'selina-voiceover.wav'; link.click(); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl transition-all"><Download size={20} /> Unduh Kualitas HD</button>
                      </div>
                    </>
                  ) : null}
                </div>
              )}

              {activeTool === 'video' && (
                <div className="bg-white border border-slate-100 rounded-[32px] p-8 flex flex-col items-center justify-center gap-6 animate-in slide-in-from-bottom-4 overflow-hidden min-h-[500px]">
                  {isProcessing ? (
                    <div className="text-center space-y-6 w-full max-w-lg">
                      <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 bg-rose-100 rounded-full animate-ping opacity-20"></div>
                        <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl border border-rose-50"><Clapperboard size={48} className="text-rose-600 animate-pulse" /></div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-xl font-black text-slate-900">{videoStatus}</p>
                        <div className="space-y-2">
                           <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>PROSES RENDER</span><span>EST. 60S - 120S</span></div>
                           <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-500 animate-[progress_30s_ease-in-out_infinite]"></div>
                           </div>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed italic">"Tahukah Juragan? Video UGC memiliki tingkat klik (CTR) 3x lebih tinggi daripada video promosi biasa!"</p>
                      </div>
                    </div>
                  ) : generatedVideo ? (
                    <div className="w-full h-full flex flex-col gap-6 animate-in zoom-in duration-500">
                      <div className={`relative mx-auto rounded-[32px] overflow-hidden shadow-2xl bg-black border-4 border-slate-100 aspect-video w-full max-w-3xl`}>
                        <video src={generatedVideo} className="w-full h-full object-cover" controls autoPlay loop />
                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-indigo-600/80 backdrop-blur text-white rounded-lg text-[10px] font-bold">UGC CONTENT BY SELINA</div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-3 max-w-2xl mx-auto w-full">
                         <button onClick={() => { const link = document.createElement('a'); link.href = generatedVideo!; link.download = 'selina-ugc-video.mp4'; link.click(); }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-indigo-700 transition-all"><Download size={20} /> Simpan Video HD</button>
                         <button onClick={() => { setGeneratedVideo(null); setVideoPrompt(''); }} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Buat Versi Lain</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-center">
                       <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><CheckCircle2 size={32} /></div>
                       <h4 className="text-lg font-bold">Aset Siap Diproses</h4>
                       <p className="text-xs text-slate-500">Foto produk dan talent sudah sesuai. Klik tombol di kiri untuk mulai menyihir video Juragan.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[500px] border-4 border-dashed border-slate-100 rounded-[48px] flex flex-col items-center justify-center text-center p-12 space-y-4 animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                 {activeTool === 'photo' && <ImageIcon size={48} />}
                 {activeTool === 'voice' && <Mic2 size={48} />}
                 {activeTool === 'video' && <Clapperboard size={48} />}
              </div>
              <h4 className="text-xl font-bold text-slate-300 uppercase tracking-widest">
                {activeTool === 'photo' ? 'Ruang Studio AI' : activeTool === 'voice' ? 'Ruang Rekaman AI' : 'UGC Production House'}
              </h4>
              <p className="text-sm text-slate-300 max-w-xs">Upload aset produk dan talent di panel kiri untuk membuat video UGC yang viral!</p>
            </div>
          )}
        </div>
      </div>

      {/* Zoom Lightbox */}
      {zoomImage && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <button onClick={() => setZoomImage(null)} className="absolute top-8 right-8 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"><X size={24} /></button>
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
             <div className="relative group cursor-zoom-in overflow-hidden rounded-[40px] shadow-2xl border-8 border-white/5 bg-white">
                <img src={zoomImage} alt="Zoom" className="max-h-[85vh] object-contain transition-transform duration-300 hover:scale-150" onMouseMove={(e) => { const img = e.currentTarget; const { left, top, width, height } = img.getBoundingClientRect(); const x = ((e.pageX - left) / width) * 100; const y = ((e.pageY - top) / height) * 100; img.style.transformOrigin = `${x}% ${y}%`; }} />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MagicStudio;
