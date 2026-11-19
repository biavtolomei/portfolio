const buttons = document.querySelectorAll('[data-lang]');
const translatable = document.querySelectorAll('[data-pt][data-en]');
function setLang(lang){
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  translatable.forEach(el => { el.textContent = el.dataset[lang]; });
  buttons.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  localStorage.setItem('portfolio-lang', lang);
}
buttons.forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
setLang(localStorage.getItem('portfolio-lang') || 'pt');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduced){ document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible')); }
else{
  const io = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } }), {threshold:.08});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
}

// Interactive concept demos
let currentLang = localStorage.getItem('portfolio-lang') || 'pt';
const originalSetLang = setLang;
setLang = function(lang){
  currentLang = lang;
  originalSetLang(lang);
  renderCourse(courseStep);
  renderMicrovideoFrame();
  renderScenario();
};

const demoDialogs = {
  course: document.getElementById('demo-course'),
  'ai-video': document.getElementById('demo-ai-video'),
  scenario: document.getElementById('demo-scenario')
};
document.querySelectorAll('.demo-open').forEach(btn => btn.addEventListener('click', () => {
  const d = demoDialogs[btn.dataset.demo];
  if(d && typeof d.showModal === 'function') d.showModal();
}));
document.querySelectorAll('.dialog-close').forEach(btn => btn.addEventListener('click', () => btn.closest('dialog').close()));
document.querySelectorAll('.demo-dialog').forEach(d => d.addEventListener('click', e => { if(e.target === d) d.close(); }));

// Demo 1: microcourse
let courseStep = 0;
const courseContent = {
  pt:[
    {title:'Observe antes de agir', text:'Antes da operação, procure sinais que exigem pausa: identificação legível, condição aparente dos acessórios, organização da área e comunicação da equipe.', question:'Qual sinal exige interrupção imediata antes do uso?', options:[['A identificação da cinta está ilegível.',true],['A equipe está usando capacete.',false],['O trajeto está livre.',false]], feedback:'Sem identificação legível, não há base segura para confirmar capacidade e condição de uso. A decisão adequada é retirar o acessório de operação e seguir o procedimento de inspeção.'},
    {title:'Decida com base no risco', text:'Uma decisão segura não é apenas “continuar ou parar”. Ela conecta evidência observada, risco e procedimento aplicável.', question:'Diante de uma condição não verificada, qual princípio orienta a decisão?', options:[['Compensar o risco reduzindo a carga.',false],['Prosseguir se a equipe tiver experiência.',false],['Interromper até que a condição seja verificada.',true]], feedback:'Quando uma condição crítica não pode ser confirmada, a ação preventiva é interromper, verificar e só então retomar a operação.'},
    {title:'Comunique para coordenar a ação', text:'A comunicação transforma uma observação individual em uma resposta coordenada da equipe. Ela precisa ser objetiva, rastreável e ligada à ação necessária.', question:'Qual mensagem é mais adequada?', options:[['“Acho que pode dar problema.”',false],['“Etiqueta ilegível. Acessório retirado de uso para inspeção.”',true],['“Vamos com cuidado e depois verificamos.”',false]], feedback:'A mensagem identifica o problema, informa a decisão e orienta o próximo passo. Isso reduz ambiguidade e favorece a coordenação.'}
  ],
  en:[
    {title:'Observe before acting', text:'Before operation, look for signs that require a pause: readable identification, visible accessory condition, area organization and team communication.', question:'Which sign requires immediate interruption before use?', options:[['The sling identification label is unreadable.',true],['The team is wearing helmets.',false],['The route is clear.',false]], feedback:'Without readable identification, there is no safe basis to confirm capacity and use conditions. The correct action is to remove the accessory from service and follow inspection procedures.'},
    {title:'Decide based on risk', text:'A safe decision is not merely “continue or stop”. It connects observed evidence, risk and the applicable procedure.', question:'When a condition cannot be verified, what principle should guide the decision?', options:[['Reduce the load and continue.',false],['Continue if the team is experienced.',false],['Stop until the condition is verified.',true]], feedback:'When a critical condition cannot be confirmed, the preventive action is to stop, verify and only then resume operation.'},
    {title:'Communicate to coordinate action', text:'Communication turns an individual observation into a coordinated team response. It should be objective, traceable and connected to the required action.', question:'Which message is more appropriate?', options:[['“I think this may be a problem.”',false],['“Unreadable label. Accessory removed from service for inspection.”',true],['“Let’s be careful and check later.”',false]], feedback:'The message identifies the issue, states the decision and points to the next step. This reduces ambiguity and supports coordination.'}
  ]
};
function renderCourse(step=courseStep){
  const panel=document.getElementById('course-panel'); if(!panel) return;
  courseStep=step;
  document.querySelectorAll('[data-course-step]').forEach((b,i)=>b.classList.toggle('active',i===step));
  const c=courseContent[currentLang][step];
  panel.innerHTML=`<h4>${c.title}</h4><p>${c.text}</p><p><strong>${c.question}</strong></p><div class="course-check">${c.options.map((o,i)=>`<button type="button" data-course-answer="${i}">${String.fromCharCode(65+i)}. ${o[0]}</button>`).join('')}</div><div class="course-feedback" id="course-feedback" hidden></div>`;
  panel.querySelectorAll('[data-course-answer]').forEach((b,i)=>b.addEventListener('click',()=>{
    const f=document.getElementById('course-feedback');
    f.hidden=false; f.textContent=(c.options[i][1] ? (currentLang==='pt'?'Boa decisão. ':'Good decision. ') : (currentLang==='pt'?'Revise a evidência. ':'Review the evidence. '))+c.feedback;
  }));
}
document.querySelectorAll('[data-course-step]').forEach(b=>b.addEventListener('click',()=>renderCourse(Number(b.dataset.courseStep))));
renderCourse(0);

// Demo 2: text-based microvideo
const microFrames={
  pt:['Posso compartilhar estas informações?','Consigo conferir a resposta?','Quem pode ser excluído ou prejudicado?','Pause.','Verifique.','Decida. A IA amplia respostas. O julgamento continua humano.'],
  en:['Can I share this information?','Can I verify the answer?','Who could be excluded or harmed?','Pause.','Verify.','Decide. AI expands answers. Human judgment remains essential.']
};
let microIndex=0,microTimer=null;
function renderMicrovideoFrame(){
  const t=document.getElementById('microvideo-text'); if(!t) return;
  const arr=microFrames[currentLang]; t.textContent=arr[microIndex];
  document.getElementById('frame-count').textContent=String(microIndex+1).padStart(2,'0')+' / '+String(arr.length).padStart(2,'0');
  document.getElementById('microvideo-bar').style.width=((microIndex+1)/arr.length*100)+'%';
}
function setPlayLabel(playing){ const b=document.getElementById('microvideo-play'); if(b) b.textContent=playing?(currentLang==='pt'?'❚❚ Pausar':'❚❚ Pause'):(currentLang==='pt'?'▶ Reproduzir':'▶ Play'); }
function stopMicro(){ if(microTimer){clearInterval(microTimer);microTimer=null;} setPlayLabel(false); }
document.getElementById('microvideo-play')?.addEventListener('click',()=>{
  if(microTimer){stopMicro();return;}
  setPlayLabel(true);
  microTimer=setInterval(()=>{ microIndex++; if(microIndex>=microFrames[currentLang].length){microIndex=microFrames[currentLang].length-1; stopMicro();} renderMicrovideoFrame(); },1800);
});
document.getElementById('microvideo-reset')?.addEventListener('click',()=>{stopMicro();microIndex=0;renderMicrovideoFrame();});
renderMicrovideoFrame();

// Demo 3: branching scenario
const scenarios={
  pt:[
    {q:'Antes da operação, você encontra uma cinta cuja etiqueta de identificação está ilegível. A equipe está atrasada. O que fazer?', opts:[['Usar pela cor aparente.',false],['Retirar de uso e seguir o procedimento de inspeção.',true],['Reduzir o peso e continuar.',false]], fb:'A identificação ilegível impede verificar com segurança as condições do acessório. O atraso não altera o critério técnico.'},
    {q:'Durante a preparação, a área de movimentação recebe circulação inesperada de pessoas. Qual é a melhor decisão?', opts:[['Prosseguir e pedir atenção.',false],['Interromper e restabelecer o isolamento/controle da área.',true],['Acelerar a operação para liberar a área.',false]], fb:'Uma mudança no ambiente pode alterar o risco. A resposta segura é restabelecer as condições previstas antes de prosseguir.'},
    {q:'A equipe percebe uma dúvida sobre o sinal combinado durante a movimentação. Como agir?', opts:[['Continuar lentamente.',false],['Parar a movimentação e restabelecer comunicação inequívoca.',true],['Escolher o sinal mais provável.',false]], fb:'Quando a comunicação não é inequívoca, a operação deve ser interrompida até que todos compartilhem o mesmo entendimento.'}
  ],
  en:[
    {q:'Before operation, you find a sling whose identification label is unreadable. The team is behind schedule. What should you do?', opts:[['Use it based on apparent color.',false],['Remove it from service and follow inspection procedures.',true],['Reduce the load and continue.',false]], fb:'Unreadable identification prevents safe verification of the accessory conditions. Schedule pressure does not change the technical criterion.'},
    {q:'During preparation, people unexpectedly enter the lifting area. What is the best decision?', opts:[['Continue and ask everyone to be careful.',false],['Stop and restore isolation/control of the area.',true],['Speed up the operation to clear the area.',false]], fb:'A change in the environment may change the risk. The safe response is to restore the planned conditions before proceeding.'},
    {q:'The team notices uncertainty about the agreed signal during movement. What should happen?', opts:[['Continue slowly.',false],['Stop the movement and restore unambiguous communication.',true],['Use the most likely signal.',false]], fb:'When communication is not unambiguous, the operation should stop until everyone shares the same understanding.'}
  ]
};
let scenarioIndex=0,scenarioScore=0,scenarioAnswered=false;
function renderScenario(){
  const stage=document.getElementById('scenario-stage'); if(!stage) return;
  const arr=scenarios[currentLang];
  const prog=document.getElementById('scenario-progress-text');
  const bar=document.getElementById('scenario-progress-bar');
  if(scenarioIndex>=arr.length){
    prog.textContent=currentLang==='pt'?'CONCLUÍDO':'COMPLETE'; bar.style.width='100%';
    stage.innerHTML=`<div class="scenario-result"><strong>${scenarioScore}/${arr.length}</strong><h4>${currentLang==='pt'?'Cenário concluído':'Scenario complete'}</h4><p>${currentLang==='pt'?'O objetivo é tornar observável o raciocínio: identificar evidências, interromper quando necessário e comunicar a decisão.':'The goal is to make reasoning observable: identify evidence, stop when necessary and communicate the decision.'}</p><button class="scenario-next" type="button" id="scenario-restart">${currentLang==='pt'?'Refazer cenário':'Restart scenario'}</button></div>`;
    document.getElementById('scenario-restart').addEventListener('click',()=>{scenarioIndex=0;scenarioScore=0;scenarioAnswered=false;renderScenario();});
    return;
  }
  prog.textContent=(currentLang==='pt'?'SITUAÇÃO ':'SITUATION ')+(scenarioIndex+1)+' / '+arr.length; bar.style.width=(scenarioIndex/arr.length*100)+'%';
  const s=arr[scenarioIndex];
  stage.innerHTML=`<h4>${s.q}</h4><div class="scenario-options">${s.opts.map((o,i)=>`<button type="button" data-scenario-answer="${i}">${String.fromCharCode(65+i)}. ${o[0]}</button>`).join('')}</div><div id="scenario-feedback" class="scenario-feedback" hidden></div>`;
  scenarioAnswered=false;
  stage.querySelectorAll('[data-scenario-answer]').forEach((b,i)=>b.addEventListener('click',()=>{
    if(scenarioAnswered) return; scenarioAnswered=true;
    if(s.opts[i][1]) scenarioScore++;
    const f=document.getElementById('scenario-feedback'); f.hidden=false;
    f.innerHTML=`<strong>${s.opts[i][1]?(currentLang==='pt'?'Decisão adequada.':'Appropriate decision.'):(currentLang==='pt'?'Há uma opção mais segura.':'There is a safer option.')}</strong><p>${s.fb}</p><button type="button" class="scenario-next" id="scenario-next">${scenarioIndex===arr.length-1?(currentLang==='pt'?'Ver resultado':'See result'):(currentLang==='pt'?'Próxima situação':'Next situation')}</button>`;
    document.getElementById('scenario-next').addEventListener('click',()=>{scenarioIndex++;scenarioAnswered=false;renderScenario();});
  }));
}
renderScenario();
