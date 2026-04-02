import{G as l,j as e,B as s,L as c,H as r}from"./index-CQ-OiM2Y.js";const x=()=>(l(()=>{const t=a=>{const i=(a.clientX/window.innerWidth-.5)*20,n=(a.clientY/window.innerHeight-.5)*20;r.to(".content-404",{x:i,y:n,duration:1,ease:"power2.out"}),r.to(".light-leak",{x:-i*1.5,y:-n*1.5,duration:1.5,ease:"power2.out"})};return window.addEventListener("mousemove",t),()=>window.removeEventListener("mousemove",t)}),e.jsxs("div",{className:"relative min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center overflow-hidden font-sans",children:[e.jsx("div",{className:"light-leak absolute w-[150vw] h-[150vh] pointer-events-none z-0",style:{background:`radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15), transparent 60%),
                       radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1), transparent 50%),
                       radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1), transparent 50%)`,filter:"blur(60px)",animation:"pulseFade 15s ease-in-out infinite alternate"}}),e.jsx("div",{className:"fixed inset-0 pointer-events-none z-50 opacity-[0.03]",style:{backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}),e.jsxs("div",{className:"content-404 relative z-10 flex flex-col items-center text-center gap-6 px-4",children:[e.jsx("div",{className:"relative text-[8rem] md:text-[12rem] font-black leading-none tracking-tighter",style:{textShadow:"0 0 20px rgba(255, 255, 255, 0.1)"},children:e.jsx("span",{className:"relative inline-block before:absolute before:top-0 before:left-[4px] before:w-full before:h-full before:content-['404'] before:text-shadow-[-2px_0_#ff00c1] before:animate-glitch-1 after:absolute after:top-0 after:left-[-4px] after:w-full after:h-full after:content-['404'] after:text-shadow-[-2px_0_#00fff9,2px_2px_#ff00c1] after:animate-glitch-2 opacity-90",children:"404"})}),e.jsxs("div",{className:"space-y-4 max-w-md",children:[e.jsx("h2",{className:"text-3xl md:text-4xl font-bold tracking-tight text-zinc-200",children:"Lost in the cinematic universe"}),e.jsx("p",{className:"text-lg text-zinc-400",children:"The scene you're looking for didn't make the final cut. Let's get you back to the main feature."})]}),e.jsx(s,{asChild:!0,className:"mt-4 px-8 py-6 text-lg font-semibold rounded-full bg-zinc-50 text-zinc-950 hover:bg-zinc-200 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:shadow-white/10",children:e.jsx(c,{to:"/",children:"Return Home"})})]}),e.jsx("style",{jsx:"true",children:`
        @keyframes pulseFade {
          0% { transform: scale(1) translate(0, 0); opacity: 0.8; }
          50% { transform: scale(1.1) translate(-2%, 2%); opacity: 1; }
          100% { transform: scale(0.9) translate(2%, -2%); opacity: 0.6; }
        }
        @keyframes glitch-anim-1 {
          0% { clip: rect(25px, 9999px, 98px, 0); }
          20% { clip: rect(10px, 9999px, 39px, 0); }
          40% { clip: rect(81px, 9999px, 2px, 0); }
          60% { clip: rect(67px, 9999px, 32px, 0); }
          80% { clip: rect(2px, 9999px, 41px, 0); }
          100% { clip: rect(8px, 9999px, 91px, 0); }
        }
        @keyframes glitch-anim-2 {
          0% { clip: rect(48px, 9999px, 2px, 0); }
          20% { clip: rect(8px, 9999px, 72px, 0); }
          40% { clip: rect(57px, 9999px, 11px, 0); }
          60% { clip: rect(5px, 9999px, 44px, 0); }
          80% { clip: rect(19px, 9999px, 35px, 0); }
          100% { clip: rect(52px, 9999px, 3px, 0); }
        }
        .animate-glitch-1 {
          animation: glitch-anim-1 3s infinite linear alternate-reverse;
        }
        .animate-glitch-2 {
          animation: glitch-anim-2 3s infinite linear alternate-reverse;
        }
        .text-shadow-\\[-2px_0_\\#ff00c1\\] {
          text-shadow: -2px 0 #ff00c1;
        }
        .text-shadow-\\[-2px_0_\\#00fff9\\,2px_2px_\\#ff00c1\\] {
          text-shadow: -2px 0 #00fff9, 2px 2px #2fff00ff;
        }
      `})]}));export{x as default};
