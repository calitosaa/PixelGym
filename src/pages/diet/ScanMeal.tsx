import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import IconButton from '../../components/ui/IconButton';
import Button from '../../components/ui/Button';
import { LoadingWave } from '../../components/ui/Loading';
import { analyzeFood } from '../../lib/gemini';
import { store } from '../../data/store';
import { Meal } from '../../types';
import { useToast } from '../../components/ui/Toast';

export default function ScanMeal() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [nutrition, setNutrition] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraDenied, setCameraDenied] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const toast = useToast();

  const capture = useCallback(() => {
    const src = webcamRef.current?.getScreenshot();
    if (src) {
      setImage(src);
      handleAnalyze(src);
    }
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const str = r.result as string;
      setImage(str);
      handleAnalyze(str);
    };
    r.readAsDataURL(f);
  };

  const handleAnalyze = async (imgStr: string) => {
    setAnalyzing(true);
    setError(null);
    setNutrition(null);
    try {
      const base64 = imgStr.replace(/^data:image\/\w+;base64,/, '');
      const mime = imgStr.match(/^data:(image\/\w+);/)?.[1] || 'image/jpeg';
      const res = await analyzeFood(base64, mime);
      const data = JSON.parse(res);
      setNutrition(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to analyze');
    } finally {
      setAnalyzing(false);
    }
  };

  const logMeal = () => {
    if (!nutrition) return;
    const now = new Date();
    const hour = now.getHours();
    let type: Meal['type'] = 'snack';
    if (hour < 10) type = 'breakfast';
    else if (hour < 15) type = 'lunch';
    else if (hour < 21) type = 'dinner';

    const meal: Meal = {
      id: `m-${Date.now()}`,
      name: nutrition.meal || 'Scanned meal',
      at: Date.now(),
      calories: Number(nutrition.calories) || 0,
      protein: Number(nutrition.protein) || 0,
      carbs: Number(nutrition.carbs) || 0,
      fat: Number(nutrition.fat) || 0,
      imageUrl: image || undefined,
      tips: nutrition.tips,
      type,
    };
    store.addMeal(meal);
    toast.show('Meal logged!', 'check_circle');
    navigate('/diet');
  };

  const retake = () => {
    setImage(null);
    setNutrition(null);
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-dvh relative bg-black overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {!image ? (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {!cameraDenied ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{ facingMode: 'environment' }}
                onUserMediaError={() => setCameraDenied(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center text-white">
                <Icon name="videocam_off" size={80} className="opacity-70 mb-4" />
                <h2 className="headline text-white">Camera unavailable</h2>
                <p className="opacity-70 mt-2">Upload a photo instead.</p>
              </div>
            )}

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
              <IconButton
                name="close"
                onClick={() => navigate('/diet')}
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                }}
              />
              <div
                className="pill-chip"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(14px)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Icon name="restaurant" size={16} />
                <span>Scan Meal</span>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFile}
              />
              <IconButton
                name="upload"
                onClick={() => fileRef.current?.click()}
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                }}
              />
            </div>

            {/* Viewfinder framing */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <motion.div
                className="rounded-[48px]"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '80vw',
                  maxWidth: 340,
                  height: '80vw',
                  maxHeight: 340,
                  border: '2px solid rgba(255,255,255,0.6)',
                }}
              />
            </div>

            {/* Capture button */}
            <div className="absolute bottom-[90px] left-0 right-0 flex justify-center z-10">
              <button
                onClick={capture}
                disabled={cameraDenied}
                className="m3-fab-lg"
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: '50%',
                  border: '6px solid rgba(255,255,255,0.5)',
                  background: 'white',
                  color: 'black',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: cameraDenied ? 'not-allowed' : 'pointer',
                }}
              >
                <Icon name="photo_camera" filled size={40} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            <img
              src={image}
              alt="Meal"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'brightness(0.5) blur(4px)' }}
            />
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
              <IconButton
                name="arrow_back"
                onClick={retake}
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                }}
              />
              <div
                className="pill-chip"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(14px)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Icon name="analytics" filled size={16} />
                <span>AI Analysis</span>
              </div>
              <div style={{ width: 44 }} />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 pb-8 flex flex-col justify-end z-10 min-h-[60%]">
              <AnimatePresence mode="wait">
                {analyzing ? (
                  <motion.div
                    key="analyzing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="expressive-card glass text-center"
                    style={{ padding: 32 }}
                  >
                    <LoadingWave />
                    <h3 className="headline mt-4">Analyzing macros...</h3>
                    <p className="opacity-70 font-medium mt-2">
                      Gemini is identifying ingredients & portion sizes
                    </p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="expressive-card"
                    style={{
                      padding: 24,
                      background: 'var(--error-container)',
                      color: 'var(--on-error-container)',
                    }}
                  >
                    <Icon name="error" filled size={32} />
                    <h3 className="headline mt-2">Analysis failed</h3>
                    <p className="opacity-80 text-sm mt-1">{error}</p>
                    <Button variant="outlined" className="mt-3" onClick={retake}>
                      Try again
                    </Button>
                  </motion.div>
                ) : nutrition ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 220 }}
                    className="expressive-hero hero-tertiary"
                    style={{ padding: 24, color: 'var(--on-tertiary-container)' }}
                  >
                    <h3 className="headline" style={{ letterSpacing: '-0.03em' }}>
                      {nutrition.meal || 'Meal analyzed'}
                    </h3>
                    <div className="display-lg mt-2" style={{ letterSpacing: '-0.05em' }}>
                      {nutrition.calories}
                      <span className="text-base font-bold opacity-70 ml-2">kcal</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <MacroCell label="Protein" value={nutrition.protein} />
                      <MacroCell label="Carbs" value={nutrition.carbs} />
                      <MacroCell label="Fat" value={nutrition.fat} />
                    </div>

                    {nutrition.tips && (
                      <div
                        className="mt-4 px-4 py-3 rounded-2xl"
                        style={{ background: 'rgba(0,0,0,0.15)' }}
                      >
                        <Icon name="tips_and_updates" filled size={16} />
                        <span className="italic font-medium ml-2">{nutrition.tips}</span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button variant="outlined" className="flex-1" onClick={retake}>
                        Retake
                      </Button>
                      <Button
                        icon="add"
                        className="flex-1"
                        onClick={logMeal}
                        style={{ background: 'white', color: 'black' }}
                      >
                        Log meal
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MacroCell({ label, value }: { label: string; value: any }) {
  return (
    <div
      className="text-center rounded-2xl p-3"
      style={{ background: 'rgba(0,0,0,0.15)' }}
    >
      <div className="font-extrabold" style={{ letterSpacing: '-0.02em', fontSize: '1.15rem' }}>
        {value}
        <span className="text-xs opacity-70 ml-1">g</span>
      </div>
      <div className="text-[10px] font-bold opacity-70 uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
}
