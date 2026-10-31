import React, { useEffect, useRef } from 'react';

export default function LandingPage({ onEnterWorkspace }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = s => root.querySelector(s);
    const $$ = s => Array.from(root.querySelectorAll(s));

    // Scroll progress & sticky nav
    const bar = $('#bar');
    const nav = $('#nav');
    function handleScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      if (nav) nav.classList.toggle('stuck', window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Intersection observer for reveal elements
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    $$('.rv, .row').forEach(el => io.observe(el));

    // Magnetic buttons
    const unbindPointers = [];
    if (!reduce && window.matchMedia('(hover:hover)').matches) {
      $$('.mag').forEach(btn => {
        const move = (e) => {
          const r = btn.getBoundingClientRect();
          btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
        };
        const leave = () => {
          btn.style.transform = '';
        };
        btn.addEventListener('pointermove', move);
        btn.addEventListener('pointerleave', leave);
        unbindPointers.push(() => {
          btn.removeEventListener('pointermove', move);
          btn.removeEventListener('pointerleave', leave);
        });
      });
    }

    // Venn diagram convergence animation
    const ca = $('#ca');
    const cb = $('#cb');
    const cc = $('#cc');
    const cl = $('#cl');
    const ta = $('#ta');
    const tb = $('#tb');
    const tl = $('#tl');
    const c1 = $('#c1');
    const c2 = $('#c2');
    const vennEl = $('#venn');

    let animFrameId;
    let parallaxFrameId;

    function setVenn(d, px) {
      if (!ca || !cb || !cc || !cl || !ta || !tb || !tl) return;
      const A = 280 - d + px;
      const B = 280 + d + px;
      ca.setAttribute('cx', A);
      cb.setAttribute('cx', B);
      cc.setAttribute('cx', B);
      cl.setAttribute('cx', A);
      ta.setAttribute('x', A - 55);
      tb.setAttribute('x', B + 55);
      tl.setAttribute('x', 280 + px);
    }

    function finishVenn() {
      if (cl) cl.setAttribute('opacity', '1');
      if (tl) tl.classList.add('on');
      setTimeout(() => { if (c1) c1.classList.add('on'); }, 200);
      setTimeout(() => { if (c2) c2.classList.add('on'); }, 650);
    }

    const D0 = 130;
    const D1 = 62;
    let px = 0;
    let tx = 0;

    if (reduce) {
      setVenn(D1, 0);
      finishVenn();
    } else {
      setVenn(D0, 0);
      let t0 = null;
      const dur = 2000;
      const delay = 700;
      const ease = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
      let done = false;

      function tick(ts) {
        if (t0 === null) t0 = ts;
        const t = Math.max(0, Math.min(1, (ts - t0 - delay) / dur));
        setVenn(D0 + (D1 - D0) * ease(t), px);
        if (t >= 0.55 && !done) {
          done = true;
          finishVenn();
        }
        animFrameId = requestAnimationFrame(tick);
      }
      animFrameId = requestAnimationFrame(tick);

      if (vennEl) {
        const onVennMove = e => {
          const r = vennEl.getBoundingClientRect();
          tx = ((e.clientX - r.left) / r.width - 0.5) * 30;
        };
        const onVennLeave = () => { tx = 0; };
        vennEl.addEventListener('pointermove', onVennMove);
        vennEl.addEventListener('pointerleave', onVennLeave);
        unbindPointers.push(() => {
          vennEl.removeEventListener('pointermove', onVennMove);
          vennEl.removeEventListener('pointerleave', onVennLeave);
        });
      }

      function sm() {
        px += (tx - px) * 0.06;
        parallaxFrameId = requestAnimationFrame(sm);
      }
      parallaxFrameId = requestAnimationFrame(sm);
    }

    // Live demo: Simulated meeting conversation
    const script = [
      { w: 'Maya', t: 'Let’s ship the new pricing page on Friday.', hl: 'ship the new pricing page on Friday', o: ['d', 'Ship pricing page', 'Decision · Friday'] },
      { w: 'Dev', t: 'I can write the copy by Thursday, but we need legal first.', hl: 'write the copy by Thursday', o: ['t', 'Write pricing page copy', 'Dev · due Thursday'] },
      { w: 'Sam', t: 'I’ll ask legal for sign-off today.', hl: 'ask legal for sign-off today', o: ['t', 'Get legal sign-off', 'Sam · due today'] },
      { w: 'Maya', t: 'And we’re dropping the annual-only plan.', hl: 'dropping the annual-only plan', o: ['d', 'Drop annual-only plan', 'Decision · agreed'] }
    ];

    const chat = $('#chat');
    const out = $('#out');
    const rec = $('#rec');
    let isCancelled = false;

    const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
    const esc = x => x.replace(/&/g, '&amp;').replace(/</g, '&lt;');

    async function play() {
      while (!isCancelled) {
        if (!chat || !out || !rec) return;
        chat.innerHTML = '';
        out.innerHTML = '';
        rec.classList.remove('off');
        rec.textContent = 'Listening';

        for (let i = 0; i < script.length; i++) {
          if (isCancelled) return;
          const l = script[i];
          const el = document.createElement('div');
          el.className = 'msg';
          chat.appendChild(el);

          await sleep(60);
          if (isCancelled) return;
          el.classList.add('on');

          let typed = '';
          if (!reduce) {
            for (let c = 0; c < l.t.length; c++) {
              if (isCancelled) return;
              typed += l.t[c];
              el.innerHTML = `<b>${l.w}</b>${esc(typed)}`;
              await sleep(16);
            }
          }

          el.innerHTML = `<b>${l.w}</b>${esc(l.t).replace(esc(l.hl), '<mark>' + esc(l.hl) + '</mark>')}`;
          await sleep(200);
          if (isCancelled) return;
          el.classList.add('hl');

          const it = document.createElement('div');
          it.className = 'item';
          it.innerHTML = `<span class="tag ${l.o[0]}">${l.o[0] === 'd' ? 'Decision' : 'Action'}</span><div>${l.o[1]}</div><small>${l.o[2]}</small>`;
          out.appendChild(it);

          await sleep(80);
          if (isCancelled) return;
          it.classList.add('on');
          await sleep(900);
        }

        if (rec) {
          rec.classList.add('off');
          rec.textContent = 'Meeting ended · 4 items captured';
        }
        if (reduce) return;
        await sleep(5000);
      }
    }

    let started = false;
    const demoEl = $('#demo');
    let demoObserver;
    if (demoEl) {
      demoObserver = new IntersectionObserver((entries, ob) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          ob.disconnect();
          play();
        }
      }, { threshold: 0.35 });
      demoObserver.observe(demoEl);
    }

    return () => {
      isCancelled = true;
      window.removeEventListener('scroll', handleScroll);
      io.disconnect();
      if (demoObserver) demoObserver.disconnect();
      unbindPointers.forEach(fn => fn());
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (parallaxFrameId) cancelAnimationFrame(parallaxFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="landing-scope">
      <style>{`
        .landing-scope {
          --cream: #FBF9F5;
          --ink: #1C1A17;
          --muted: #6B665D;
          --line: #E6E0D4;
          --forest: #2B4C3F;
          --amber: #E99D34;
          --ember: #E05A30;
          --sand: #F2EDE2;
          --serif: 'Instrument Serif', Georgia, 'Times New Roman', serif;
          --sans: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
          --ease: cubic-bezier(.16, 1, .3, 1);
          --wrap: min(1180px, 92vw);
          background: var(--cream);
          color: var(--ink);
          font-family: var(--sans);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          width: 100%;
          min-height: 100vh;
          position: relative;
        }

        .landing-scope h1, .landing-scope h2, .landing-scope h3 {
          font-family: var(--serif);
          font-weight: 400;
          line-height: 1;
          letter-spacing: -.015em;
        }

        .landing-scope .wrap {
          width: var(--wrap);
          margin-inline: auto;
        }

        .landing-scope #bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--ember);
          transform: scaleX(0);
          transform-origin: left;
          z-index: 60;
        }

        .landing-scope nav {
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 16px 0;
          transition: .4s;
          background: rgba(251, 249, 245, .85);
          backdrop-filter: blur(14px);
        }

        .landing-scope nav.stuck {
          box-shadow: 0 1px 0 var(--line);
          padding: 12px 0;
        }

        .landing-scope nav .wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .landing-scope .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--serif);
          font-size: 1.7rem;
          color: var(--ink);
          text-decoration: none;
        }

        .landing-scope .logo svg {
          width: 30px;
          height: 30px;
        }

        .landing-scope .links {
          display: flex;
          gap: 30px;
          font-size: .93rem;
          color: var(--muted);
        }

        .landing-scope .links a {
          position: relative;
          transition: color .2s;
          text-decoration: none;
          color: inherit;
        }

        .landing-scope .links a::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -4px;
          height: 1.5px;
          background: var(--ink);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform .5s var(--ease);
        }

        .landing-scope .links a:hover {
          color: var(--ink);
        }

        .landing-scope .links a:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .landing-scope .btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 13px 24px;
          border-radius: 999px;
          border: 0;
          background: var(--forest);
          color: var(--cream);
          font: 500 .95rem var(--sans);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform .4s var(--ease);
          will-change: transform;
          text-decoration: none;
        }

        .landing-scope .btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: var(--ember);
          transform: translateY(101%);
          transition: transform .5s var(--ease);
        }

        .landing-scope .btn:hover::before {
          transform: none;
        }

        .landing-scope .btn span {
          position: relative;
          z-index: 1;
        }

        .landing-scope .btn.ghost {
          background: transparent;
          color: var(--ink);
          box-shadow: inset 0 0 0 1.5px var(--ink);
        }

        .landing-scope .btn.ghost::before {
          background: var(--ink);
        }

        .landing-scope .btn.ghost:hover {
          color: var(--cream);
        }

        /* Hero */
        .landing-scope .hero {
          padding: 70px 0 70px;
        }

        .landing-scope .hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 40px;
          align-items: center;
        }

        .landing-scope h1 {
          font-size: clamp(3.2rem, 7.2vw, 6.4rem);
        }

        .landing-scope h1 em {
          font-style: italic;
          color: var(--forest);
        }

        .landing-scope .ln {
          display: block;
          overflow: hidden;
          padding: .04em 0 .1em;
        }

        .landing-scope .ln > span {
          display: inline-block;
          transform: translateY(112%);
          animation: landUp 1.1s var(--ease) forwards;
        }

        .landing-scope .ln:nth-child(2) > span { animation-delay: .1s; }
        .landing-scope .ln:nth-child(3) > span { animation-delay: .2s; }

        @keyframes landUp {
          to { transform: none; }
        }

        .landing-scope .lede {
          margin: 26px 0 34px;
          max-width: 29em;
          font-size: 1.15rem;
          color: var(--muted);
        }

        .landing-scope .lede, .landing-scope .cta {
          opacity: 0;
          animation: landRise 1s var(--ease) forwards;
        }

        .landing-scope .lede { animation-delay: .5s; }
        .landing-scope .cta { animation-delay: .65s; display: flex; gap: 12px; flex-wrap: wrap; }

        @keyframes landRise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }

        .landing-scope .venn {
          position: relative;
          width: 100%;
          aspect-ratio: 1.28;
          opacity: 0;
          animation: landRise 1s .3s var(--ease) forwards;
        }

        .landing-scope .venn svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .landing-scope .venn text {
          font-family: var(--serif);
          font-size: 25px;
          fill: var(--ink);
        }

        .landing-scope #tl {
          fill: var(--cream);
          font-size: 27px;
          opacity: 0;
          transition: opacity .8s;
        }

        .landing-scope #tl.on {
          opacity: 1;
        }

        .landing-scope .chip {
          position: absolute;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 9px 14px;
          font-size: .82rem;
          font-weight: 500;
          box-shadow: 0 18px 30px -18px rgba(43, 76, 63, .5);
          opacity: 0;
          transform: translateY(14px) scale(.95);
          transition: opacity .7s, transform .9s var(--ease);
        }

        .landing-scope .chip.on {
          opacity: 1;
          transform: none;
        }

        .landing-scope .chip small {
          display: block;
          color: var(--muted);
          font-weight: 400;
        }

        .landing-scope .c1 { left: 6%; bottom: 6%; }
        .landing-scope .c2 { right: 2%; top: 4%; }

        /* Marquee */
        .landing-scope .marq {
          overflow: hidden;
          background: var(--amber);
          padding: 22px 0;
          color: var(--ink);
        }

        .landing-scope .track {
          display: flex;
          width: max-content;
          animation: landSlide 36s linear infinite;
          font-family: var(--serif);
          font-size: clamp(2rem, 4vw, 3.2rem);
          white-space: nowrap;
        }

        .landing-scope .track span {
          padding-right: .6em;
        }

        .landing-scope .track i {
          color: var(--forest);
          font-style: normal;
        }

        @keyframes landSlide {
          to { transform: translateX(-50%); }
        }

        /* Said to done */
        .landing-scope section {
          padding: 110px 0;
        }

        .landing-scope .head {
          max-width: 700px;
          margin-bottom: 60px;
        }

        .landing-scope h2 {
          font-size: clamp(2.4rem, 5vw, 4.2rem);
        }

        .landing-scope .head p {
          margin-top: 18px;
          color: var(--muted);
          font-size: 1.1rem;
          max-width: 32em;
        }

        /* Demo Window */
        .landing-scope .demo {
          max-width: 1000px;
          margin-inline: auto;
          background: #17291F;
          color: #EFEBE0;
          border-radius: 26px;
          overflow: hidden;
          box-shadow: 0 50px 90px -40px rgba(43, 76, 63, .75);
        }

        .landing-scope .demo-top {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 15px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, .08);
          font-size: .85rem;
          color: #9DB5A6;
        }

        .landing-scope .demo-top b {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #2E4A3C;
        }

        .landing-scope .demo-top .ttl {
          margin-left: 10px;
        }

        .landing-scope .rec {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .landing-scope .rec::before {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--ember);
          animation: landPulse 1.4s infinite;
        }

        .landing-scope .rec.off::before {
          animation: none;
          background: #587566;
        }

        @keyframes landPulse {
          50% { opacity: .25; transform: scale(.7); }
        }

        .landing-scope .demo-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 430px;
        }

        .landing-scope .pane {
          padding: 26px 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .landing-scope .pane + .pane {
          border-left: 1px solid rgba(255, 255, 255, .08);
          background: rgba(255, 255, 255, .025);
        }

        .landing-scope .pane h4 {
          font: 500 .85rem var(--sans);
          color: #9DB5A6;
        }

        .landing-scope #chat, .landing-scope #out {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .landing-scope .msg {
          font-size: 1rem;
          line-height: 1.55;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity .4s, transform .6s var(--ease);
        }

        .landing-scope .msg.on {
          opacity: 1;
          transform: none;
        }

        .landing-scope .msg b {
          color: var(--amber);
          font-weight: 600;
          margin-right: 8px;
        }

        .landing-scope .msg mark {
          color: inherit;
          background: linear-gradient(rgba(233, 157, 52, .5), rgba(233, 157, 52, .5)) 0 100% / 0 42% no-repeat;
          transition: background-size .8s var(--ease);
        }

        .landing-scope .msg.hl mark {
          background-size: 100% 42%;
        }

        .landing-scope .item {
          background: #21392D;
          border: 1px solid rgba(255, 255, 255, .09);
          border-radius: 16px;
          padding: 14px 18px;
          opacity: 0;
          transform: translateX(28px) scale(.97);
          transition: opacity .5s, transform .8s var(--ease);
        }

        .landing-scope .item.on {
          opacity: 1;
          transform: none;
        }

        .landing-scope .tag {
          display: inline-block;
          font-size: .76rem;
          font-weight: 600;
          padding: 3px 11px;
          border-radius: 99px;
          margin-bottom: 7px;
        }

        .landing-scope .tag.d {
          background: rgba(233, 157, 52, .2);
          color: var(--amber);
        }

        .landing-scope .tag.t {
          background: rgba(120, 200, 160, .18);
          color: #8FE0B8;
        }

        .landing-scope .item div {
          font-weight: 500;
        }

        .landing-scope .item small {
          display: block;
          color: #9DB5A6;
          margin-top: 2px;
        }

        /* Features */
        .landing-scope .feat {
          border-top: 1px solid var(--ink);
        }

        .landing-scope .f {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 40px;
          padding: 34px 22px;
          border-bottom: 1px solid var(--line);
          position: relative;
          overflow: hidden;
          transition: color .5s var(--ease);
        }

        .landing-scope .f::before {
          content: "";
          position: absolute;
          inset: 0;
          background: var(--forest);
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform .6s var(--ease);
          z-index: 0;
        }

        .landing-scope .f > * {
          position: relative;
          z-index: 1;
        }

        .landing-scope .f h3 {
          font-size: clamp(1.9rem, 3vw, 2.6rem);
        }

        .landing-scope .f p {
          color: var(--muted);
          transition: color .5s;
          align-self: center;
        }

        .landing-scope .f:hover {
          color: var(--cream);
        }

        .landing-scope .f:hover p {
          color: #CFE0D6;
        }

        .landing-scope .f:hover::before {
          transform: none;
        }

        /* Final CTA */
        .landing-scope .final {
          position: relative;
          background: var(--forest);
          color: var(--cream);
          border-radius: 36px;
          padding: 110px 6vw;
          text-align: center;
          overflow: hidden;
        }

        .landing-scope .final .o {
          position: absolute;
          border-radius: 50%;
          width: 420px;
          height: 420px;
          top: 50%;
          margin-top: -210px;
        }

        .landing-scope .final .a {
          left: -120px;
          background: var(--amber);
          opacity: .9;
          animation: landD1 11s ease-in-out infinite alternate;
        }

        .landing-scope .final .b {
          right: -120px;
          background: #1E382E;
          animation: landD2 11s ease-in-out infinite alternate;
        }

        @keyframes landD1 { to { transform: translateX(150px); } }
        @keyframes landD2 { to { transform: translateX(-150px); } }

        .landing-scope .final > *:not(.o) {
          position: relative;
        }

        .landing-scope .final h2 {
          max-width: 11em;
          margin: 0 auto;
        }

        .landing-scope .final p {
          margin: 22px auto 34px;
          max-width: 30em;
          color: #CFE0D6;
          font-size: 1.1rem;
        }

        .landing-scope .final .btn {
          background: var(--cream);
          color: var(--ink);
        }

        .landing-scope footer {
          padding: 48px 0;
          color: var(--muted);
          font-size: .9rem;
        }

        .landing-scope footer .wrap {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .landing-scope .rv {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity .9s var(--ease), transform 1.1s var(--ease);
        }

        .landing-scope .rv.in {
          opacity: 1;
          transform: none;
        }

        @media(max-width: 860px) {
          .landing-scope .links { display: none; }
          .landing-scope .hero-grid, .landing-scope .f { grid-template-columns: 1fr; gap: 24px; }
          .landing-scope section { padding: 80px 0; }
          .landing-scope .demo-body { grid-template-columns: 1fr; }
          .landing-scope .pane + .pane { border-left: 0; border-top: 1px solid rgba(255, 255, 255, .08); }
        }

        @media(prefers-reduced-motion: reduce) {
          .landing-scope *, .landing-scope *::before, .landing-scope *::after {
            animation-duration: .01ms !important;
            animation-delay: 0s !important;
            transition-duration: .01ms !important;
            transition-delay: 0s !important;
          }
        }
      `}</style>

      <div id="bar" />

      {/* Navigation */}
      <nav id="nav">
        <div className="wrap">
          <a href="#" className="logo" aria-label="Decisio home">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="38" cy="50" r="28" fill="#E99D34" />
              <circle cx="62" cy="50" r="28" fill="#2B4C3F" opacity=".9" />
            </svg>
            <span>Decisio</span>
          </a>
          <div className="links">
            <a href="#said">How it works</a>
            <a href="#features">What it does</a>
          </div>
          <button type="button" onClick={onEnterWorkspace} className="btn mag">
            <span>Open App →</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>
              <span className="ln"><span>Turn what</span></span>
              <span className="ln"><span>was said into</span></span>
              <span className="ln"><span><em>what gets done.</em></span></span>
            </h1>
            <p className="lede">
              Turn meeting transcripts into proposed decisions and tasks. Review owners, dates, and conflicts before committing the work.
            </p>
            <div className="cta">
              <button type="button" onClick={onEnterWorkspace} className="btn mag">
                <span>Try Decisio</span>
              </button>
              <a href="#said" className="btn ghost mag">
                <span>See it work</span>
              </a>
            </div>
          </div>

          <div className="venn" id="venn">
            <svg viewBox="0 0 560 437" role="img" aria-label="A meeting circle and an execution circle overlapping to form a decision">
              <defs>
                <clipPath id="clip">
                  <circle id="cc" cx="280" cy="218" r="150" />
                </clipPath>
              </defs>
              <circle id="ca" cx="150" cy="218" r="150" fill="#E99D34" />
              <circle id="cb" cx="410" cy="218" r="150" fill="#2B4C3F" opacity=".92" />
              <circle id="cl" cx="150" cy="218" r="150" fill="#E05A30" clipPath="url(#clip)" opacity="0" />
              <text id="ta" x="95" y="226" textAnchor="middle">Meeting</text>
              <text id="tb" x="465" y="226" textAnchor="middle" style={{ fill: '#FBF9F5' }}>Execution</text>
              <text id="tl" x="280" y="226" textAnchor="middle">Decision</text>
            </svg>
            <div className="chip c1" id="c1">
              Ship pricing page
              <small>Maya · Friday</small>
            </div>
            <div className="chip c2" id="c2">
              Legal sign-off
              <small>Sam · today</small>
            </div>
          </div>
        </div>
      </header>

      {/* Marquee Banner */}
      <div className="marq" aria-hidden="true">
        <div className="track" id="track">
          {Array(6).fill(null).map((_, i) => (
            <React.Fragment key={i}>
              <span>Decided <i>●</i></span>
              <span>Assigned <i>●</i></span>
              <span>Tracked <i>●</i></span>
              <span>Done <i>●</i></span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Section: Said to Done */}
      <section id="said">
        <div className="wrap">
          <div className="head rv">
            <h2>Every line that matters, caught and owned.</h2>
            <p>Decisio separates decisions from discussion, then turns each commitment into a task someone is accountable for.</p>
          </div>
          <div className="demo rv" id="demo" aria-label="Animated example of Decisio turning a meeting into decisions and tasks">
            <div className="demo-top">
              <b />
              <b />
              <b />
              <span className="ttl">Product sync · illustrative example</span>
              <span className="rec" id="rec">Listening</span>
            </div>
            <div className="demo-body">
              <div className="pane">
                <h4>Conversation</h4>
                <div id="chat" />
              </div>
              <div className="pane">
                <h4>Decisio captured</h4>
                <div id="out" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Features */}
      <section id="features" style={{ paddingTop: '20px' }}>
        <div className="wrap">
          <div className="head rv">
            <h2>Built for what happens after the meeting.</h2>
          </div>
          <div className="feat rv">
            <div className="f">
              <h3>Decisions on the record</h3>
              <p>Each decision is logged with who made it and why, so nobody has to ask whether it was agreed.</p>
            </div>
            <div className="f">
              <h3>One owner, one date</h3>
              <p>“We should” becomes a name and a deadline, taken from what people actually said.</p>
            </div>
            <div className="f">
              <h3>Follow-up that sticks</h3>
              <p>Review upcoming deadlines while the app is open and download a weekly digest for each owner.</p>
            </div>
            <div className="f">
              <h3>Works where you work</h3>
              <p>Connect a Trello destination, review the proposed card, and confirm before posting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Start / CTA */}
      <section id="start" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="final rv">
            <span className="o a" />
            <span className="o b" />
            <h2>Make the next meeting count.</h2>
            <p>Stop losing decisions in chat threads. Let Decisio turn the conversation into finished work.</p>
            <button type="button" onClick={onEnterWorkspace} className="btn mag">
              <span>Start with Decisio</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <span>© 2026 Decisio</span>
          <span>Meeting-to-Execution Agent</span>
        </div>
      </footer>
    </div>
  );
}
