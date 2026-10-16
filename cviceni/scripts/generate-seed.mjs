// Pocáteční početní banka: 4 číselné varianty každého z 24 typů úloh.
// Změny obsahu provádějte zde a znovu spusťte node scripts/generate-seed.mjs.
import {writeFileSync} from 'node:fs';
const rows=[];
const fmt=n=>Number(n.toFixed(6)).toLocaleString('cs-CZ',{maximumFractionDigits:6,useGrouping:false});
function add(topic,level,question,value,unit,explanation,wrong){
 const answer=n=>`${fmt(n)}${unit?' '+unit:''}`;
 const choices=wrong||[value*2,value/2,value*3];
 if(new Set([value,...choices]).size!==4)throw new Error('Duplicitní možnosti');
 rows.push([topic,level,question,answer(value),...choices.map(answer),explanation]);
}
for(let n=1;n<=4;n++){
 add('si','zakladni',`Kolik metrů je ${n+1} km?`,(n+1)*1000,'m','Předpona kilo znamená tisíc. Kilometry převádíme na metry násobením 1 000.');
 add('si','stredni',`Cyklista jede rychlostí ${36+18*n} km/h. Jaká je jeho rychlost v m/s?`,10+5*n,'m/s','Jeden kilometr má 1 000 m a hodina 3 600 s. Rychlost v km/h dělíme číslem 3,6.');
 add('si','tezke',`Hustota materiálu je ${fmt(1+n/2)} g/cm³. Vyjádři ji v kg/m³.`,1000+500*n,'kg/m³','1 g = 0,001 kg a 1 cm³ = 0,000001 m³. Proto 1 g/cm³ = 1 000 kg/m³.');
 add('vektory','zakladni',`Na těleso působí dvě síly stejného směru o velikostech ${2*n} N a ${3*n} N. Jaká je velikost výslednice?`,5*n,'N','Velikosti sil působících ve stejném směru se sčítají.',[n,6*n,10*n]);
 add('vektory','stredni',`Dvě síly mají velikosti ${3*n} N a ${4*n} N a jsou na sebe kolmé. Jaká je velikost výslednice?`,5*n,'N','Pro kolmé vektory použijeme Pythagorovu větu: F = √(F₁² + F₂²).',[7*n,n,25*n]);
 add('vektory','tezke',`Síla A má složky (${5*n}; ${2*n}) N a síla B složky (−${2*n}; ${2*n}) N. Jaká je velikost jejich výslednice?`,5*n,'N',`Sčítáme složky: výslednice má složky (${3*n}; ${4*n}) N. Její velikost je √(${3*n}² + ${4*n}²) = ${5*n} N.`,[7*n,3*n,4*n]);
 add('kinematika','zakladni',`Chodec ujde rovnoměrným pohybem ${120*n} m za ${60*n} s. Jaká je jeho rychlost?`,2,'m/s','Pro rovnoměrný pohyb platí v = s / t.',[0.5,4,120]);
 add('kinematika','stredni',`Těleso se rozjíždí z klidu se stálým zrychlením 2 m/s² po dobu ${n+2} s. Jakou dráhu urazí?`,(n+2)**2,'m','Při rovnoměrně zrychleném pohybu z klidu platí s = ½ a t².');
 add('kinematika','tezke',`Auto jede rychlostí ${10+2*n} m/s a rovnoměrně brzdí se zpomalením 2 m/s². Jaká je brzdná dráha do zastavení?`,(10+2*n)**2/4,'m','Z rovnice v² = v₀² + 2as při v = 0 získáme s = v₀² / (2|a|).');
 add('dynamika','zakladni',`Jaká výsledná síla udělí tělesu o hmotnosti ${n+1} kg zrychlení 3 m/s²?`,3*(n+1),'N','Druhý Newtonův zákon: F = m · a.');
 add('dynamika','stredni',`Vozík o hmotnosti ${2*n} kg táhne síla ${12*n} N. Proti pohybu působí odpor ${4*n} N. Jaké je zrychlení?`,4,'m/s²','Nejprve určíme výslednou sílu F = F₁ − F₂. Potom a = F / m.',[6,8,2]);
 add('dynamika','tezke',`Bednu o hmotnosti ${10*n} kg táhneme vodorovně silou ${50*n} N. Součinitel smykového tření je 0,2. Urči zrychlení; použij g = 10 m/s².`,3,'m/s²','Na vodorovné podložce Fₙ = mg a třecí síla Fₜ = 0,2mg. Zrychlení a = (F − Fₜ) / m = 3 m/s².',[5,2,7]);
 add('energie','zakladni',`Stálá síla ${10*n} N posune těleso o 3 m ve směru svého působení. Jakou práci vykoná?`,30*n,'J','Je-li síla rovnoběžná s posunutím, práce je W = F · s.');
 add('energie','stredni',`Jakou kinetickou energii má těleso o hmotnosti ${2*n} kg při rychlosti 4 m/s?`,16*n,'J','Kinetická energie Eₖ = ½ m v². Pozor na druhou mocninu rychlosti.');
 add('energie','tezke',`Motor zvedne náklad o hmotnosti ${20*n} kg do výšky 5 m za 10 s. Účinnost je 50 %. Jaký je příkon motoru? Použij g = 10 m/s².`,200*n,'W','Užitečný výkon P = mgh/t. Příkon je P/η, kde η = 0,5.');
 add('gravitace','zakladni',`Jak velká tíhová síla působí na těleso o hmotnosti ${3*n} kg? Použij g = 10 m/s².`,30*n,'N','Tíhová síla F = m · g.');
 add('gravitace','stredni',`Těleso padá volným pádem z klidu ${n+1} s. Jakou rychlost má na konci pádu? Odpor vzduchu zanedbej, g = 10 m/s².`,10*(n+1),'m/s','Volný pád je rovnoměrně zrychlený pohyb. Z klidu platí v = gt.');
 add('gravitace','tezke',`Na povrchu kulové planety o poloměru R je gravitační zrychlení ${16*n} m/s². Jaké je ve výšce R nad povrchem? Rotaci zanedbej.`,4*n,'m/s²','Ve výšce R je vzdálenost od středu 2R. Gravitační zrychlení klesá se čtvercem vzdálenosti, tedy na čtvrtinu.',[8*n,16*n,32*n]);
 add('tuhe_teleso','zakladni',`Síla ${10*n} N působí kolmo na rameno délky 0,5 m. Jaká je velikost momentu síly?`,5*n,'N·m','Moment síly M = F · r, kde r je kolmá vzdálenost osy od přímky působení síly.');
 add('tuhe_teleso','stredni',`Na jednom rameni páky působí síla ${20*n} N ve vzdálenosti 0,3 m od osy. Jakou kolmou silou na opačné straně ve vzdálenosti 0,6 m páku vyvážíme?`,10*n,'N','V rovnováze jsou momenty opačných směrů stejně velké: F₁r₁ = F₂r₂.');
 add('tuhe_teleso','tezke',`Dva hmotné body mají hmotnosti ${n} kg v poloze x = 0 m a ${3*n} kg v poloze x = 4 m. Jaká je souřadnice jejich těžiště?`,3,'m','Souřadnice těžiště xₜ = (m₁x₁ + m₂x₂) / (m₁ + m₂) = 3 m.',[1,2,4]);
 add('tekutiny','zakladni',`Kolmou silou ${100*n} N působíme na plochu 0,5 m². Jaký tlak vzniká?`,200*n,'Pa','Tlak je síla dělená plochou: p = F / S.');
 add('tekutiny','stredni',`Jaký je hydrostatický tlak vody v hloubce ${n+1} m? Počítej ρ = 1 000 kg/m³, g = 10 m/s². Atmosférický tlak nepřičítej.`,10000*(n+1),'Pa','Hydrostatický tlak p = ρgh. Závisí na hustotě, tíhovém zrychlení a hloubce.');
 add('tekutiny','tezke',`Těleso o objemu ${n} dm³ a hustotě 800 kg/m³ držíme celé pod vodou (ρ = 1 000 kg/m³). Jak velkou silou směrem dolů je musíme přidržovat? g = 10 m/s².`,2*n,'N','Objem převedeme na m³. Vztlak je větší než tíha; přidržovací síla F = (ρ vody − ρ tělesa) · V · g.');
}
const quote=v=>`'${v.replaceAll("'","''")}'`;
const values=rows.map((row,i)=>`('${`f1200000-0000-4000-8000-${String(i+1).padStart(12,'0')}`}', ${row.map(quote).join(', ')})`).join(',\n');
writeFileSync('migrations/003_starter_questions.sql',`-- 96 úloh: osm okruhů × tři úrovně × čtyři číselné varianty.\n-- Opakované spuštění nepřepisuje obsah ani výsledky.\n-- Původní demonstrační otázky zůstávají zachované, aplikace je nevybírá.\nbegin;\ninsert into public.questions (id,topic,difficulty,question,correct_answer,wrong_answer_1,wrong_answer_2,wrong_answer_3,explanation) values\n${values}\non conflict (id) do nothing;\ncommit;\n`);
console.log(`Vygenerováno ${rows.length} otázek.`);
