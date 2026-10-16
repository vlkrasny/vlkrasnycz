import {TOPICS, LEVELS, escapeHTML as e} from './core.js';

export const ROLES={student:'Žák',teacher:'Učitel',admin:'Administrátor'};
export const roleBadges=roles=>roles.map(role=>`<span class="badge">${e(ROLES[role]||role)}</span>`).join(' ');
let draft=null;
export function clearManagementDraft(){draft=null;}

export function usersPage({main,db,query,notice,errorText,isCurrent,refreshRoles}){
 document.title='Správa uživatelů · FyzikaLab';
 main.innerHTML=`<section class="hero"><div><span class="eyebrow">ADMINISTRACE · UŽIVATELÉ A PRÁVA</span><h1>Správa uživatelů</h1><p>Vyhledej existující účet podle e-mailu a přidej mu potřebné role. Jeden účet může mít všechna tři oprávnění.</p></div></section><div class="split"><section class="stack"><form id="user-search" class="card"><label for="account-email">E-mail uživatele</label><div class="search-account"><input id="account-email" name="email" type="email" autocomplete="off" placeholder="jmeno@example.cz" required><button type="submit">Vyhledat účet</button></div><p class="small muted" style="margin:12px 0 0">Použij stejný e-mail jako při přihlášení. Uživatel musí už mít účet.</p></form><div id="user-result" aria-live="polite"></div></section><aside class="card"><h2>Co jednotlivé role umožňují</h2><h3>Žák</h3><p class="muted">Procvičování úloh a ukládání vlastních výsledků.</p><h3>Učitel</h3><p class="muted">Vytváření nových úloh ve společné knihovně.</p><h3>Administrátor</h3><p class="muted">Vyhledání existujících účtů podle e-mailu a přidávání rolí.</p><p class="small muted">Role se sčítají. Pro vytváření úloh potřebuje i administrátor roli Učitel.</p></aside></div>`;
 const search=document.querySelector('#user-search'),result=document.querySelector('#user-result');let busy=false;
 function setBusy(value){busy=value;search.querySelectorAll('input,button').forEach(el=>el.disabled=value);result.querySelectorAll('button').forEach(el=>el.disabled=value);}
 async function lookup(email){const rows=await query(db.rpc('admin_find_user',{p_email:email.trim()}));return rows[0]||null;}
 function draw(account,message=''){
  if(!account){result.innerHTML=notice('Účet s tímto e-mailem nebyl nalezen. Uživatel se musí nejprve zaregistrovat.');return;}
  result.innerHTML=`<article class="card"><span class="eyebrow">NALEZENÝ ÚČET</span><h2 style="margin-top:14px">${e(account.display_name)}</h2><p class="account-email">${e(account.email)}</p><div class="role-badges">${roleBadges(account.roles)}</div><h3 style="margin-top:24px">Přidat oprávnění</h3><div class="role-actions">${Object.entries(ROLES).map(([id,name])=>`<button class="${account.roles.includes(id)?'secondary':''}" data-grant="${id}" ${account.roles.includes(id)?'disabled':''}>${account.roles.includes(id)?'✓':'+'} ${name}</button>`).join('')}</div><div id="grant-message">${message}</div></article>`;
  result.querySelectorAll('[data-grant]:not(:disabled)').forEach(button=>button.onclick=async()=>{
   if(busy)return;const role=button.dataset.grant;setBusy(true);
   try{await query(db.rpc('admin_grant_role',{p_email:account.email,p_role:role,p_expected_user_id:account.user_id}));const current=await lookup(account.email);if(!isCurrent())return;await refreshRoles();if(!isCurrent())return;if(current)account=current;draw(current,notice(`Role ${ROLES[role]} byla přidána.`,'success'));}
   catch(error){if(isCurrent())document.querySelector('#grant-message').innerHTML=notice(errorText(error),'error');}
   finally{busy=false;if(isCurrent()){search.querySelectorAll('input,button').forEach(el=>el.disabled=false);result.querySelectorAll('[data-grant]').forEach(el=>el.disabled=account.roles.includes(el.dataset.grant));}}
  });
 }
 search.onsubmit=async event=>{event.preventDefault();if(busy)return;const email=search.email.value;setBusy(true);result.innerHTML=notice('Vyhledávání účtu…');try{const account=await lookup(email);if(isCurrent())draw(account);}catch(error){if(isCurrent())result.innerHTML=notice(errorText(error),'error');}finally{busy=false;if(isCurrent())search.querySelectorAll('input,button').forEach(el=>el.disabled=false);}};
}

export function questionEditor({main,db,user,query,notice,errorText,isCurrent}){
 document.title='Nová úloha · FyzikaLab';
 if(draft?.owner!==user.id)draft={owner:user.id,id:crypto.randomUUID(),values:{topic:'si',difficulty:'zakladni'},locked:false,saved:false,error:''};
 const current=draft;
 const field=(id,label,max=1000)=>`<div><label for="${id}">${label}</label><input id="${id}" name="${id}" maxlength="${max}" value="${e(current.values[id]||'')}" required></div>`;
 main.innerHTML=`<section class="hero"><div><span class="eyebrow">UČITEL · TVORBA OBSAHU</span><h1>Nová úloha do knihovny</h1><p>Jedno zadání, čtyři možnosti a právě jedna správná odpověď. Uloženou úlohu uvidí všichni přihlášení uživatelé.</p></div></section><div class="split"><form id="question-editor" class="card"><fieldset id="question-fields" ${current.locked?'disabled':''}><legend class="sr-only">Zadání nové úlohy</legend><div class="editor-grid"><div><label for="new-topic">Tematický okruh</label><select id="new-topic" name="topic">${TOPICS.map(t=>`<option value="${t[0]}" ${current.values.topic===t[0]?'selected':''}>${e(t[1])}</option>`).join('')}</select></div><div><label for="new-level">Obtížnost</label><select id="new-level" name="difficulty">${Object.entries(LEVELS).map(([id,label])=>`<option value="${id}" ${current.values.difficulty===id?'selected':''}>${label}</option>`).join('')}</select></div></div><label for="question" style="margin-top:20px">Zadání úlohy</label><textarea id="question" name="question" rows="5" maxlength="10000" required>${e(current.values.question||'')}</textarea><div class="editor-grid" style="margin-top:20px">${field('correct_answer','Správná odpověď')}${field('wrong_answer_1','Nesprávná odpověď 1')}${field('wrong_answer_2','Nesprávná odpověď 2')}${field('wrong_answer_3','Nesprávná odpověď 3')}</div><label for="explanation" style="margin-top:20px">Vysvětlení řešení (nepovinné)</label><textarea id="explanation" name="explanation" rows="5" maxlength="20000">${e(current.values.explanation||'')}</textarea></fieldset><div id="editor-message" aria-live="polite">${current.saved?notice('Úloha je uložená v knihovně.','success'):current.error?notice(current.error,'error'):''}</div><div class="quiz-actions">${current.saved?`<a href="#solution/${current.id}" class="button secondary">Zobrazit úlohu</a><button type="button" id="new-question">Vytvořit další úlohu</button>`:`<span class="small muted">Autor: ${e(user.email)}</span><button type="submit">${current.locked?'Zkusit uložit znovu':'Uložit úlohu'}</button>`}</div></form><aside class="stack"><div class="card"><h2>Dobré zadání pomáhá učit</h2><p class="muted">Uveď všechny potřebné údaje a jednotky. Pokud zaokrouhluješ nebo používáš zjednodušenou hodnotu konstanty, napiš ji do zadání.</p><p class="muted">Možnosti odpovědí musí být odlišné. Vysvětlení pomůže žákovi pochopit postup i po chybné odpovědi.</p></div><div class="filter-note" style="margin:0"><span class="eyebrow" style="color:#acedff">SPOLEČNÁ KNIHOVNA</span><p class="small" style="margin:10px 0 0">Po uložení bude úloha dostupná pro výběr do sady podle svého tématu a obtížnosti.</p></div></aside></div>`;
 const form=document.querySelector('#question-editor'),message=document.querySelector('#editor-message');let busy=false;
 form.oninput=()=>{if(!current.locked)current.values=Object.fromEntries(new FormData(form));};
 document.querySelector('#new-question')?.addEventListener('click',()=>{draft=null;questionEditor({main,db,user,query,notice,errorText,isCurrent});});
 form.onsubmit=async event=>{
  event.preventDefault();if(busy||current.saved)return;
  if(!current.locked){const values=Object.fromEntries(new FormData(form));for(const key of Object.keys(values))values[key]=values[key].trim();const answers=['correct_answer','wrong_answer_1','wrong_answer_2','wrong_answer_3'].map(k=>values[k]);if(!values.question||answers.some(a=>!a)){message.innerHTML=notice('Vyplň zadání a všechny čtyři odpovědi.','error');return;}if(new Set(answers.map(a=>a.toLocaleLowerCase('cs'))).size!==4){message.innerHTML=notice('Všechny čtyři možnosti odpovědi musí být odlišné.','error');return;}current.values=values;current.locked=true;}
  busy=true;form.querySelector('fieldset').disabled=true;form.querySelector('[type=submit]').disabled=true;message.innerHTML=notice('Ukládání úlohy…');
  try{await query(db.rpc('create_question',{p_id:current.id,p_question:current.values}));current.saved=true;current.error='';}
  catch(error){current.error=errorText(error)+' Stejné zadání můžeš bezpečně odeslat znovu; druhá kopie nevznikne.';}
  finally{busy=false;if(isCurrent())questionEditor({main,db,user,query,notice,errorText,isCurrent});}
 };
}
