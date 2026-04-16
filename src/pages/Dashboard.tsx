import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, cubicBezier: [0.34, 1.56, 0.64, 1] }}
      className="padding-bottom"
    >
      <header className="padding-top space center-align">
         <h1 style={{fontSize: '4.5rem', fontWeight: 800, letterSpacing: '-3px', lineHeight: 1}}>450</h1>
         <p className="opacity-70 medium-text tracking-widest uppercase">Active Calories</p>
      </header>
      
      <main className="responsive stretch">
         <Link to="/workouts" className="no-underline text-on-background">
           <article className="expressive-hero margin" style={{aspectRatio: '1', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px', position: 'relative', overflow: 'hidden'}}>
              <div className="absolute top left right bottom" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)' }}></div>
              <h2 className="bold" style={{fontSize: '2.5rem', lineHeight: '1'}}>Upper Body Power</h2>
              <p className="opacity-80 margin-bottom">45 mins • Hypertrophy</p>
              <div className="row top-align">
                 <button className="circle extra large tertiary text-on-tertiary"><i>play_arrow</i></button>
                 <div className="max"></div>
                 <button className="circle border transparent text-white"><i>more_horiz</i></button>
              </div>
           </article>
         </Link>

         {/* Tracklist style recent logs */}
         <div className="padding">
            <h5 className="bold margin-bottom opacity-80" style={{ letterSpacing: '-0.5px' }}>Past Sessions</h5>
            
            <div className="track-item wave">
               <div className="track-icon"><i>fitness_center</i></div>
               <div className="max">
                  <h6 className="bold no-margin">Leg Day Blast</h6>
                  <p className="opacity-70 small-text no-margin">Yesterday</p>
               </div>
               <strong className="text-primary">+120p</strong>
            </div>

            <div className="track-item wave">
               <div className="track-icon"><i>directions_run</i></div>
               <div className="max">
                  <h6 className="bold no-margin">Cardio Core</h6>
                  <p className="opacity-70 small-text no-margin">Tuesday</p>
               </div>
               <strong className="text-tertiary">+85p</strong>
            </div>

            <div className="track-item wave" style={{ borderBottom: 'none' }}>
               <div className="track-icon"><i>self_improvement</i></div>
               <div className="max">
                  <h6 className="bold no-margin">Stretching & Mobility</h6>
                  <p className="opacity-70 small-text no-margin">Sunday</p>
               </div>
               <strong className="text-secondary">+50p</strong>
            </div>
         </div>
      </main>
    </motion.div>
  );
}
