/* The Freelancers — questionnaire engine.
   Each client page sets window.TF_FORM = { client, whatsapp, messageTitle, steps, ... } before loading this file. */
(function(){
  const C = window.TF_FORM;
  // Set to true once the logo pack SVGs are in /assets (tf-lockup-horizontal-ink.svg / -linen.svg).
  const HAS_LOGO = false;
  const steps = C.steps;
  const answers = {}, otherText = {};
  let i = 0;

  const el = (tag, attrs={}, kids=[]) => { const e=document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)) { if(k==="class") e.className=v; else if(k==="text") e.textContent=v;
      else if(k.startsWith("on")) e.addEventListener(k.slice(2),v); else e.setAttribute(k,v); }
    (Array.isArray(kids)?kids:[kids]).forEach(c=>c&&e.appendChild(c)); return e; };

  // Shell
  const mark = el("a",{class:"tf-mark",href:"https://thefreelancers.io",target:"_blank",rel:"noopener","aria-label":"The Freelancers"});
  if (HAS_LOGO){
    const base = new URL("./", document.currentScript ? document.currentScript.src : location.href).href;
    const pic = el("picture");
    pic.appendChild(el("source",{srcset:base+"tf-lockup-horizontal-linen.svg",media:"(prefers-color-scheme: dark)"}));
    pic.appendChild(el("img",{src:base+"tf-lockup-horizontal-ink.svg",alt:"The Freelancers",height:"28"}));
    mark.appendChild(pic);
  } else mark.textContent = "The Freelancers";
  const count = el("div",{class:"tf-count","aria-live":"polite"});
  const barFill = el("i");
  const main = el("main",{class:"tf-main"});
  document.body.appendChild(el("div",{class:"tf-wrap"},[
    el("header",{class:"tf-top"},[mark,count]),
    el("div",{class:"tf-bar","aria-hidden":"true"},[barFill]),
    main,
    el("footer",{class:"tf-foot"},[el("span",{text:"The Freelancers"}), el("span",{text:C.client?`for ${C.client}`:""})])
  ]));

  const visible = () => steps.filter(s => !s.when || s.when(answers));
  const qSteps = () => visible().filter(s => !["intro","review"].includes(s.type));
  const pad = n => String(n).padStart(2,"0");

  function valueOf(s){
    const v = answers[s.id];
    if (s.type==="multi") return (v||[]).join("، ");
    if (v==="__other") return (otherText[s.id]||"").trim();
    return (v||"").toString().trim();
  }
  function isDone(s){
    if (s.type==="text") return !s.required || valueOf(s).length>0;
    if (s.type==="multi") return (answers[s.id]||[]).length>0;
    if (s.type==="single") return !!answers[s.id] && (answers[s.id]!=="__other" || valueOf(s).length>0);
    return true;
  }
  function buildMessage(){
    const lines = [C.messageTitle || "أجوبة الأسئلة", ""];
    qSteps().forEach((q,n)=>{ lines.push(`${n+1}) ${q.title}`); lines.push(`← ${valueOf(q)||"—"}`); lines.push(""); });
    return lines.join("\n");
  }

  function render(){
    const list = visible(); const s = list[i]; const qs = qSteps(); const qi = qs.indexOf(s);
    main.replaceChildren(); main.classList.remove("tf-in"); void main.offsetWidth; main.classList.add("tf-in");
    count.textContent = qi>=0 ? `${pad(qi+1)} / ${pad(qs.length)}` : "";
    barFill.style.width = s.type==="intro" ? "0%" : s.type==="review" ? "100%" : `${Math.round(qi/qs.length*100)}%`;

    if (s.section) main.appendChild(el("p",{class:"tf-label",text:s.section}));
    main.appendChild(el("h1",{class:"tf-q",text:s.title,id:"q-title",tabindex:"-1"}));
    if (s.hint) main.appendChild(el("p",{class:"tf-hint",text:s.hint}));

    const next = el("button",{class:"tf-btn primary",type:"button",text: s.type==="intro" ? (C.startLabel||"يلا نبدأ") : "التالي", onclick:go});
    const back = i>0 ? el("button",{class:"tf-btn secondary",type:"button",text:"رجوع",onclick:()=>{i--;render();}}) : null;
    const refresh = () => { next.disabled = !isDone(s); };

    if (s.type==="text"){
      const id="in-"+s.id;
      const input = s.long ? el("textarea",{class:"tf-input",id,placeholder:s.placeholder||""})
                           : el("input",{class:"tf-input",id,type:"text",placeholder:s.placeholder||"",autocomplete:"off"});
      input.value = answers[s.id]||"";
      input.addEventListener("input",()=>{answers[s.id]=input.value;refresh();});
      if (!s.long) input.addEventListener("keydown",e=>{ if(e.key==="Enter"&&!next.disabled) go(); });
      main.appendChild(el("label",{class:"tf-field",for:id},[input]));
      setTimeout(()=>input.focus({preventScroll:true}),50);
    }

    if (s.type==="single"||s.type==="multi"){
      const wrap = el("div",{class:"tf-opts",role:"group","aria-labelledby":"q-title"});
      const opts = [...s.options]; if (s.other) opts.push("__other");
      const otherInput = s.other ? el("input",{class:"tf-input",type:"text",id:"other-"+s.id,placeholder:"اكتب جوابك",autocomplete:"off"}) : null;
      const otherWrap = s.other ? el("label",{class:"tf-field",for:"other-"+s.id},[otherInput]) : null;
      const sync = () => {
        [...wrap.children].forEach(b=>{ const val=b.dataset.v;
          const on = s.type==="multi" ? (answers[s.id]||[]).includes(val) : answers[s.id]===val;
          b.setAttribute("aria-pressed", on?"true":"false"); });
        if (otherWrap) otherWrap.hidden = answers[s.id]!=="__other";
        refresh();
      };
      opts.forEach(o=>{
        const b = el("button",{class:"tf-opt"+(s.type==="multi"?" multi":""),type:"button","aria-pressed":"false"},
          [el("span",{class:"tf-tick","aria-hidden":"true"}), el("span",{text:o==="__other"?"غير ذلك":o})]);
        b.dataset.v=o;
        b.addEventListener("click",()=>{
          if (s.type==="multi"){ const cur=new Set(answers[s.id]||[]); cur.has(o)?cur.delete(o):cur.add(o); answers[s.id]=[...cur]; }
          else { answers[s.id]=o; if(o==="__other") setTimeout(()=>otherInput.focus(),30); }
          sync();
          if (s.type==="single" && o!=="__other") setTimeout(()=>{ if(visible()[i]===s) go(); }, 280);
        });
        wrap.appendChild(b);
      });
      main.appendChild(wrap);
      if (otherWrap){
        otherInput.value = otherText[s.id]||"";
        otherInput.addEventListener("input",()=>{otherText[s.id]=otherInput.value;refresh();});
        otherInput.addEventListener("keydown",e=>{ if(e.key==="Enter"&&!next.disabled) go(); });
        main.appendChild(otherWrap);
      }
      sync();
    }

    if (s.type==="review"){
      const text = buildMessage();
      main.appendChild(el("div",{class:"tf-nav"},[
        el("a",{class:"tf-btn primary",href:`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(text)}`,target:"_blank",rel:"noopener",text:"إرسال على واتساب"})]));
      const note = el("p",{class:"tf-note","aria-live":"polite"});
      const copy = el("button",{class:"tf-btn secondary",type:"button",text:"نسخ الأجوبة",style:"flex:1",onclick:async()=>{
        try{ await navigator.clipboard.writeText(text); note.textContent="تم النسخ. الصقها في واتساب أو الإيميل وأرسلها لنا."; }
        catch(e){ note.textContent="ما قدرنا ننسخ تلقائيًا. حدّد النص تحت وانسخه يدويًا."; } }});
      main.appendChild(el("div",{class:"tf-nav"},[back, copy]));
      main.appendChild(note);
      const sum = el("div",{class:"tf-summary"});
      qs.forEach(q=>sum.appendChild(el("div",{},[el("b",{text:q.title}), el("span",{text:valueOf(q)||"—"})])));
      main.appendChild(sum);
      if (C.thanks) main.appendChild(el("p",{class:"tf-hint",text:C.thanks}));
      main.querySelector("#q-title").focus({preventScroll:true});
      return;
    }

    main.appendChild(el("div",{class:"tf-nav"},[back, next]));
    refresh();
    if (s.type!=="text") main.querySelector("#q-title").focus({preventScroll:true});
  }

  function go(){
    const s = visible()[i];
    if (!isDone(s)) return;
    i = Math.min(i+1, visible().length-1);
    render(); window.scrollTo({top:0,behavior:"smooth"});
  }

  render();
})();
