import {TOPICS,LEVELS,escapeHTML as e} from './core.js';
const percent=(correct,total)=>Number(total)>0?Math.round(100*Number(correct)/Number(total)):null;
const value=(correct,total)=>percent(correct,total)===null?'—':`${percent(correct,total)} %`;
function chart(title,rows,unit){
 const max=Math.max(1,...rows.map(r=>r.value??0));
 return `<section class="card"><h2>${title}</h2><div class="teacher-chart">${rows.map(r=>`<div class="teacher-bar"><div class="card-top"><span>${e(r.label)}</span><strong>${r.value===null?'—':e(r.value)+' '+unit}</strong></div><div class="progress" role="img" aria-label="${e(r.label)}: ${r.value===null?'bez výsledků':e(r.value)+' '+unit}"><span style="width:${r.value===null?0:r.value/(unit==='%'?100:max)*100}%"></span></div><p class="small muted">${e(r.detail||'')}</p></div>`).join('')}</div></section>`;
}
export async function teacherPage({main,db,query,isCurrent}){
 document.title='Přehled žáků · FyzikaLab';
 const data=await query(db.rpc('teacher_overview'));
 if(!isCurrent())return;
 const topics=TOPICS.map(([id,label])=>{const row=data.topics.find(r=>r.topic===id);return {label,value:row?percent(row.correct,row.total):null,detail:row?`${row.correct} / ${row.total} správných odpovědí`:'Zatím bez výsledků'};});
 const levels=Object.entries(LEVELS).map(([id,label])=>{const row=data.levels.find(r=>r.difficulty===id);return {label,value:row?percent(row.correct,row.total):null,detail:row?`${row.correct} / ${row.total} správných odpovědí`:'Zatím bez výsledků'};});
 const unknown=data.levels.filter(r=>!LEVELS[r.difficulty]);
 if(unknown.length)levels.push({label:'Neznámá obtížnost',value:percent(unknown.reduce((n,r)=>n+Number(r.correct),0),unknown.reduce((n,r)=>n+Number(r.total),0)),detail:'Starší odpovědi bez údaje o obtížnosti'});
 const success=['0–49 %','50–74 %','75–100 %'].map(label=>({label,value:Number(data.success.find(r=>r.label===label)?.students||0)}));
 main.innerHTML=`<section class="hero"><div><span class="eyebrow">UČITELSKÝ PŘEHLED</span><h1>Přehled žáků</h1><p>Grafy zahrnují všechny žáky s alespoň jednou uloženou sadou, za celou dobu. Úspěšnost počítáme ze všech jejich odpovědí.</p></div></section><div class="stat-grid"><div class="card"><span class="eyebrow">AKTIVNÍ ŽÁCI</span><strong>${e(data.active_students)}</strong></div><div class="card"><span class="eyebrow">DOKONČENÉ SADY</span><strong>${e(data.attempts)}</strong></div><div class="card"><span class="eyebrow">ODPOVĚDI</span><strong>${e(data.total)}</strong></div><div class="card"><span class="eyebrow">ÚSPĚŠNOST</span><strong>${value(data.correct,data.total)}</strong></div></div><div class="teacher-charts">${chart('Úspěšnost podle tématu',topics,'%')}${chart('Úspěšnost podle obtížnosti',levels,'%')}${chart('Rozložení úspěšnosti žáků',success,'žáků')}</div><div class="section-heading"><div><h2>Posledních 20 uživatelů</h2><p class="small muted">Zobrazeno ${data.users.length} z ${e(data.user_count)} účtů. Řazeno podle poslední uložené sady; účty bez výsledků jsou na konci.</p></div></div><div class="history">${data.users.map(u=>`<article class="card history-item"><div><h3>${e(u.display_name)}</h3><span class="small muted">${u.last_active?e(new Date(u.last_active).toLocaleString('cs-CZ')):'Zatím bez uložené sady'}</span></div><div><strong>${e(u.attempts)} sad</strong><p class="small">${e(u.correct)} / ${e(u.total)} správně · ${value(u.correct,u.total)}</p></div></article>`).join('')||'<div class="card empty">Zatím tu nejsou žádní uživatelé.</div>'}</div>`;
}
