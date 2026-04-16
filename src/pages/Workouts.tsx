import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Workouts() {
  const [activeTab, setActiveTab] = useState<'routines' | 'video'>('routines');
  const [generatingVideo, setGeneratingVideo] = useState(false);

  const routines = [
    { id: 1, name: 'Hypertrophy Full Body', target: 'Strength', muscles: 'Chest, Back, Legs' },
    { id: 2, name: 'Cardio Shred', target: 'Endurance', muscles: 'Full Body' },
    { id: 3, name: 'Core Crusher', target: 'Agility', muscles: 'Abs, Obliques' },
  ];

  const handleGenerateVideo = () => {
    setGeneratingVideo(true);
    setTimeout(() => {
      setGeneratingVideo(false);
      alert('Video generation simulator complete. In production, Veo 3.1 results would stream here.');
    }, 4000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="padding-bottom pt-8">
      <header className="padding space">
        <h1 className="expressive-headline">Workouts</h1>
      </header>

      <main className="responsive padding stretch pb-[120px]">
        <nav className="scroll padding-bottom">
           <button 
             className={`chip ${activeTab === 'routines' ? 'active fill' : 'border'}`} 
             onClick={() => setActiveTab('routines')}
           >
             <i>fitness_center</i>
             <span>My Routines</span>
           </button>
           <button 
             className={`chip ${activeTab === 'video' ? 'active fill tertiary' : 'border'}`} 
             onClick={() => setActiveTab('video')}
           >
             <i>videocam</i>
             <span>Generative Video</span>
           </button>
        </nav>

        <AnimatePresence mode="wait">
          {activeTab === 'routines' ? (
            <motion.div
              key="routines"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {routines.map((routine) => (
                <div key={routine.id} className="track-item wave" style={{ padding: '20px 0' }}>
                   <div className="track-icon primary" style={{ width: '80px', height: '80px', borderRadius: '28px', background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}>
                     <i style={{ fontSize: '2rem' }}>fitness_center</i>
                   </div>
                   <div className="max">
                     <h5 className="bold no-margin" style={{ letterSpacing: '-0.5px' }}>{routine.name}</h5>
                     <p className="opacity-70 no-margin">{routine.muscles} • {routine.target}</p>
                   </div>
                   <button className="circle transparent text-on-background"><i>play_circle</i></button>
                </div>
              ))}
              
              <div className="center-align padding-top margin-top">
                <button className="expressive-btn secondary-container text-on-secondary-container wave">
                  <i>add</i>
                  <span>Create Routine</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="video"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <article className="expressive-hero padding tertiary-container text-tertiary-on-container relative overflow-hidden">
                 <div className="absolute right bottom">
                    <i style={{ fontSize: '15rem', opacity: 0.05, transform: 'rotate(-25deg) translate(20%, 20%)' }}>smart_toy</i>
                 </div>
                 <h2 className="bold" style={{fontSize: '2.5rem', lineHeight: '1'}}>Veo 3.1 Mini</h2>
                 <p className="opacity-80 margin-bottom">
                   Describe an exercise and our AI will generate a mini-video demonstration.
                 </p>
                 
                 <div className="field textarea label border margin-bottom max">
                   <textarea placeholder="e.g. A detailed cinematic 3D render of a person performing a perfect deep squat..." rows={4} style={{ borderRadius: '24px', padding: '20px' }}></textarea>
                 </div>
                 
                 <button 
                   onClick={handleGenerateVideo}
                   disabled={generatingVideo}
                   className="button responsive expressive-btn tertiary text-on-tertiary wave"
                 >
                   {generatingVideo ? <i>progress_activity</i> : <i>videocam</i>}
                   <span>{generatingVideo ? 'Synthesizing...' : 'Generate AI Video'}</span>
                 </button>
              </article>
              
              <h6 className="center-align opacity-50 margin-top padding-top">Recent Generations</h6>
              <p className="center-align opacity-30 italic">No videos generated yet.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
