// import { useState, useRef, useEffect } from "react";
// import { useAuth }                      from "../../context/AuthContext";
// import { apiUpload }                    from "../../services/api";
// import { toast }                        from "react-toastify";
// import BuilderModal                     from "../BuilderModal";
// import { getGuestId } from "../../utils/guest";
// const STYLES = [
//   { value:"modern",      label:"Modern",      emoji:"🏙️" },
//   { value:"traditional", label:"Traditional", emoji:"🏛️" },
//   { value:"aesthetic",   label:"Aesthetic",   emoji:"🌸" },
// ];
// const ROOMS = ["Living Room","Bedroom","Kitchen","Bathroom","Dining Room"];

// async function urlToFile(url, filename = "ai-design.jpg") {
//   const res  = await fetch(url);
//   const blob = await res.blob();
//   return new File([blob], filename, { type: blob.type || "image/jpeg" });
// }

// export default function GeneratorModal({ onClose }) {
//   const { isLoggedIn } = useAuth();

//   const [tab,          setTab]          = useState("generate");
//   const [image,        setImage]        = useState(null);   
//   const [preview,      setPreview]      = useState(null);  
//   const [style,        setStyle]        = useState("");
//   const [roomType,     setRoomType]     = useState("");
//   const [customMode,   setCustomMode]   = useState(false);
//   const [customPrompt, setCustomPrompt] = useState("");
//   const [enhanceInstr, setEnhanceInstr] = useState("");
//   const [loading,      setLoading]      = useState(false);
//   const [result,       setResult]       = useState(null);   
//   const [originalUrl,  setOriginalUrl]  = useState(null);   
//   const [sliderPos,    setSliderPos]    = useState(50);
//   const [showBuilder,  setShowBuilder]  = useState(false);
//   const [guestLeft,    setGuestLeft]    = useState(null);
//   const [loadingEnhanceSwitch, setLoadingEnhanceSwitch] = useState(false);

//   const inputRef = useRef();

//   const handleFile = (file) => {
//     if (!file) return;
//     setImage(file);
//     setPreview(URL.createObjectURL(file));
//     setResult(null);
//   };


//   const switchToEnhance = async () => {
//     setTab("enhance");
//     if (result) {
//       setLoadingEnhanceSwitch(true);
//       try {
//         const file = await urlToFile(result);
//         setImage(file);
//         setPreview(result);   
//         setResult(null);       
//         setOriginalUrl(null);
//         toast.info("🔧 AI design loaded as input — add your enhancement instructions below.");
//       } catch {

//         toast.info("Switch to Enhance tab — upload an image or re-use your generated design.");
//       } finally {
//         setLoadingEnhanceSwitch(false);
//       }
//     }
//   };

//   const handleEnhanceThis = async () => {
//     await switchToEnhance();
//     setTimeout(() => {
//       document.getElementById("enhance-instructions")?.scrollIntoView({ behavior: "smooth" });
//     }, 200);
//   };

//   const handleGenerate = async () => {
//     if (!image) { toast.error("Please upload a room photo first"); return; }
//     if (!style && !customMode) { toast.error("Please choose a design style"); return; }
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("image",        image);
//       fd.append("style",        style || "");
//       fd.append("roomType",     roomType || "");
//       fd.append("customPrompt", customMode ? customPrompt : "");
// const guestId = getGuestId();
// fd.append("guestId", guestId);

// const data = await apiUpload(
//   "/api/designs/generate",
//   fd,
//   "POST"
// );
//       setResult(data.generatedImage);
//       setOriginalUrl(data.originalImage);
//       setSliderPos(50);
//       if (data.remaining !== null) setGuestLeft(data.remaining);
//       toast.success(" Design generated!");
//     } catch (err) {
//       if (err.data?.requireLogin) toast.error("Guest limit reached. Sign in for unlimited designs.");
//       else toast.error(err.message || "Generation failed");
//     } finally { setLoading(false); }
//   };

//   const handleEnhance = async () => {
//     if (!image) { toast.error("Please upload an image first"); return; }
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("image",        image);
//       fd.append("instructions", enhanceInstr || "");
// const guestId = getGuestId();
// fd.append("guestId", guestId);

// const data = await apiUpload(
//   "/api/designs/enhance",
//   fd,
//   "POST"
// );
//       setResult(data.enhancedImage);
//       setOriginalUrl(data.originalImage);
//       setSliderPos(50);
//       if (data.remaining !== null) setGuestLeft(data.remaining);
//       toast.success(" Image enhanced!");
//     } catch (err) {
//       if (err.data?.requireLogin) toast.error("Guest limit reached. Sign in to continue.");
//       else toast.error(err.message || "Enhancement failed");
//     } finally { setLoading(false); }
//   };

//   const handleDownload = () => {
//     const a = document.createElement("a");
//     a.href = result; a.download = "decorgen-design.jpg"; a.target = "_blank";
//     document.body.appendChild(a); a.click(); document.body.removeChild(a);
//   };

//   const inp = "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition";

//   return (
//     <>
//       <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
//         <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>

//         <div className="relative bg-white border border-gray-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-scaleIn">

//           <div className="sticky top-0 bg-white border-b border-gray-200 px-7 py-5 flex items-center justify-between z-10 rounded-t-3xl">
//             <div>
//               <h2 className="text-xl font-bold text-gray-900">AI Room Designer</h2>
//               {!isLoggedIn && guestLeft !== null && (
//                 <p className="text-xs text-purple-600 mt-0.5">{guestLeft} free {tab}s remaining</p>
//               )}
//             </div>
//             <div className="flex items-center gap-3">

//               <div className="flex bg-gray-100 rounded-xl p-1 text-xs font-semibold">
//                 <button
//                   onClick={() => { setTab("generate"); }}
//                   className={`px-3 py-1.5 rounded-lg transition ${tab === "generate" ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow" : "text-gray-500 hover:text-gray-800"}`}>
//                   Generate
//                 </button>
//                 <button
//                   onClick={switchToEnhance}
//                   disabled={loadingEnhanceSwitch}
//                   className={`px-3 py-1.5 rounded-lg transition ${tab === "enhance" ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow" : "text-gray-500 hover:text-gray-800"} disabled:opacity-50`}>
//                   {loadingEnhanceSwitch ? "Loading..." : " Enhance"}
//                 </button>
//               </div>
//               <button onClick={onClose}
//                 className="w-8 h-8 rounded-full bg-gray-100 hover:bg-purple-100 flex items-center justify-center text-gray-500 hover:text-purple-600 text-sm transition">
//                 ✕
//               </button>
//             </div>
//           </div>

//           <div className="px-7 py-6 space-y-5">

//             <div>
//               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
//                 {tab === "enhance" && image && preview === result?.toString()
//                   ? "Input Image (AI Generated)"
//                   : "Room Photo"}
//               </label>
//               <div
//                 onClick={() => inputRef.current.click()}
//                 onDragOver={e => e.preventDefault()}
//                 onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
//                 className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
//                   tab === "enhance" && image
//                     ? "border-purple-300 bg-purple-50/50 hover:border-purple-500"
//                     : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/50"
//                 }`}>
//                 <input ref={inputRef} type="file" accept="image/*" className="hidden"
//                   onChange={e => handleFile(e.target.files[0])}/>
//                 {preview ? (
//                   <div className="relative">
//                     <img src={preview} alt="input" className="mx-auto rounded-xl max-h-52 object-cover shadow"/>
//                     {tab === "enhance" && (
//                       <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-md font-semibold">
//                         Input ✓
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="py-4">
//                     <p className="text-sm font-medium text-gray-700">Drop room photo here or click to upload</p>
//                     <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG up to 5 MB</p>
//                   </div>
//                 )}
//               </div>
//               {preview && (
//                 <button
//                   onClick={() => { setImage(null); setPreview(null); setResult(null); setOriginalUrl(null); }}
//                   className="mt-1.5 text-xs text-gray-400 hover:text-red-500 transition">
//                   ✕ Remove &amp; upload different image
//                 </button>
//               )}
//             </div>

//             {tab === "generate" && (
//               <>
//                 <div>
//                   <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Room Type (optional)</label>
//                   <select value={roomType} onChange={e => setRoomType(e.target.value)} className={inp}>
//                     <option value="">Select room type...</option>
//                     {ROOMS.map(r => <option key={r} value={r.toLowerCase()}>{r}</option>)}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Design Style</label>
//                   <div className="grid grid-cols-3 gap-2">
//                     {STYLES.map(s => (
//                       <button key={s.value} type="button"
//                         onClick={() => { setStyle(s.value); setCustomMode(false); }}
//                         className={`py-3 px-2 rounded-xl border-2 text-center transition ${
//                           style === s.value && !customMode
//                             ? "border-purple-500 bg-purple-50"
//                             : "border-gray-200 hover:border-purple-300 bg-white"
//                         }`}>
//                         <div className="text-xl mb-1">{s.emoji}</div>
//                         <div className={`text-xs font-semibold ${style === s.value && !customMode ? "text-purple-700" : "text-gray-700"}`}>
//                           {s.label}
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                   <button
//                     onClick={() => { setCustomMode(!customMode); setStyle(""); }}
//                     className={`mt-3 w-full py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
//                       customMode ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-500 hover:border-purple-300"
//                     }`}>
//                      Custom Instructions {customMode ? "(Active)" : ""}
//                   </button>
//                   {customMode && (
//                     <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} rows={3}
//                       placeholder="e.g. Add a large bookshelf, warm golden lighting, hanging plants on the wall..."
//                       className={`mt-3 ${inp} resize-none border-purple-300`}/>
//                   )}
//                 </div>
//               </>
//             )}

//             {tab === "enhance" && (
//               <div id="enhance-instructions">
//                 {image && (
//                   <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-3 flex items-start gap-2">
//                     <span className="text-purple-500 text-base shrink-0">🔧</span>
//                     <p className="text-xs text-purple-700 leading-relaxed">
//                       Describe specific changes you want — lighting, furniture, colours, plants, textures — and the AI will refine this design further.
//                     </p>
//                   </div>
//                 )}
//                 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
//                   What to change?
//                 </label>
//                 <textarea value={enhanceInstr} onChange={e => setEnhanceInstr(e.target.value)} rows={4}
//                   placeholder="e.g. Add warmer lighting, replace the sofa with a velvet blue one..."
//                   className={`${inp} resize-none`}/>
//                 <p className="text-xs text-gray-400 mt-1.5">
//                   Tip: Be specific. "Change sofa to dark green velvet" works better than "change furniture".
//                 </p>
//               </div>
//             )}

//             <button
//               onClick={tab === "generate" ? handleGenerate : handleEnhance}
//               disabled={loading || !image || loadingEnhanceSwitch}
//               className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition shadow-lg shadow-purple-200 disabled:opacity-50 flex items-center justify-center gap-2">
//               {loading ? (
//                 <>
//                   <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
//                   </svg>
//                   {tab === "generate" ? "Generating (10–20s)..." : "Enhancing (20–40s)..."}
//                 </>
//               ) : tab === "generate" ? " Generate AI Design" : " Apply Enhancement"}
//             </button>

//             {result && (
//               <div className="border-t border-gray-200 pt-6 space-y-4">
//                 <h3 className="text-lg font-bold text-gray-900">
//                   {tab === "generate" ? " Your AI Design" : " Enhanced Result"}
//                 </h3>

//                 {originalUrl && (
//                   <div>
//                     <p className="text-xs text-gray-400 mb-2"> Drag slider to compare before &amp; after</p>
//                     <div className="relative rounded-2xl overflow-hidden select-none border border-gray-200"
//                       style={{ aspectRatio: "4/3" }}>
//                       <img src={result} alt="After" className="absolute inset-0 w-full h-full object-cover"/>
//                       <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
//                         <img src={originalUrl} alt="Before" className="absolute inset-0 h-full object-cover"
//                           style={{ width: `${10000 / sliderPos}%`, maxWidth: "none" }}/>
//                       </div>
//                       <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
//                         style={{ left: `${sliderPos}%` }}>
//                         <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-xl border-2 border-purple-200 flex items-center justify-center cursor-ew-resize">
//                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
//                             <path d="M9 18l-6-6 6-6M15 6l6 6-6 6" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"/>
//                           </svg>
//                         </div>
//                       </div>
//                       <span className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md font-semibold pointer-events-none">Before</span>
//                       <span className="absolute top-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-md font-semibold pointer-events-none">After</span>
//                       <input type="range" min="5" max="95" value={sliderPos}
//                         onChange={e => setSliderPos(+e.target.value)}
//                         className="slider-thumb absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
//                         style={{ appearance: "none", background: "transparent" }}/>
//                     </div>
//                   </div>
//                 )}

//                 {/* Primary actions */}
//                 <div className="grid grid-cols-2 gap-3">
//                   <button onClick={handleDownload}
//                     className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 py-3 rounded-xl text-sm font-semibold transition">
//                     ↓ Download
//                   </button>
//                   <button onClick={() => setShowBuilder(true)}
//                     className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-md shadow-purple-200">
//                      Connect with Designer
//                   </button>
//                 </div>

//                 {/* Enhance this result */}
//                 <button
//                   onClick={handleEnhanceThis}
//                   disabled={loadingEnhanceSwitch}
//                   className="w-full py-3 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-400 text-orange-700 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50">
//                   {loadingEnhanceSwitch ? (
//                     <>
//                       <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
//                       </svg>
//                       Loading for enhancement...
//                     </>
//                   ) : (
//                     <>🔧 Enhance This Result Further</>
//                   )}
//                 </button>

//                 {/* Regenerate */}
//                 <button
//                   onClick={tab === "generate" ? handleGenerate : handleEnhance}
//                   disabled={loading}
//                   className="w-full py-2.5 border border-gray-300 text-gray-500 hover:text-purple-600 hover:border-purple-300 rounded-xl text-sm font-medium transition disabled:opacity-40">
//                    Regenerate
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {showBuilder && (
//         <BuilderModal
//           style={style}
//           originalImage={originalUrl}
//           generatedImage={result}
//           onClose={() => setShowBuilder(false)}
//         />
//       )}
//     </>
//   );
// }import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiUpload } from "../../services/api";
import { toast } from "react-toastify";
import BuilderModal from "../BuilderModal";
import { getGuestId } from "../../utils/guest";

// ── React Icons (Font Awesome) ────────────────────────────────────────────────
import {
  FaUpload, FaImage, FaMagic, FaSyncAlt, FaLink,
  FaTimes, FaDownload, FaLock, FaUser, FaStar,
  FaArrowsAltH, FaSpinner, FaWrench,
} from "react-icons/fa";

// ── Constants ─────────────────────────────────────────────────────────────────
const STYLES = [
  { value: "modern",      label: "Modern",      icon: "⬛" },
  { value: "traditional", label: "Traditional", icon: "🏛" },
  { value: "aesthetic",   label: "Aesthetic",   icon: "✦" },
];
const ROOMS = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Dining Room"];

async function urlToFile(url, filename = "ai-design.jpg") {
  const res  = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

// ── Guest Limit Popup ─────────────────────────────────────────────────────────
function GuestLimitPopup({ onClose, onSignIn, onSignUp }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center animate-scaleIn">
        <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4 text-violet-600">
          <FaLock size={28} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Free limit reached</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          You've used all your free generations. Sign in or create a free account to continue designing.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onSignIn}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2">
            <FaUser size={14} /> Sign In
          </button>
          <button
            onClick={onSignUp}
            className="w-full py-3 border-2 border-violet-200 text-violet-700 rounded-xl font-semibold text-sm hover:bg-violet-50 transition">
            Create Free Account
          </button>
          <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 transition mt-1">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Download Format Picker ────────────────────────────────────────────────────
function DownloadPicker({ url, onClose }) {
  const formats = ["jpg", "png", "jpeg"];
  const download = (fmt) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `decorgen-design.${fmt}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onClose();
  };
  return (
    <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
      <p className="text-xs font-semibold text-gray-400 px-3 pt-3 pb-1.5 uppercase tracking-wider">Download as</p>
      {formats.map(f => (
        <button key={f} onClick={() => download(f)}
          className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition flex items-center gap-2">
          <FaDownload size={13} /> .{f.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function GeneratorModal({ onClose, onNavigateToAuth }) {
  const { isLoggedIn } = useAuth();

  const [tab,          setTab]          = useState("generate");
  const [image,        setImage]        = useState(null);
  const [preview,      setPreview]      = useState(null);
  const [style,        setStyle]        = useState("");
  const [roomType,     setRoomType]     = useState("");
  const [customMode,   setCustomMode]   = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [enhanceInstr, setEnhanceInstr] = useState("");
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [originalUrl,  setOriginalUrl]  = useState(null);
  const [sliderPos,    setSliderPos]    = useState(50);
  const [showBuilder,  setShowBuilder]  = useState(false);
  const [guestLeft,    setGuestLeft]    = useState(null);
  const [loadingSwitch, setLoadingSwitch] = useState(false);
  const [showDownloadPicker, setShowDownloadPicker] = useState(false);
  const [showGuestPopup,     setShowGuestPopup]     = useState(false);

  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const clearImage = () => {
    setImage(null); setPreview(null); setResult(null); setOriginalUrl(null);
  };

  const switchToEnhance = async () => {
    setTab("enhance");
    if (result) {
      setLoadingSwitch(true);
      try {
        const file = await urlToFile(result);
        setImage(file);
        setPreview(result);
        setResult(null);
        setOriginalUrl(null);
        toast.info("AI design loaded — add enhancement instructions below.");
      } catch {
        toast.info("Switch to Enhance tab and upload your image.");
      } finally {
        setLoadingSwitch(false);
      }
    }
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
      fd.append("guestId",      getGuestId());
      const data = await apiUpload("/api/designs/generate", fd, "POST");
      setResult(data.generatedImage);
      setOriginalUrl(data.originalImage);
      setSliderPos(50);
      if (data.remaining !== null) setGuestLeft(data.remaining);
      toast.success("Design generated!");
    } catch (err) {
      if (err.data?.requireLogin) setShowGuestPopup(true);
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
      fd.append("guestId",      getGuestId());
      const data = await apiUpload("/api/designs/enhance", fd, "POST");
      setResult(data.enhancedImage);
      setOriginalUrl(data.originalImage);
      setSliderPos(50);
      if (data.remaining !== null) setGuestLeft(data.remaining);
      toast.success("Image enhanced!");
    } catch (err) {
      if (err.data?.requireLogin) setShowGuestPopup(true);
      else toast.error(err.message || "Enhancement failed");
    } finally { setLoading(false); }
  };

  const inp = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none transition placeholder:text-gray-400";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose}/>

        {/* Modal shell — two column on md+ */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn">

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center text-white">
                <FaMagic size={14} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-none">AI Room Designer</h2>
                {!isLoggedIn && guestLeft !== null && (
                  <p className="text-[11px] text-violet-500 mt-0.5">{guestLeft} free uses left</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Tab toggle */}
              <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setTab("generate")}
                  className={`px-4 py-1.5 rounded-md transition-all ${tab === "generate" ? "bg-white text-violet-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  Generate
                </button>
                <button
                  onClick={switchToEnhance}
                  disabled={loadingSwitch}
                  className={`px-4 py-1.5 rounded-md transition-all flex items-center gap-1 ${tab === "enhance" ? "bg-white text-violet-700 shadow-sm" : "text-gray-500 hover:text-gray-700"} disabled:opacity-50`}>
                  {loadingSwitch ? <FaSpinner size={13} className="animate-spin" /> : <FaWrench size={13} />}
                  Enhance
                </button>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 transition">
                <FaTimes size={13} />
              </button>
            </div>
          </div>

          {/* ── Two-column body ── */}
          <div className="flex flex-col md:flex-row flex-1 min-h-0">

            {/* ════ LEFT PANEL — Inputs ════ */}
            <div className="md:w-[42%] shrink-0 border-r border-gray-100 overflow-y-auto px-6 py-5 space-y-5">

              {/* Upload zone */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  {tab === "enhance" && preview ? "Input Image" : "Room Photo"}
                </label>
                <div
                  onClick={() => inputRef.current.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                  className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all group ${
                    preview
                      ? "border-violet-300 bg-violet-50/40"
                      : "border-gray-200 hover:border-violet-400 hover:bg-violet-50/30"
                  }`}>
                  <input ref={inputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => handleFile(e.target.files[0])}/>
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="input" className="w-full rounded-xl max-h-52 object-cover"/>
                      <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                        <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition bg-black/50 px-3 py-1.5 rounded-lg">
                          Click to change
                        </span>
                      </div>
                      {tab === "enhance" && (
                        <span className="absolute top-2 left-2 bg-violet-600 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold">
                          Input ✓
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="py-10 flex flex-col items-center gap-3 text-gray-400">
                      <FaUpload size={30} />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Drop photo here or click to upload</p>
                        <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, JPEG — up to 5 MB</p>
                      </div>
                    </div>
                  )}
                </div>
                {preview && (
                  <button onClick={clearImage}
                    className="mt-1.5 text-[11px] text-gray-400 hover:text-red-400 transition flex items-center gap-1">
                    <FaTimes size={10} /> Remove image
                  </button>
                )}
              </div>

              {/* ── Generate controls ── */}
              {tab === "generate" && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Room Type (optional)</label>
                    <select value={roomType} onChange={e => setRoomType(e.target.value)} className={inp}>
                      <option value="">Select room type...</option>
                      {ROOMS.map(r => <option key={r} value={r.toLowerCase()}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Design Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {STYLES.map(s => (
                        <button key={s.value} type="button"
                          onClick={() => { setStyle(s.value); setCustomMode(false); }}
                          className={`py-3 px-2 rounded-xl border-2 text-center transition-all ${
                            style === s.value && !customMode
                              ? "border-violet-500 bg-violet-50 text-violet-700"
                              : "border-gray-200 hover:border-violet-300 text-gray-600"
                          }`}>
                          <div className="text-lg mb-1">{s.icon}</div>
                          <div className="text-[11px] font-semibold">{s.label}</div>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => { setCustomMode(!customMode); setStyle(""); }}
                      className={`mt-2 w-full py-2.5 rounded-xl border-2 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        customMode ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-500 hover:border-violet-300"
                      }`}>
                      <FaMagic size={12} /> Custom Prompt {customMode ? "(Active)" : ""}
                    </button>
                    {customMode && (
                      <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} rows={3}
                        placeholder="e.g. Add a large bookshelf, warm golden lighting, hanging plants..."
                        className={`mt-2 ${inp} resize-none border-violet-200`}/>
                    )}
                  </div>
                </>
              )}

              {/* ── Enhance controls ── */}
              {tab === "enhance" && (
                <div>
                  {image && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 flex items-start gap-2">
                      <FaWrench size={13} className="text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-700 leading-relaxed">
                        Describe specific changes — lighting, furniture, colours, textures — and the AI will refine this design.
                      </p>
                    </div>
                  )}
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    What to change?
                  </label>
                  <textarea value={enhanceInstr} onChange={e => setEnhanceInstr(e.target.value)} rows={4}
                    placeholder="e.g. Add warmer lighting, replace sofa with dark blue velvet one..."
                    className={`${inp} resize-none`}/>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Tip: "Change sofa to dark green velvet" works better than "change furniture".
                  </p>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={tab === "generate" ? handleGenerate : handleEnhance}
                disabled={loading || !image || loadingSwitch}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl font-bold text-sm hover:opacity-90 transition shadow-lg shadow-violet-200/60 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <FaSpinner size={15} className="animate-spin" />
                    {tab === "generate" ? "Generating (10–20s)..." : "Enhancing (20–40s)..."}
                  </>
                ) : tab === "generate" ? (
                  <><FaStar size={14} /> Generate AI Design</>
                ) : (
                  <><FaMagic size={13} /> Apply Enhancement</>
                )}
              </button>
            </div>

            {/* ════ RIGHT PANEL — Result ════ */}
            <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50/50">
              {result ? (
                <div className="flex flex-col h-full p-6 gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-800">
                      {tab === "generate" ? "Your AI Design" : "Enhanced Result"}
                    </h3>
                    <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FaStar size={10} /> Ready
                    </span>
                  </div>

                  {/* Before / After slider */}
                  {originalUrl && (
                    <div className="flex-1 relative rounded-xl overflow-hidden select-none border border-gray-200 shadow-sm min-h-[260px]"
                      style={{ aspectRatio: "4/3" }}>
                      <img src={result} alt="After" className="absolute inset-0 w-full h-full object-cover"/>
                      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                        <img src={originalUrl} alt="Before" className="absolute inset-0 h-full object-cover"
                          style={{ width: `${10000 / sliderPos}%`, maxWidth: "none" }}/>
                      </div>
                      {/* Divider */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-md" style={{ left: `${sliderPos}%` }}>
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center cursor-ew-resize">
                          <FaArrowsAltH size={16} className="text-violet-600" />
                        </div>
                      </div>
                      <span className="absolute top-2.5 left-2.5 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold">Before</span>
                      <span className="absolute top-2.5 right-2.5 bg-violet-600 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold">After</span>
                      <input type="range" min="5" max="95" value={sliderPos}
                        onChange={e => setSliderPos(+e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                        style={{ appearance: "none", background: "transparent" }}/>
                    </div>
                  )}

                  <p className="text-[11px] text-gray-400 text-center -mt-1">
                    Drag slider to compare before &amp; after
                  </p>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Download with format picker */}
                    <div className="relative">
                      <button
                        onClick={() => setShowDownloadPicker(p => !p)}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-700 hover:text-violet-700 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm">
                        <FaDownload size={13} /> Download
                      </button>
                      {showDownloadPicker && (
                        <DownloadPicker url={result} onClose={() => setShowDownloadPicker(false)}/>
                      )}
                    </div>

                    <button onClick={() => setShowBuilder(true)}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white py-2.5 rounded-xl text-xs font-semibold hover:opacity-90 transition shadow-md shadow-violet-200">
                      <LuLink size={14} /> Connect Designer
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button onClick={switchToEnhance} disabled={loadingSwitch}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-amber-50 border border-amber-200 hover:border-amber-400 text-amber-700 rounded-xl text-xs font-semibold transition disabled:opacity-50">
                      {loadingSwitch ? <AiOutlineLoading3Quarters size={13} className="animate-spin" /> : <LuWand2 size={13} />} Enhance Further
                    </button>
                    <button onClick={tab === "generate" ? handleGenerate : handleEnhance} disabled={loading}
                      className="flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 text-gray-500 hover:text-violet-600 hover:border-violet-300 rounded-xl text-xs font-semibold transition disabled:opacity-40">
                      <LuRefreshCw size={13} /> Regenerate
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                    <LuImage size={38} strokeWidth={1.2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-400">Your result will appear here</p>
                    <p className="text-xs text-gray-300 mt-1">Upload a photo and generate your AI design</p>
                  </div>
                  {loading && (
                    <div className="flex items-center gap-2 text-violet-500 text-sm font-medium">
                      <AiOutlineLoading3Quarters size={16} className="animate-spin" /> Working on your design...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guest Limit Popup */}
      {showGuestPopup && (
        <GuestLimitPopup
          onClose={() => setShowGuestPopup(false)}
          onSignIn={() => { setShowGuestPopup(false); onNavigateToAuth?.("signin"); onClose(); }}
          onSignUp={() => { setShowGuestPopup(false); onNavigateToAuth?.("signup"); onClose(); }}
        />
      )}

      {/* Builder Modal */}
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