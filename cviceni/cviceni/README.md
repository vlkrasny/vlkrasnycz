# Fyzikální kvíz — Supabase + GitHub Pages

## Co je v balíčku
- `schema.sql` — kompletní databázové schéma pro Supabase (tabulky, RLS politiky, ukázkové otázky)
- `migrations/001_question_difficulty.sql` — zavedení tří povinných úrovní do existující databáze
- `prihlaseni.html` — výchozí aplikace (přihlášení, kvíz, historie výsledků); `index.html` zatím chybí

## Postup nasazení (cca 15-20 minut)

### 1. Vytvoř Supabase projekt
1. Jdi na supabase.com, přihlas se (přes GitHub je nejrychlejší) a klikni na "New Project".
2. Zvol název, heslo k databázi a region (nejblíž Evropě, např. Frankfurt).
3. Po vytvoření projektu (chvíli to trvá) otevři sekci "SQL Editor".

### 2. Nastav databázi
1. V SQL Editoru vlož celý obsah souboru `schema.sql` a spusť (Run).
2. Tím se vytvoří tabulky questions, profiles, attempts, answers + zabezpečení (RLS) + pár ukázkových otázek z mechaniky a elektřiny.

`schema.sql` je určen pro novou databázi, nespouštěj jej znovu nad existujícími tabulkami. Pro existující databázi spusť pouze `migrations/001_question_difficulty.sql`. Migrace zachovává otázky a lze ji opakovat. Pokud najde neznámou nebo chybějící obtížnost, skončí chybou bez změn. Problematické řádky vyhledej následujícím dotazem, ručně jim přiřaď správnou úroveň a migraci zopakuj:

```sql
select id, question, difficulty
from public.questions
where difficulty is null
   or difficulty not in ('zakladni', 'stredni', 'tezke');
```

Každá úloha či příklad v `questions` má právě jednu úroveň: `zakladni` (základní), `stredni` (střední), `tezke` (těžká). Vynechaná hodnota při vložení znamená `zakladni`; explicitní NULL, prázdný řetězec a jiné hodnoty databáze odmítne. Nabídka filtru v rozhraní zůstává návrhem podle PRD.

### 3. Zapni email autentizaci
1. V Supabase dashboardu: Authentication → Providers → Email → ujisti se, že je zapnuté.
2. Authentication → Settings → pro jednoduchost (rodinné použití) můžeš vypnout "Confirm email", aby se uživatelé nemuseli potvrzovat přes email.

### 4. Zkopíruj přístupové údaje
Aktuální připojení je nastavené v `prihlaseni.html` na projekt `zodzxytxavymxgkyngcx` pomocí dodaného veřejného publishable klíče. Historický název konstanty `SUPABASE_ANON_KEY` je zachován. Nastavení připojení samo nevytváří databázové tabulky.

1. Settings → API.
2. Zkopíruj "Project URL" a "anon public" klíč.
3. Při změně projektu v souboru `prihlaseni.html` najdi řádky:
   ```
   const SUPABASE_URL = 'https://TVUJ-PROJEKT.supabase.co';
   const SUPABASE_ANON_KEY = 'TVUJ-ANON-PUBLIC-KLIC';
   ```
   a nahraď je svými hodnotami.

### 5. Nahraj na GitHub Pages
1. Vytvoř nový repozitář na GitHubu (např. `fyzika-kviz`).
2. Nahraj do něj upravený `index.html`.
3. Settings → Pages → Source: zvol branch `main`, root `/`.
4. Po chvíli běží appka na `https://tvoje-jmeno.github.io/fyzika-kviz/`.

### 6. Vytvoř účty pro rodinu (3-5 uživatelů)
Každý uživatel (syn, ty, případně další) si na stránce klikne na "Vytvořit účet" a zadá email + heslo.
Volný tier Supabase zvládne až 50 000 aktivních uživatelů měsíčně, takže pro pár rodinných účtů
je to zcela bez omezení.

## Jak přidat další otázky
V Supabase dashboardu, v Table Editoru, otevři tabulku `questions` a přidávej řádky přímo tam,
nebo spusť další INSERT příkazy v SQL Editoru podle vzoru ze `schema.sql`.

Pole `topic` musí odpovídat hodnotám v `<select>` v `index.html` (mechanika, elektrina, optika) —
pokud chceš nové téma, přidej i novou `<option>` do HTML.

## Bezpečnostní poznámka
Klíč SUPABASE_ANON_KEY je bezpečný zveřejnit v prohlížeči — je to veřejný klíč omezený
Row Level Security politikami (RLS), které jsme nastavili ve schema.sql. Nikdy nepoužívej
"service_role" klíč v klientském kódu.

## Poznámka k neaktivitě
Pokud appku nikdo nepoužije 7 dní, Supabase projekt se automaticky "uspí" (pauza).
Data zůstanou zachována, jen je potřeba projekt v dashboardu manuálně znovu aktivovat
(jedno kliknutí na "Restore project").
