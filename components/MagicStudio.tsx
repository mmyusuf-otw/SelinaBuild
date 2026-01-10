
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
  Smartphone,
  Layout,
  Type,
  Hash,
  Send,
  Copy,
  ChevronRightSquare,
  Wand,
  Monitor,
  Clapperboard as MovieIcon,
  Layers,
  Images
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

const VOICES = [
  { id: 'Zephyr', name: 'Zephyr', gender: 'Wanita', desc: 'Profesional & Formal' },
  { id: 'Kore', name: 'Kore', gender: 'Wanita', desc: 'Ramah & Ceria' },
  { id: 'Puck', name: 'Puck', gender: 'Pria', desc: 'Energetik & Muda' },
  { id: 'Charon', name: 'Charon', gender: 'Pria', desc: 'Tenang & Elegan' },
];

const VIDEO_TYPES = [
  { id: 'storytelling', label: 'Storytelling', desc: 'Narasi emosional & gaya hidup', icon: '📖' },
  { id: 'ads', label: 'Ads Driven', desc: 'Fokus konversi & USP produk', icon: '💰' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square', icon: <SquareIcon size={14} />, desc: 'Marketplace/Feed' },
  { id: '3:4', label: '3:4 Portrait', icon: <RectangleVertical size={14} />, desc: 'Instagram' },
  { id: '4:3', label: '4:3 Standard', icon: <RectangleHorizontal size={14} />, desc: 'Web Catalog' },
  { id: '9:16', label: '9:16 Stories', icon: <Smartphone size={14} />, desc: 'TikTok/Reels' },
  { id: '16:9', label: '16:9 Wide', icon: <RectangleHorizontal size={14} />, desc: 'Youtube/Banner' },
];

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', icon: '🎵', ratio: '9:16', style: 'Gen-Z, Trendy, TikTok viral aesthetics' },
  { id: 'ig', label: 'Instagram', icon: '📸', ratio: '9:16', style: 'Aesthetic, Clean, Minimalist' },
  { id: 'fb', label: 'Facebook', icon: '👥', ratio: '4:3', style: 'Informative, Clear, Professional' },
  { id: 'youtube', label: 'YouTube', icon: '📺', ratio: '16:9', style: 'Cinematic, High Production, Detailed' },
];

const MagicStudio: React.FC = () => {
  const [activeTool, setActiveTool] = React.useState<'photo' | 'voice' | 'video' | 'post'>('photo');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = React.useState(false);
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

  // Video Magic States
  const [videoProductImage, setVideoProductImage] = React.useState<string | null>(null);
  const [videoTalentImage, setVideoTalentImage] = React.useState<string | null>(null);
  const [videoType, setVideoType] = React.useState('storytelling');
  const [videoScriptPrompt, setVideoScriptPrompt] = React.useState('');
  const [videoPlatform, setVideoPlatform] = React.useState('tiktok');
  const [storyboardScenes, setStoryboardScenes] = React.useState<string[]>([]);
  const [generatedVideo, setGeneratedVideo] = React.useState<string | null>(null);
  const [videoStatus, setVideoStatus] = React.useState('');
  const [videoProgress, setVideoProgress] = React.useState(0);

  // Post Magic States
  const [postProductImage, setPostProductImage] = React.useState<string | null>(null);
  const [postProductName, setPostProductName] = React.useState('');
  const [postDesc, setPostDesc] = React.useState('');
  const [selectedPlatform, setSelectedPlatform] = React.useState('ig');
  const [postCarousel, setPostCarousel] = React.useState<string[]>([]);
  const [postCaption, setPostCaption] = React.useState('');
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [postProgress, setPostProgress] = React.useState(0);

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

  const downloadFile = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllStoryboard = async () => {
    if (storyboardScenes.length === 0) return;
    for (let i = 0; i < storyboardScenes.length; i++) {
      downloadFile(storyboardScenes[i], `selina-storyboard-scene-${i + 1}.png`);
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  };

  const handleAutoSuggestPost = async () => {
    if (!postProductImage) return alert("Upload foto produk dulu Juragan!");
    setIsAnalyzingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = postProductImage.split(',')[1];
      const mimeType = postProductImage.split(';')[0].split(':')[1];

      const prompt = `Analyze this product image. Provide output in raw JSON format:
      {
        "productName": "Attractive product name (max 5 words)",
        "description": "Short persuasive description in Indonesian"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ inlineData: { data: base64Data, mimeType } }, { text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      if (result.productName) setPostProductName(result.productName);
      if (result.description) setPostDesc(result.description);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handlePostMagic = async () => {
    if (!postProductImage || !postProductName || !postDesc) return alert("Lengkapi data produk dulu!");
    setIsProcessing(true);
    setPostCarousel([]);
    setPostCaption('');
    setPostProgress(0);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = postProductImage.split(',')[1];
      const mimeType = postProductImage.split(';')[0].split(':')[1];
      const platformInfo = PLATFORMS.find(p => p.id === selectedPlatform);
      
      const carouselResults: string[] = [];
      const slidePrompts = [
        `Masterpiece Hero Slide. Display ONLY the text "${postProductName}" in professional, clean, minimalist bold typography. Place it at the top or bottom corner. High-end lighting. NO TYPOS.`,
        `Product Benefit Slide. Close up view of the product. Maintain original labels. NO random messy letters or typos in background.`,
        `Lifestyle Showcase Slide. Product in a high-end natural usage environment. Authentic lighting.`,
        `Minimalist Clean Feature Slide. Highlight one key benefit. No decorative text that looks like gibberish.`,
        `Call to Action Slide. Encouraging and clean layout. NO background typos.`
      ];

      for (let i = 0; i < 5; i++) {
        setPostProgress((i + 1) * 15);
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: `Create a professional social media marketing slide. Theme: ${postProductName}. Instruction: ${slidePrompts[i]}. Target Style: ${platformInfo?.style}. IMPORTANT: NO TYPOS. Ensure typography is sharp and readable.` }
            ]
          },
          config: { imageConfig: { 
            // @ts-ignore
            aspectRatio: platformInfo?.ratio 
          } }
        });
        const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (imgPart?.inlineData) {
          carouselResults.push(`data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`);
          setPostCarousel([...carouselResults]);
        }
      }

      setPostProgress(90);
      const capResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Buat caption media sosial yang powerfull dalam Bahasa Indonesia untuk platform ${platformInfo?.label} mengenai produk "${postProductName}" dengan deskripsi "${postDesc}". Sertakan hashtag.`
      });
      setPostCaption(capResponse.text || '');
      setPostProgress(100);
    } catch (err) {
      alert("Gagal menyulap postingan.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoSuggestVideo = async () => {
    if (!videoProductImage || !videoTalentImage) return alert("Upload foto produk dan talent dulu!");
    setIsAnalyzingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this product and talent image. Create a short storytelling video script (3-5 sentences) in Indonesian for platform ${videoPlatform}. Focus on why this influencer loves the product. Tone: ${videoType}.`;
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
      setVideoScriptPrompt(response.text || '');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleGenerateStoryboard = async () => {
    if (!videoProductImage || !videoTalentImage || !videoScriptPrompt) return alert("Lengkapi data video dulu!");
    setIsProcessing(true);
    setStoryboardScenes([]);
    setGeneratedVideo(null);
    setVideoProgress(0);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const platformInfo = PLATFORMS.find(p => p.id === videoPlatform);
      const scenes: string[] = [];
      
      const backgrounds = [
        "Modern minimalist living room with aesthetic furniture and plants.",
        "Trendy urban street background with cinematic bokeh city lights.",
        "Professional studio with high-end props and artistic soft lighting.",
        "Cozy natural location like a warm cafe or a clean home office space.",
        "Clean, elegant minimalist background for the final brand message."
      ];

      const directiveActions = [
        "Hook: Talent smiling brightly while unboxing or showing product. Authentic vibe.",
        "Usage: Talent using the product in a real-life diverse environment.",
        "Detail: Close-up of product textures and labels in talent's hands.",
        "Reaction: Talent looking extremely satisfied and impressed with the results.",
        "Closing: Talent inviting viewers to shop now with a friendly high-energy gesture."
      ];

      for (let i = 0; i < 5; i++) {
        setVideoProgress((i + 1) * 20);
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data: videoProductImage.split(',')[1], mimeType: videoProductImage.split(';')[0].split(':')[1] } },
              { inlineData: { data: videoTalentImage.split(',')[1], mimeType: videoTalentImage.split(';')[0].split(':')[1] } },
              { text: `Video Storyboard Scene ${i+1}. Theme: ${videoScriptPrompt}. ENVIRONMENT: ${backgrounds[i]}. ACTION: ${directiveActions[i]}. Ensure talent and product consistency but IGNORE original backgrounds. Create new immersive environments.` }
            ]
          },
          config: { imageConfig: { 
            // @ts-ignore
            aspectRatio: platformInfo?.ratio 
          } }
        });
        const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (imgPart?.inlineData) {
          scenes.push(`data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`);
          setStoryboardScenes([...scenes]);
        }
      }
    } catch (err) {
      alert("Gagal merancang storyboard.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalVideoRender = async () => {
    if (storyboardScenes.length < 5) return alert("Rancang storyboard dulu Juragan!");
    setIsProcessing(true);
    setVideoStatus('Mempersiapkan render sinematik...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const platformInfo = PLATFORMS.find(p => p.id === videoPlatform);
      
      setVideoStatus('Menghubungkan engine Veo 3.1...');
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: `Cinematic influencer endorsement video. Talent interacting with product in diverse locations (Living room, Urban city, Studio). Smooth transitions, authentic lighting, viral ${videoPlatform} style. High production value.`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          // @ts-ignore
          aspectRatio: platformInfo?.ratio === '9:16' ? '9:16' : '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const videoRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoRes.ok) {
           const errText = await videoRes.text();
           if (errText.includes("Requested entity was not found")) throw new Error("Requested entity was not found");
           throw new Error("Gagal mengunduh video.");
        }
        const blob = await videoRes.blob();
        setGeneratedVideo(URL.createObjectURL(blob));
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        alert("Sesi API Key terputus. Silakan pilih kembali API Key berbayar Juragan.");
        setHasVideoApiKey(false);
        // @ts-ignore
        await window.aistudio.openSelectKey();
      } else {
        alert("Gagal merender video final. Pastikan koneksi dan API Key aktif.");
      }
    } finally {
      setIsProcessing(false);
      setVideoStatus('');
    }
  };

  const handlePhotoMagic = async () => {
    if (!sourceImage) return alert("Upload foto produk dulu!");
    setIsProcessing(true);
    setGeneratedResults([]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = sourceImage.split(',')[1];
      const mimeType = sourceImage.split(';')[0].split(':')[1];
      const variants = [
        "Professional studio, clean white background, commercial lighting.",
        "Minimalist wooden table with soft sunlight, aesthetic plants background.",
        "Macro detail, dramatic cinematic lighting, dark textured background.",
        "Flat lay on luxury marble surface, airy and bright.",
        "Creative studio with colorful neon backlighting."
      ];
      
      for (const variant of variants) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: `Transform into a professional product photo. ${variant}. Sharp focus. Keep original product label. NO TYPOS.` }
            ]
          },
          config: { imageConfig: { 
            // @ts-ignore
            aspectRatio: photoAspectRatio 
          } }
        });
        const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (imgPart?.inlineData) {
          generatedResults.push(`data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`);
          setGeneratedResults([...generatedResults]);
        }
      }
    } catch (err) {
      alert("Gagal memproses foto.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceMagic = async () => {
    if (!voiceScript.trim()) return alert("Tulis naskah dulu!");
    setIsProcessing(true);
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
        {[
          { id: 'photo', label: 'Photo Magic', icon: <Camera size={18} /> },
          { id: 'post', label: 'Post Magic', icon: <ChevronRightSquare size={18} /> },
          { id: 'voice', label: 'Voice Magic', icon: <Mic2 size={18} /> },
          { id: 'video', label: 'Video Magic', icon: <Clapperboard size={18} /> },
        ].map(tool => (
          <button 
            key={tool.id}
            onClick={() => { setActiveTool(tool.id as any); setIsProcessing(false); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shrink-0 ${activeTool === tool.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}
          >
            {tool.icon} {tool.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bento-card bg-white p-6 border border-slate-100 shadow-sm space-y-6">
            
            {activeTool === 'post' && (
              <>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-amber-500" /> Post Magic</h3>
                  <p className="text-xs text-slate-400">Sulap satu foto menjadi 5 slide carousel yang viral.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">1. Foto Produk</label>
                    <div className="relative group">
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setPostProductImage)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {postProductImage ? (
                        <div className="aspect-square rounded-2xl overflow-hidden border-2 border-indigo-100">
                          <img src={postProductImage} alt="Source" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-slate-50 group-hover:bg-indigo-50/50 transition-all">
                          <Upload size={24} className="text-slate-400" />
                          <p className="text-xs font-bold text-slate-400">Upload Foto Utama</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2. Detail Konten</label>
                       {postProductImage && (
                        <button 
                          onClick={handleAutoSuggestPost}
                          disabled={isAnalyzingImage}
                          className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors disabled:opacity-50"
                        >
                          {isAnalyzingImage ? <RefreshCw size={12} className="animate-spin" /> : <Wand size={12} />}
                          {isAnalyzingImage ? "Menganalisa..." : "🪄 Auto-Fill Detail"}
                        </button>
                       )}
                    </div>
                    <input 
                      type="text" 
                      value={postProductName}
                      onChange={e => setPostProductName(e.target.value)}
                      placeholder="Nama Produk..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 font-bold"
                    />
                    <textarea 
                      value={postDesc}
                      onChange={e => setPostDesc(e.target.value)}
                      placeholder="Deskripsi singkat..."
                      className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">3. Pilih Platform</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PLATFORMS.filter(p => p.id !== 'youtube').map(p => (
                        <button 
                          key={p.id}
                          onClick={() => setSelectedPlatform(p.id)}
                          className={`flex flex-col items-center gap-1.5 p-3 border rounded-xl transition-all ${selectedPlatform === p.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                        >
                          <span className="text-xl">{p.icon}</span>
                          <span className="text-[10px] font-bold">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!postProductImage || isProcessing}
                  onClick={handlePostMagic}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl disabled:opacity-50 transition-all active:scale-95"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" /> : <Zap size={20} />}
                  {isProcessing ? `Magic in progress... ${postProgress}%` : 'Sulap Konten'}
                </button>
              </>
            )}

            {activeTool === 'photo' && (
              <>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-amber-500" /> AI Photoshoot</h3>
                  <p className="text-xs text-slate-400">Ubah foto HP menjadi hasil jepretan studio profesional.</p>
                </div>
                
                <div className="space-y-4">
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
                  {isProcessing ? 'Generating Photos...' : 'Mulai Photoshoot'}
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
                      placeholder="Contoh: Dapatkan diskon 50% untuk produk kecantikan kami!"
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
                  <h3 className="text-xl font-bold flex items-center gap-2"><MovieIcon className="text-rose-500" /> Video Magic</h3>
                  <p className="text-xs text-slate-400">Rancang video endorse dari foto produk & talent.</p>
                </div>

                {hasVideoApiKey === false ? (
                  <div className="p-6 bg-slate-900 rounded-[32px] text-white space-y-4 animate-in zoom-in-95">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500 rounded-xl"><Lock size={18} /></div>
                      <h4 className="font-bold text-sm">Aktivasi Video Premium</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Fitur video memerlukan API Key berbayar dari Google Cloud Juragan.
                    </p>
                    <div className="space-y-2 pt-2">
                      <button 
                        onClick={handleOpenKeySelector}
                        className="w-full py-3 bg-white text-slate-900 rounded-xl text-xs font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Zap size={14} className="fill-amber-500 text-amber-500" /> Pilih API Key
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">1. Foto Produk</label>
                          <div className="relative aspect-square border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50 group cursor-pointer transition-all hover:border-indigo-300">
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setVideoProductImage)} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                            {videoProductImage ? <img src={videoProductImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1"><ImageIcon size={20} /><span className="text-[8px] font-bold uppercase">Produk</span></div>}
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">2. Foto Talent</label>
                          <div className="relative aspect-square border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50 group cursor-pointer transition-all hover:border-indigo-300">
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setVideoTalentImage)} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                            {videoTalentImage ? <img src={videoTalentImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1"><User size={20} /><span className="text-[8px] font-bold uppercase">Talent</span></div>}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">3. Alur Video</label>
                       <div className="grid grid-cols-2 gap-2">
                          {VIDEO_TYPES.map(t => (
                            <button 
                              key={t.id}
                              onClick={() => setVideoType(t.id)}
                              className={`p-3 border rounded-xl text-left transition-all ${videoType === t.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-indigo-300'}`}
                            >
                               <p className="text-xs font-bold flex items-center gap-1.5"><span>{t.icon}</span> {t.label}</p>
                               <p className={`text-[8px] mt-0.5 leading-tight ${videoType === t.id ? 'text-indigo-100' : 'text-slate-400'}`}>{t.desc}</p>
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">4. Deskripsi Konten</label>
                        {videoProductImage && videoTalentImage && (
                           <button 
                            onClick={handleAutoSuggestVideo}
                            disabled={isAnalyzingImage}
                            className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors disabled:opacity-50"
                          >
                            {isAnalyzingImage ? <RefreshCw size={10} className="animate-spin" /> : <Wand size={10} />}
                            {isAnalyzingImage ? "Menganalisa..." : "🪄 Auto-Script"}
                          </button>
                        )}
                      </div>
                      <textarea 
                        value={videoScriptPrompt}
                        onChange={(e) => setVideoScriptPrompt(e.target.value)}
                        placeholder="Influencer menceritakan produk..."
                        className="w-full h-20 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 resize-none font-medium"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">5. Target Platform</label>
                      <div className="grid grid-cols-4 gap-2">
                        {PLATFORMS.map(p => (
                          <button 
                            key={p.id}
                            onClick={() => setVideoPlatform(p.id)}
                            className={`flex flex-col items-center gap-1.5 p-2.5 border rounded-xl transition-all ${videoPlatform === p.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                          >
                            <span className="text-base">{p.icon}</span>
                            <span className="text-[8px] font-bold">{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      disabled={!videoScriptPrompt || isProcessing}
                      onClick={handleGenerateStoryboard}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl disabled:opacity-50 transition-all active:scale-95"
                    >
                      {isProcessing ? <RefreshCw className="animate-spin" /> : <Layers size={20} />}
                      {isProcessing ? `Magic in progress... ${videoProgress}%` : 'Generate Storyboard'}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Output Gallery */}
        <div className="lg:col-span-8">
          {(isProcessing || generatedResults.length > 0 || postCarousel.length > 0 || generatedAudioUrl || generatedVideo || storyboardScenes.length > 0) ? (
            <div className="space-y-6">
              
              {activeTool === 'video' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-4">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             Storyboard Content Scenes <Layers size={14} />
                          </h4>
                          <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-tight mt-1">Diverse locations active per scene</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {storyboardScenes.length === 5 && (
                             <button 
                              onClick={handleDownloadAllStoryboard}
                              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                             >
                                <Images size={14} /> Simpan Semua Foto
                             </button>
                          )}
                          {storyboardScenes.length === 5 && !generatedVideo && (
                            <button 
                              onClick={handleFinalVideoRender}
                              disabled={isProcessing}
                              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                            >
                              {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <MovieIcon size={14} />}
                              {isProcessing ? "Rendering..." : "🎬 Render Video Final"}
                            </button>
                          )}
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {storyboardScenes.map((scene, idx) => (
                           <div key={idx} className="group relative rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100 aspect-[9/16] animate-in zoom-in-95" style={{ animationDelay: `${idx * 100}ms` }}>
                              <img src={scene} className="w-full h-full object-cover" />
                              <div className="absolute top-2 left-2 px-2 py-1 bg-black/40 backdrop-blur rounded-lg text-[8px] text-white font-bold uppercase tracking-widest">Scene {idx + 1}</div>
                              <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           </div>
                        ))}
                        {isProcessing && storyboardScenes.length < 5 && (
                           <div className="aspect-[9/16] bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 animate-pulse">
                              <RefreshCw className="text-slate-300 animate-spin" size={20} />
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Envisioning...</span>
                           </div>
                        )}
                     </div>
                  </div>

                  {(generatedVideo || (isProcessing && videoStatus)) && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-6 duration-700">
                       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           Final Video Preview <Smartphone size={14} />
                        </h4>
                        <div className="relative mx-auto bg-slate-950 rounded-[3rem] p-4 shadow-2xl border-[12px] border-slate-900 max-w-[320px] aspect-[9/16] overflow-hidden">
                           {generatedVideo ? (
                              <video src={generatedVideo} className="w-full h-full object-cover rounded-[2rem]" controls autoPlay loop />
                           ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-center px-8 gap-4">
                                 <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center relative">
                                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-3xl animate-spin"></div>
                                    <MovieIcon className="text-indigo-400" size={24} />
                                 </div>
                                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{videoStatus || 'Synthesizing cinematic assets...'}</p>
                              </div>
                           )}
                        </div>

                        {generatedVideo && (
                          <div className="flex flex-col md:flex-row gap-3 max-w-md mx-auto">
                            <button onClick={() => downloadFile(generatedVideo!, 'selina-video-magic.mp4')} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-indigo-700 transition-all">
                               <Download size={16} /> Simpan Video HD
                            </button>
                            <button onClick={() => { setGeneratedVideo(null); setStoryboardScenes([]); setVideoProgress(0); }} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Ulangi Alur</button>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}

              {activeTool === 'post' && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">Mobile Carousel Preview <Smartphone size={14} /></h4>
                      <div className={`relative bg-slate-900 rounded-[3rem] p-4 shadow-2xl border-8 border-slate-800 mx-auto max-w-[320px] ${selectedPlatform === 'fb' ? 'aspect-[4/3] rounded-[2rem]' : 'aspect-[9/16]'}`}>
                         <div className="w-full h-full rounded-[2rem] overflow-hidden bg-white relative">
                            {postCarousel.length > 0 ? (
                              <>
                                <img src={postCarousel[currentSlide]} className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur px-2 py-1 rounded-full text-[10px] text-white font-bold">{currentSlide + 1} / {postCarousel.length}</div>
                                <div className="absolute inset-y-0 left-0 flex items-center p-2"><button onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))} className="p-1.5 bg-white/20 backdrop-blur rounded-full text-white"><ChevronLeft size={16}/></button></div>
                                <div className="absolute inset-y-0 right-0 flex items-center p-2"><button onClick={() => setCurrentSlide(prev => Math.min(postCarousel.length - 1, prev + 1))} className="p-1.5 bg-white/20 backdrop-blur rounded-full text-white"><ChevronRight size={16}/></button></div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 animate-pulse"><ImageIcon size={48} /><p className="text-[10px] font-bold mt-2 uppercase tracking-widest">Sihir Slide {Math.min(5, Math.floor(postProgress/15) + 1)}...</p></div>
                            )}
                         </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generated Caption <Type size={14} /></h4>
                         <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative group">
                            {postCaption ? (
                              <>
                                <textarea readOnly value={postCaption} className="w-full h-48 text-xs text-slate-700 leading-relaxed outline-none resize-none bg-transparent" />
                                <button onClick={() => { navigator.clipboard.writeText(postCaption); alert('Caption disalin!'); }} className="absolute bottom-4 right-4 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg transition-all active:scale-90"><Copy size={16}/></button>
                              </>
                            ) : (
                              <div className="h-48 flex flex-col items-center justify-center gap-2 text-slate-300 italic text-sm"><RefreshCw size={24} className="animate-spin" /><span>Menulis caption viral...</span></div>
                            )}
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <button disabled={postCarousel.length === 0} onClick={() => { postCarousel.forEach((url, i) => downloadFile(url, `slide-${i+1}.png`)); }} className="flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-30"><Download size={16}/> Unduh Slide</button>
                         <button onClick={() => { setPostProductImage(null); setPostCarousel([]); setPostProgress(0); }} className="flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200"><RefreshCw size={16}/> Ulangi</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTool === 'photo' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {generatedResults.map((url, idx) => (
                    <div key={idx} className={`group relative ${getAspectClass(photoAspectRatio)} bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 animate-in zoom-in duration-500`}>
                      <img src={url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                         <div className="flex gap-2">
                            <button onClick={() => setZoomImage(url)} className="flex-1 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-slate-100"><Search size={12} /> Detail</button>
                            <button onClick={() => downloadFile(url, `photoshoot-${idx+1}.png`)} className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700"><Download size={14} /></button>
                         </div>
                      </div>
                    </div>
                  ))}
                  {isProcessing && generatedResults.length < 5 && <div className={`${getAspectClass(photoAspectRatio)} bg-slate-100 rounded-[32px] flex flex-col items-center justify-center gap-3 animate-pulse border-2 border-dashed border-slate-200`}><RefreshCw className="text-slate-300 animate-spin" size={24} /></div>}
                </div>
              )}

              {activeTool === 'voice' && generatedAudioUrl && (
                 <div className="bg-white border border-slate-100 rounded-[32px] p-10 flex flex-col items-center justify-center gap-8 animate-in slide-in-from-bottom-4">
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-lg border-4 border-emerald-100"><Volume2 size={40} /></div>
                    <div className="w-full max-w-md space-y-6 text-center">
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">Suara Berhasil Dibuat!</h4>
                      <audio ref={audioRef} src={generatedAudioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                      <button onClick={togglePlayAudio} className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto shadow-xl hover:scale-110 transition-all active:scale-95">
                        {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
                      </button>
                      <button onClick={() => downloadFile(generatedAudioUrl!, 'selina-voiceover.wav')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-indigo-100/20">
                        <Download size={20} /> Unduh Kualitas HD
                      </button>
                    </div>
                 </div>
              )}

            </div>
          ) : (
            <div className="h-full min-h-[500px] border-4 border-dashed border-slate-100 rounded-[48px] flex flex-col items-center justify-center text-center p-12 space-y-4 animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                 {activeTool === 'photo' && <ImageIcon size={48} />}
                 {activeTool === 'post' && <Layout size={48} />}
                 {activeTool === 'voice' && <Mic2 size={48} />}
                 {activeTool === 'video' && <MovieIcon size={48} />}
              </div>
              <h4 className="text-xl font-bold text-slate-300 uppercase tracking-widest">
                {activeTool === 'photo' ? 'AI Photoshoot' : activeTool === 'post' ? 'Social Magic Post' : activeTool === 'voice' ? 'Ruang Rekaman AI' : 'Video Magic Production'}
              </h4>
              <p className="text-sm text-slate-300 max-w-xs">Pilih alat di panel kiri dan biarkan Selina menyulap aset Juragan menjadi profit!</p>
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
