import {test,expect} from '@playwright/test';
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
const uid='10000000-0000-4000-8000-000000000001';
const user={id:uid,email:'student@example.test',aud:'authenticated',role:'authenticated',user_metadata:{display_name:'Alex'},app_metadata:{provider:'email'},created_at:'2026-10-16T10:00:00Z'};
let questions;
test.beforeAll(async()=>{const db=new PGlite();await db.exec('create schema auth;create table auth.users(id uuid primary key);create role authenticated;create function auth.uid() returns uuid language sql as $$ select null::uuid $$;');await db.exec(readFileSync('schema.sql','utf8'));await db.exec(readFileSync('migrations/003_starter_questions.sql','utf8'));questions=(await db.query("select * from questions where topic not in ('mechanika','elektrina') order by id")).rows;await db.close();});
async function mock(page,{loggedIn=true}={}){
 const attempts=[],answers=[];let failSave=true;
 const token='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:uid,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.test';
 const session={access_token:token,refresh_token:'test-refresh',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user};
 if(loggedIn)await page.addInitScript(session=>localStorage.setItem('sb-zodzxytxavymxgkyngcx-auth-token',JSON.stringify(session)),session);
 await page.route('https://zodzxytxavymxgkyngcx.supabase.co/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname;const json=data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  if(path.includes('/auth/v1/token'))return json(session);
  if(path.includes('/auth/v1/signup'))return json({user,session:null});
  if(path.includes('/auth/v1/user'))return json(user);
  if(path.includes('/auth/v1/logout'))return json({});
  if(path.endsWith('/profiles')){const row={id:uid,display_name:'Alex'};return json(url.searchParams.has('id')?row:[row]);}
  if(path.endsWith('/questions')){const id=url.searchParams.get('id')?.replace('eq.','');return json(id?questions.find(q=>q.id===id):questions);}
  if(path.endsWith('/rpc/save_attempt')){
   if(failSave){failSave=false;return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Dočasný výpadek spojení'})});}
   const body=req.postDataJSON();if(!attempts.find(a=>a.id===body.p_id)){attempts.push({id:body.p_id,user_id:uid,topic:body.p_topic,score:body.p_answers.filter(a=>questions.find(q=>q.id===a.question_id).correct_answer===a.chosen_answer).length,max_score:body.p_answers.length,completed_at:new Date().toISOString()});answers.push(...body.p_answers.map(a=>({...a,is_correct:questions.find(q=>q.id===a.question_id).correct_answer===a.chosen_answer,snapshot:questions.find(q=>q.id===a.question_id)})));}return json(body.p_id);
  }
  if(path.endsWith('/attempts')){const id=url.searchParams.get('id')?.replace('eq.','');return json(id?attempts.find(a=>a.id===id):attempts);}
  if(path.endsWith('/answers'))return json(answers);
  return json([]);
 });
 return {attempts,answers};
}
test('přihlášení, sada, zpětná vazba, výpadek uložení, historie a mobil',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));const data=await mock(page,{loggedIn:false});await page.goto('http://127.0.0.1:4173');
 await expect(page.getByRole('heading',{name:'Vítej zpět',exact:true})).toBeVisible();await page.screenshot({path:'test-results/login-desktop.png',fullPage:true});
 await page.getByLabel('E-mail',{exact:true}).fill('student@example.test');await page.getByLabel('Heslo',{exact:true}).fill('test-password');await page.getByRole('button',{name:'Přihlásit se',exact:false}).click();
 await page.getByRole('link',{name:'Knihovna úloh',exact:true}).click();await expect(page.getByRole('heading',{name:'Knihovna fyzikálních úloh'})).toBeVisible();await page.screenshot({path:'test-results/library-desktop.png',fullPage:true});
 await page.getByLabel('Tematický okruh').selectOption('si');await page.getByLabel('Obtížnost',{exact:true}).selectOption('zakladni');await expect(page.getByLabel('Počet otázek')).toHaveValue('4');
 await page.getByRole('button',{name:'Spustit procvičování'}).click();await expect(page.getByRole('button',{name:'Ověřit odpověď'})).toBeDisabled();
 await page.getByRole('link',{name:'Knihovna úloh',exact:true}).first().click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Zůstat'}).click();
 for(let i=0;i<4;i++){
  const prompt=await page.locator('.question-text').textContent();const q=questions.find(q=>q.question===prompt);
  await page.getByRole('radio',{name:new RegExp('^[ABCD] '+q.correct_answer.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).check();await page.getByRole('button',{name:'Ověřit odpověď'}).click();await expect(page.getByText('✓ Správně!',{exact:true})).toBeVisible();
  if(i===0)await page.screenshot({path:'test-results/question-desktop.png',fullPage:true});
  await page.getByRole('button',{name:i===3?'Zobrazit výsledek':'Další otázka'}).click();
 }
 await expect(page.getByRole('button',{name:'Zkusit uložit znovu'})).toBeVisible();await expect(page.getByText('Výsledek i odpovědi jsou uložené.')).toHaveCount(0);await page.getByRole('button',{name:'Zkusit uložit znovu'}).click();await expect(page.getByText('Výsledek i odpovědi jsou uložené.')).toBeVisible();expect(data.attempts).toHaveLength(1);expect(data.answers).toHaveLength(4);
 await page.getByRole('link',{name:'Moje výsledky'}).click();await expect(page.getByText('4 / 4',{exact:true})).toBeVisible();await page.screenshot({path:'test-results/dashboard-desktop.png',fullPage:true});
 await page.getByRole('link',{name:'Prohlédnout odpovědi'}).click();await expect(page.getByText('✓ Správně',{exact:true})).toHaveCount(4);
 await page.setViewportSize({width:390,height:844});await page.getByRole('link',{name:'Knihovna úloh',exact:true}).click();await expect(page.getByRole('heading',{name:'Knihovna fyzikálních úloh'})).toBeVisible();await page.screenshot({path:'test-results/library-mobile.png',fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(errors).toEqual([]);
});
test('prázdné vyhledávání a odhlášení',async({page})=>{await mock(page);await page.goto('http://127.0.0.1:4173/#library');await page.getByRole('searchbox').fill('nenalezitelná úloha');await expect(page.getByText('Zvoleným filtrům zatím neodpovídá žádná úloha.',{exact:false})).toBeVisible();await page.getByRole('button',{name:'Odhlásit se'}).click();await expect(page.getByRole('heading',{name:'Vítej zpět',exact:true})).toBeVisible();});
test('mobil: chybná odpověď, zamčení výběru a vysvětlení',async({page})=>{
 await mock(page);await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:4173/#practice');await page.getByLabel('Tematický okruh').selectOption('si');await page.getByRole('button',{name:'Spustit procvičování'}).click();const prompt=await page.locator('.question-text').textContent(),q=questions.find(q=>q.question===prompt);
 await page.getByRole('radio',{name:new RegExp('^[ABCD] '+q.wrong_answer_1.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).check();await page.getByRole('button',{name:'Ověřit odpověď'}).click();await expect(page.getByText('✕ Tentokrát to nevyšlo.',{exact:true})).toBeVisible();await expect(page.getByText('✓ Správná odpověď',{exact:true})).toBeVisible();for(const input of await page.getByRole('radio').all())await expect(input).toBeDisabled();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'test-results/question-mobile.png',fullPage:true});
});
test('registrace vyžadující potvrzení e-mailu',async({page})=>{await mock(page,{loggedIn:false});await page.goto('http://127.0.0.1:4173');await page.getByRole('button',{name:'Vytvořit účet',exact:true}).click();await page.getByLabel('Tvoje jméno').fill('Alex');await page.getByLabel('E-mail',{exact:true}).fill('new@example.test');await page.getByLabel('Heslo',{exact:true}).fill('test-password');await page.locator('#auth-form').getByRole('button',{name:'Vytvořit účet'}).click();await expect(page.getByText('Zkontroluj e-mail.',{exact:false})).toBeVisible();await expect(page.getByRole('navigation')).toHaveCount(0);});
