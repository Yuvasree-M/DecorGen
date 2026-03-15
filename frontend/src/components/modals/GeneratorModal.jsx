import { useState, useRef, useEffect } from "react";
import { useAuth }                      from "../../context/AuthContext";
import { apiUpload }                    from "../../services/api";
import { toast }                        from "react-toastify";
import BuilderModal                     from "../BuilderModal";

const STYLES = [
  { value:"modern",      label:"Modern",      emoji:"🏙️" },
  { value:"traditional", label:"Traditional", emoji:"🏛️" },
  { value:"aesthetic",   label:"Aesthetic",   emoji:"🌸" },
];
const ROOMS = ["Living Room","Bedroom","Kitchen","Bathroom","Dining Room"];

/* Download a URL as a File object (used to feed result back into enhance) */
async function urlToFile(url, filename = "ai-design.jpg") {
  const res  = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

export default function GeneratorModal({ onClose }) {
  const { isLoggedIn } = useAuth();

  const [tab,          setTab]          = useState("generate");
  const [image,        setImage]        = useState(null);   // File object
  const [preview,      setPreview]      = useState(null);   // object URL for display
  const [style,        setStyle]        = useState("");
  const [roomType,     setRoomType]     = useState("");
  const [customMode,   setCustomMode]   = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [enhanceInstr, setEnhanceInstr] = useState("");
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);   // generated/enhanced image URL
  const [originalUrl,  setOriginalUrl]  = useState(null);   // the "before" URL
  const [sliderPos,    setSliderPos]    = useState(50);
  const [showBuilder,  setShowBuilder]  = useState(false);
  const [guestLeft,    setGuestLeft]    = useState(null);
  const [loadingEnhanceSwitch, setLoadingEnhanceSwitch] = useState(false);

  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  /* When switching to Enhance tab: if a result exists, auto-load it as the new image */
  const switchToEnhance = async () => {
    setTab("enhance");
    if (result) {
      setLoadingEnhanceSwitch(true);
      try {
        const file = await urlToFile(result);
        setImage(file);
        setPreview(result);    // show the AI image as the current "input" preview
        setResult(null);       // clear old result so slider resets
        setOriginalUrl(null);
        toast.info("🔧 AI design loaded as input — add your enhancement instructions below.");
      } catch {
        // Fallback: just switch tab, user can upload manually
        toast.info("Switch to Enhance tab — upload an image or re-use your generated design.");
      } finally {
        setLoadingEnhanceSwitch(false);
      }
    }
  };

  /* "Enhance This" button from result section — one click to switch + load */
  const handleEnhanceThis = async () => {
    await switchToEnhance();
    // Scroll to instructions
    setTimeout(() => {
      document.getElementById("enhance-instructions")?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const handleGenerate = async () => {
    if (!image) { toast.error("Please upload a room photo first"); return; }
    if (!style && !customMode) { toast.error("Please choose a design style"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image",        image);
      fd.append("style",        style || "");
      fd.append("roomType",     roomType || "");
      fd.append("customPrompt", customMode ? customPrompt : "");
      const data = await apiUpload("/api/designs/generate", fd);
      setResult(data.generatedImage);
      setOriginalUrl(data.originalImage);
      setSliderPos(50);
      if (data.remaining !== null) setGuestLeft(data.remaining);
      toast.success("✨ Design generated!");
    } catch (err) {
      if (err.data?.requireLogin) toast.error("Guest limit reached. Sign in for unlimited designs.");
      else toast.error(err.message || "Generation failed");
    } finally { setLoading(false); }
  };

  const handleEnhance = async () => {
    if (!image) { toast.error("Please upload an image first"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image",        image);
      fd.append("instructions", enhanceInstr || "");
      const data = await apiUpload("/api/designs/enhance", fd);
      setResult(data.enhancedImage);
      setOriginalUrl(data.originalImage);
      setSliderPos(50);
      if (data.remaining !== null) setGuestLeft(data.remaining);
      toast.success("🔧 Image enhanced!");
    } catch (err) {
      if (err.data?.requireLogin) toast.error("Guest limit reached. Sign in to continue.");
      else toast.error(err.message || "Enhancement failed");
    } finally { setLoading(false); }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = result; a.download = "decorgen-design.jpg"; a.target = "_blank";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const inp = "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>

        <div className="relative bg-white border border-gray-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-scaleIn">

          {/* ── Header ── */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-7 py-5 flex items-center justify-between z-10 rounded-t-3xl">
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Room Designer</h2>
              {!isLoggedIn && guestLeft !== null && (
                <p className="text-xs text-purple-600 mt-0.5">{guestLeft} free {tab}s remaining</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Tab switcher */}
              <div className="flex bg-gray-100 rounded-xl p-1 text-xs font-semibold">
                <button
                  onClick={() => { setTab("generate"); }}
                  className={`px-3 py-1.5 rounded-lg transition ${tab === "generate" ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow" : "text-gray-500 hover:text-gray-800"}`}>
                  ✨ Generate
                </button>
                <button
                  onClick={switchToEnhance}
                  disabled={loadingEnhanceSwitch}
                  className={`px-3 py-1.5 rounded-lg transition ${tab === "enhance" ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow" : "text-gray-500 hover:text-gray-800"} disabled:opacity-50`}>
                  {loadingEnhanceSwitch ? "Loading..." : "🔧 Enhance"}
                </button>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-100 flex items-center justify-center text-gray-500 hover:text-purple-600 text-sm transition">
                ✕
              </button>
            </div>
          </div>

          <div className="px-7 py-6 space-y-5">

            {/* ── Upload zone ── */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {tab === "enhance" && image && preview === result?.toString()
                  ? "Input Image (AI Generated)"
                  : "Room Photo"}
              </label>
              <div
                onClick={() => inputRef.current.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                  tab === "enhance" && image
                    ? "border-purple-300 bg-purple-50/50 hover:border-purple-500"
                    : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/50"
                }`}>
                <input ref={inputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => handleFile(e.target.files[0])}/>
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="input" className="mx-auto rounded-xl max-h-52 object-cover shadow"/>
                    {tab === "enhance" && (
                      <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-md font-semibold">
                        Input ✓
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-sm font-medium text-gray-700">Drop room photo here or click to upload</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5 MB</p>
                  </div>
                )}
              </div>
              {preview && (
                <button
                  onClick={() => { setImage(null); setPreview(null); setResult(null); setOriginalUrl(null); }}
                  className="mt-1.5 text-xs text-gray-400 hover:text-red-500 transition">
                  ✕ Remove &amp; upload different image
                </button>
              )}
            </div>

            {/* ── Generate options ── */}
            {tab === "generate" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Room Type (optional)</label>
                  <select value={roomType} onChange={e => setRoomType(e.target.value)} className={inp}>
                    <option value="">Select room type...</option>
                    {ROOMS.map(r => <option key={r} value={r.toLowerCase()}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Design Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {STYLES.map(s => (
                      <button key={s.value} type="button"
                        onClick={() => { setStyle(s.value); setCustomMode(false); }}
                        className={`py-3 px-2 rounded-xl border-2 text-center transition ${
                          style === s.value && !customMode
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300 bg-white"
                        }`}>
                        <div className="text-xl mb-1">{s.emoji}</div>
                        <div className={`text-xs font-semibold ${style === s.value && !customMode ? "text-purple-700" : "text-gray-700"}`}>
                          {s.label}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => { setCustomMode(!customMode); setStyle(""); }}
                    className={`mt-3 w-full py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                      customMode ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-500 hover:border-purple-300"
                    }`}>
                    ✏️ Custom Instructions {customMode ? "(Active)" : ""}
                  </button>
                  {customMode && (
                    <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} rows={3}
                      placeholder="e.g. Add a large bookshelf, warm golden lighting, hanging plants on the wall..."
                      className={`mt-3 ${inp} resize-none border-purple-300`}/>
                  )}
                </div>
              </>
            )}

            {/* ── Enhance options ── */}
            {tab === "enhance" && (
              <div id="enhance-instructions">
                {/* Info banner when AI image is loaded */}
                {image && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-3 flex items-start gap-2">
                    <span className="text-purple-500 text-base shrink-0">🔧</span>
                    <p className="text-xs text-purple-700 leading-relaxed">
                      <strong>AI-generated image loaded as input.</strong> Describe specific changes you want — lighting, furniture, colours, plants, textures — and the AI will refine this design further.
                    </p>
                  </div>
                )}
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  What to change?
                </label>
                <textarea value={enhanceInstr} onChange={e => setEnhanceInstr(e.target.value)} rows={4}
                  placeholder="e.g. Add warmer lighting, replace the sofa with a velvet blue one, add indoor plants near the window, change wall colour to warm cream..."
                  className={`${inp} resize-none`}/>
                <p className="text-xs text-gray-400 mt-1.5">
                  Tip: Be specific. "Change sofa to dark green velvet" works better than "change furniture".
                </p>
              </div>
            )}

            {/* ── Action button ── */}
            <button
              onClick={tab === "generate" ? handleGenerate : handleEnhance}
              disabled={loading || !image || loadingEnhanceSwitch}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition shadow-lg shadow-purple-200 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  {tab === "generate" ? "Generating (20–40s)..." : "Enhancing (20–40s)..."}
                </>
              ) : tab === "generate" ? "✨ Generate AI Design" : "🔧 Apply Enhancement"}
            </button>

            {/* ── Result section ── */}
            {result && (
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {tab === "generate" ? "✨ Your AI Design" : "🔧 Enhanced Result"}
                </h3>

                {/* Before / After slider */}
                {originalUrl && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">👆 Drag slider to compare before &amp; after</p>
                    <div className="relative rounded-2xl overflow-hidden select-none border border-gray-200"
                      style={{ aspectRatio: "4/3" }}>
                      <img src={result} alt="After" className="absolute inset-0 w-full h-full object-cover"/>
                      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                        <img src={originalUrl} alt="Before" className="absolute inset-0 h-full object-cover"
                          style={{ width: `${10000 / sliderPos}%`, maxWidth: "none" }}/>
                      </div>
                      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                        style={{ left: `${sliderPos}%` }}>
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-xl border-2 border-purple-200 flex items-center justify-center cursor-ew-resize">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18l-6-6 6-6M15 6l6 6-6 6" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                      </div>
                      <span className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md font-semibold pointer-events-none">Before</span>
                      <span className="absolute top-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-md font-semibold pointer-events-none">After</span>
                      <input type="range" min="5" max="95" value={sliderPos}
                        onChange={e => setSliderPos(+e.target.value)}
                        className="slider-thumb absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                        style={{ appearance: "none", background: "transparent" }}/>
                    </div>
                  </div>
                )}

                {/* Primary actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleDownload}
                    className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 py-3 rounded-xl text-sm font-semibold transition">
                    ↓ Download
                  </button>
                  <button onClick={() => setShowBuilder(true)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-md shadow-purple-200">
                    🤝 Connect with Designer
                  </button>
                </div>

                {/* Enhance this result */}
                <button
                  onClick={handleEnhanceThis}
                  disabled={loadingEnhanceSwitch}
                  className="w-full py-3 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-400 text-orange-700 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {loadingEnhanceSwitch ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Loading for enhancement...
                    </>
                  ) : (
                    <>🔧 Enhance This Result Further</>
                  )}
                </button>

                {/* Regenerate */}
                <button
                  onClick={tab === "generate" ? handleGenerate : handleEnhance}
                  disabled={loading}
                  className="w-full py-2.5 border border-gray-300 text-gray-500 hover:text-purple-600 hover:border-purple-300 rounded-xl text-sm font-medium transition disabled:opacity-40">
                  🔄 Regenerate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showBuilder && (
        <BuilderModal
          style={style}
          originalImage={originalUrl}
          generatedImage={result}
          onClose={() => setShowBuilder(false)}
        />
      )}
    </>
  );
}
