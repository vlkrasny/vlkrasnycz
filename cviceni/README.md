# FyzikaLab — rodinné procvičování fyziky

Funkční statická aplikace je v `index.html`, styly a logika v `assets/`. Přihlášení, otázky, profil a výsledky používají Supabase projekt `zodzxytxavymxgkyngcx`. Soubor `assets/config.js` obsahuje veřejnou URL a publishable klíč, nikoli administrátorský klíč.

## Dokončení databáze

Pokud už proběhly `schema.sql` a `migrations/001_question_difficulty.sql`, spusť v Supabase SQL Editoru postupně:

1. `migrations/002_app_support.sql` — atomické ukládání sad a odpovědí, snímky zadání, oprava vlastnictví odpovědí a rodičovská oprávnění.
2. `migrations/003_starter_questions.sql` — 96 početních úloh, osm okruhů × tři obtížnosti × čtyři číselné varianty.

Pro novou databázi nejprve spusť `schema.sql`, poté migrace 001, 002 a 003. Samotný `schema.sql` se nad existujícími tabulkami znovu nespouští. Migrace 002 a 003 lze opakovat; 003 nepřepisuje již vložené otázky. Původní demonstrační obsah z mechaniky a elektřiny zůstává uložený, ale nová aplikace ho nenabízí.

Veřejný klíč nemůže provádět změny schématu. Při chybějící migraci 002 se uložení označí jako neúspěšné a lze ho na stejné stránce zopakovat po doplnění migrace. Stránku do té doby neopouštěj. Bez banky 003 se mohou zobrazit prázdné okruhy.

## Spuštění a nasazení

Pro místní náhled je potřeba Node.js:

```sh
npm start
```

Otevři `http://127.0.0.1:4173`. Aplikaci otevírej přes HTTP, ne přímo jako soubor: používá JavaScript moduly.

Pro GitHub Pages publikuj `index.html` a celý adresář `assets/` ze stejného adresáře. V nastavení Pages vyber příslušnou větev a kořen. V Supabase Auth nastav skutečnou URL publikované aplikace jako Site URL a povolenou návratovou URL pro potvrzení e-mailu. Zda je nutné potvrzení e-mailu, určuje nastavení projektu. Aplikace po registraci bez relace zobrazí pokyn ke kontrole schránky.

Node.js ani testovací balíčky nejsou potřeba na hostingu. Původní soubory `knihovna_uloh.html`, `uloha.html`, `priklad.html`, `dashboard_a_v_sledky.html` a PNG jsou zachované vizuální podklady. Původní prototyp v `cviceni/` je archivní; nová aplikace začíná v kořenovém `index.html`.

## Co stránky umí

- Registrace, přihlášení, obnovení relace, odhlášení a úprava zobrazovaného jména.
- Knihovna s hledáním, osmi okruhy a obtížnostmi `zakladni`, `stredni`, `tezke`.
- Náhodné sady 4–6 otázek bez opakování, promíchané odpovědi a okamžité vysvětlení. Nedostupné délky jsou zakázané. Startovací banka má čtyři otázky pro každou kombinaci tématu a úrovně; sady pěti a šesti otázek lze spouštět při volbě všech úrovní.
- Vzorové řešení jednotlivé úlohy, výsledek sady, historie, detail odpovědí a statistiky z uložených dat.
- Rodičovský výběr člena rodiny se zobrazí jen tehdy, pokud databáze zpřístupní další profily.
- Mobilní rozložení a ovládání klávesnicí. Rozpracovaná sada se neukládá; opuštění neuloženého výsledku vyžaduje potvrzení.

Pokus a odpovědi se ukládají jedním voláním `save_attempt`. Databáze ověřuje otázky, téma a možnosti, počítá skóre a ukládá snímek zadání. Opakování používá stejné UUID a nevytváří další pokus. V rámci relace se výsledek při chybě uchovává v paměti stránky, nikoli po zavření prohlížeče. Správné odpovědi jsou dostupné přihlášenému klientovi; jde o rodinné procvičování.

## Rodičovský přístup

Nejprve vytvoř běžné účty. Jejich UUID najdeš v Supabase Authentication → Users. Správce v SQL Editoru přidělí rodiči konkrétní dítě:

```sql
insert into public.parent_access (parent_id, child_id)
values ('UUID-RODICE', 'UUID-DITETE')
on conflict do nothing;
```

Rodič potom obnoví přehled a vybere člena rodiny nad historií výsledků. Horní statistiky stále zobrazují vlastní výsledky rodiče. Přístup se uděluje jednotlivě pro každého člena; běžný uživatel do `parent_access` nesmí zapisovat. Odebrání přístupu provede správce smazáním příslušného řádku.

## Správa obsahu

Tabulka `questions` má identifikátory témat:

| `topic` | Téma |
| --- | --- |
| `si` | Soustava SI a převody jednotek |
| `vektory` | Skalární a vektorové veličiny |
| `kinematika` | Kinematika |
| `dynamika` | Dynamika |
| `energie` | Mechanická práce a energie |
| `gravitace` | Gravitační pole |
| `tuhe_teleso` | Mechanika tuhého tělesa |
| `tekutiny` | Mechanika tekutin |

Každá otázka má právě čtyři odlišné možnosti. Pro šest otázek v jedné konkrétní úrovni je potřeba banku dané kombinace rozšířit alespoň na šest. Startovací banka obsahuje početní varianty 24 typů úloh; nepokrývá vyčerpávajícím způsobem celou látku. Zdroj generátoru je `scripts/generate-seed.mjs`; ruční obsah spravuj přes Supabase Table Editor nebo další migraci. Změna generátoru sama neaktualizuje už vložené řádky.

## Ověření

```sh
npm ci
npm test
npx playwright install chromium
npx playwright test
```

Před prohlížečovými testy spusť `npm start` v jiném terminálu. Testy SQL běží v PGlite (PostgreSQL), vytvářejí izolované účty a kontrolují RLS, rodičovská oprávnění, transakce a opakování zápisu. Prohlížečové testy používají simulované API; nevytvářejí účty ve skutečném Supabase projektu. Skutečný průchod s účtem je potřeba ověřit po spuštění migrací a přihlášení. Screenshoty testů se ukládají do ignorované složky `test-results/`.
