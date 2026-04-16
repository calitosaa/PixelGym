import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeFood } from '../lib/gemini';

export default function Diet() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [nutrition, setNutrition] = useState<any>(null);
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      handleAnalyze(imageSrc);
    }
  }, [webcamRef]);

  const handleAnalyze = async (imgStr: string) => {
    setAnalyzing(true);
    setNutrition(null);
    try {
      const base64Data = imgStr.replace(/^data:image\/\w+;base64,/, "");
      const res = await analyzeFood(base64Data, 'image/jpeg');
      const data = JSON.parse(res);
      setNutrition(data);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze food. Ensure Gemini API key is valid.');
    } finally {
      setAnalyzing(false);
    }
  };

  const retake = () => {
    setImage(null);
    setNutrition(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
      <AnimatePresence mode="wait">
        {!image ? (
          <motion.div key="camera" exit={{ opacity: 0 }} className="h-full relative bg-black">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{ facingMode: 'environment' }}
            />
            <div className="absolute top left right padding">
               <div className="chip blur text-white border transparent" style={{ borderRadius: '99px', backdropFilter: 'blur(20px)' }}>
                 <i>restaurant</i>
                 <span>Scan Meal</span>
               </div>
            </div>
            <div className="absolute bottom left right center-align" style={{ paddingBottom: '120px' }}>
              <button 
                 onClick={capture}
                 className="circle extra large primary wave"
                 style={{ width: '90px', height: '90px', border: '6px solid rgba(255,255,255,0.4)', background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}
              >
                <i style={{ fontSize: '2.5rem' }}>camera_alt</i>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full relative overflow-hidden bg-black">
            <img src={image} alt="Food meal" className="w-full h-full object-cover absolute inset-0 text-blur blur" style={{ opacity: 0.6 }} />
            
            <div className="absolute inset-0 flex flex-col justify-end padding" style={{ paddingBottom: '120px' }}>
               <nav className="margin-bottom">
                 <button onClick={retake} className="button responsive glass blur text-white wave" style={{ borderRadius: '99px' }}>
                   <i>arrow_back</i> <span>Retake Photo</span>
                 </button>
               </nav>

               <article className="expressive-card padding tertiary-container text-tertiary-on-container shadow" style={{ background: 'rgba(var(--tertiary-container), 0.8)' }}>
                 {analyzing ? (
                   <div className="center-align padding space">
                      <progress className="circle large margin-bottom"></progress>
                      <h5 className="bold">Analyzing macros...</h5>
                      <p className="opacity-70">Gemini 3.1 Flash Lite assessing nutrition</p>
                   </div>
                 ) : nutrition ? (
                   <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                     <h3 className="bold">{nutrition.meal || 'Unknown Meal'}</h3>
                     <h2 className="expressive-headline text-primary" style={{ fontSize: '3rem' }}>{nutrition.calories} <span className="small-text opacity-70">kcal</span></h2>
                     
                     <div className="space"></div>

                     <div className="grid">
                        <div className="s4 center-align">
                          <h4 className="bold no-margin">{nutrition.protein}</h4>
                          <span className="small-text opacity-70 uppercase tracking-widest">Protein</span>
                        </div>
                        <div className="s4 center-align">
                          <h4 className="bold no-margin">{nutrition.carbs}</h4>
                          <span className="small-text opacity-70 uppercase tracking-widest">Carbs</span>
                        </div>
                        <div className="s4 center-align">
                          <h4 className="bold no-margin">{nutrition.fat}</h4>
                          <span className="small-text opacity-70 uppercase tracking-widest">Fat</span>
                        </div>
                     </div>

                     {nutrition.tips && (
                       <>
                        <div className="space"></div>
                        <div className="padding surface-variant text-on-surface-variant" style={{ borderRadius: '24px' }}>
                          <p className="italic no-margin">"{nutrition.tips}"</p>
                        </div>
                       </>
                     )}
                   </motion.div>
                 ) : null}
               </article>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
