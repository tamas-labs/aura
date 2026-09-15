# Aura

> 🇬🇧 **[Full English reference →](./README.en.md)** · **[Short overview →](./README.md)**
> (installation, quick start, config basics). Ez a fájl a **teljes** magyar nyelvű
> referencia-dokumentáció.

Vue 3 táblázat komponens plugin Bootstrap 5 alapokon, TypeScript és TSX támogatással.

## Funkciók

- 🚀 **Vue 3** + Composition API + TSX
- 📦 **TypeScript** típusbiztonság
- 🎨 **Bootstrap 5** CSS framework
- 🔄 **Pinia** state management
- ✅ **Zod** validáció és runtime típusellenőrzés
- 🧪 **Vitest** tesztelési framework
- 🔍 **ESLint** + SonarJS kódminőség
- ⚡ **Vite** gyors build és HMR
- 🛡️ **ECS-kompatibilis hibakezelés** - Elastic Common Schema alapú error tracking

## Telepítés

```bash
npm install @tamas-labs/aura
```

> **ESM-only csomag.** Az Aura kizárólag ES modulként publikál (`"type": "module"`,
> nincs CommonJS/`require` build), és Node **≥ 20**-at igényel. Modern bundlerrel
> (Vite, webpack 5, Rollup) vagy natív ESM környezetben használható. A csomag a
> peer dependency-ket nem tartalmazza — ezeket a host alkalmazás biztosítja (lásd lentebb).

### Peer Dependencies

Az Aura az alábbi peer dependencies-eket igényli, amelyeket a host alkalmazásban külön telepíteni kell:

```bash
npm install vue@^3.4.0 pinia@^3.0.3 bootstrap@^5.3.3 axios@^1.7.0 isomorphic-dompurify@^2.31.0 libphonenumber-js@^1.12.37
```

> **Az `isomorphic-dompurify` 3.x is támogatott** — a peer-tartomány `^2.31.0 || ^3.0.0`. A fenti
> parancs a 2.x alsó határt telepíti, mert az minden olyan Node-on fut, amit maga a csomag is
> támogat (**≥ 20**); a 3.x minorról minorra emeli a küszöböt (a 3.0 Node ≥ 20.19-et, a 3.22 már
> ≥ 22.22.2-t kér), ezért csak akkor válaszd, ha a hoszt Node-verziója megfelel. A sanitize API a
> két főverzió között azonos — az Aura teszkészlete mindkettőn lefut. Egy különbség, ami
> tesztíráskor számít: Node alatt a 3.x a DOMPurify-példány helyett egy `Proxy`-t exportál, ezért
> a `DOMPurify.sanitize` nem spy-olható és nem monkey-patchelhető (a hívása normálisan működik).

**Miért peer dependencies?**

- **Bundle size optimalizálás**: A peer dependencies nincsenek benne az Aura bundle-ben, így csökkentve a méretet
- **Verziószabadság**: A host app választhatja meg a legmegfelelőbb verziót
- **Duplikáció elkerülése**: Nem kell többször telepíteni ugyanazt a library-t

### Bundle méret

Az Aura egy fő ES modult publikál, plusz néhány validátor chunkot, amelyek lustán, az első API
válaszkor töltődnek be. **v1.0.0**-n mérve (produkciós build, peer dependency-k nélkül):

| Chunk                                                    | Minifikált | Gzip-elt    |
| -------------------------------------------------------- | ---------- | ----------- |
| `dist/index-*.js` (fő)                                    | 189,7 kB   | **53,1 kB** |
| Lusta response-séma chunkok (header / body / footer)      | 31,5 kB    | 8,8 kB      |
| **Összes JS**                                             | 221,5 kB   | **62,1 kB** |
| `dist/style.css`                                          | 1,3 kB     | 0,5 kB      |

Mindkét összesítésre budget-kapu van a CI-ban (`size-limit`: 70 kB a fő chunkra, 80 kB az összes
JS-re), így egy méretnövekedés a buildet bukja el, nem csendben kerül fel az npm-re.

**A zod be van bundle-özve — nagyjából ennek a harmadát teszi ki.** A peer dependency-kkel
ellentétben a `zod` sima `dependency`, és a fő chunkba fordul bele, mert a válaszvalidáció
alapfunkció, nem opcionális kiegészítő. A költsége — ugyanazokból a forrásokból, a `zod`-ot
external-ként jelölve újramérve:

| Build                | Fő chunk (gzip)    | Összes JS (gzip)   |
| -------------------- | ------------------ | ------------------ |
| Ahogy publikálva van | 53,1 kB            | 62,1 kB            |
| Zod nélkül           | 34,9 kB            | 44,0 kB            |
| **A zod részaránya** | **18,2 kB (34 %)** | **18,1 kB (29 %)** |

Amivel érdemes számolni: mivel az Aura zod-példánya a publikált bundle *belsejében* van, egy olyan
host alkalmazás, amely maga is zod-ot használ, kétszer szállítja — az előre bundle-özött példányt a
bundlerek nem tudják deduplikálni. Ez tudatos 0.x döntés (nincs mit telepíteni, nincs verzióütközés
a host zod-jával, és a 62,1 kB bőven a budgeten belül van).

**Hogy mit hozna a két alternatíva — mérve, nem becsülve.** A sémák átírása a függvény-alapú
`zod/mini` API-ra egy olyan próbán lett megmérve, amely ugyanazt a funkciófelületet viseli, mint a
valódi sémafájlok (objektum, record, union, enum, tuple, string- és szám-ellenőrzések, `catchall`,
`merge`, `superRefine`, `transform`, `default`, `catch`), és amelyről ellenőrizve lett, hogy
azonos `safeParse` eredményt ad — hibakóddal, path-tal és üzenettel együtt: **18,7 kB → 8,0 kB
gzip-elve**. Ezzel a megtakarítással szemben a függvény-alapú stílus magát a lefordított
séma-kódot nagyjából 10 %-kal növeli — és ez a rész a 80 sémafájlon skálázódik, míg a
runtime-megtakarítás egyszeri —, tehát egy teljes átállás a fő chunkot inkább **44 kB**
környékére vinné, nem 35-re. A `zod` peer dependency-vé minősítése a teljes 18,2 kB-ot elviszi, cserébe viszont a
telepítést és a verziótartományt minden fogyasztóra áttolja.

Egyik sem éri meg, amíg a fő chunk 24 %-kal a budgetje alatt van, ezért a 0.x marad a
bundle-özött `zod`-nál. Mindkettő nyitva marad egy jövőbeli főverzióra — és egyik sem *típus*-törés: a
`dist/index.d.ts` egyáltalán nem hivatkozik zod-ra, tehát a használt séma-API implementációs
részlet. Amit a 0.x forrás viszont kerül, az a zod v3-as kompatibilitási rétege (`ZodIssueCode`,
`ZodTypeAny`, `ZodSchema` és a `zod/v4/classic/compat` többi neve): ezek deprecated aliasok,
`zod/mini`-ben nincs párjuk, és egy teszt bukik, ha valamelyik visszakerül.

### Bootstrap CSS importálás

Az Aura Bootstrap 5 alapú, ezért szükséges a Bootstrap CSS importálása:

```typescript
// main.ts vagy App.vue
import 'bootstrap/dist/css/bootstrap.min.css';
```

Vagy ha custom Bootstrap build-et használsz:

```scss
// styles/main.scss
@import 'bootstrap/scss/bootstrap';
```

## Fejlesztői függőségek telepítése

```bash
npm install
```

## Használat

### Plugin regisztráció

```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Aura from '@tamas-labs/aura';
import auraConfig from './aura.config';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia()); // kötelező - lásd alább
app.use(Aura, auraConfig);
app.mount('#app');
```

> **A Pinia nem opcionális.** Az Aura minden tábla állapotát `storeId`-kulcsolt Pinia store-okban
> tartja, tehát a komponens már a setup pillanatában felold egyet. Aktív Pinia nélkül a tábla
> **semmit nem renderel**, a Vue pedig a Pinia saját hibáját jelenti
> (`[🍍]: "getActivePinia()" was called but there was no active Pinia`) - egy olyan üzenetet,
> amely az Aurát meg sem említi. Ha a hoszt alkalmazás a saját állapotához amúgy is hív
> `app.use(createPinia())`-t, az Aura azt a példányt használja; a két `app.use` sorrendje
> nem számít.

### Konfiguráció

Hozz létre egy `aura.config.ts` fájlt a projekt gyökérben:

```typescript
import type { AuraConfig } from '@tamas-labs/aura';

export const auraConfig: AuraConfig = {
    siteName: 'Aura Table',
    icons: {
        sortable: {
            up: ['fas', 'fa-caret-up'],
            down: ['fas', 'fa-caret-down'],
            both: ['fas', 'fa-sort'],
        },
        search: ['fas', 'fa-magnifying-glass'],
        clear: ['fas', 'fa-xmark'],
        // ... további ikonok
    },
    rowsNumber: 10,
    externalPaginator: false,
};

export default auraConfig;
```

## Konfigurációs Hierarchia

Az Aura három szintű konfigurációs rendszert használ prioritási sorrendben:

1. **Config fájl** (alapértelmezett) - `aura.config.ts`
2. **Props** (komponens szintű) - felülírja a config értékeket
3. **API paraméterek** (dinamikus) - felülír mindent

### Példa prioritási sorrendre

```typescript
// 1. Config fájl (alapértelmezett)
export default {
  rowsNumber: 10
}

// 2. Props (felülírja a config-ot)
<Aura :rows-number="25" />

// 3. API válasz (mindent felülír)
{
  "variables": {
    "config": {
      "rowsNumber": 50
    }
  }
}
// Végeredmény: rowsNumber = 50
```

### Multi-instance támogatás

Több táblázat példány használata ugyanazon az oldalon:

```typescript
// Első táblázat példány
app.use(Aura, { storeId: 'users-table', debug: true });

// Második táblázat példány
app.use(Aura, { storeId: 'products-table', debug: false });
```

## Session Persistence (Állapotmentés)

Az Aura automatikusan elmenti a felhasználó által beállított táblázat állapotot a böngésző `sessionStorage`-ába, és oldal újratöltéskor visszaállítja azt.

### Mentett adatok
- **Lapozás:** Aktuális oldal (`page`), sorok száma (`limit`)
- **Rendezés:** Aktív rendezési mezők és irányok (`sortItems`)
- **Keresés:** Oszlop szintű keresések (`searchItems`) és globális keresés (`globalSearchTerm`)
- **Szűrés:** Aktív szűrők (`filterItems`)
- **Kijelölés:** A kijelölt sorok azonosítói (`selectedRows`)

### Működés
- A mentés automatikusan történik minden állapotváltozáskor, **250 ms-os debounce-szal**: egy
  változás-sorozat — több száz sor „összes kijelölése", vagy gyors lapozgatás — így *egyetlen*
  szerializálást és írást eredményez, nem változásonként egyet (a `sessionStorage.setItem`
  szinkron, a fő szálon futó művelet).
- Függőben lévő mentés nem veszhet el: a táblázat megszűnésekor, valamint a lap elrejtésekor
  és elhagyásakor (`pagehide` / `visibilitychange`) kikényszerítjük — így az utolsó változás
  utáni azonnali újratöltés is helyesen áll vissza.
- Az adatok a böngésző fül (tab) bezárásáig maradnak meg.
- Minden táblázat példány saját, egyedi kulcsot használ: `aura-session-{storeId}` — ez a
  [`sessionKey`](#sessionkey) proppal felülírható (hasznos generált `storeId` esetén, vagy ha
  két táblázat szándékosan ugyanazt a mentett állapotot használja).
- Visszatöltéskor az adatok Zod séma validáción esnek át, hibás adat esetén az alapértelmezett értékek töltődnek be.

### Kikapcsolás
A funkció alapértelmezésben be van kapcsolva. Kikapcsoláshoz használd a `disableSession` prop-ot:

```typescript
<Aura
  storeId="users-table"
  :disable-session="true"
/>
```

## Cell Formatting

Az Aura támogatja a cellák tartalmának formázását a konfiguráció (Header/Body config) alapján.

### Támogatott formázások

| Prop       | Típus     | Leírás                                                                 | Példa                                                                                                             |
| ---------- | --------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `number`   | `boolean` | Számként formázás (lokalizáció alapján).                               | `1234.56` -> `"1 234,56"` (hu-HU)                                                                                 |
| `currency` | `string`  | Pénznemként formázás (ISO kód).                                        | `1234` -> `"1 234 Ft"` (`huf`), `"€1,234.00"` (`usd`)                                                             |
| `base`     | `string`  | Pénznem alapértelmezett kódja, ha nincs specifikálva a `currency` prop | `base: 'USD', currency: true` -> `"$1,234.00"`                                                                    |
| `unit`     | `string`  | Egység alapú formázás (ECMA-402 unit identifiers).                     | `50` -> `"50%"` (`percent`), `"100 km"` (`kilometer`), `"25°C"` (`celsius`). Támogatott: `liter`, `meter`, stb.   |
| `date`     | `boolean` | Dátum formázás (`dateStyle` alapján).                                  | `"2024-01-01"` -> `"2024. 01. 01."` (short)                                                                       |
| `datetime` | `boolean` | Dátum és idő formázás (`dateStyle` + idő).                             | `"2024-01-01T15:00"` -> `"2024. 01. 01. 15:00"`                                                                   |
| `phone`    | `boolean` | Telefonszám formázás (locale alapján detektált ország).                | `"+36301234567"` -> `"+36 30 123 4567"`                                                                           |
| `raw`      | `boolean` | Nyers HTML renderelése (sanitize-olva).                                | `"<b>Bold</b>"` -> **Bold**                                                                                       |

### Szöveg transzformációk

| Prop         | Típus     | Leírás                                                           | Példa                          |
| ------------ | --------- | ---------------------------------------------------------------- | ------------------------------ |
| `uppercase`  | `boolean` | Nagybetűsre alakítás.                                            | `"hello"` -> `"HELLO"`        |
| `lowercase`  | `boolean` | Kisbetűsre alakítás.                                             | `"HELLO"` -> `"hello"`        |
| `capitalize` | `boolean` | Első betű nagybetűsítése, a többi kisbetűsítése.                 | `"hELLO"` -> `"Hello"`        |

### Szöveg vágás (Slice)

| Prop       | Típus     | Leírás                                                               | Példa                                      |
| ---------- | --------- | -------------------------------------------------------------------- | ------------------------------------------- |
| `slice`    | `number`  | A megjelenített szöveg maximális hossza.                             | `"Hello World"` + `slice: 5` -> `"Hello"`  |
| `sliceEnd` | `string`  | Utótag, ami a levágott szöveg végéhez kerül (pl. `"..."`).           | `slice: 5, sliceEnd: "..."` -> `"Hello..."` |

### Padding (Kitöltés)

| Prop       | Típus     | Leírás                                                           | Példa                                             |
| ---------- | --------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| `pad`      | `number`  | Kétoldali kitöltés a megadott hosszra.                           | `"42"` + `pad: 6` -> `"  42  "`                   |
| `padStart` | `number`  | Bal oldali kitöltés a megadott hosszra.                          | `"42"` + `padStart: 5` -> `"   42"`               |
| `padEnd`   | `number`  | Jobb oldali kitöltés a megadott hosszra.                         | `"42"` + `padEnd: 5` -> `"42   "`                 |
| `chars`    | `string`  | A kitöltő karakter (alapértelmezett: szóköz).                    | `"42"` + `padStart: 5, chars: "0"` -> `"00042"`   |

### Kiemelés (Highlight)

A `highlightText` segédfüggvény a keresési kifejezés alapján kiemeli a találatokat a cella szövegében `<mark>` tagekkel. Ez automatikusan történik a `TableBodyCell` komponensben, ha a globális keresés aktív. Az XSS védelmet `escapeHtml()` biztosítja.

### Prioritás

A formázások alkalmazási sorrendje (ha több is meg van adva):
1. `raw` (ha igaz, minden mást figyelmen kívül hagy)
2. Típus formázás: `currency` > `unit` > `number` > `datetime` > `date` > `phone` > `time`
3. Szöveg vágás: `slice` + `sliceEnd`
4. Szöveg transzformáció: `uppercase` / `lowercase` / `capitalize`
5. Padding: `padStart` / `padEnd` / `pad`

### Példa konfiguráció

```typescript
// Header config példa
{
  key: "price",
  content: "Ár",
  currency: "HUF" // Minden érték forintosítva lesz
},
{
  key: "weight",
  content: "Súly",
  unit: "kilogram" // "50 kg"
},
{
  key: "change",
  content: "Változás",
  unit: "percent" // "12%"
},
{
  key: "description",
  content: "Leírás",
  slice: 50,
  sliceEnd: "..." // Hosszú szöveg levágása 50 karakterre + "..."
},
{
  key: "code",
  content: "Kód",
  uppercase: true,
  padStart: 6,
  chars: "0" // "42" -> "000042" nagybetűsen
}
```

## API Válasz Struktúra

Az Aura elvárja, hogy a szerver oldali API válasz egy meghatározott JSON struktúrát kövessen. Ez lehetővé teszi a táblázat konfigurációjának (fejléc, lábléc, stílusok) dinamikus vezérlését a szerverről.

### Teljes felépítés (`ApiResponse`)

```typescript
interface ApiResponse {
    header: Header;           // Táblázat fejléc definíció (kötelező)
    body?: Body;              // Törzs beállítások (opcionális)
    footer?: Footer;          // Lábléc definíció (opcionális)
    items: unknown[];         // Adat sorok tömbje
    meta?: PaginationMeta;    // Laravel paginációs metaadatok
    links?: PaginationLinks;  // Laravel paginációs linkek
}

interface Body {
    columnConfigs?: Record<string, ColumnConfig>; // Oszlop konfigurációk (key → config)
    columnStyles?: Record<string, string | string[]>; // Oszlop CSS osztályok (oszlop `key` → class(ek))
    settings?: BodySettings;                      // Általános törzs beállítások
    rowRules?: RowRules | null;                   // Feltételes sorformázás (<tr>)
}

interface BodySettings {
    striped?: boolean;    // Csíkozott sorok (a `table-striped` osztály be-/kikapcsolása)
    hoverable?: boolean;  // Hover-kiemelés (a `table-hover` osztály be-/kikapcsolása)
}
```

> **`columnStyles`** — oszloponkénti CSS osztályok a törzs (`<td>`) cellákra. A kulcs az oszlop
> `key`-e, az érték egy osztály-string vagy string-tömb (pl. `{ "file": "text-truncate",
> "priceUsd": ["text-end", "fw-semibold"] }`). Az osztályok a cella meglévő (cellRules /
> columnConfig) osztályai mellé kerülnek.
>
> **`settings.striped` / `settings.hoverable`** — felülbírálják a `config.classes.table`
> alapértelmezést: `true` → biztosan bekapcsolt, `false` → biztosan kikapcsolt, hiányzó érték →
> a config default marad érvényben (alapból `table-striped` + `table-hover` be van kapcsolva).

### Fejléc struktúra (`Header`)

A fejléc határozza meg az oszlopokat, azok sorrendjét és tulajdonságait.

```typescript
interface Header {
    rows: HeaderRow[];
    settings?: HeaderSettings;
}

interface HeaderRow {
    cells: HeaderCell[];
}

interface HeaderCell {
    content: string;      // Megjelenő szöveg
    key: string;          // Egyedi azonosító
    field?: string;       // Adat mező neve (items-ben) VAGY columnConfigs kulcs (ha létezik, ikon/config renderelés)
    fields?: string[];    // Több mező egymás után; ha egy elem szerepel a columnConfigs-ban → config renderelés, egyébként adat érték
    sortable?: boolean;   // Rendezhető-e
    searchable?: boolean; // Kereshető-e
    filterable?: boolean; // Szűrhető-e (legördülő). Ha `true` és nincs `elements`, a szűrő-lista a betöltött sorok distinct értékeiből épül automatikusan (kliens-oldal)
    between?: boolean;    // Tartomány-keresés (min/max) a kereső-sorban (szám/dátum oszlop)
    reference?: string;   // Melyik mezőre menjen a rendezés/keresés/szűrés (több `fields` esetén)
    selectable?: boolean; // Kijelölő checkbox-oszlop (a `field` a sor-azonosító, default `id`)
    show?: boolean;       // Oszlop láthatósága — csak explicit `false` rejti el (default: látható)
    elements?: (string | number)[] | Record<string, string | number> | { value: string | number | boolean | null, label: string }[]; // Szűrési opciók (támogatott: egyszerű tömb, kulcs-érték pár objektum, vagy {value, label} objektumok tömbje)
    // ... további formázási opciók (width, align, raw, number, currency, unit, date, phone, slice, sliceEnd, pad, padStart, padEnd, chars, uppercase, lowercase, capitalize)
}
```

> **`show`** — az oszlop kezdeti láthatósága (**opt-out**): a mező elhagyása vagy `true` esetén az
> oszlop látszik, és **kizárólag az explicit `show: false` rejti el**. A rejtett oszlop a fejlécből,
> a törzs minden sorából, a láblécből és a kereső-sorból egyaránt kimarad (pozíció szerint igazodva).
> Példa — a `secret` oszlop nem renderelődik:
> ```json
> { "content": "Titkos", "key": "secret", "field": "secret", "show": false }
> ```

> **`between`** — tartomány-keresés a kereső-sorban (`showHeaderSearch: true` + az oszlop
> `searchable: true`). A szokásos egyetlen input helyett **két input** (min/max) jelenik meg; az
> input típusa az oszlop formázó-jelzőiből adódik (`number`/`currency`/`time` → `number`,
> `date` → `date`, `datetime` → `datetime-local`). A specifikusabb jelző nyer: a `datetime` a
> `date` fölött, mindkettő a numerikus csoport fölött. A hamis értékű `currency` (`false`, `""`)
> azt jelenti, hogy az oszlop nem pénznem, tehát a mezők `text`-ek maradnak. Bármelyik határ
> elhagyható (nyílt tartomány).
> Kliens-oldali módban a szűrés helyben fut (szám- és dátum-tartomány is), szerver-oldali módban
> (`externalPaginator: true`) a `min`/`max` a `searchable` request-paraméterben megy ki
> (`{ "field": "...", "min": ..., "max": ... }`).
> ```json
> { "content": "Életkor", "key": "age", "field": "age", "searchable": true, "between": true, "number": true }
> ```

> **`reference`** — több `fields` (vagy eltérő adat-mező) esetén megadja, **melyik mezőre** menjen a
> rendezés, keresés és szűrés. Ha nincs megadva, a művelet a `field`, végső soron a `key` mezőre esik.
> ```json
> { "content": "Felhasználó", "key": "user", "fields": ["user.first_name", "user.last_name"], "reference": "user.id", "sortable": true, "searchable": true }
> ```

> **`selectable`** — az oszlop **kijelölő checkbox-oszloppá** válik: a fejlécben „összes kijelölése"
> checkbox (az aktuális oldal sorait kezeli, részleges kijelölésnél `indeterminate`), minden sorban
> egy sor-checkbox. A **sor egyedi azonosítója** ennek az oszlopnak a `field`-jéből olvasódik ki
> (ha nincs `field`, akkor `id`); csak szám/szöveg érték fogadható el ID-nek. A kijelölt ID-k a
> `store.selectedRows`-ban élnek, session-be mentődnek, és a **kérés `selected` mezőjében** mennek ki
> a szerver felé (a kijelölés önmagában **nem** tölti újra a táblát — a `selected` a következő valós
> adatkéréssel utazik). Store-metódusok: `toggleRowSelection` / `selectRows` / `deselectRows` /
> `clearSelection` / `isRowSelected`.
> ```json
> { "content": "", "key": "select", "field": "id", "selectable": true }
> ```

```typescript
interface HeaderSettings {
    sticky?: boolean;     // Fejléc rögzítése görgetésnél
    height?: string;      // Fix magasság (pl. '50px')
    searchableItems?: string[]; // Globális keresésben résztvevő mezők
}
```

### Lábléc struktúra (`Footer`)

A lábléc opcionális. Ha nincs megadva, és a `showFooter: true` config aktív, akkor a fejléc struktúráját másolja le.

```typescript
interface Footer {
    rows: FooterRow[];    // Ugyanaz a struktúra, mint a HeaderRow
    settings?: FooterSettings;
}

interface FooterSettings {
    sticky?: boolean;     // Lábléc rögzítése alul
    height?: string;      // Fix magasság
}
```

> **`settings.sticky` / `settings.height`** — a `sticky: true` a renderelt `<thead>`/`<tfoot>`
> elemre az `aura-thead-sticky` / `aura-tfoot-sticky` osztályt teszi (`position: sticky`,
> `top: 0` / `bottom: 0`), a `height` pedig inline `height` stílust (`'100px'`, `'50%'`,
> `'2.5rem'` vagy `'auto'`). A `sticky` **az Aura stíluslapját igényli** (a rögzített sáv
> átlátszóság elleni háttere onnan jön) — importáld a host oldalán:
> ```typescript
> import '@tamas-labs/aura/style.css';
> ```
> A háttér és a z-index a `$aura-sticky-bg` / `$aura-sticky-z-index` SCSS-változókkal
> testreszabható (alapból a Bootstrap `--bs-body-bg`).

### Példa API válaszra

```json
{
    "header": {
        "rows": [
            {
                "cells": [
                    { "content": "Név", "key": "name", "field": "name", "sortable": true },
                    { "content": "Email", "key": "email", "field": "email", "searchable": true },
                    { "content": "Szerepkör", "key": "role", "field": "role" }
                ]
            }
        ],
        "settings": {
            "sticky": true
        }
    },
    "footer": {
        "rows": [
            {
                "cells": [
                    { "content": "Összesen", "key": "total", "colspan": 2 },
                    { "content": "15 felhasználó", "key": "count" }
                ]
            }
        ]
    },
    "items": [
        { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "admin" },
        { "id": 2, "name": "Jane Smith", "email": "jane@example.com", "role": "user" }
    ],
    "meta": {
        "current_page": 1,
        "total": 15,
        "per_page": 10
    }
}
```

## Props

Az Aura komponens a következő prop-okat támogatja:

| Prop                      | Típus                      | Kötelező | Alapértelmezett                                         | Leírás                                               |
| ------------------------- | -------------------------- | -------- | ------------------------------------------------------- | ---------------------------------------------------- |
| `storeId`                 | `string`                   | Nem      | `'aura-core'`                                           | Egyedi store azonosító multi-instance támogatáshoz   |
| `debug`                   | `boolean`                  | Nem      | `false`                                                 | Debug mód engedélyezése, részletes console logokkal  |
| `siteName`                | `string`                   | Nem      | `window.location.origin`                                | Az alkalmazás neve vagy base URL                     |
| `urlParameter`            | `string`                   | Nem      | `undefined`                                             | URL paraméter a resource endpoint-hoz                |
| `urlParameterLastSegment` | `string`                   | Nem      | `'resources'`                                           | URL utolsó szegmense                                 |
| `urlStructure`            | `string`                   | Nem      | `'{siteName}/{urlParameter}/{urlParameterLastSegment}'` | URL struktúra sablon                                 |
| `siteToken`               | `boolean \| string`        | Nem      | `false`                                                 | Site token használata (boolean vagy token string)    |
| `paginateValues`          | `number[]`                 | Nem      | `[5, 10, 25, 50, 100]`                                  | Elérhető lapozási értékek                            |
| `rowsNumber`              | `number`                   | Nem      | `10`                                                    | Alapértelmezett sorok száma oldalanként              |
| `classes`                 | `Record<string, string[]>` | Nem      | Lásd alább                                              | CSS osztályok konfigurációja                         |
| `showFooter`              | `boolean`                  | Nem      | `true`                                                  | Footer megjelenítése                                 |
| `actionButtons`           | `ActionButtonItem[]`       | Nem      | `[]`                                                    | Action gombok (refresh, export, settings)            |
| `showHeaderSearch`        | `boolean`                  | Nem      | `false`                                                 | Header keresés megjelenítése                         |
| `showLoadingOverlay`      | `boolean`                  | Nem      | `true`                                                  | Beépített betöltési overlay lekérés közben           |
| `showLoadingBar`          | `boolean`                  | Nem      | `false`                                                 | Vékony folyamatjelző sáv lekérés közben              |
| `showToolbarTitle`        | `boolean`                  | Nem      | `false`                                                 | Toolbar cím megjelenítése                            |
| `toolbarTitleContent`     | `string`                   | Nem      | `''`                                                    | Toolbar cím tartalma (fallback: 'Logo/Cím')          |
| `externalPaginator`       | `boolean`                  | Nem      | `false`                                                 | Szerver oldali lapozás engedélyezése                 |
| `dateStyle`               | `'short' \| 'medium' \| 'long'`| Nem      | `'short'`                                               | Dátum megjelenítési stílus                           |
| `timeZone`                | `string`                   | Nem      | `'Europe/Budapest'`                                     | Időzóna                                              |
| `utcOffset`               | `string`                   | Nem      | `'+02:00'`                                              | UTC offset                                           |
| `localization`            | `string`                   | Nem      | `'en-US'`                                               | Lokalizáció (Intl szám/dátum formázás, rendezés)     |
| `currencyCode`            | `string`                   | Nem      | `'HUF'`                                                 | Pénznem kód (ISO 4217)                               |
| `resources`               | `boolean`                  | Nem      | `false`                                                 | Resources mód engedélyezése                          |
| `requestMethod`           | `string`                   | Nem      | `'POST'`                                                | HTTP request metódus (GET, POST, PUT, DELETE, PATCH) |
| `disableSession`          | `boolean`                  | Nem      | `false`                                                 | Session tárolás letiltása                            |
| `sessionKey`              | `string`                   | Nem      | `null` (`aura-session-{storeId}`)                       | A mentett állapot sessionStorage-kulcsának felülírása |
| `emptyStateMessage`       | `string`                   | Nem      | `'No data available to display.'`                       | ⚠️ Elavult — helyette `labels.emptyState`             |
| `accentInsensitiveSearch` | `boolean`                  | Nem      | `false`                                                 | Ékezetek figyelmen kívül hagyása a kliensoldali keresésben |
| `highlightSearchResults`  | `boolean`                  | Nem      | `true`                                                  | Keresési találatok kiemelése                         |
| `highlightClass`          | `string`                   | Nem      | `'aura-highlight'`                                      | Kiemelés CSS osztálya                                |

## API Referencia

### Config Mezők Részletes Dokumentációja

#### Alapvető beállítások

##### `storeId`

- **Típus:** `string`
- **Alapértelmezett:** `'aura-core'`
- **Leírás:** Egyedi store azonosító, amely lehetővé teszi több táblázat példány használatát ugyanazon az oldalon
- **Példa:**

    ```typescript
    app.use(Aura, { storeId: 'users-table' });
    ```

##### `debug`

- **Típus:** `boolean`
- **Alapértelmezett:** `false`
- **Leírás:** Debug mód bekapcsolása, amely részletes logokat ír a console-ra
- **Példa:**

    ```typescript
    app.use(Aura, { debug: true });
    ```

##### `siteName`

- **Típus:** `string`
- **Alapértelmezett:** `window.location.origin`
- **Leírás:** Az alkalmazás neve vagy alap URL
- **Példa:**

    ```typescript
    app.use(Aura, { siteName: 'https://api.example.com' });
    ```

##### `href`

- **Típus:** `string`
- **Alapértelmezett:** `window.location.href`
- **Leírás:** API endpoint URL
- **Példa:**

    ```typescript
    app.use(Aura, { href: '/api/v1/users' });
    ```

#### Lapozási beállítások

##### `rowsNumber`

- **Típus:** `number`
- **Alapértelmezett:** `10`
- **Leírás:** Alapértelmezett sorok száma oldalanként
- **Példa:**

    ```typescript
    app.use(Aura, { rowsNumber: 25 });
    ```

##### `paginateValues`

- **Típus:** `number[]`
- **Alapértelmezett:** `[5, 10, 25, 50, 100]`
- **Leírás:** Elérhető lapozási értékek listája
- **Példa:**

    ```typescript
    app.use(Aura, { paginateValues: [10, 20, 50, 100] });
    ```

##### `externalPaginator`

- **Típus:** `boolean`
- **Alapértelmezett:** `false`
- **Leírás:** Szerver oldali lapozás és szűrés engedélyezése. Ha `true`, a lapozás, rendezés, keresés és szűrés szerver oldalon történik új API hívással. Ha `false`, minden művelet kliens oldalon zajlik a már betöltött adatokon.
- **Kliens oldali módban nincs kérés.** `false` esetén a lapozás, rendezés, keresés és szűrés
  teljes egészében a store-ban már meglévő `items`-ből válaszolódik meg — **nem** indít API hívást,
  így nem is állítja `loading` állapotba a táblát, és nem jelenít meg betöltésjelzőt. Ebben a módban
  csak a kezdeti mount és az explicit `fetchData()` (például a toolbar frissítés gombja) megy a
  hálózatra. Ha az API-nak kell lapoznia vagy keresnie, `externalPaginator: true` kell.
- **Példa:**

    ```typescript
    app.use(Aura, { externalPaginator: true });
    ```

#### URL konfiguráció

##### `urlParameter`

- **Típus:** `string`
- **Alapértelmezett:** `undefined`
- **Leírás:** URL paraméter a resource endpoint-hoz. A vezető perjel (`/`) automatikusan eltávolításra kerül.
- **Példa:**

    ```typescript
    // Input: '/users' -> Result URL: .../users/...
    app.use(Aura, { urlParameter: '/users' });
    ```

##### `urlParameterLastSegment`

- **Típus:** `string`
- **Alapértelmezett:** `'resources'`
- **Leírás:** URL utolsó szegmense. A vezető perjel (`/`) automatikusan eltávolításra kerül.
- **Példa:**

    ```typescript
    app.use(Aura, { urlParameterLastSegment: 'data' });
    ```

##### `urlStructure`

- **Típus:** `string`
- **Alapértelmezett:** `'{siteName}/{urlParameter}/{urlParameterLastSegment}'`
- **Leírás:** URL struktúra sablon
- **Példa:**

    ```typescript
    app.use(Aura, { urlStructure: '{siteName}/api/{urlParameter}' });
    ```

#### Megjelenítési beállítások

##### `showFooter`

- **Típus:** `boolean`
- **Alapértelmezett:** `true`
- **Leírás:** Footer megjelenítése a táblázat alatt
- **Példa:**

    ```typescript
    app.use(Aura, { showFooter: false });
    ```

##### `actionButtons`

- **Típus:** `ActionButtonItem[]` (`'refresh' | 'export' | 'settings'`)
- **Alapértelmezett:** `[]` — nincs action gomb; mindegyiket külön kell bekapcsolni
- **Leírás:** Action gombok megjelenítése (Frissítés, Export, Beállítások). A validáció során az érvénytelen elemek kiszűrésre kerülnek (pl. `['refresh', 'invalid']` -> `['refresh']`), a teljes lista megjelenítése helyett.
- **📤 Export:** Az `'export'` gomb egy dropdownt jelenít meg egyetlen **CSV export**
  ponttal, amely a **látható oszlopok** alapján a **jelenlegi nézet** (aktuális oldal,
  a rá ható kereséssel/szűréssel/rendezéssel) sorait tölti le kliensoldali CSV-ként
  (UTF-8 BOM-mal, RFC 4180 escape-eléssel), külső függőség nélkül. Valódi `.xlsx`
  (Excel) exporthoz egy host-oldali library kell — a nyers adat (`items`) elérhető
  hozzá; ezt **szándékosan nem** csomagoljuk az Aurába. A `'refresh'` és `'settings'`
  teljesen működik.
- **🛡️ Képlet-injekció elleni védelem:** az `=`, `+`, `-`, `@`, TAB vagy CR karakterrel
  kezdődő cellaérték aposztróf (`'`) elé kerül és mindig idézőjelet kap, így az Excel, a
  LibreOffice Calc és a Google Sheets **szövegként** olvassa, nem képletként értékeli ki.
  Az API-válasz nem megbízható bemenet, a CSV-fájl pedig a böngésző sandboxán kívül nyílik
  meg — egy `=HYPERLINK(...)` alakú érték egyébként a felhasználó gépén futna le. Az
  idézőjelezés önmagában nem véd: a táblázatkezelő az idézőjeleket a kiértékelés előtt
  eltávolítja. **A tisztán numerikus értékek kivételt képeznek** (`-5`, `+1.5`, `-1e3`
  változatlan marad), tehát a negatív számok nem kapnak aposztrófot. A védelem nem
  kapcsolható ki.
- **⚙️ Beállítások panel:** a `'settings'` gomb a toolbar alatti lenyíló panelt kapcsolja,
  benne két élő szekcióval:
    - **Oszlop-láthatóság** — adatoszloponként egy checkbox (a header utolsó sorából).
      A kikapcsolása egyszerre veszi ki az oszlopot a headerből, a bodyból, a footerből, a
      fejléc keresősorából és a CSV-exportból. Tisztán megjelenítési állapot, ezért egy
      átkapcsolás soha nem indít kérést — szerveroldali módban (`externalPaginator: true`)
      sem —, és a többi session-állapottal együtt megőrződik (lásd
      [`disableSession`](#disablesession)). Amíg van elrejtett oszlop, megjelenik a
      **Show all** gomb. Két oszloptípus szándékosan hiányzik a listából: a `show: false`
      oszlop (ezt a válasz rejtette el, nem a felhasználó dolga felülbírálni) és a
      `selectable` checkbox-oszlop (elrejtése ott hagyná a meglévő kijelölést). Az utolsó
      látható oszlop checkboxa tiltott, így a táblázat nem maradhat nulla oszloppal.
    - **Aktív szűrők** — minden aktív globális keresés, oszlopkeresés és oszlopszűrő egy-egy
      törölhető badge-ként, plusz egy **Clear all** gomb. Ugyanez a badge-lista — a
      clear-all gomb és az üres állapot szövege nélkül — a toolbar alsó sorában is ott van.
      Egy badge törlése az őt birtokló store-akciót hívja, tehát kliensoldalon azonnal
      újraszeletel, szerveroldalon újra lekér.
- **Példa:**

    ```typescript
    // Mindhárom gomb
    app.use(Aura, { actionButtons: ['refresh', 'export', 'settings'] });

    // Csak frissítés és beállítások gomb
    app.use(Aura, { actionButtons: ['refresh', 'settings'] });

    // Üres tömb (az alapértelmezés) = nincs gomb
    app.use(Aura, { actionButtons: [] });
    
    // Érvénytelen elem szűrése (csak a 'refresh' jelenik meg)
    app.use(Aura, { actionButtons: ['refresh', 'invalid'] });
    ```

##### `showHeaderSearch`

- **Típus:** `boolean`
- **Alapértelmezett:** `false`
- **Leírás:** Header keresés megjelenítése
- **Példa:**

    ```typescript
    app.use(Aura, { showHeaderSearch: true });
    ```

    A keresőmezőbe gépelés **300 ms-os debounce-szal** fut, tehát egy gyors gépelési sorozatból egy
    store-írás (szerver-oldali módban egy kérés) lesz, nem karakterenként egy. Az Enter, illetve a
    kereső- és a törlő gomb azonnal alkalmaz, és eldobja a függőben lévő hívást. A késleltetés
    egyelőre nem konfigurálható — egyetlen közös konstans.

##### `showLoadingOverlay`

- **Típus:** `boolean`
- **Alapértelmezett:** `true`
- **Leírás:** A beépített betöltési overlay (áttetsző fátyol Bootstrap spinnerrel) megjelenítése a
  táblázat fölött, amíg kérés van folyamatban. A kikapcsolása nem tünteti el magát az állapotot: a
  [`loading`](#useapiresourcesstore) store-tulajdonság ettől függetlenül elérhető marad, tehát a
  hoszt saját visszajelzést köthet rá.
- **Rövid késleltetés (250 ms) után jelenik meg.** A fátyol elsötétíti a sorokat és blokkolja az
  egérmutatót, ezért egy pár tíz ezredmásodperc alatt lefutó kérésnél csak felvillanna. Az e küszöb
  alatti kéréseknél semmilyen indikátor nem jelenik meg. A késleltetés nem konfigurálható —
  egyetlen közös konstans. A `<table>` `aria-busy` attribútuma **nincs** késleltetve.
- **Kizárja a sávot.** A két indikátor kizárja egymást, és az overlay az erősebb: amíg be van
  kapcsolva, a [`showLoadingBar`](#showloadingbar) figyelmen kívül marad, akkor is, ha `true`.
- **Az Aura stíluslapját igényli** (`import '@tamas-labs/aura/style.css'`) — a fátyol pozicionálása,
  háttere és rétegsorrendje onnan jön. A háttér és a z-index a `$aura-loading-overlay-bg` /
  `$aura-loading-overlay-z-index` SCSS-változókkal testreszabható; a z-index alapértéke (`3`)
  szándékosan az `$aura-sticky-z-index` fölött van, hogy a sticky fejléc ne takarja el az overlayt.
- **Példa:**

    ```typescript
    // A beépített overlay kikapcsolása, saját indikátor mellett
    app.use(Aura, { showLoadingOverlay: false });
    ```

##### `showLoadingBar`

- **Típus:** `boolean`
- **Alapértelmezett:** `false`
- **Leírás:** Vékony (3px), határozatlan folyamatjelző sáv megjelenítése a táblázat terület felső
  élén, amíg kérés van folyamatban — az overlay nem blokkoló alternatívája. Nem foglal helyet a
  layoutban és nem sötétíti el a sorokat, ezért **azonnal** megjelenik, és a kérés teljes idejére
  marad.
- **Kizárja az overlayt, és az overlay az erősebb.** A sáv csak akkor jelenik meg, ha a
  [`showLoadingOverlay`](#showloadingoverlay) `false`; bekapcsolt overlay mellett (ez az
  alapértelmezés) ez a kulcs figyelmen kívül marad, akkor is, ha `true`. A sávhoz mindkét kulcsot
  át kell állítani, ahogy a lenti példa mutatja.
- **Az Aura stíluslapját igényli** (`import '@tamas-labs/aura/style.css'`) — enélkül a sávnak nincs
  magassága, színe és animációja. A `$aura-loading-bar-height`, `$aura-loading-bar-color`,
  `$aura-loading-bar-track-bg`, `$aura-loading-bar-duration` és `$aura-loading-bar-z-index`
  SCSS-változókkal szabható testre. A söprő animáció `prefers-reduced-motion: reduce` mellett
  automatikusan elmarad.
- **Akadálymentesség:** a sáv `role="progressbar"`, `aria-valuenow` nélkül (ez jelöli a
  folyamatjelzőt határozatlannak). Magán a `<table>`-en az `aria-busy` van, ami közvetlenül a kérést
  követi, és **nincs** késleltetve.
- **Példa:**

    ```typescript
    // Csak nem blokkoló visszajelzés: sáv fátyol nélkül
    app.use(Aura, { showLoadingBar: true, showLoadingOverlay: false });
    ```

##### `showToolbarTitle`

- **Típus:** `boolean`
- **Alapértelmezett:** `false`
- **Leírás:** Toolbar cím megjelenítése. Ha `false`, a cím teljesen elrejtésre kerül és a layout újraszámolódik.
  Ha a cím, a header keresés és az action gombok mind ki vannak kapcsolva (ez az alapértelmezés), a
  toolbar teljes felső sora kimarad, így nem marad üres sor a sorszám-választó fölött.
- **Példa:**

    ```typescript
    app.use(Aura, { showToolbarTitle: true });
    ```

##### `toolbarTitleContent`

- **Típus:** `string`
- **Alapértelmezett:** `''` (fallback: `'Logo/Cím'`)
- **Leírás:** A toolbar címének tartalma. Ha üres string, a komponens a 'Logo/Cím' fallback értéket jeleníti meg.
- **Példa:**

    ```typescript
    app.use(Aura, { toolbarTitleContent: 'Felhasználók kezelése' });
    ```

#### Ikonok konfiguráció

##### `icons`

- **Típus:** `object`
- **Leírás:** Központosított ikon rendszer konfigurációja. Minden ikon lecserélhető (FontAwesome, Bootstrap Icons, Lucide, Heroicons)
- **Példa:**

    ```typescript
    app.use(Aura, {
        icons: {
            sortable: {
                up: ['fas', 'fa-arrow-up'],
                down: ['fas', 'fa-arrow-down'],
                both: ['fas', 'fa-sort'],
            },
            filterable: ['fas', 'fa-filter'],
            search: ['fas', 'fa-search'],
            clear: ['fas', 'fa-times'],
        },
    });
    ```

#### CSS osztályok konfiguráció

##### `classes`

- **Típus:** `Record<string, string[] | Record<string, string[]>>`
- **Leírás:** Bootstrap 5 CSS osztályok konfigurációja. Minden kulcs meghatározza, hogy az adott típusú trigger elemre milyen CSS osztályok kerüljenek.

| Kulcs | Alkalmazva | Elem |
|---|---|---|
| `table` | Táblázat komponens | `<table>` |
| `icon` | Icon oszloptípus; modal icon trigger | `<i>` |
| `button` | Modal button trigger | `<button>` |
| `link` | Modal link trigger | `<a>` |
| `dataTypes.numbers` | Numerikus értékek | cella `<td>` |
| `dataTypes.currency` | Pénznem értékek | cella `<td>` |
| `dataTypes.unit` | Mértékegység értékek | cella `<td>` |

- **Alapértelmezett:**

    ```typescript
    classes: {
        table: ['table', 'table-striped', 'table-hover', 'mt-2', 'mb-4'],
        icon: ['mx-2'],
        button: ['mx-1'],
        link: ['mx-1'],
        dataTypes: {
            numbers: ['text-end'],
            currency: ['text-end'],
            unit: ['text-end'],
        },
    }
    ```

- **Példa:**

    ```typescript
    app.use(Aura, {
        classes: {
            table: ['table-striped', 'table-hover', 'table-bordered'],
            icon: ['mx-2', 'text-secondary'],
            button: ['btn', 'btn-sm'],
            link: ['text-decoration-none'],
            dataTypes: {
                numbers: ['text-end', 'fw-bold'],
                currency: ['text-end', 'text-success'],
            },
        },
    });
    ```

#### Bootstrap variant színek

##### `variants`

- **Típus:** `Record<string, string>`
- **Leírás:** Bootstrap variant típusok konfigurációja
- **Példa:**

    ```typescript
    app.use(Aura, {
        variants: {
            primary: 'primary',
            destroy: 'danger',
            edit: 'warning',
            show: 'info',
        },
    });
    ```

##### `renderers`

- **Típus:** `Record<string, AuraCustomRenderer>`
- **Alapértelmezett:** `{}`
- **Leírás:** A `custom` oszloptípus renderelő függvényeinek hoszt-regisztere. Az API válasz csak **név szerint** hivatkozhat rájuk (`columnConfigs[...].renderer`), definiálni nem tudja — így a válasz nem tud kódot injektálni. A visszatérési érték HTML string, és átmegy a DOMPurify-on. Szignatúra: `(value, row, config) => string`. A teljes képhez ld. a [`custom` oszloptípust](#custom-oszloptípus). A `__proto__`, `constructor` és `prototype` név **foglalt**: ilyen bejegyzést a validátor figyelmeztetéssel eldob, mert a válasz különben egy prototípus-tagot érhetne el a néven keresztül.
- **Példa:**

    ```typescript
    app.use(Aura, {
        renderers: {
            userCard: (value, row, config) => `<strong>${value}</strong>`,
        },
    });
    ```

##### `callbacks`

- **Típus:** `Record<string, AuraCustomCallback>`
- **Alapértelmezett:** `{}`
- **Leírás:** A `custom` oszloptípus callback függvényeinek hoszt-regisztere, a válaszból névvel hivatkozva (`columnConfigs[...].callback`). A `renderers`-szel ellentétben a visszatérési érték **sima szöveg**: a static formázó dolgozza fel, majd a Vue escape-eli, tehát sosem lesz belőle HTML. Szignatúra: `(value, row, params) => string | number | null | undefined`. A `__proto__`, `constructor` és `prototype` név **foglalt**: ilyen bejegyzést a validátor figyelmeztetéssel eldob, mert a válasz különben egy prototípus-tagot érhetne el a néven keresztül.
- **Példa:**

    ```typescript
    app.use(Aura, {
        callbacks: {
            formatPrice: (price, row, params) => `${price} ${params.currency}`,
        },
    });
    ```

#### Nemzetköziesítés

##### `dateStyle`

- **Típus:** `'short' | 'medium' | 'long'`
- **Alapértelmezett:** `'short'`
- **Leírás:** Dátum megjelenítési stílus (Intl.DateTimeFormat)
- **Példa:**

    ```typescript
    app.use(Aura, { dateStyle: 'medium' });
    ```

##### `timeZone`

- **Típus:** `string`
- **Alapértelmezett:** `'Europe/Budapest'`
- **Leírás:** Időzóna
- **Példa:**

    ```typescript
    app.use(Aura, { timeZone: 'America/New_York' });
    ```

##### `localization`

- **Típus:** `string`
- **Alapértelmezett:** `'en-US'`
- **Leírás:** Lokalizáció (nyelv és régió) az `Intl` szám- és dátumformázáshoz, valamint a
  **kliensoldali rendezéshez**: a szöveges oszlopok összehasonlítása az ebből a locale-ból épített
  `Intl.Collator`-ral történik, tehát az ékezetes és kettős betűs adatok a beállított nyelv
  szabályai szerint rendeződnek, nem a böngészőé szerint. Publikus csomagként az alapértelmezés
  `en-US`; magyar formázáshoz állítsd `'hu-HU'`-ra.
- **Példa:**

    ```typescript
    app.use(Aura, { localization: 'hu-HU' });
    ```

##### `currencyCode`

- **Típus:** `string`
- **Alapértelmezett:** `'HUF'`
- **Leírás:** Pénznem kód (ISO 4217)
- **Példa:**

    ```typescript
    app.use(Aura, { currencyCode: 'USD' });
    ```

##### `unit`

- **Típus:** `string`
- **Alapértelmezett:** `undefined`
- **Leírás:** Globális mértékegység beállítás (Intl.NumberFormat unit)
- **Példa:**

    ```typescript
    app.use(Aura, { unit: 'kilogram' });
    ```

##### `labels`

- **Típus:** `Partial<AuraLabels>` (`Record<string, string>`)
- **Alapértelmezett:** beépített **angol** szövegkészlet (`DEFAULT_LABELS`)
- **Leírás:** A beépített, felhasználó-látható UI-szövegek (törlés-megerősítő modal,
  toolbar-gombok, keresés, lapozás, oldalra-ugrás, oldalankénti sorszám-választó, sor-kijelölés,
  oszlop-szűrő dropdown, beállítások panel, hibariasztások) felülírása. **Részlegesen is megadható** — a meg nem
  adott kulcsok az angol alapértékre esnek vissza. Az üres string is érvényes (így egy felirat
  szándékosan elrejthető). A `paginationInfo` sablon a `{from}` / `{to}` / `{total}` tokeneket,
  a `dismissAllErrors` / `hiddenErrors` / `errorOccurrences` sablon a `{count}` tokent, az
  `apiErrorClient` / `apiErrorServer` pedig a `{status}` tokent helyettesíti be.
- **Elérhető kulcsok (48):** `confirmDeleteTitle`, `confirmDeleteBody`, `cancel`, `confirmDelete`,
  `refresh`, `export`, `exportCsv`, `settings`, `search`, `clearSearch`, `searchPlaceholder`,
  `paginationInfo`, `noResults`, `previousPage`, `nextPage`, `pageJump`,
  `pageNumberPlaceholder`, `pageNumberInput`, `goToPage`, `go`, `perPage`, `results`,
  `selectRow`, `selectAllRows`, `sortColumn`, `selectAll`, `filterToggle`, `filterOptions`,
  `filterApply`, `columnVisibility`, `showAllColumns`, `activeFilters`, `noActiveFilters`,
  `clearAllFilters`, `removeFilter`, `loading`, `close`, `dismissAllErrors`, `hiddenErrors`,
  `errorOccurrences`, `retry`, `apiErrorNetwork`, `apiErrorTimeout`, `apiErrorClient`,
  `apiErrorServer`, `apiErrorUnknown`, `apiErrorInvalidResponse`, `emptyState`.
- **Megjegyzés:** a `columnVisibility` … `removeFilter` hat kulcs a beállítások panelhez
  tartozik (lásd [`actionButtons`](#actionbuttons)). A `search` felirat ott újra felhasználásra
  kerül a globális keresés badge-ének címeként, így a badge nem tud elcsúszni attól a
  keresőmezőtől, amit töröl.
- Az **`emptyState`** az egyetlen kulcs, amelynek **nincs** alapértéke a `DEFAULT_LABELS`-ben. Ez
  az üres táblázat üzenete, és ez váltja ki az elavult, top-level
  [`emptyStateMessage`](#emptystatemessage-elavult) config-kulcsot. Feloldási sorrend:
  `labels.emptyState` → `emptyStateMessage` → a beépített `'No data available to display.'`.
  Épp az teszi működőképessé az elavult aliast, hogy alapból nincs beállítva — ezért hiányzik
  szándékosan az alapértékek közül.
- **Példa (magyar felülírás):**

    ```typescript
    app.use(Aura, {
        labels: {
            confirmDeleteTitle: 'Törlés megerősítése',
            confirmDeleteBody: 'Biztosan törlöd ezt az elemet?',
            cancel: 'Mégsem',
            confirmDelete: 'Törlés',
            refresh: 'Frissítés',
            export: 'Exportálás',
            settings: 'Beállítások',
            paginationInfo: '{from}–{to} / {total} elem',
            noResults: 'Nincs találat',
        },
    });
    ```

#### Megjelenítési beállítások (haladó)

##### `accentInsensitiveSearch`

- **Típus:** `boolean`
- **Alapértelmezett:** `false`
- **Leírás:** Ékezetek figyelmen kívül hagyása a kliensoldali keresésben. Bekapcsolva az `arvizturo` megtalálja az `árvíztűrő`-t, a `Béla` pedig a `Bela`-t — a keresőkifejezés és a cellaérték is `NFD`-re bontva, a kombináló jelek eltávolításával kerül összehasonlításra. Egyaránt vonatkozik az oszlopkeresésre, a globális keresésre és a találatok kiemelésére, tehát egy találati sor mindig meg is kapja a `<mark>`-ját.
- **Szándékosan alapból kikapcsolva:** a bekapcsolása bővíti a találati halmazt, egy meglévő táblázat eredménye pedig nem változhat meg magától egy frissítéstől.
- **Csak kliensoldalon.** Szerveroldali módban (`externalPaginator: true`) a backend dönti el, mi számít találatnak — a kapcsoló nem módosítja a kérést. PostgreSQL-en az `unaccent` kiterjesztés, MySQL/MariaDB-n egy ékezetérzéketlen kollácó (`utf8mb4_0900_ai_ci`) a megfelelője.
- **Példa:**

    ```typescript
    app.use(Aura, { accentInsensitiveSearch: true });
    ```

##### `highlightSearchResults`

- **Típus:** `boolean`
- **Alapértelmezett:** `true`
- **Leírás:** Keresési találatok kiemelése a táblázatban
- **Példa:**

    ```typescript
    app.use(Aura, { highlightSearchResults: true });
    ```

##### `highlightClass`

- **Típus:** `string`
- **Alapértelmezett:** `'aura-highlight'`
- **Leírás:** Kiemelés CSS osztálya. Az érték a `<mark class="...">` attribútumba kerül, és HTML-escape-elve renderelődik (egy idézőjel nem tud kitörni az attribútumból).
- **Példa:**

    ```typescript
    app.use(Aura, { highlightClass: 'my-custom-highlight' });
    ```

#### Haladó beállítások

##### `resources`

- **Típus:** `boolean`
- **Alapértelmezett:** `false`
- **Leírás:** Resources mód engedélyezése
- **Példa:**

    ```typescript
    app.use(Aura, { resources: true });
    ```

##### `requestMethod`

- **Típus:** `'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'`
- **Alapértelmezett:** `'POST'`
- **Leírás:** HTTP request metódus az API hívásokhoz
- **Példa:**

    ```typescript
    app.use(Aura, { requestMethod: 'GET' });
    ```

##### `disableSession`

- **Típus:** `boolean`
- **Alapértelmezett:** `false`
- **Leírás:** Session storage használatának letiltása
- **Példa:**

    ```typescript
    app.use(Aura, { disableSession: true });
    ```

##### `sessionKey`

- **Típus:** `string | null`
- **Alapértelmezett:** `null` (a kulcs a `storeId`-ból képződik: `aura-session-{storeId}`)
- **Leírás:** Felülírja azt a `sessionStorage`-kulcsot, amely alá a táblázat állapota mentődik.
  Akkor hasznos, ha a `storeId` generált (különben minden mountnál elveszne a mentett állapot),
  vagy ha két táblázat szándékosan ugyanazon a mentett állapoton osztozik. Az üres vagy csak
  szóközből álló érték „nincs beállítva"-ként számít, és a származtatott kulcsra esik vissza.
  `disableSession: true` mellett nincs hatása. Érdemes **táblázatonként** (propként) megadni —
  egy globális érték hatására az oldal minden táblázata ugyanabba a kulcsba írna.
- **Példa:**

    ```typescript
    <Aura store-id="users-table" session-key="users-state" />
    ```

##### `sliceEndText`

- **Típus:** `string`
- **Alapértelmezett:** `'...'`
- **Leírás:** Szöveg vágás végén megjelenő karakterek
- **Példa:**

    ```typescript
    app.use(Aura, { sliceEndText: '…' });
    ```

##### `emptyStateMessage` (elavult)

- **Típus:** `string`
- **Alapértelmezett:** `'No data available to display.'`
- **Állapot:** ⚠️ **Elavult** — helyette a [`labels.emptyState`](#labels) használandó, hogy minden
  beépített UI-szöveg egy kulcs alatt legyen. Továbbra is működik, és `1.0` előtt **nem** tervezett
  az eltávolítása; ha mindkettő meg van adva, a `labels.emptyState` nyer.
- **Leírás:** Az az üzenet, amely akkor jelenik meg, ha a táblázat betöltött, de nincs
  megjeleníthető sora. A tábla teljes szélességét átfogó üres sorban renderelődik.
- **Példa:**

    ```typescript
    // Elavult
    app.use(Aura, { emptyStateMessage: 'Nincs találat.' });

    // Javasolt
    app.use(Aura, { labels: { emptyState: 'Nincs találat.' } });
    ```

##### `allowExternalApi`

- **Típus:** `boolean`
- **Alapértelmezett:** `false`
- **Leírás:** Külső (cross-origin) API-hívások engedélyezése. Alapértelmezetten
  (`false`) a `fetchData` **blokkolja** azokat a kéréseket, amelyek az aktuális
  oldal origin-jétől eltérő origin-re mutatnának (más protokoll, host vagy port);
  ilyenkor `authorization` típusú hiba kerül az error store-ba, és az axios-hívás
  nem indul el. A same-origin (relatív vagy azonos origin-ű abszolút) kérések
  mindig engedélyezettek. Külső API használatához állítsd `true`-ra.
- **Példa:**

    ```typescript
    app.use(Aura, { allowExternalApi: true });
    ```

##### `errorReporting`

- **Típus:** `boolean`
- **Alapértelmezett:** `false`
- **Leírás:** Távoli error reporting engedélyezése
- **Példa:**

    ```typescript
    app.use(Aura, {
        errorReporting: true,
        errorReportingEndpoint: 'https://api.example.com/errors',
        errorReportingService: 'custom',
    });
    ```

##### `errorReportingEndpoint`

- **Típus:** `string`
- **Alapértelmezett:** `undefined`
- **Leírás:** Custom error reporting endpoint URL (kötelező custom service esetén)
- **Példa:**

    ```typescript
    app.use(Aura, {
        errorReporting: true,
        errorReportingEndpoint: 'https://api.example.com/errors',
    });
    ```

##### `errorReportingService`

- **Típus:** `'sentry' | 'logrocket' | 'rollbar' | 'custom'`
- **Alapértelmezett:** `'custom'`
- **Leírás:** Error reporting szolgáltatás típusa.
- **⚠️ Megjegyzés:** Pontosan **egy transzport** létezik: POST az
  `errorReportingEndpoint`-ra. A `'sentry'`, `'logrocket'` és `'rollbar'`
  elfogadott érték (az unió API-stabilitás miatt megmaradt), de **nincs mögöttük
  SDK-integráció** — ha ezek egyikét állítod be, nem blokkoló **warning banner**
  jelenik meg, a reporter pedig a te endpointodra küld, pontosan úgy, mint a
  `'custom'`. A visszaesés **valódi**, nem csak egy config-érték: semmi nem
  vész el némán, endpoint hiányában pedig a sikertelen küldés az
  `errorReporting.failed` kulcs alatt jelenik meg.
- **Példa:**

    ```typescript
    app.use(Aura, {
        errorReporting: true,
        errorReportingService: 'custom',
        errorReportingEndpoint: 'https://api.example.com/errors',
    });
    ```

##### `errorReportingApiKey`

- **Típus:** `string`
- **Alapértelmezett:** `undefined`
- **Leírás:** API kulcs az error reporting szolgáltatáshoz (opcionális). A `custom`
  szolgáltatásnál `Authorization: Bearer <apiKey>` fejlécként megy ki az
  `errorReportingEndpoint`-ra.
- **🔒 Biztonsági figyelmeztetés:** ez az érték a **kliensoldali bundle-ba kerül**, és
  minden hálózati kérésben a böngészőből küldődik — tehát **nyilvánosan látható**
  (DevTools, forráskód). **Ne használj** ide titkos/privilegizált kulcsot. Adj meg
  helyette egy **kizárólag error-ingest jogosultságú, publikus** tokent (mint egy
  Sentry DSN), vagy hagyd el a mezőt, és **proxyzd** a kéréseket egy saját backend
  endpointon át, amely szerveroldalon fűzi hozzá a titkos kulcsot.
- **Példa:**

    ```typescript
    app.use(Aura, {
        errorReporting: true,
        errorReportingEndpoint: 'https://api.example.com/errors',
        errorReportingApiKey: 'public-ingest-token', // NEM titkos kulcs!
    });
    ```

#### Raw HTML konfiguráció

Ezek a beállítások a `raw: true` cellák render-idejű sanitizálását (`formatRaw`,
DOMPurify whitelist) vezérlik. Az alapértelmezés a korábbi hardcode-olt viselkedést
őrzi (a `style` engedélyezett); a host felül tudja írni — pl. a `style` tiltásához
adj meg `rawHtmlAllowedAttr`-t `style` nélkül.

> **🔒 A sanitizálás nem kapcsolható ki.** Az egyetlen szabályozó a whitelist: ha hiányzik egy
> markup-forma, bővítsd a `rawHtmlAllowedTags` / `rawHtmlAllowedAttr` listát. Nincs
> „változatlanul renderelem" mód, tehát semmilyen konfigurációval nem kerülhet sanitizálatlan
> válasz-HTML a DOM-ba.

> **🔒 `target="_blank"` biztonság:** a `raw: true` HTML-ben minden
> `<a target="_blank">` horgony automatikusan megkapja a `rel="noopener noreferrer"`
> tokeneket (reverse-tabnabbing + referrer-védelem), a meglévő `rel` értékek
> megtartásával — akkor is, ha a mező szerepel a `rawHtmlAllowedAttr` listán.

> **Nincs globális DOMPurify-mellékhatás.** A `rel`-kikényszerítés DOMPurify-horog, az
> `isomorphic-dompurify` pedig egyetlen megosztott példányt exportál — pontosan azt, amit egy
> ugyanezt a csomagot használó hoszt is kap. Az Aura ezért **csak a saját `sanitize()` hívása
> köré** regisztrálja a horgot, és közvetlenül utána el is távolítja, tehát a te
> `DOMPurify.sanitize()` hívásaid eredményét nem módosítja. A magad regisztrálta horgok
> érintetlenül a helyükön maradnak.

##### `rawHtmlAllowedTags`

- **Típus:** `string[]`
- **Alapértelmezett:** `['b', 'i', 'u', 'strong', 'em', 'span', 'br', 'p', 'a']`
- **Leírás:** A `raw: true` cellákban engedélyezett HTML tag-ek (DOMPurify `ALLOWED_TAGS`). A veszélyes tag-eket (pl. script, iframe) a DOMPurify mindig eltávolítja.
- **Példa:**

    ```typescript
    app.use(Aura, { rawHtmlAllowedTags: ['b', 'i', 'span'] });
    ```

##### `rawHtmlAllowedAttr`

- **Típus:** `string[]`
- **Alapértelmezett:** `['href', 'target', 'title', 'class', 'style', 'rel']`
- **Leírás:** A `raw: true` cellákban engedélyezett HTML attribútumok (DOMPurify `ALLOWED_ATTR`). A `style` alapból engedélyezett; tiltásához hagyd ki a listából.
- **Példa:**

    ```typescript
    // style tiltása a raw cellákban:
    app.use(Aura, { rawHtmlAllowedAttr: ['href', 'target', 'title', 'class', 'rel'] });
    ```

##### `rawHtmlAllowDataAttr`

- **Típus:** `boolean`
- **Alapértelmezett:** `true`
- **Leírás:** Engedélyezi-e a `data-*` attribútumokat a 'raw' típusú cellákban.
- **Példa:**

    ```typescript
    app.use(Aura, { rawHtmlAllowDataAttr: false });
    ```

## Store API Referencia

### useApiResourcesStore

Az Aura egységes store architektúrát használ az API válaszok kezelésére. Az `useApiResourcesStore` közvetlenül tárolja az összes response adatot (header, body, footer, items, meta, links).

#### Inicializálás

```typescript
import { useApiResourcesStore } from '@tamas-labs/aura';
import { useCoreStore } from '@tamas-labs/aura';

// Core store létrehozása
const coreStore = useCoreStore('my-table', {
    siteName: 'My App',
    urlStructure: '{siteName}/api/{urlParameter}',
    urlParameter: 'users'
});

// API Resources store létrehozása
const apiStore = useApiResourcesStore('my-table', coreStore);
```

#### Store Properties

- **`loading`** (`boolean`) - Van-e folyamatban `fetchData` kérés. Átfedő kérések esetén csak az
  utolsó lezárultakor vált vissza `false`-ra, és minden kimenetnél felszabadul, a hibát is beleértve.
  Köthető rá saját hoszt-oldali indikátor, vagy rábízható a beépített
  [`showLoadingOverlay`](#showloadingoverlay)-re.
- **`header`** (`Header | null`) - Táblázat fejléc adatok
- **`body`** (`Body | null`) - Táblázat törzs konfigurációk
- **`footer`** (`Footer | null`) - Táblázat lábléc adatok
- **`items`** (`unknown[] | null`) - Táblázat sorok (nyers API adatok)
- **`displayItems`** (`unknown[] | null`) - Megjelenítendő sorok (szűrt, rendezett, paginált)
- **`meta`** (`PaginationMeta | null`) - Laravel pagination meta (nyers API)
- **`displayMeta`** (`PaginationMeta | null`) - Számított pagination meta (client-side pagination esetén)
- **`links`** (`PaginationLinks | null`) - Laravel pagination links
- **`displayFooter`** (`Header | Footer | null`) - Számított footer (fallback: header konfiguráció)
- **`queryParams`** (`QueryParams`) - API query paraméterek (page, paginate, sortable, searchable, filterable, globalSearch)
- **`autoRefetch`** (`boolean`) - Automatikus újra-lekérdezés engedélyezése. Ha be van kapcsolva és
  az [`externalPaginator`](#externalpaginator) `true`, akkor a `queryParams` minden változása új
  kérést indít - lapozás, lapméret-váltás, és minden rendezés-, keresés-, tartomány- vagy
  szűrő-módosítás, azokat is beleértve, amelyek meglévő szabályt írnak át új felvétele helyett
  (rendezés asc→desc váltása, fejléc-keresés finomítása az első leütés után, szűrőértékek cseréje,
  tartomány egyik határának mozgatása). Az azonos tickben egymást kioltó módosítások nem küldenek
  kérést. Állítsd `false`-ra, ha több szabályt akarsz megváltoztatni, majd egyetlen explicit
  `fetchData()`-val lekérni őket.
- **`sortItems`** (`SortItem[]`) - Aktív rendezési szabályok
- **`searchItems`** (`SearchItem[]`) - Aktív keresési szűrők
- **`filterItems`** (`FilterItem[]`) - Aktív érték alapú szűrők (checkbox/dropdown)
- **`globalSearchTerm`** (`string | null`) - Globális keresés kifejezés

#### Store Methods

##### `fetchData()`

API hívás végrehajtása és válasz feldolgozása.

```typescript
await apiStore.fetchData();

// Hozzáférés az adatokhoz
console.log(apiStore.items); // [{ id: 1, name: 'John' }, ...]
console.log(apiStore.displayItems); // Szűrt/rendezett/paginált elemek
console.log(apiStore.header?.rows); // [{ cells: [...] }]
```

**Mindig a legutolsó hívás nyer.** Egy új kérés indítása megszakítja a még úton lévőt
(`AbortController`), a korábbi hívásokat pedig elavultnak jelöli — így a sorrenden kívül visszaérő
válasz sem az újabb sorokat nem írhatja felül, sem a saját hibáját nem jelentheti föléjük: a
megszakított kérés soha nem jelenik meg hibaként. E nélkül két gyors lapváltásnál, lassú
kapcsolaton a felhasználó a 2. oldalon állhatott, miközben az 1. oldal sorait látta.

##### `processResponse(response: ApiResponse)`

API válasz manuális feldolgozása és validálása.

```typescript
const response = {
    header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
    items: [{ id: 1, name: 'John' }],
    meta: { current_page: 1, total: 100, per_page: 10 }
};

await apiStore.processResponse(response);
```

##### `clearResponse()`

Minden store adat törlése (null-ra állítása).

```typescript
apiStore.clearResponse();

console.log(apiStore.items); // null
console.log(apiStore.header); // null
```

##### `setPage(page: number)`

Aktuális oldal beállítása.

```typescript
apiStore.setPage(3);
```

##### `setLimit(limit: number)`

Oldalankénti elemszám beállítása (page automatikusan 1-re áll).

```typescript
apiStore.setLimit(25);
```

##### Rendezés (Sorting)

```typescript
// Rendezés hozzáadása
apiStore.addSort('name', 'asc');

// Rendezési irány módosítása
apiStore.updateSortDirection('name', 'desc');

// Rendezés eltávolítása
apiStore.removeSort('name');

// Összes rendezés törlése
apiStore.clearAllSorts();

// Rendezési irány lekérdezése
const direction = apiStore.getSortDirection('name'); // 'asc' | 'desc' | null
```

##### Oszlop keresés (Column Search)

```typescript
// Keresés hozzáadása (üres term automatikusan törli)
apiStore.addSearch('name', 'John');
apiStore.addSearch('email', 'test@example.com', true); // exact match

// Keresési kifejezés módosítása
apiStore.updateSearchTerm('name', 'Jane');

// Keresés eltávolítása
apiStore.removeSearch('name');

// Összes keresés törlése
apiStore.clearAllSearches();

// Keresési kifejezés lekérdezése
const term = apiStore.getSearchTerm('name'); // string | null
```

##### Szűrés (Filter)

A szűrés lehetővé teszi specifikus értékek kiválasztását (pl. dropdown, checkbox lista).

```typescript
// Szűrő hozzáadása (field, values)
apiStore.addFilter('status', ['active', 'pending']);
apiStore.addFilter('role', ['admin', 'manager']);

// Szűrő értékeinek frissítése
apiStore.updateFilterValues('status', ['inactive']);

// Szűrő eltávolítása egy adott mezőről
apiStore.removeFilter('status');

// Összes szűrő törlése
apiStore.clearAllFilters();

// Jelenlegi szűrőértékek lekérdezése
const statusFilters = apiStore.getFilterValues('status'); // ['active', 'pending'] vagy null
```

##### Globális keresés (Global Search)

```typescript
// Globális keresés beállítása
apiStore.setGlobalSearch('John');

// Globális keresés törlése
apiStore.clearGlobalSearch();

// Aktuális kifejezés
console.log(apiStore.globalSearchTerm); // 'John' | null
```

#### Példa: Teljes munkafolyamat

```typescript
import { useCoreStore, useApiResourcesStore } from '@tamas-labs/aura';

// 1. Store-ok inicializálása
const core = useCoreStore('users-table', {
    siteName: 'https://api.example.com',
    urlParameter: 'users'
});

const api = useApiResourcesStore('users-table', core);

// 2. Adatok lekérése
await api.fetchData();

// 3. Adatok használata
if (api.items) {
    console.log(`${api.items.length} user found`);
}

// 4. Header elérése
const columns = api.header?.rows[0]?.cells || [];
console.log('Columns:', columns.map(c => c.content));

// 5. Pagination használata
if (api.meta) {
    console.log(`Page ${api.meta.current_page} of ${api.meta.last_page}`);
}

// 6. Adatok törlése
api.clearResponse();
```

### ⚠️ Breaking Changes (v0.1.0+)

#### Store architektúra egyszerűsítése

A korábbi 3-szintű store hierarchia helyett most **1-szintű architektúrát** használunk:

**Régi (deprecated):**

```typescript
// ❌ ELAVULT - NE HASZNÁLD
const apiStore = useApiResourcesStore('my-table', core);
const header = apiStore.tableData?.response?.header;
const items = apiStore.tableData?.response?.items;
```

**Új (v0.1.0+):**

```typescript
// ✅ ÚJ - HASZNÁLD EZT
const apiStore = useApiResourcesStore('my-table', core);
const header = apiStore.header;
const items = apiStore.items;
```

#### Eltávolított store-ok

A következő store-ok már **nem érhetők el**:

- `useResponseStore` - megszűnt, funkciója beépült `useApiResourcesStore`-ba
- `useHeaderStore` - megszűnt
- `useBodyStore` - megszűnt
- `useFooterStore` - megszűnt
- `useItemsStore` - megszűnt

#### Migrációs útmutató

| Régi kód | Új kód |
|----------|--------|
| `apiStore.tableData.response.header` | `apiStore.header` |
| `apiStore.tableData.response.body` | `apiStore.body` |
| `apiStore.tableData.response.footer` | `apiStore.footer` |
| `apiStore.tableData.response.items` | `apiStore.items` |
| `headerStore.processHeader(data)` | `apiStore.processResponse(data)` |
| `bodyStore.setBody(data)` | `apiStore.processResponse({ body: data })` |

#### Error Store változás

A központi error store azonosító is megváltozott:

| Régi | Új |
|------|-----|
| `${storeId}-header-errors` | `${storeId}-errors` |
| `${storeId}-body-errors` | `${storeId}-errors` |
| ... | `${storeId}-errors` |

**Miért jó ez?**

- ✅ Egyszerűbb API
- ✅ Kevesebb store instance
- ✅ Jobb teljesítmény
- ✅ Könnyebb hibakezelés
- ✅ Egységes error store

## API Response Struktúra

Az Aura komponens szabványosított JSON válaszstruktúrát vár az API-tól. Ez a struktúra öt fő részből áll:

1. **Header**: Táblázat fejléce, oszlop definíciók
2. **Body**: Táblázat törzs konfigurációk
3. **Footer**: Lábléc (opcionális)
4. **Items**: Adatsorok
5. **Meta & Links**: Laravel paginációs adatok

Exhaustive típusdefiníciókért lásd a [src/types/api-response.types.ts](src/types/api-response.types.ts) fájlt.

### Cella Konfigurációs Típusok (cell.types.ts)

A cella konfigurációk hierarchikusan épülnek fel:

| Interface | Leírás |
|-----------|--------|
| `BaseCellConfig` | Közös cella tulajdonságok (key, width, colspan, rowspan, align, color, background, typography, CSS) |
| `HeaderCellConfig` | Header cellák (`extends BaseCellConfig`) — label, content, field, sortable, searchable, filterable, elements, raw |
| `BodyCellConfig` | Body cellák (`extends BaseCellConfig`) — type, slice, number, currency, date, phone, raw, padding |
| `FooterCellConfig` | Footer cellák (`extends BaseCellConfig`) — label, content |

```typescript
import type { HeaderCellConfig, BodyCellConfig } from '@tamas-labs/aura';

const headerCell: HeaderCellConfig = {
    key: 'name',
    label: 'Név',
    field: 'name',
    sortable: true,
    searchable: true,
    align: 'start',
};

const bodyCell: BodyCellConfig = {
    key: 'price',
    type: 'static',
    currency: 'HUF',
    number: true,
    align: 'end',
};
```

### Példa API Válasz

```json
{
    "header": {
        "rows": [
            {
                "cells": [
                    { "content": "ID", "key": "id", "field": "id", "sortable": true, "width": "60px" },
                    { "content": "Name", "key": "name", "field": "name", "searchable": true },
                    { "content": "Status", "key": "status", "field": "status", "type": "badge" }
                ]
            }
        ],
        "settings": {
            "sticky": true
        }
    },
    "body": {
        "columnConfigs": {
            "status": {
                "type": "badge",
                "mapping": {
                    "active": { "variant": "success", "label": "Aktív" },
                    "inactive": { "variant": "secondary", "label": "Inaktív" }
                }
            }
        }
    },
    "items": [
        { "id": 1, "name": "John Doe", "status": "active" },
        { "id": 2, "name": "Jane User", "status": "inactive" }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 5,
        "total": 50,
        "per_page": 10
    }
}
```

### Oszlop Típusok (Body Column Configs)

A `body.columnConfigs` objektumban definiálhatók speciális oszlop viselkedések:

- **static**: Fix szöveg megjelenítése
- **icon**: Ikon megjelenítése
- **modal**: Bootstrap 5 modal trigger (ikon, gomb vagy link formában)
- **link**: Kattintható link
- **badge**: Bootstrap badge (mapping támogatással)
- **progress**: Progress bar
- **button**: Interaktív gomb
- **custom**: Egyedi renderelés
- **reference**: Hivatkozás más mezőkre

#### `static` Típus — Vizuális Formázás (`ContentFormattingOptions`)

A `static` oszloptípus a fix szöveg tartalom mellett teljes körű vizuális CSS formázást is támogat. A formázás a renderelt tartalmon (`<span>` elem) kerül alkalmazásra — elkülönítve a cella (`<td>`) szintű formázástól.

**Szín és háttér**

| Mező         | Típus     | Bootstrap szín → osztály          | CSS érték → inline stílus     | Példa                          |
| ------------ | --------- | --------------------------------- | ----------------------------- | ------------------------------ |
| `color`      | `string`  | `text-{szín}` (pl. `text-primary`) | `color: '#ff0000'`           | `"primary"`, `"#ff0000"`     |
| `background` | `string`  | `bg-{szín}` (pl. `bg-success`)    | `backgroundColor: '#e0e0e0'` | `"success"`, `"#e0e0e0"`     |

> Elfogadott Bootstrap színek: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark` és variánsaik (`-subtle`, `-emphasis`).
> A `color` esetén csak Bootstrap színek engedélyezettek (Zod validáció). A `background` elfogad CSS értékeket is (hex, rgb, CSS szín nevek).

**Tipográfia**

| Mező         | Típus               | Leírás                                                        | Példa                             |
| ------------ | ------------------- | ------------------------------------------------------------- | --------------------------------- |
| `fontSize`   | `string`            | CSS font-size érték                                           | `"14px"`, `"1rem"`, `"small"`  |
| `fontWeight` | `string \| number`  | CSS font-weight (100–900 vagy kulcsszó)                       | `700`, `"bold"`, `"lighter"`   |
| `italic`     | `boolean`           | Dőlt betű (`fontStyle: italic`)                               | `true`                            |
| `normal`     | `boolean`           | Álló betű (`fontStyle: normal`) — az `italic` explicit visszaállítása; ha mindkettő igaz, a `normal` nyer | `true`                            |
| `lineHeight` | `string \| number`  | CSS sor köz                                                   | `"1.5"`, `"24px"`, `1.5`       |
| `monospace`  | `boolean`           | Monospace betűtípus (`font-monospace` Bootstrap osztály)      | `true`                            |

**Szöveg és osztályok**

| Mező    | Típus               | Leírás                                                               | Példa                          |
| ------- | ------------------- | -------------------------------------------------------------------- | ------------------------------ |
| `text`  | `string`            | Bootstrap text utility osztály (kötelező `text-` előtag)             | `"text-truncate"`, `"text-nowrap"` |
| `class` | `string \| string[]`| Extra CSS osztályok (string szóközzel elválasztva, vagy tömb)        | `"fw-bold pe-1"`, `["fw-bold"]` |
| `style` | `string`            | Inline CSS string (kebab-case → camelCase parse-olva)                | `"margin-left: 8px"`           |
| `align` | `string`            | Szöveg igazítás: `"start"` \| `"center"` \| `"end"`               | `"center"`                    |

**Értékformázás** (azonos a többi column type-nál elérhető mezőkkel)

A `static` típus minden, a [Cell Formatting](#cell-formatting) szekcióban leírt értékformázási mezőt támogat: `number`, `currency`, `date`, `datetime`, `phone`, `time`, `raw`, `slice`, `sliceEnd`, `pad`, `padStart`, `padEnd`, `chars`, `uppercase`, `lowercase`, `capitalize`, `monospace`.

**Példa: Teljes `static` konfiguráció**

```json
{
    "body": {
        "columnConfigs": {
            "prefix": {
                "type": "static",
                "value": "ID:",
                "color": "primary",
                "fontWeight": 700,
                "fontSize": "13px",
                "italic": false,
                "monospace": true,
                "class": "pe-1",
                "text": "text-nowrap"
            },
            "score": {
                "type": "static",
                "key": "score",
                "number": true,
                "padStart": 5,
                "chars": "0",
                "monospace": true,
                "if": [
                    { "gte": 90, "color": "success", "fontWeight": 700 },
                    { "lt":  50, "color": "danger",  "italic": true }
                ],
                "else": { "color": "secondary" }
            }
        }
    }
}
```

> **Megjegyzés:** A vizuális formázási mezők (`color`, `background`, `fontSize`, stb.) a `<span>` tartalomelemre kerülnek alkalmazásra, nem a `<td>` cellára. A cella szintű formázáshoz használd a `cellRules` mezőt.

#### `icon` Típus — Ikon Megjelenítés

Az `icon` oszloptípus egy config-alapú ikon megjelenítésére szolgál. Az ikon CSS osztályait a `class` mező tartalmazza — a renderelési réteg kizárólag ezt olvassa.

> **Preprocessor réteg (⑦.5):** Az ikon megjelenítés előtt a response preprocesszor automatikusan elvégzi a következő transzformációkat:
> - **Auto-generálás:** Ha egy header cellában `_icon` suffixes field szerepel (pl. `switch_user_icon`) és az nem szerepel az `items`-ben (nem valódi adat), a preprocesszor automatikusan létrehoz egy `columnConfigs` bejegyzést — nincs szükség manuális konfigurálásra.
> - **Normalizálás:** Ha a config `icon` / `variant` / `color` mezőket tartalmaz — akár a config gyökerén, akár egy `if`/`else` ágban, akár egy `mapping` bejegyzésen belül —, a preprocesszor ezeket a regisztráció keresési lánc alapján feloldja és `class` tömbbé konvertálja, majd az eredeti mezőket törli. A renderelési réteg tehát mindig tisztán `class`-alapú configot kap.

**Kötelezőség szabály:** A `class` mező megadása kötelező — kivéve, ha `icon`/`variant`/`color`, `mapping`, vagy `if`/`else` feltételes ágak is jelen vannak, illetve ha a preprocesszor automatikusan kitölti.

**Érték-alapú megjelenítés (`mapping`):** a `mapping` egy érték→ikon-config szótár — tömörebb alternatíva az azonos célú `if`/`else` `eq`-láncnál enum-szerű értékekhez (pl. státusz → glyph + variant), ugyanazzal a szemantikával, mint a `badge` (ld. lentebb) mapping-je. A feloldás mindig az `if`/`else` lapítás **után** fut — ha mindkettő szerepel, előbb az `if`/`else` választ ágat, és az ág (vagy az onnan örökölt gyökér-) `mapping`-je érvényesül a lapított configon.

**Mezők**

| Mező       | Típus                 | Kötelező | Leírás                                                                            | Példa                                    |
| ---------- | --------------------- | -------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| `type`     | `'icon'`              | ✅        | Típus azonosító (literal)                                                         | `"icon"`                                 |
| `class`    | `string \| string[]`  | ⚠️*       | CSS osztályok; preprocesszor tölti ki `icon`/`variant`/`color` alapján, ha nincs megadva | `["fa-regular", "fa-trash-can", "text-danger"]` |
| `icon`     | `string`              | ❌        | Ikon neve a `config.icons`-ból; a preprocesszor `class`-ba konvertálja render előtt; max 250 karakter | `"check"`, `"edit"`, `"trash"` |
| `variant`  | `string`              | ❌        | Bootstrap szín VAGY `config.variants` registry kulcs; a preprocesszor `text-{szín}` osztállyá konvertálja; **Validació:** csak azonosító formátum (`[a-zA-Z][a-zA-Z0-9_-]*`), CSS szintaxis tiltott (`#fff`, `rgb(...)`) | `"primary"`, `"show"`, `"destroy"` |
| `color`    | `string`              | ❌        | `variant` alternatívája; azonos preprocesszor feloldási lánc és validaciós szabály | `"warning"`, `"info"`, `"edit"`          |
| `size`     | `string`              | ❌        | Ikon méret: `"xs"` \| `"sm"` \| `"md"` \| `"lg"` \| `"xl"`                  | `"sm"`, `"lg"`                          |
| `alt`      | `string`              | ❌        | Alternatív szöveg (akadálymentesség); max 500 karakter                            | `"Szerkesztés"`                          |
| `title`    | `string`              | ❌        | Tooltip szöveg; max 500 karakter                                                  | `"Törlés"`                              |
| `route`    | `string`              | ❌        | URL template; pont-elválasztók `/`-re konvertálódnak, `{kulcs}` helyőrzők az sor adataiból feloldódnak, majd `siteName` előtaggal egészül ki; max 1000 karakter | `"users.{id}.edit"`, `"/users/{id}/edit"` |
| `style`    | `string`              | ❌        | Inline CSS string (kebab-case → camelCase parse-olva)                             | `"margin-left: 4px"`                    |
| `mapping`  | `object`              | ❌        | Érték → `{ icon, variant, color, class, title, alt }` leképezés (exact match, `field ?? key` szelektor); a talált entry a config fölé merge-elődik; entry-kulcsok nested-strip-elve a security boundary-nál | *(ld. lent)* |
| `cellRules`| `CellRules`           | ❌        | Feltételes `<td>` cellaformázás                                                   | *(ld. Feltételes Formázás szekció)*       |
| `key`      | `string`              | ❌        | Az `items` adat-mező neve; ha `route`-tal együtt van megadva és az `item` adat is elérhető, `<a>` wrapper generálódik; feltételes kiértékeléshez is szükséges; a `mapping` szelektora is ezt olvassa, ha nincs `field` | `"id"`, `"status"` |
| `if`       | `object[]`            | ❌        | Feltételes ágak tömbje                                                            | *(ld. Feltételes Renderelés szekció)*    |
| `else`     | `object`              | ❌        | Fallback konfig ha egyetlen `if` ág sem egyezik                                   | *(ld. Feltételes Renderelés szekció)*    |
| `data-*`   | `string \| number`    | ❌        | Tetszőleges `data-` attribútum; `DataAttributeValueZod`-dal validálva             | `"data-id": 42`                         |

> ⚠️* A `class` kötelező — kivéve ha `icon`/`variant`/`color` van megadva (preprocesszor kitölti), vagy feltételes (`if`/`else`) konfig esetén.

**Auto-generálás `_icon` suffix alapján**

Ha egy header cellában `_icon`-ra végződő field szerepel (pl. `switch_user_icon`) és a field nem valódi adat mező (nem szerepel az `items`-ben), a preprocesszor (⑦.5) automatikusan létrehozza a `columnConfigs` bejegyzést:

```json
// API válasz — nincs body megadva, a switch_user_icon nem szerepel az items-ben
{
    "header": {
        "rows": [{ "cells": [
            { "content": "Switch User", "field": "switch_user_icon" }
        ]}]
    },
    "items": [{ "id": 1, "name": "Alice" }]
}
```

```typescript
// aura.config.ts — icon/variant registry
icons:    { switchUser: ['fas', 'fa-user-secret'], primary: ['fas', 'fa-file'] }
variants: { switchUser: 'warning', primary: 'secondary' }
```

```json
// Preprocesszor (⑦.5) automatikusan előállítja:
{
    "columnConfigs": {
        "switch_user_icon": {
            "type": "icon",
            "class": ["fas", "fa-user-secret", "text-warning"],
            "alt": "Switch User",
            "title": "Switch User"
        }
    }
}
```

**Speciális `_icon` mezők (beépített útvonal-automatizmus)**

A **prefix** (a `_icon` előtti rész) egyben az icon/variant registry kulcsa is, így a megfelelő glyph automatikusan kijön. Néhány **beépített prefix** ráadásul fix Laravel-resource útvonalat is kap — az útvonalak a `config.urlParameter`-hez (a `{current_url}` megfelelője) képest generálódnak, a cella **`key`** mezője az URL-placeholder (alapértelmezett `id`):

| Field | Generált típus | Útvonal |
| --- | --- | --- |
| `create_icon` | `icon` link | `{base}/create` |
| `edit_icon` | `icon` link | `{base}/{key}/edit` |
| `show_icon` | `icon` link | `{base}/{key}` |
| `destroy_icon` | **`modal`** (beépített `destroyModal` trigger) | `{base}/{key}/destroy` |
| egyéb (pl. `status_icon`) | `icon` (csak glyph) | – (nem navigál) |

```json
// header: { "cells": [ { "content": "Edit", "key": "id", "field": "edit_icon" },
//                       { "content": "Delete", "key": "id", "field": "destroy_icon" } ] }
// urlParameter: "admin/users" → preprocesszor (⑦.5) előállítja:
{
    "columnConfigs": {
        "edit_icon": {
            "type": "icon",
            "class": ["fas", "fa-pen-to-square", "text-secondary"],
            "alt": "Edit", "title": "Edit",
            "key": "id", "route": "admin/users/{id}/edit"
        },
        "destroy_icon": {
            "type": "modal", "id": "destroyModal",
            "key": "id", "route": "admin/users/{id}/destroy",
            "content": { "type": "icon", "class": ["fas", "fa-trash-can", "text-danger"], "alt": "Destroy", "title": "Destroy" }
        }
    }
}
```

> **Eltérés a `_link`-től:** az `_icon`-nál **csak a 4 beépített prefix** (create/edit/show/destroy) kap útvonalat — a generikus `_icon` (pl. `status_icon`) állapot-glyph marad, nem navigál. (A `_link`-nél minden prefix kapott URL-t.)

**Normalizálás `icon`/`variant`/`color` mezőkből**

Az API-ban küldött `icon` / `variant` / `color` mezőket a preprocesszor a render előtt osztályokká alakítja:

```json
// API válasz body
{
    "columnConfigs": {
        "show": {
            "type": "icon",
            "icon": "show",
            "variant": "info",
            "alt": "Show",
            "key": "id",
            "route": "users.{id}.show"
        }
    }
}
```

```json
// Preprocesszor (⑦.5) normalizálás után (renderelési réteg ezt kapja):
{
    "columnConfigs": {
        "show": {
            "type": "icon",
            "class": ["fas", "fa-eye", "text-info"],
            "alt": "Show",
            "key": "id",
            "route": "users.{id}.show"
        }
    }
}
```

**Renderelt HTML kimenet**

Az `icon` típus egy `<i>` elemet generál. Ha `route`, `key` és az `item` adat is elérhető, az ikon `<a>` wrapperbe kerül. Az URL felépítése három lépésben történik:

1. `{kulcs}` helyőrzők feloldása az aktuális sor adataiból
2. Pontok (`.`) átalakítása `/` karakterré
3. `config.siteName` előtagként való hozzáfűzése

```html
<!-- route nélkül -->
<i class="fa-regular fa-trash-can ms-1 text-danger" title="Törlés" aria-label="Törlés"></i>

<!-- route + key + item adat esetén -->
<!-- siteName: "https://myapp.com", route: "users.{id}.edit", item: { id: 42 } -->
<a href="https://myapp.com/users/42/edit">
    <i class="fas fa-pencil text-primary" title="Szerkesztés" aria-label="Szerkesztés"></i>
</a>

<!-- siteName nélkül: leading slash-sel kezdő relatív útvonal -->
<!-- route: "users.{id}.edit", item: { id: 42 } -->
<a href="/users/42/edit">
    <i class="fas fa-pencil text-primary" title="Szerkesztés" aria-label="Szerkesztés"></i>
</a>
```

> **Megjegyzés:** Az `<a>` wrapper csak akkor jön létre, ha a `route`, a `key` és az `item` adat is rendelkezésre áll. Ha csak `route` van megadva `key` nélkül, kizárólag `<i>` elem keletkezik.

**Icon registry feloldási lánc** *(preprocesszor végzi — render előtt)*

Az `icon` mező a `config.icons` registry-ből keresi ki a CSS osztályokat:

1. `icon` neve megtalálható a registry-ben → registry CSS osztályok alkalmazása
2. `icon` neve **nem** szerepel a registry-ben, de `icons.primary` létezik → `icons.primary` fallback osztályok
3. `icons.primary` sem létezik → nincs ikon osztály

```typescript
// aura.config.ts — icon registry
icons: {
    primary: ['fas', 'fa-file'],   // fallback minden ismeretlen ikonnévhez
    edit:    ['fas', 'fa-pencil'],
    destroy: ['fas', 'fa-trash'],
    show:    ['fas', 'fa-eye'],
}
```

**Variant registry feloldási lánc** *(preprocesszor végzi — render előtt)*

A `variant` / `color` mező tetszőleges string kulcs lehet — a `config.variants` regiszterből oldódik fel Bootstrap szín névre:

1. A kulcs megtalálható `config.variants`-ban → `text-{feloldott szín}` osztály (pl. `show` → `info` → `text-info`)
2. A kulcs **nem** szerepel `config.variants`-ban → `variants.primary` fallback (pl. `text-primary`)
3. Nincs `config.variants` registry → az érték közvetlen `text-{érték}` osztályként kerül alkalmazásra

```typescript
// aura.config.ts — variants registry
variants: {
    primary: 'primary',  // fallback minden ismeretlen variánshoz
    show:    'info',
    edit:    'warning',
    destroy: 'danger',
}
```

**Példa: Registry-alapú ikon és variáns**

```json
{
    "body": {
        "columnConfigs": {
            "show_action": {
                "type": "icon",
                "icon": "show",
                "variant": "show",
                "key": "id",
                "route": "products.{id}.show"
            }
        }
    }
}
```

> `icons.show = ['fas', 'fa-eye']` + `variants.show = 'info'` → `<i class="fas fa-eye text-info">`

**Példa: Egyszerű ikon dot-notation route-tal**

```json
{
    "body": {
        "columnConfigs": {
            "edit_action": {
                "type": "icon",
                "icon": "edit",
                "variant": "primary",
                "title": "Szerkesztés",
                "alt": "Szerkesztés",
                "key": "id",
                "route": "users.{id}.edit",
                "size": "sm"
            }
        }
    }
}
```

> `siteName: "https://myapp.com"` + `item.id = 5` → `href="https://myapp.com/users/5/edit"`

**Példa: CSS osztályos ikon**

```json
{
    "body": {
        "columnConfigs": {
            "delete_action": {
                "type": "icon",
                "class": ["fa-regular", "fa-trash-can", "text-danger"],
                "title": "Törlés",
                "size": "md"
            }
        }
    }
}
```

**Példa: Feltételes ikon**

```json
{
    "body": {
        "columnConfigs": {
            "status_icon": {
                "type": "icon",
                "key": "status",
                "if": [
                    { "eq": "active",   "icon": "check-circle", "variant": "success" },
                    { "eq": "inactive", "icon": "x-circle",     "variant": "danger"  }
                ],
                "else": { "icon": "help-circle", "variant": "warning" }
            }
        }
    }
}
```

**Példa: Mapping alapú ikon (érték → glyph + variant)**

Ugyanaz az eredmény, mint a fenti feltételes példa, de tömörebben — enum-szerű értékhez a `mapping` a preferált eszköz az `if`/`else` `eq`-lánc helyett:

```json
{
    "body": {
        "columnConfigs": {
            "status_icon": {
                "type": "icon",
                "key": "status",
                "mapping": {
                    "active":   { "icon": "check-circle", "variant": "success" },
                    "inactive": { "icon": "x-circle",     "variant": "danger"  },
                    "pending":  { "icon": "clock",         "variant": "warning" }
                }
            }
        }
    }
}
```

> No-match esetén (pl. `status: "archived"`) a `status_icon` a `mapping` nélküli config marad — mivel itt sem `class`, sem `icon` nincs a gyökéren, egy osztály nélküli, vizuálisan üres `<i>` elem renderelődik (nincs hiba, nincs adatvesztés). Adj meg gyökér-szintű `icon`/`class`-t fallbacknek, ha ez nem kívánt.

#### `modal` Típus — Bootstrap 5 Modal Trigger

A `modal` oszloptípus Bootstrap 5 modált megnyitó trigger elemet generál. A trigger háromféle formában jelenhet meg: **ikon** (`<i>` elem `<a>` wrapperben), **gomb** (`<button>`), vagy **link** (`<a href="#">`). A trigger minden esetben megkapja a `data-bs-toggle="modal"` és `data-bs-target="#{id}"` Bootstrap attribútumokat.

> **Preprocessor réteg (⑦.5):** A renderelés előtt a response preprocesszor (`normalizeModalConfigs`) elvégzi a shorthand mezők normalizálását:
> - Root szintű `icon`/`variant` mezők → `content: { type: "icon", class: [...feloldott...] }` objektum; `icon`/`variant`/`class` törlődik a root-ból
> - Root szintű `button`/`value`/`size` mezők → `content: { type: "button", variant, value, size }` objektum; `button`/`value`/`size` törlődik
> - Feltételes ágakban lévő flat `type: "icon"`/`type: "button"` → `content` objektummá alakul; az ág `type` mezője **törlésre kerül** (kritikus: megakadályozza a root `type: "modal"` felülírását merge-nél)
> - Beágyazott `content.type === "icon"` esetén az `icon`/`variant`/`color` mezők feloldódnak a registry alapján

**Kötelezőség szabály:** Az `id` mező kötelező — kivéve ha `if`/`else` feltételes ágak vannak megadva (akkor branch szinten adható meg). Trigger (`icon`, `button`, `content`) megadása szintén kötelező, kivéve feltételes config esetén.

**Mezők**

| Mező       | Típus                 | Kötelező | Leírás                                                                                                    | Példa                                           |
| ---------- | --------------------- | -------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `type`     | `'modal'`             | ✅        | Típus azonosító (literal)                                                                                 | `"modal"`                                       |
| `id`       | `string`              | ⚠️*       | A modal elem HTML azonosítója; `data-bs-target="#{id}"` értéke; max 250 karakter                         | `"edit-modal"`, `"confirm-dialog"`              |
| `icon`     | `string`              | ❌        | Shorthand ikon trigger; preprocesszor normalizálja `content: { type: "icon", ... }`-tá; max 250 karakter  | `"pencil"`, `"edit"`, `"trash"`                |
| `variant`  | `string`              | ❌        | Shorthand variáns az ikon triggerhez; azonosító formátum (`[a-zA-Z][a-zA-Z0-9_-]*`), CSS szintaxis tiltott | `"primary"`, `"danger"`, `"show"`            |
| `button`   | `string`              | ❌        | Shorthand gomb trigger stílusa; preprocesszor `content: { type: "button", variant: button_value }`-vé alakítja; max 100 karakter | `"danger"`, `"outline-primary"` |
| `value`    | `string`              | ❌        | Gomb / link szövege (shorthand `button` páros); max 1000 karakter                                        | `"Törlés"`, `"Megnyitás"`                      |
| `size`     | `string`              | ❌        | Trigger méret: `"xs"` \| `"sm"` \| `"md"` \| `"lg"` \| `"xl"`                                   | `"sm"`, `"lg"`                                |
| `target`   | `string`              | ❌        | Link target: `"_blank"` \| `"_self"` \| `"_parent"` \| `"_top"`                                   | `"_blank"`                                     |
| `content`  | `object`              | ❌        | Beágyazott trigger objektum: `{ type: "icon" \| "button" \| "link", ... }`; a preprocesszor tölti ki shorthand esetén | *(ld. példák)*                    |
| `route`    | `string`              | ❌        | URL template; `{kulcs}` placeholderek feloldódnak az sor adataiból, `.` → `/`; `siteName` prefix; a feloldott URL `data-route` attribútumként kerül a triggerre; max 1000 karakter | `"items.{id}.edit"` |
| `alt`      | `string`              | ❌        | Akadálymentességi szöveg (`aria-label`); max 500 karakter                                                | `"Szerkesztés"`                                |
| `title`    | `string`              | ❌        | Tooltip szöveg; max 500 karakter                                                                          | `"Elem törlése"`                               |
| `class`    | `string \| string[]` | ❌        | Extra CSS osztályok a trigger elemen                                                                      | `["ms-1"]`, `"fw-bold"`                        |
| `style`    | `string`              | ❌        | Inline CSS string                                                                                         | `"cursor: pointer"`                             |
| `key`      | `string`              | ❌        | Az `items` adat-mező neve — route placeholder feloldáshoz és feltételes kiértékeléshez                    | `"id"`, `"status"`                             |
| `cellRules`| `CellRules`           | ❌        | Feltételes `<td>` cellaformázás                                                                           | *(ld. Feltételes Formázás szekció)*              |
| `if`       | `object[]`            | ❌        | Feltételes ágak tömbje                                                                                    | *(ld. Feltételes Renderelés szekció)*            |
| `else`     | `object`              | ❌        | Fallback konfig ha egyetlen `if` ág sem egyezik                                                           | *(ld. Feltételes Renderelés szekció)*            |
| `data-*`   | `string \| number`   | ❌        | Tetszőleges `data-` attribútum; `DataAttributeValueZod`-dal validálva                                    | `"data-action": "open"`                        |

> ⚠️* Az `id` kötelező — kivéve `if`/`else` feltételes config esetén, ahol branch szinten is megadható.

**Renderelt HTML kimenet**

```html
<!-- Ikon trigger: icon shorthand + registry feloldás -->
<!-- config: { type: "modal", id: "edit-modal", icon: "edit", variant: "primary" } -->
<!-- preprocesszor után: content: { type: "icon", class: ["fas", "fa-pencil", "text-primary"] } -->
<a data-bs-toggle="modal" data-bs-target="#edit-modal" role="button" tabindex="0" style="cursor: pointer">
    <i class="fas fa-pencil text-primary"></i>
</a>

<!-- Gomb trigger: button shorthand -->
<!-- config: { type: "modal", id: "confirm-modal", button: "danger", value: "Törlés" } -->
<button type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#confirm-modal">
    Törlés
</button>

<!-- Link trigger: content type link -->
<!-- config: { type: "modal", id: "info-modal", content: { type: "link", value: "Részletek" } } -->
<a href="#" role="button" data-bs-toggle="modal" data-bs-target="#info-modal">
    Részletek
</a>

<!-- Route megadásával: data-route attribútum a triggeren -->
<!-- config: { ..., route: "items.{id}", key: "id" }, item: { id: 5 } -->
<a data-bs-toggle="modal" data-bs-target="#edit-modal" data-route="/items/5" role="button" tabindex="0">
    <i class="fas fa-pencil"></i>
</a>
```

> ♿ **Billentyűzetes kezelés.** Az ikon-trigger `href` **nélküli** horgony, amit a böngésző nem tesz fókuszálhatóvá, ezért `tabindex="0"`-t és saját Enter/Space kezelőt kap. A link-trigger (`href="#"`) eleve fókuszálható, és az Entert a böngésző már kattintássá alakítja, ezért csak a Space hiányzik — az a billentyű, amit a `role="button"` implikál, de a horgony sosem kezel. Mindkettő **kattintásként** továbbítja a leütést, mert a Bootstrap modal data-api erre az eseményre figyel. A gomb-trigger valódi `<button>`, ott nincs mit pótolni. Az ikon-triggernek adj hozzáférhető nevet az `alt`-tal (`aria-label`-ként jelenik meg) — egy ikon önmagában semmit nem mond be.

**Példa: Ikon trigger shorthand**

```json
{
    "body": {
        "columnConfigs": {
            "editModal": {
                "type": "modal",
                "id": "edit-modal",
                "icon": "edit",
                "variant": "primary",
                "alt": "Szerkesztés",
                "route": "items.{id}",
                "key": "id"
            }
        }
    }
}
```

**Példa: Gomb trigger shorthand**

```json
{
    "body": {
        "columnConfigs": {
            "deleteModal": {
                "type": "modal",
                "id": "delete-modal",
                "button": "outline-danger",
                "value": "Törlés",
                "size": "sm"
            }
        }
    }
}
```

**Példa: Feltételes modal — ágankénti eltérő ID és trigger**

```json
{
    "body": {
        "columnConfigs": {
            "statusModal": {
                "type": "modal",
                "key": "status",
                "if": [
                    { "eq": "active",   "id": "deactivate-modal", "icon": "ban",   "variant": "danger"  },
                    { "eq": "inactive", "id": "activate-modal",   "icon": "check", "variant": "success" }
                ],
                "else": { "id": "info-modal", "icon": "info", "variant": "secondary" }
            }
        }
    }
}
```

> **Megjegyzés:** A feltételes ágakban megadott `type: "icon"` mezőket a preprocesszor **törli** a branch-ből, és helyette `content` objektumot épít — ellenkező esetben a `resolveConditionalConfig` merge felülírná a root `type: "modal"`-t.

#### Beépített `destroyModal` — törlés megerősítő dialog

Az Aura automatikusan renderel egy beépített Bootstrap 5 modalt `id="destroyModal"`-lal minden Aura wrapper példányban. Ez a modal a törlési műveletek standard megerősítő dialógusa — a fejlesztőnek nem kell saját HTML-t írni.

**Működési elv:**
1. A trigger elem `data-bs-target="#destroyModal"` és `data-route="<url>"` attribútumokkal nyitja meg a modalt
2. A Bootstrap `show.bs.modal` esemény kiolvas a trigger `data-route` attribútumából egy URL-t
3. A „Törlés" gomb megnyomásakor `POST` form submit: `_method=DELETE` + best-effort CSRF token

**Példa API-konfiguráció destroyModal triggerhez:**

```json
{
    "body": {
        "columnConfigs": {
            "actions": {
                "type": "modal",
                "id": "destroyModal",
                "icon": "trash",
                "variant": "danger",
                "route": "users.{id}.destroy",
                "key": "id",
                "alt": "Törlés"
            }
        }
    }
}
```

A fenti konfigból generált trigger:

```html
<a data-bs-toggle="modal" data-bs-target="#destroyModal"
   data-route="http://app.test/users/5/destroy" role="button" tabindex="0">
    <i class="fas fa-trash text-danger"></i>
</a>
```

A beépített modal nem testreszabható. Egyedi törlési logikához (pl. más szöveg, plusz mező) a fejlesztő saját modalt készít más `id`-val, és a trigger `id` mezőjét ennek megfelelően állítja be.

> **CSRF:** Ha a DOM-ban megtalálható a `<meta name="csrf-token">` tag (Laravel, Rails, Phoenix alkalmazások), a `_token` mező automatikusan bekerül a form-ba. Ha nincs ilyen meta tag, a form `_token` nélkül kerül elküldésre — a backend CSRF middleware-e kezeli.

> **Origin-védelem:** A `destroyModal` form submit **csak same-origin `data-route`-ra** fut le (relatív vagy az oldallal azonos origin-ű abszolút URL). Ha a `data-route` egy másik origin-re mutat (pl. manipulált API-válasz miatt), a submit **teljesen blokkolódik** és `console.warn` figyelmeztetés íródik ki — így a CSRF-token nem szivároghat ki idegen origin-re. Cross-origin törlési műveletnek nincs legitim esete ezen a mechanizmuson keresztül (a Laravel session + CSRF folyamat eleve same-origin).

#### `link` oszloptípus

A `link` oszloptípus egy kattintható `<a href="...">` elemet generál. A megjelenített szöveg forrása a `field` (az `items` sorból), vagy fix `value`. A `href` a `route` template-ből készül — a `{key}` placeholderek a sor adataiból oldódnak fel (`resolveRoute`, ugyanaz a logika mint az `icon`/`modal` típusnál: pont→slash konverzió, `siteName` prefix).

> **Route nélkül:** ha nincs `route`, az elem sima `<span>`-ként renderelődik (nincs üres horgony).
>
> **`target="_blank"` biztonság:** ha nincs explicit `rel`, automatikusan `rel="noopener noreferrer"` kerül a linkre (tabnabbing védelem).

| Mező | Típus | Kötelező | Leírás | Példa |
| --- | --- | --- | --- | --- |
| `type` | `'link'` | ✅ | Típus azonosító (literal) | `"link"` |
| `field` | `string` | ⚠️¹ | Megjelenítendő mező az `items`-ből | `"name"` |
| `value` | `string` | ⚠️¹ | Fix szöveg (static mód, ha nincs `field`) | `"View Profile"` |
| `route` | `string` | ⚠️¹ | URL template `{key}` placeholderekkel | `"/users/{id}"` |
| `key` | `string` | – | URL-ben használt mező (alapértelmezett: `id`) | `"slug"` |
| `target` | `'_blank'\|'_self'\|'_parent'\|'_top'` | – | Link target | `"_blank"` |
| `rel` | `string` | – | Link relationship (auto `noopener noreferrer` `_blank` esetén) | `"noopener"` |
| `title` | `string` | – | Tooltip szöveg | `"Open profile"` |
| `color` | Bootstrap szín \| CSS szín | – | Szövegszín (`text-{color}` vagy inline) | `"primary"`, `"#f00"` |
| `variant` | `string` | – | Bootstrap link variant → `link-{variant}` osztály | `"danger"` |
| `mapping` | `object` | ⚠️¹ | Érték → `{ variant, color, class, title, route, target, rel }` leképezés (exact match, **csak `field` szelektor**); a talált entry a config fölé merge-elődik | *(ld. lent)* |
| `class`, `style`, `align`, `fontSize`, `fontWeight`, `italic`, `normal`, `lineHeight`, `monospace`, `text` | – | – | Tartalmi formázás (mint a `static`) | |
| `uppercase`, `lowercase`, `capitalize`, `slice`, `currency`, `date`, `phone`, `unit` | – | – | Tartalom-manipuláció / speciális formázás | |
| `data-*` | `string` | – | Data attribútumok `{field}` helyettesítéssel | `"data-id": "{id}"` |
| `if`/`else`/`key`, `cellRules` | – | – | Feltételes renderelés és cellaformázás | |

¹ A `field`, `value`, `route` és `mapping` közül **legalább egy** kötelező (kivéve ha `if`/`else` feltételes ágak vannak megadva).

> **Érték-alapú megjelenítés (`mapping`):** a `link` `mapping`-je **prezentáció-orientált** — a bejegyzés csak a megjelenést/URL-t/link-attribútumokat állítja (`variant`, `color`, `class`, `title`, `route`, `target`, `rel`), **nincs `label`/`value` alias**. Ennek oka: a link **szelektora és felirata is a `field`** (a `field` nyer a `value` felett), így egy leképezett felirat sosem jelenne meg — a felirat marad a `field`, a mapping csak hangol. **A szelektor kizárólag `field`** (a `key` itt URL-kulcs, nem szelektor). A feloldás az `if`/`else` lapítás **után** fut. Példa: `status: "active"` → `{ "variant": "success", "route": "/activate/{id}" }`.

```json
{
    "body": {
        "columnConfigs": {
            "name": {
                "type": "link",
                "field": "name",
                "key": "id",
                "route": "/users/{id}",
                "class": "text-decoration-none"
            },
            "external": {
                "type": "link",
                "field": "website",
                "target": "_blank",
                "color": "info"
            }
        }
    }
}
```

A `name` config által generált link (sor: `{ id: 5, name: "Anna" }`):

```html
<a href="/users/5" class="text-decoration-none">Anna</a>
```

##### Egyszerűsített `_link` mezők (auto-generálás)

Ha egy header cellában `_link` végződésű `field` (vagy `fields[]` elem) szerepel, a preprocesszor (⑦.5) automatikusan létrehozza a megfelelő columnConfig bejegyzést — nincs szükség manuális konfigurálásra. A bejegyzést a **prefix** (a `_link` előtti rész) és a cella **`key`** mezője (URL-kulcs, alapértelmezett `id`) határozza meg. Az útvonalak az erőforrás bázisútvonalához (`config.urlParameter`, a `{current_url}` megfelelője) képest generálódnak, és a render réteg elé teszi a `siteName`-et.

**Beépített akció-prefixek (Laravel resource konvenciók):**

| Field | Generált típus | Útvonal |
| --- | --- | --- |
| `create_link` | `link` (label „create") | `{base}/create` |
| `edit_link` | `link` (label „edit") | `{base}/{key}/edit` |
| `show_link` | `link` (label „show") | `{base}/{key}` |
| `destroy_link` | **`modal`** (beépített `destroyModal` trigger) | `{base}/{key}/destroy` |

**Egyedi prefix (nem beépített, pl. `name_link`):** a `key` az URL-placeholder, a **prefix bekerül az útvonal végére** is. Ha létezik a headerben a prefixszel megegyező `field`-ű **oszlop** (pl. `name`), a cella annak az oszlopnak az **items-beli, soronkénti** értékét jeleníti meg (`field: "name"` — pl. „Bálint Tamás" / „Kis Guci Illés"). Ha nincs ilyen oszlop, a prefix **static szövegként** íródik ki, de a link megmarad.

| Eset | Generált config | Megjelenítés |
| --- | --- | --- |
| `name_link` + van `name` oszlop | `{ field: "name", key, route: "{base}/{key}/name" }` | soronkénti `name` érték |
| `name_link` + nincs `name` oszlop | `{ value: "name", key, route: "{base}/{key}/name" }` | fix „name" szöveg |

> **URL kulcs:** a `key` a cella `key` mezőjéből jön (alapértelmezett `id`). A meglévő `columnConfigs` bejegyzést az auto-generálás **soha nem írja felül** — egyedi viselkedéshez írj explicit `columnConfig`-ot (a `link`/`modal` típus minden paramétere elérhető).

```json
{
    "header": {
        "rows": [
            {
                "cells": [
                    { "content": "Name", "key": "id", "field": "name" },
                    { "content": "Name", "key": "id", "field": "name_link" },
                    { "content": "Edit", "key": "id", "field": "edit_link" },
                    { "content": "Delete", "key": "id", "field": "destroy_link" }
                ]
            }
        ]
    }
}
```

`urlParameter: "admin/users"`, `siteName: "https://app.com"`, sor `{ id: 7, name: "Bálint Tamás" }` esetén (a `name_link` a `name` oszlopra hivatkozik):

```html
<a href="https://app.com/admin/users/7/name">Bálint Tamás</a>
<a href="https://app.com/admin/users/7/edit">edit</a>
<a href="#" data-bs-toggle="modal" data-bs-target="#destroyModal"
   data-route="https://app.com/admin/users/7/destroy" role="button">destroy</a>
```

#### `reference` oszloptípus

A `reference` egy `<span>` cellát renderel, amelynek tartalma **másik mező(k) értéke** az `items` sorból (nem fix `value`, mint a `static`-nál). Egy mezőhöz a `field`, több mező összefűzéséhez a `fields[]` + `separator` használható. A feloldott szöveg ugyanazon a formázó-láncon megy át, mint a `static` (kis-/nagybetűsítés, `slice`, `currency`/`date`/`phone`/`number`, `unit`, padding) — vagyis **ugyanazokkal a paraméterekkel** építhető, mint az `icon`/`modal`/`static`.

> **Több mező:** a `fields[]` értékeit a `separator` (alapértelmezett `" "`) köti össze. Az üres/`null` mezők kimaradnak az összefűzésből (nincs lógó elválasztó). Ha `field` és `fields` is meg van adva, a `fields` nyer.

> **Érték-alapú megjelenítés (`mapping`):** a `reference` a `field`/`fields` (item-mezőből olvasott szöveg) mellett egy önálló, fix **`value`** mezőt is támogat — ez a `mapping` `label`→`value` aliasának célmezője (a fix szöveg forrása minden mapping-elt típusnál `value`). A szöveg-forrás prioritása: **`value` → `fields` → `field`**. A `mapping` egy érték→felirat (+formázás) szótár — pl. `status: "active"` → `{ label: "Aktív", color: "success" }` —, tömörebb alternatíva az azonos célú `if`/`else` `eq`-láncnál. A feloldás mindig az `if`/`else` lapítás **után** fut, ugyanazzal a szemantikával, mint a `badge` mapping-je (ld. lentebb).

| Mező | Típus | Kötelező | Leírás | Példa |
| --- | --- | --- | --- | --- |
| `type` | `'reference'` | ✅ | Típus azonosító (literal) | `"reference"` |
| `field` | `string` | ⚠️¹ | Egy hivatkozott mező (pontozott útvonal OK) | `"email"`, `"user.name"` |
| `fields` | `string[]` | ⚠️¹ | Több mező összefűzéshez | `["firstName", "lastName"]` |
| `separator` | `string` | – | `fields` elválasztója (alapértelmezett `" "`) | `", "` |
| `value` | `string` | ⚠️¹ | Fix szöveg — a `mapping` `label`→`value` normalizálásának célmezője; a renderer `fields`/`field` elé sorolja | `"N/A"` |
| `mapping` | `object` | ⚠️¹ | Érték → `{ label, ...formázók }` leképezés (exact match, `field ?? key` szelektor, `label`→`value` alias); a talált entry a config fölé merge-elődik | *(ld. lent)* |
| `key` | `string` | – | Feltételes (`if`/`else`) kiértékelés mezője; a `mapping` szelektora is ezt olvassa, ha nincs `field` | `"description"` |
| `class`, `style`, `align`, `color`, `background`, `fontSize`, `fontWeight`, `italic`, `normal`, `lineHeight`, `monospace`, `text` | – | – | Tartalmi formázás (mint a `static`) | |
| `uppercase`, `lowercase`, `capitalize`, `slice`, `number`, `currency`, `date`, `phone`, `unit`, `padStart`/`padEnd`/`chars` | – | – | Tartalom-manipuláció / speciális formázás | |
| `data-*` | `string` | – | Data attribútumok | `"data-id": "x"` |
| `if`/`else`/`key`, `cellRules` | – | – | Feltételes renderelés és cellaformázás | |

¹ A `field`, `fields`, `value` vagy `mapping` közül **legalább egy** kötelező (kivéve ha `if`/`else` feltételes ágak vannak megadva).

```json
{
    "body": {
        "columnConfigs": {
            "userEmail": {
                "type": "reference",
                "field": "email",
                "lowercase": true,
                "class": ["text-muted", "small"]
            },
            "fullName": {
                "type": "reference",
                "fields": ["firstName", "lastName"],
                "separator": " ",
                "class": "fw-bold"
            }
        }
    }
}
```

A `fullName` config által generált tartalom (sor: `{ firstName: "Anna", lastName: "Kovács" }`):

```html
<span class="fw-bold">Anna Kovács</span>
```

Feltételes (null-kezelő) példa — `key` a vizsgált mező, az `else` ág a tényleges hivatkozást formázza:

```json
{
    "type": "reference",
    "key": "description",
    "if": [{ "empty": true, "type": "static", "value": "Nincs leírás", "class": "text-muted fst-italic" }],
    "else": { "field": "description", "slice": 100 }
}
```

**Példa: Mapping alapú felirat (érték → megjelenítendő szöveg)**

```json
{
    "body": {
        "columnConfigs": {
            "statusLabel": {
                "type": "reference",
                "key": "status",
                "mapping": {
                    "active":   { "label": "Aktív",   "color": "success" },
                    "inactive": { "label": "Inaktív", "color": "secondary" },
                    "pending":  { "label": "Függőben", "color": "warning", "italic": true }
                }
            }
        }
    }
}
```

`status: "active"` esetén a `label` a mapping-feloldó `resolveMappingConfig` révén `value`-ra normalizálódik, amelyet a `renderReferenceNode` a `fields`/`field` elé sorol:

```html
<span class="text-success">Aktív</span>
```

> No-match esetén (pl. `status: "archived"`) a `statusLabel` a `mapping` nélküli configra esik vissza — mivel itt sem `field`, sem `fields`, sem `value` nincs a gyökéren, üres `<span>` renderelődik. Adj meg gyökér-szintű `value`-t vagy `field`-et fallbacknek, ha ez nem kívánt.

#### `button` oszloptípus

A `button` egy Bootstrap 5 gombot renderel a cellába. **Duál elem-modell:** ha `route` meg van adva → `<a class="btn btn-{variant} btn-{size}" href="...">` (navigációs gomb, a `{key}` placeholderek a sor adataiból oldódnak fel, `resolveRoute`); ha **nincs** `route` → valódi `<button type="{htmlType}">` (form-kontextusban `submit`/`reset`, `disabled` támogatással). A gomb felirata a `field` (az `items` sorból) vagy fix `value`, amely ugyanazon a formázó-láncon megy át, mint a `static`.

> **Ikon:** az `icon` a `config.icons` **registry kulcsa** (nem nyers CSS osztály) — a renderelés a registry-ből oldja fel az osztályokat (ismeretlen kulcs esetén `icons.primary` fallback), és egy `<i>` glyph-et helyez a felirat elé (`iconPosition: "start"`, alapértelmezett) vagy mögé (`"end"`). `field`/`value` nélkül, csak `icon`-nal ikon-gomb készül.

| Mező | Típus | Kötelező | Leírás | Példa |
| --- | --- | --- | --- | --- |
| `type` | `'button'` | ✅ | Típus azonosító (literal) | `"button"` |
| `field` | `string` | ⚠️¹ | Felirat forrása az `items` sorból (pontozott útvonal OK) | `"name"` |
| `value` | `string` | ⚠️¹ | Fix felirat (static mód) | `"Részletek"` |
| `route` | `string` | ⚠️¹ | URL template — jelenléte `<a class="btn">`-t választ | `"/users/{id}/edit"` |
| `key` | `string` | – | URL-kulcs mező (alapértelmezett `id`) / feltételes kiértékelés | `"id"`, `"slug"` |
| `icon` | `string` | ⚠️¹ | `config.icons` registry kulcs | `"cog"`, `"edit"` |
| `iconPosition` | `'start'` \| `'end'` | – | Ikon helye a felirathoz képest (alapértelmezett `start`) | `"end"` |
| `variant` | `string` | – | Bootstrap btn variáns | `"primary"`, `"outline-secondary"` |
| `size` | `'xs'`–`'xl'` | – | Gombméret (`btn-{size}`) | `"sm"` |
| `rounded` | `boolean` | – | Kerek gomb (`rounded-circle`) | `true` |
| `pill` | `boolean` | – | Pill gomb (`rounded-pill`) | `true` |
| `disabled` | `boolean` | – | Letiltott állapot (`<button disabled>` / `<a class="disabled" aria-disabled>`) | `true` |
| `title` | `string` | – | Tooltip | `"Beállítások"` |
| `htmlType` | `'button'` \| `'submit'` \| `'reset'` | – | HTML `type` (csak `<button>` ágon, alapértelmezett `button`) | `"submit"` |
| `mapping` | `object` | ⚠️¹ | Érték → `{ variant, color, background, size, rounded, pill, disabled, icon, iconPosition, title, route, class }` leképezés (exact match, **csak `field` szelektor**); a talált entry a config fölé merge-elődik | *(ld. lent)* |
| `class`, `style`, `color`, `background`, `align`, `fontSize`, `fontWeight`, `italic`, `normal`, `lineHeight`, `monospace`, `text` | – | – | Tartalmi formázás (mint a `static`) | |
| `uppercase`, `lowercase`, `capitalize`, `slice`, `number`, `currency`, `date`, `phone`, `unit`, `padStart`/`padEnd`/`chars` | – | – | Tartalom-manipuláció / speciális formázás | |
| `data-*` | `string` | – | Data attribútumok (`{field}` helyettesítéssel) | `"data-user-id": "{id}"` |
| `if`/`else`/`key`, `cellRules` | – | – | Feltételes renderelés és cellaformázás | |

¹ A `field`, `value`, `route`, `icon` és `mapping` közül **legalább egy** kötelező (kivéve ha `if`/`else` feltételes ágak vannak megadva).

> **Érték-alapú megjelenítés (`mapping`):** a `button` `mapping`-je **prezentáció-orientált** — a bejegyzés csak a gomb megjelenését/állapotát/URL-jét állítja (`variant`, `color`, `background`, `size`, `rounded`, `pill`, `disabled`, `icon`, `iconPosition`, `title`, `route`, `class`), **nincs `label`/`value` alias** (a felirat a `field` marad, ld. a `link` mapping magyarázatát). **A szelektor kizárólag `field`** (a `key` itt URL-kulcs). A feloldás az `if`/`else` lapítás **után** fut. Példa: `state: "locked"` → `{ "variant": "danger", "disabled": true, "icon": "lock" }`.

```json
{
    "body": {
        "columnConfigs": {
            "edit": {
                "type": "button",
                "field": "name",
                "key": "id",
                "route": "/users/{id}/edit",
                "variant": "primary",
                "size": "sm",
                "icon": "edit"
            },
            "settings": {
                "type": "button",
                "icon": "cog",
                "variant": "outline-secondary",
                "size": "sm",
                "rounded": true,
                "title": "Beállítások"
            }
        }
    }
}
```

Az `edit` config által generált tartalom (sor: `{ id: 5, name: "Szerkesztés" }`, `config.icons.edit = ["fas", "fa-edit"]`):

```html
<a href="/users/5/edit" class="btn btn-primary btn-sm"><i class="fas fa-edit"></i> Szerkesztés</a>
```

##### Egyszerűsített `_button` mezők (auto-generálás)

Ha egy header cellában `_button` végződésű `field` (vagy `fields[]` elem) szerepel, a preprocesszor (⑦.5) automatikusan létrehozza a megfelelő columnConfig bejegyzést — a `_link`/`_icon` mintájára, manuális konfigurálás nélkül. A bejegyzést a **prefix** (a `_button` előtti rész) és a cella **`key`** mezője (URL-kulcs, alapértelmezett `id`) határozza meg. Az útvonalak az erőforrás bázisútvonalához (`config.urlParameter`, a `{current_url}` megfelelője) képest generálódnak, a render réteg elé teszi a `siteName`-et.

> **Variant a registry-ből:** ellentétben a `_link`-kel, a gomb **mindig kap `variant`-ot** (a stílus nélküli `.btn` láthatatlan lenne). A variant a `config.variants` registry-ből oldódik fel a prefix alapján (`edit` → `variants.edit`), `variants.primary`, majd a literal `"primary"` fallbackkal. Így pl. a `destroy_button` a `variants.destroy` (alap: `danger`) színt kapja. **Ikont NEM generál** — csak feliratot + variant színt; ikonhoz explicit `columnConfig` kell.

| Prefix | Generált típus | Route |
| --- | --- | --- |
| `create_button` | `button` (label „create") | `{base}/create` |
| `edit_button` | `button` (label „edit") | `{base}/{key}/edit` |
| `show_button` | `button` (label „show") | `{base}/{key}` |
| `destroy_button` | **`modal`** (beépített `destroyModal` trigger, `button` content) | `{base}/{key}/destroy` |

**Egyedi prefix (nem beépített, pl. `name_button`):** a `key` az URL-placeholder, a **prefix bekerül az útvonal végére** is. Ha létezik a headerben a prefixszel megegyező `field`-ű **oszlop** (pl. `name`), a cella annak az oszlopnak az **items-beli, soronkénti** értékét jeleníti meg (`field: "name"`). Ha nincs ilyen oszlop, a prefix **static szövegként** íródik ki, de a link megmarad.

| Eset | Generált config | Megjelenített szöveg |
| --- | --- | --- |
| `name_button` + van `name` oszlop | `{ field: "name", variant, key, route: "{base}/{key}/name" }` | soronkénti `name` érték |
| `name_button` + nincs `name` oszlop | `{ value: "name", variant, key, route: "{base}/{key}/name" }` | fix „name" szöveg |

```json
{
    "header": {
        "rows": [
            {
                "cells": [
                    { "content": "Név", "key": "id", "field": "name" },
                    { "content": "Szerkesztés", "key": "id", "field": "edit_button" },
                    { "content": "Törlés", "key": "id", "field": "destroy_button" }
                ]
            }
        ]
    }
}
```

`urlParameter: "admin/users"`, `variants: { edit: "primary", destroy: "danger" }`, sor `{ id: 7 }` esetén a preprocesszor a következő configokat generálja:

```jsonc
// edit_button →
{ "type": "button", "value": "edit", "variant": "primary", "key": "id", "route": "admin/users/{id}/edit" }
// destroy_button →
{ "type": "modal", "id": "destroyModal", "key": "id", "route": "admin/users/{id}/destroy",
  "content": { "type": "button", "value": "destroy", "variant": "danger" } }
```

#### `badge` oszloptípus

A `badge` egy Bootstrap 5 badge-et renderel a cellába (`<span class="badge text-bg-{variant}">`). A megjelenített felirat és a szín az **érték** függvénye, három feloldási móddal:

1. **Statikus / egyszerű** — `field` (az `items` sorból) vagy fix `value` + fix `variant`. A felirat ugyanazon a formázó-láncon megy át, mint a `static`.
2. **Mapping (érték → config)** — a `mapping[érték]` egy `{ label, variant, icon, class }` bejegyzésre képez le (pl. `high` → `danger` + „Magas"). **Ha nincs találat**, a badge a nyers értékkel és a config `variant`-jával jelenik meg (nincs adatvesztés; variant hiányában `secondary`).
3. **Boolean (`trueValue` / `falseValue`)** — ha `trueValue` vagy `falseValue` meg van adva, az értéket boolean-ként értelmezi (a `true`/`1`/`yes` és a nem-üres szövegek igazak; a `false`/`0`/`no`/üres hamis), és a megfelelő ág `{ label, variant, icon, class }` konfigját használja.

> **Számláló mód (numerikus érték):** a `prefix` elé kerül (pl. `#`), a `maxValue` felett a felirat `{maxValue}{suffix}` lesz (pl. `15` → `"9+"`, ha `maxValue: 9`, `suffix: "+"`), `showZero: false` esetén pedig 0 értéknél **nem renderel semmit**.

> **Ikon:** az `icon` (és a `mapping`/`trueValue`/`falseValue` `icon`-ja) a `config.icons` **registry kulcsa** — a `button`-nal azonos módon oldódik fel (`icons.primary` fallback), `<i>` glyph a felirat elé (`iconPosition: "start"`, alap) vagy mögé (`"end"`).

> **Variant-osztály:** a badge a Bootstrap **5.3 `text-bg-{variant}`** formát használja (automatikus kontraszt-szöveg a háttérhez), nem a régi `bg-{variant}`-ot.

| Mező | Típus | Kötelező | Leírás | Példa |
| --- | --- | --- | --- | --- |
| `type` | `'badge'` | ✅ | Típus azonosító (literal) | `"badge"` |
| `field` | `string` | ⚠️¹ | Melyik mező értéke vezérli a badge-et | `"status"` |
| `value` | `string` | ⚠️¹ | Fix felirat (static mód) | `"ÚJ"` |
| `variant` | `BootstrapColor` | – | Alap / fallback szín (`primary`…`dark`) | `"success"` |
| `pill` | `boolean` | – | `rounded-pill` stílus | `true` |
| `size` | `'sm'\|'md'\|'lg'…` | – | Méret módosító (`badge-{size}`) | `"sm"` |
| `mapping` | `object` | ⚠️¹ | Érték → `{ label, variant, icon, class }` | *(ld. lent)* |
| `trueValue` / `falseValue` | `object` | ⚠️¹ | Boolean-ág `{ label, variant, icon, class }` | *(ld. lent)* |
| `showZero` | `boolean` | – | 0 érték megjelenjen-e (alap: `true`) | `false` |
| `maxValue` | `number` | – | Max megjelenített szám (felette túlcsordulás) | `99` |
| `suffix` | `string` | – | Túlcsordulás-jelölő a `maxValue` után | `"+"` |
| `prefix` | `string` | – | Előtag a felirat előtt | `"#"` |
| `icon` | `string` | – | `config.icons` registry kulcs | `"check"` |
| `iconPosition` | `'start'\|'end'` | – | Ikon helye (alap: `"start"`) | `"end"` |
| formázók | – | – | Teljes `static`-paritás a feliraton (color/background/uppercase/slice/…) | |
| `data-*` | `string` | – | Data attribútumok (`{field}` helyettesítéssel) | `"data-id": "{id}"` |
| `if`/`else`/`key`, `cellRules` | – | – | Feltételes renderelés és cellaformázás | |

¹ A `field`, `value`, `mapping`, `trueValue` vagy `falseValue` közül **legalább egy** kötelező (kivéve ha `if`/`else` feltételes ágak vannak megadva).

```json
{
    "body": {
        "columnConfigs": {
            "status": {
                "type": "badge",
                "field": "status",
                "variant": "success"
            },
            "priority": {
                "type": "badge",
                "field": "priority",
                "mapping": {
                    "high": { "variant": "danger", "label": "Magas" },
                    "medium": { "variant": "warning", "label": "Közepes" },
                    "low": { "variant": "secondary", "label": "Alacsony" }
                }
            },
            "verified": {
                "type": "badge",
                "field": "isVerified",
                "trueValue": { "label": "Ellenőrizve", "variant": "success", "icon": "check" },
                "falseValue": { "label": "Függőben", "variant": "warning", "icon": "clock" }
            },
            "unread": {
                "type": "badge",
                "field": "unreadCount",
                "variant": "primary",
                "pill": true,
                "showZero": false,
                "maxValue": 99,
                "suffix": "+"
            }
        }
    }
}
```

A `priority` config `high` értéknél a következőt generálja:

```html
<span class="badge text-bg-danger">Magas</span>
```

##### Egyszerűsített `_badge` mezők (auto-generálás)

Ha egy header cellában `_badge` végződésű `field` (vagy `fields[]` elem) szerepel, a preprocesszor (⑦.5) automatikusan létrehozza a megfelelő `badge` columnConfig bejegyzést — a `_link`/`_button`/`_icon` mintájára, manuális konfigurálás nélkül.

> **Eltérés a `_link`/`_button`-tól:** a badge **sosem navigál**, ezért itt **nincs útvonal, nincs beépített prefix** (create/edit/show/destroy) és **nincs modal**. Az egyetlen prefix-függő logika a mező-feloldás és a variant.

**Mező-feloldás (mit jelenít meg a badge):** a `_badge` levágásával kapott **prefix** alapján. Ha létezik a headerben a prefixszel megegyező `field`-ű **oszlop** (pl. `status`), a badge annak a soronkénti, `items`-beli értékét olvassa (`field: "status"`). Ha nincs ilyen oszlop, a badge a **teljes suffixes mezőt** olvassa (`field: "status_badge"`) — ilyenkor a backend a `status_badge` kulcs alatt küldi a badge értékét.

**Variant (alap szín):** a `config.variants` registry-ből oldódik fel a prefix alapján (`status` → `variants.status`), `variants.secondary`, majd a literal `"secondary"` fallbackkal. A `mapping`/`boolean`/számláló mód **nem vezethető le automatikusan**, ezért az auto-generált badge mindig sima field-badge (a fejlettebb módokhoz explicit `columnConfig` kell).

| Mező | Feloldás | Eredmény |
| --- | --- | --- |
| `status_badge` + nincs `status` oszlop | teljes suffixes mező | `{ type: "badge", field: "status_badge", variant }` |
| `role_badge` + van `role` oszlop | prefix-oszlop (soronkénti) | `{ type: "badge", field: "role", variant }` |

```json
{
    "header": {
        "rows": [
            {
                "cells": [
                    { "content": "Státusz", "field": "status_badge" }
                ]
            }
        ]
    }
}
```

`variants: { status: "info" }` esetén ez a következő configot generálja (nincs külön `status` oszlop):

```json
// status_badge → { "type": "badge", "field": "status_badge", "variant": "info" }
```

#### `progress` oszloptípus

A `progress` típus Bootstrap 5 progress bart renderel: egy `field` (vagy fix `value`) numerikus értékét jeleníti meg `[min, max]` tartomány százalékában (`<div class="progress"><div class="progress-bar bg-{variant}" style="width:{percent}%">`).

```json
{
    "body": {
        "columnConfigs": {
            "completion": {
                "type": "progress",
                "field": "completionRate",
                "variant": "success",
                "label": true
            },
            "storageUsage": {
                "type": "progress",
                "field": "usedSpace",
                "max": "totalSpace",
                "label": "{value} GB / {max} GB",
                "height": "20px",
                "striped": true,
                "animated": true
            },
            "cpuUsage": {
                "type": "progress",
                "field": "cpu",
                "thresholds": { "success": [0, 50], "warning": [51, 80], "danger": [81, 100] },
                "label": true
            }
        }
    }
}
```

| Mező            | Típus                       | Leírás                                                                        |
| --------------- | --------------------------- | ----------------------------------------------------------------------------- |
| `field`         | `string`                    | Az item-mező, amelynek numerikus értéke kitölti a sávot                        |
| `value`         | `number`                    | Fix érték (static mód, `field` helyett)                                        |
| `max`           | `number \| string`          | Maximum — szám vagy mezőnév (soronkénti max); alapértelmezett `100`            |
| `min`           | `number`                    | Minimum; alapértelmezett `0`                                                   |
| `variant`       | `BootstrapColor`            | Statikus sáv-szín (a színforrások közül a legalacsonyabb prioritású)           |
| `height`        | `string`                    | Sáv magasság (pl. `"20px"`, `"1rem"`)                                          |
| `striped`       | `boolean`                   | Csíkozott megjelenés                                                           |
| `animated`      | `boolean`                   | Animált csíkok (csak `striped` mellett hatásos)                               |
| `label`         | `boolean \| string`         | `true` → százalék; template string `{value}`/`{max}`/`{percent}` behelyettesítéssel |
| `labelPosition` | `"inside" \| "outside"`     | Címke a sávon belül (alap) vagy a sáv után                                     |
| `mapping`       | `object`                    | Tartomány-kulcsos (`"0-25"`) → `{ variant, label, class }`                     |
| `thresholds`    | `object`                    | `variant → [min, max]` küszöb-színezés                                         |
| `stacked`       | `boolean`                   | Több sáv egymás mellett                                                        |
| `bars`          | `object[]`                  | Stacked sávok: `{ field, variant, label }`                                     |
| `showValue`     | `boolean`                   | Érték címke (ha nincs explicit `label`)                                        |
| `showPercent`   | `boolean`                   | Százalék címke (ha nincs explicit `label`)                                     |
| `decimals`      | `number`                    | Tizedesjegyek a szám-formázásban (alap `0`)                                    |
| `prefix`/`suffix` | `string`                  | Elő-/utótag a default címkében                                                 |

**Színezés prioritása:** `mapping` (tartomány) → `thresholds` → `variant` → `primary` (fallback). A legspecifikusabb nyer; a `mapping` találat egyben címkét is adhat.

**Címke (label a mester):** ha `label` template string → azt használjuk (`{value}`/`{max}`/`{percent}` + `decimals`). `label: true` → `{prefix}{percent}{suffix ?? "%"}`. Ha nincs `label`, a `showValue`/`showPercent` építi fel a címkét. Egy találatot adó `mapping` `label` felülírja a config-címkét.

**Stacked (`stacked: true` + `bars`):** a sávok szélessége **auto-normalizált** — minden sáv `barValue / Σ(bars) * 100`, így mindig pontosan kitölti a track-et (a relatív arányokat mutatja).

```json
{
    "type": "progress",
    "stacked": true,
    "bars": [
        { "field": "sold", "variant": "success", "label": "Eladott" },
        { "field": "reserved", "variant": "warning", "label": "Foglalt" },
        { "field": "available", "variant": "secondary", "label": "Szabad" }
    ]
}
```

##### Egyszerűsített `_progress` mezők (auto-generálás)

Ha egy header cellában `_progress` végződésű `field` (vagy `fields[]` elem) szerepel, a preprocesszor (⑦.5) automatikusan létrehozza a megfelelő `progress` columnConfig bejegyzést — a `_badge` mintájára.

> **Eltérés a `_link`/`_button`/`_icon`-tól:** a progress bar **sosem navigál**, ezért **nincs útvonal, nincs beépített prefix és nincs modal**; **variant registry sincs** — az auto-generált progress mindig sima field-bar (a render `primary` fallback színezi).

**Mező-feloldás:** a `_progress` levágásával kapott **prefix** alapján. Ha létezik a headerben a prefixszel megegyező `field`-ű oszlop (pl. `cpu`), a bar annak soronkénti értékét olvassa (`field: "cpu"`); különben a teljes suffixes mezőt (`field: "completion_progress"`).

```json
// completion_progress → { "type": "progress", "field": "completion_progress" }
```

#### `custom` oszloptípus

A `custom` a legrugalmasabb oszloptípus: **négy renderelési mód** közül választ (prioritási sorrendben), így tetszőleges megjelenítés állítható elő.

1. **`renderer`** — a `config.renderers` **host-registry** egy függvényének **neve**. A függvény `(value, row, config)` argumentumokkal hívódik és **HTML stringet** ad vissza, amely `innerHTML`-ként a cellába kerül. `fields[]` esetén az első argumentum a feloldott értékek tömbje.
2. **`callback`** — a `config.callbacks` host-registry egy függvényének **neve**. `(value, row, params)` argumentumokkal hívódik és **sima szöveget** ad vissza (a `static` formázó dolgozza fel, majd a Vue escape-eli — nem HTML).
3. **`template`** — HTML string placeholderekkel (`{value}`, `{field}`, `{class}`, `{icon}`, és a `mapping`-bejegyzés tetszőleges kulcsai). A behelyettesítés után DOMPurify sanitizál.
4. **default** — ha egyik sincs, a nyers `field`/`value` érték jelenik meg (static formázással).

> **Biztonság:** a `renderer`/`callback`/`template` a `config`-ban csak **névvel** hivatkozik host-függvényre — az API-válasz **nem tud kódot injektálni** (a függvényeket kizárólag a host adja meg `app.use`/props szinten). Minden HTML-kimenet (`renderer`, `template`) DOMPurify-on esik át (a cella-szintű `raw` whitelisttel), a `callback` kimenete pedig escaped szöveg. A `template` `mapping`-je **template-paraméter-halmaz** (a bejegyzés kulcsai a placeholder-nevek, értékei kizárólag primitívek) — a végső sanitizálás a biztonsági határ.

| Paraméter | Típus | Kötelező | Leírás | Példa |
| --- | --- | :---: | --- | --- |
| `type` | `'custom'` | ✅ | Típus azonosító (literal) | `"custom"` |
| `field` | `string` | ⚠️¹ | Az elsődleges érték mezője az items-ből | `"status"` |
| `fields` | `string[]` | ⚠️¹ | Több mező (a `renderer` tömbként kapja) | `["first","last"]` |
| `value` | `string` | ⚠️¹ | Fix érték-forrás | `"N/A"` |
| `renderer` | `string` | ⚠️¹ | `config.renderers` függvénynév (HTML) | `"userCard"` |
| `callback` | `string` | ⚠️¹ | `config.callbacks` függvénynév (szöveg) | `"formatPrice"` |
| `template` | `string` | ⚠️¹ | HTML template placeholderekkel | `"<b>{value}</b>"` |
| `params` | `object` | – | Extra adat a `callback`-nek | `{ "currency": "HUF" }` |
| `mapping` | `object` | – | Érték → template-paraméterek (exact vagy `"min-max"` tartomány) | ld. lentebb |

> ¹ A `renderer`/`callback`/`template`/`field`/`fields`/`value` közül **legalább egy** kötelező (kivéve feltételes `if`/`else` ág esetén).

**Host-registry (`app.use`):**

```javascript
app.use(Aura, {
    renderers: {
        userCard: (value, row, config) => `<div class="user-card"><strong>${value}</strong></div>`,
    },
    callbacks: {
        formatPrice: (price, row, params) => `${price} ${params.currency}`,
    },
});
```

**Template + mapping (érték → placeholder-paraméterek):**

```json
{
    "type": "custom",
    "field": "stock",
    "template": "<span class='{class}'>{icon} {label}</span>",
    "mapping": {
        "0": { "class": "text-danger", "icon": "⚠", "label": "Elfogyott" },
        "1-10": { "class": "text-warning", "icon": "!", "label": "Kevés" },
        "11-999": { "class": "text-success", "icon": "✓", "label": "Raktáron" }
    }
}
```

> A `custom` `mapping`-je **eltérő dialektus** a többi típusétól: nem a config fölé merge-elődik, hanem a talált bejegyzés kulcsai a `template` placeholdereibe helyettesítődnek. A kulcs lehet **exact** (`"active"`) vagy **tartomány** (`"1-10"`, mint a `progress`-nél); egyezés esetén az exact nyer. Ezért a `custom` (a `badge`/`progress` mellett) **ki van zárva** a generikus `resolveMappingConfig` feloldóból.

### Feltételes Renderelés (Conditional Rendering)

Minden `body.columnConfigs` bejegyzés támogatja a feltételes renderelést az `if`/`else`/`key` struktúra segítségével. Ez lehetővé teszi, hogy a cella konfigurációja (pl. variáns, szöveg, stílus) dinamikusan változzon az aktuális sor adatai alapján.

#### Struktúra

```json
{
    "body": {
        "columnConfigs": {
            "status": {
                "key": "status",
                "if": [
                    { "eq": "active", "variant": "success", "label": "Aktív" },
                    { "eq": "inactive", "variant": "secondary", "label": "Inaktív" }
                ],
                "else": { "variant": "warning", "label": "Ismeretlen" }
            }
        }
    }
}
```

| Mező    | Típus                          | Leírás                                                                              |
| ------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| `key`   | `string`                       | Az `items` adat objektumban lévő mező neve, amelynek értéke alapján kiértékelés történik |
| `if`    | `Record<string, unknown>[]`    | Feltételek tömbje — az első egyező branch konfig tulajdonságai kerülnek alkalmazásra |
| `else`  | `Record<string, unknown>`      | Ha egyetlen `if` branch sem egyezik, ez a konfig kerül alkalmazásra (opcionális)   |

> Ha sem `if` branch, sem `else` nem egyezik, a cella nem renderelődik.

#### Támogatott Operátorok

| Operátor                      | Leírás                                     | Példa érték            |
| ----------------------------- | ------------------------------------------ | ---------------------- |
| `eq`                          | Egyenlő                                    | `"active"`             |
| `ne` / `neq`                  | Nem egyenlő                                | `"inactive"`           |
| `gt` / `bigger`               | Nagyobb                                    | `100`                  |
| `gte` / `biggerOrEqual`       | Nagyobb vagy egyenlő                       | `100`                  |
| `lt` / `smaller`              | Kisebb                                     | `50`                   |
| `lte` / `smallerOrEqual`      | Kisebb vagy egyenlő                        | `50`                   |
| `between`                     | Intervallumban van (inkluzív)              | `[10, 100]`            |
| `in`                          | Role a tömbben                             | `["admin", "editor"]`  |
| `notIn`                       | Nincs a tömbben                            | `["banned"]`           |
| `contains`                    | Tartalmaz (string)                         | `"@example.com"`       |
| `startsWith`                  | Ezzel kezdődik (string)                    | `"admin"`              |
| `endsWith`                    | Ezzel végződik (string)                    | `".hu"`                |
| `regex`                       | Reguláris kifejezés (string)               | `"^[A-Z]"`             |
| `null`                        | `null` értékű-e                            | `true`                 |
| `notNull`                     | Nem `null`-e                               | `true`                 |
| `empty`                       | Üres-e (null, undefined, '', 0, false)     | `true`                 |
| `notEmpty`                    | Nem üres-e                                 | `true`                 |
| `true`                        | Értéke pontosan `true`                     | `true`                 |
| `false`                       | Értéke pontosan `false`                    | `true`                 |

#### Speciális Dátum Értékek

Az összehasonlítási értékekben speciális dátum kulcsszavak is használhatók:

| Kulcsszó      | Leírás                          |
| ------------- | ------------------------------- |
| `"now"`       | Jelenlegi pontos időpont        |
| `"today"`     | Mai nap (00:00:00)              |
| `"yesterday"` | Tegnapi nap (00:00:00)          |
| `"tomorrow"`  | Holnapi nap (00:00:00)          |
| ISO string    | pl. `"2025-01-01T00:00:00.000Z"` |

```json
{
    "key": "expires_at",
    "if": [
        { "lt": "now", "variant": "danger", "label": "Lejárt" },
        { "between": ["today", "tomorrow"], "variant": "warning", "label": "Ma jár le" }
    ],
    "else": { "variant": "success", "label": "Érvényes" }
}
```

#### Beágyazott Feltételek (Nested Conditions)

A feltételek egymásba ágyazhatók, maximum 5 szint mélységig:

```json
{
    "key": "role",
    "if": [
        {
            "eq": "admin",
            "key": "status",
            "if": [
                { "eq": "active", "variant": "success", "label": "Admin (aktív)" }
            ],
            "else": { "variant": "warning", "label": "Admin (inaktív)" }
        }
    ],
    "else": { "variant": "secondary", "label": "Felhasználó" }
}
```

### Feltételes Formázás (Conditional Styling)

A `rowRules` és `cellRules` mezők lehetővé teszik, hogy az API válasz alapján feltételesen formázd a táblázat sorait (`<tr>`) és celláit (`<td>`). A formázás ugyanazt a `key`/`if`/`else` feltételrendszert használja, mint a [Feltételes Renderelés](#feltételes-renderelés-conditional-rendering).

#### Prioritási sorrend

> `rowRules` < `cellRules` < `columnConfigs` stílusok

- **`body.rowRules`** — az egész sort (`<tr>`) formázza; minden cellára érvényes
- **`body.columnConfigs.*.cellRules`** — egy adott oszlop celláját (`<td>`) formázza; felülírja a `rowRules`-t

#### Elérhető formázási opciók (`CellFormattingOptions`)

| Mező           | Típus               | Leírás                                                                        | Példa                          |
| -------------- | ------------------- | ----------------------------------------------------------------------------- | ------------------------------ |
| `background`   | `string`            | Háttérszín: Bootstrap szín → `bg-*` osztály, raw CSS → `backgroundColor`     | `"success-subtle"`, `"#fff3cd"` |
| `color`        | `string`            | Szövegszín: Bootstrap szín → `text-*` osztály, raw CSS → `color`             | `"danger-emphasis"`, `"red"`    |
| `borderTop`    | `boolean`           | Felső border megjelenítése                                                    | `true`                         |
| `borderBottom` | `boolean`           | Alsó border megjelenítése                                                     | `true`                         |
| `borderLeft`   | `boolean`           | Bal oldali border megjelenítése                                               | `true`                         |
| `borderRight`  | `boolean`           | Jobb oldali border megjelenítése                                              | `true`                         |
| `borderColor`  | `string`            | Border szín: Bootstrap → `var(--bs-*)`, raw CSS → as-is (default: currentColor) | `"success"`, `"#198754"`     |
| `borderWidth`  | `string`            | Border vastagság (default: `"1px"`)                                          | `"3px"`, `"0.25rem"`          |
| `padding`      | `string`            | Belső margó (CSS shorthand)                                                   | `"8px 16px"`                   |
| `class`        | `string \| string[]` | Extra CSS osztályok                                                           | `"fw-bold"`, `["fw-bold", "text-truncate"]` |
| `style`        | `string`            | Inline CSS string (kebab-case → camelCase parse)                             | `"font-size: 14px"`            |
| `opacity`      | `number`            | Átlátszóság 0–1 között                                                        | `0.6`                          |

#### `body.rowRules` — sor szintű formázás

```json
{
    "body": {
        "rowRules": {
            "key": "status",
            "if": [
                { "eq": "active",   "background": "success-subtle", "borderBottom": true, "borderColor": "success" },
                { "eq": "pending",  "background": "warning-subtle", "borderLeft": true,   "borderWidth": "4px" },
                { "eq": "inactive", "background": "secondary-subtle", "class": "text-muted", "opacity": 0.6 }
            ],
            "else": { "background": "light" }
        }
    }
}
```

#### `body.columnConfigs.*.cellRules` — oszlop szintű cellaformázás

```json
{
    "body": {
        "columnConfigs": {
            "score": {
                "type": "static",
                "cellRules": {
                    "key": "score",
                    "if": [
                        { "gte": 90, "background": "success-subtle", "borderLeft": true, "borderWidth": "3px", "borderColor": "success" },
                        { "gte": 70, "background": "warning-subtle" },
                        { "lt":  50, "background": "danger-subtle",  "opacity": 0.7 }
                    ]
                }
            },
            "expires_at": {
                "type": "static",
                "cellRules": {
                    "key": "expires_at",
                    "if": [
                        { "lt": "now",      "background": "danger-subtle",  "class": "text-decoration-line-through" },
                        { "lt": "tomorrow", "background": "warning-subtle", "borderLeft": true }
                    ]
                }
            }
        }
    }
}
```

> **Megjegyzés:** A `cellRules`-ban ugyanazok a feltétel operátorok és dátum kulcsszavak érvényesek, mint a [Feltételes Renderelés](#feltételes-renderelés-conditional-rendering) szekcióban.

### Pagináció

Az Aura automatikusan kezeli a Laravel API Resource és Pagination response formátumait (`meta` és `links` objektumok).

## Akadálymentesség

A kirajzolt táblázat hordozza azokat a szemantikákat, amikre a segítő technológiáknak szükségük
van — nincs mit beállítani, a markup eleve így készül:

- **Minden `<th>` megadja a hatókörét.** A fejléccellák, a kereső sor cellái, az „összes
  kijelölése" cella és a lábléccellák `scope="col"`-t kapnak, több oszlopot átfogó cellánál
  (`colspan > 1`) pedig `scope="colgroup"`-ot. Enélkül a képernyőolvasó nem tudja a
  cellát a fejlécéhez társítani (WCAG 1.3.1).
- **A rendezhető oszlop bejelenti a rendezési állapotát.** A `<th>`-ja
  `aria-sort="ascending" | "descending" | "none"` attribútumot kap a store rendezési állapotából.
  A nem rendezhető oszlopon egyáltalán nincs `aria-sort`, tehát az attribútum sosem ígér nem
  létező lehetőséget; a rendezhető oszlop `none` értéke épp azt közli, hogy az oszlop
  *rendezhető*.
- **A rendezésvezérlő valódi `<button>`.** Fókuszálható és magától reagál az Enter/Space
  billentyűre, tehát a rendezés már nem csak egérrel érhető el. A neve a `sortColumn`
  [label](#labels) (alapból `'Sort column'`), a benne lévő ikon pedig `aria-hidden` — az állapotot
  az `aria-sort` mondja el, az ikon bejelentése csak zaj lenne.

- **A táblázat `aria-busy` jelölést kap betöltés közben.** A kérés ideje alatt a `<table>`-en
  `aria-busy="true"` van, így a félig renderelt táblázat nem végeredményként hangzik el; az overlay
  spinnere pedig `role="status"` elem, amelynek akadálymentes neve a `loading`
  [label](#labels) (alapból `'Loading...'`).

Nyitott: a `<table>` továbbra sem kap sem `<caption>`-t, sem saját `aria-label`-t.

## Error Handling

Az Aura plugin beépített, ECS-kompatibilis (Elastic Common Schema) hibakezelést, UI megjelenítést és távoli error reporting-ot biztosít.

### Error Display UI

Az Aura automatikusan megjeleníti a hibákat a felhasználónak severity alapú prioritással:

#### Critical/Error szintű hibák (Full Screen)

Ha `critical` vagy `error` severity-jű hiba van, a táblázat nem jelenik meg, helyette csak a hibák láthatók:

```typescript
const core = useCoreStore('my-table', props);

// Critical hiba hozzáadása
core.errorStore.addError({
    severity: 'critical',
    component: 'DataLoader',
    action: 'loadData',
    type: 'network',
    message: 'Failed to connect to server',
});

// A komponens automatikusan full screen error state-be vált
// Csak az ErrorHandler komponens jelenik meg
```

**Megjelenítés:**

- Teljes oldal helyettesítése error state-tel
- Bootstrap alert-dismissible pattern
- Container-ben, padding-gel
- Max 10 hiba látható egyszerre
- "Összes törlése" gomb elérhető

#### Warning/Info/Debug hibák (Top Notification)

Ha `warning`, `info` vagy `debug` severity-jű hiba van, a hibák a content tetején jelennek meg, és a táblázat normálisan megjelenik alatta:

```typescript
const core = useCoreStore('my-table', props);

// Warning hozzáadása
core.errorStore.addError({
    severity: 'warning',
    component: 'DataLoader',
    action: 'loadData',
    type: 'validation',
    message: 'Some data might be outdated',
});

// A táblázat normálisan megjelenik
// A warning a content tetején látható
```

**Megjelenítés:**

- Hibák a táblázat előtt, content tetején
- Sima Bootstrap alert stílusban
- Max 5 hiba látható egyszerre
- Táblázat normálisan működik alatta

#### Prioritási sorrend

1. **Critical/Error** → Full screen error state (táblázat nem jelenik meg)
2. **Warning/Info/Debug** → Top notification (táblázat megjelenik)

Ha van critical/error hiba, akkor a warning-ok nem jelennek meg (a critical felülír mindent).

#### ErrorHandler Komponens Props

Az ErrorHandler komponens a következő props-okat fogadja:

```typescript
interface ErrorHandlerProps {
    errorStore: ErrorHandlerStore; // Error store instance (kötelező)
    maxVisible?: number; // Max hibák száma (default: 5)
    showDismissAll?: boolean; // "Összes törlése" gomb (default: true)
    severityFilter?: ErrorSeverity[]; // Severity szűrő (default: ['critical', 'error', 'warning'])
    componentFilter?: string; // Komponens szűrő (optional)
}
```

**Használat:**

```typescript
import { ErrorHandler } from '@tamas-labs/aura';

// Custom ErrorHandler használat komponensben
<ErrorHandler
  :errorStore="core.errorStore"
  :maxVisible="10"
  :showDismissAll="true"
  :severityFilter="['error', 'warning']"
/>
```

### Error Handler Store

Az `useErrorHandlerStore` központosított hibakezelést és error tracking-et biztosít:

```typescript
import { useErrorHandlerStore } from '@tamas-labs/aura';

// Error handler store létrehozása
const errorStore = useErrorHandlerStore('my-error-store');

// Hiba hozzáadása
errorStore.addError({
    severity: 'error',
    component: 'UserForm',
    action: 'submit',
    type: 'validation',
    message: 'Invalid email format',
    key: 'email',
    details: 'Email must contain @ symbol',
});

// Hibák lekérdezése
console.log(errorStore.errors);
console.log(errorStore.hasErrors); // true/false
console.log(errorStore.isValid); // true/false

// Hibák törlése
errorStore.clearErrors(); // Összes hiba törlése
errorStore.clearByKey('email'); // Csak az email kulcsú hibák törlése
errorStore.clearByComponent('UserForm'); // Komponens hibáinak törlése
errorStore.clearByType('validation'); // Típus szerinti törlés

// Hibák szűrése
const criticalErrors = errorStore.criticalErrors;
const warnings = errorStore.warnings;
const emailErrors = errorStore.getErrorsByKey('email');
```

#### Automatikus hibakulcsok

A `key` az `addError()` bemenetén opcionális, de **minden eltárolt hibának van kulcsa**: ha a hívó
nem ad meg egyet, a store determinisztikusan képzi a hiba saját azonosítójából,
`component.action.type` alakban.

```typescript
errorStore.addError({
    severity: 'error',
    component: 'ApiResourcesStore',
    action: 'fetchData',
    type: 'api',
    message: 'Request failed with status code 500',
});

errorStore.errors[0].key; // 'ApiResourcesStore.fetchData.api'
```

Ez azért fontos, mert a kulcs teszi a hibát *eltávolíthatóvá*: a hiba-felület csak a kulccsal
rendelkező hibákhoz rajzol elutasító gombot, és a `clearByKey()` az egyetlen mód egyetlen hiba
törlésére. Eddig egy kulcs nélkül bejelentett hiba — például egy sikertelen lekérés — úgy
blokkolhatta a táblázatot, hogy a felhasználónak nem maradt eszköze a továbblépésre.

A generált kulcs egy adott hibaforrásra állandó, tehát az ugyanonnan ismétlődő hibák azonos
kulcsot kapnak, és egyetlen `clearByKey()` hívással törölhetők. Az így generált kulcsok a
hiba-felületen **nem** jelennek meg badge-ként (csak a mellettük álló komponens- és típus-badge-et
ismételnék); a saját magad által megadott kulcs a korábbi módon látszik.

#### Az ismétlődő hibák összevonódnak, a lista pedig korlátos

Az újra jelentkező ugyanaz a probléma nem kap külön bejegyzést: a store összevonja a már meglévővel,
és számolja az előfordulásokat. Két hiba akkor „ugyanaz a probléma", ha a `key`, a `severity`, a
`message` és a `details` is egyezik — így egy rossz típus és egy tartományon kívüli érték ugyanarra
a config-kulcsra két külön hiba marad, egy 30 másodpercenként frissülő tábla hibázó végponttal
viszont pontosan egyet ad.

```typescript
errorStore.addError(failure); // bekerül
errorStore.addError(failure); // összevonva az elsővel

errorStore.errors.length; // 1
errorStore.errors[0].count; // 2
errorStore.errors[0].timestamp; // az első előfordulás
errorStore.errors[0].lastTimestamp; // a legutóbbi
```

A `count` és a `lastTimestamp` **hiányzik, amíg a hiba nem ismétlődött**, tehát az előfordulások
száma `count ?? 1`. A hiba-felület az összevont hibákra `×N` badge-et rajzol, tooltipként az
`errorOccurrences` [label](#labels) szövegével. A `metadata` az **első** előfordulást írja le — az
az egy eseményhez tartozó kontextus, nem a problémához —, és a [távoli
hibajelentés](#remote-error-reporting) továbbra is minden előfordulást elküld, mert az összesítés
oda tartozik.

Az összevonás önmagában nem korlátozza a tömböt (egy válasz végtelen sok *különböző* hibát is
termelhet), ezért a store legfeljebb **50** hibát tart. Efölött a legrégebbiek esnek ki, két
szabály szerint: az `info`/`warning`/`debug` mindig előbb megy, mint egy `critical`/`error` — egy
figyelmeztetés-áradat nem szoríthatja ki azt a hibát, ami megmagyarázza a táblázat hiányát —, és a
pipeline saját jelzései (`errorReporting.failed`, `errorReporting.dropped`,
`errorHandler.limitReached`) sosem esnek ki. Maga a korlát elérése is bekerül egy
`errorHandler.limitReached` kulcsú `info` bejegyzésként, aminek a `metadata.totalDropped` mezője
megmondja, mennyi veszett el.

#### API-hibaüzenetek

A sikertelen kérés korábban a nyers axios-üzenettel került be — „Request failed with status code
500", „Network Error". Ez fejlesztőnek íródott, fejlesztőnek: nem fordítható, és a végfelhasználó
nem tud vele mit kezdeni. Az üzenetet ezért a **hiba osztálya** választja ki, a szövege pedig a
[`labels`](#labels)-ből jön, a nyers szöveg meg szó szerint megmarad a `details` mezőben:

| Hiba                                   | Label              | Alapértelmezett üzenet                                                  |
| -------------------------------------- | ------------------ | ----------------------------------------------------------------------- |
| A kérés el sem jutott a szerverig       | `apiErrorNetwork`  | Could not reach the server. Please check your connection and try again.  |
| A kérés kifutott az időből              | `apiErrorTimeout`  | The server took too long to respond. Please try again.                   |
| `4xx` válasz                            | `apiErrorClient`   | The server rejected the request (`{status}`).                            |
| `5xx` válasz                            | `apiErrorServer`   | The server ran into an error (`{status}`). Please try again later.       |
| Minden más                              | `apiErrorUnknown`  | Could not load the data. Please try again.                               |

```typescript
app.use(Aura, {
    labels: {
        apiErrorServer: 'A szerver hibába futott ({status}). Kérjük, próbáld újra később.',
    },
});
```

A tárolt hiba mindent megtart, amire a fejlesztőnek szüksége van:

```typescript
{
    severity: 'error',
    type: 'api', // minden osztályra ugyanaz, így a kulcs marad 'ApiResourcesStore.fetchData.api'
    message: 'The server ran into an error (503). Please try again later.', // ezt látja a felhasználó
    details: 'Request failed with status code 503', // a nyers axios-üzenet
    metadata: { kind: 'server', status: 503, code: 'ERR_BAD_RESPONSE' },
}
```

A `type` szándékosan marad `api` minden osztályra: a [hibakulcs](#automatikus-hibakulcsok) a
`component.action.type`-ból generálódik, és az alábbi öntakarítás is, meg a hoszt
`clearByKey('ApiResourcesStore.fetchData.api')` hívása is arra épül, hogy ez mindig ugyanaz a
kulcs. Az osztály helyette a `metadata.kind` mezőben van.

#### Feldolgozhatatlan válaszok

A kérés lefuthat sikeresen úgy is, hogy a táblának mégsem marad mit megjelenítenie: a fejléc
elbukik a validáción, vagy az utána következő előfeldolgozás dob egy olyan tartalmon, amit egyik
séma sem utasított el. Ez **nem** API-hiba, és nem is úgy kerül bejelentésre — saját típust,
kulcsot és üzenetet kap:

|            | Sikertelen kérés                   | Feldolgozhatatlan válasz                  |
| ---------- | ---------------------------------- | ----------------------------------------- |
| `type`     | `api`                              | `validation`                              |
| Kulcs      | `ApiResourcesStore.fetchData.api`  | `ApiResourcesStore.fetchData.validation`  |
| Üzenet     | hibaosztály szerint (fenti tábla)  | `apiErrorInvalidResponse`                 |
| `details`  | a nyers axios-üzenet               | a nyers kivétel-üzenet                    |

A megkülönböztetés mindkét közönségnek számít. A felhasználót többé nem kérjük egy olyan kérés
újrapróbálására, ami már sikerült — az újrapróbálás pontosan ugyanazt a hibát reprodukálná —, a
fejlesztő első pillantása pedig a válasz tartalmára esik, nem a hálózati fülre. A válaszon *belül*
keletkező, mezőnkénti validációs hibákat (`response.header.…`) ez nem érinti, azok megtartják a
saját kulcsukat; ez a hiba arra az esetre való, amikor a feldolgozás még azelőtt megállt, hogy
össze lehetett volna gyűjteni őket.

`severity: 'error'`, tehát a táblát lecseréli a hiba-felületre, és pontosan úgy takarítja el magát,
mint az alábbi kettő.

#### Önmagukat takarító lekérési hibák

A sikertelen kérés `severity: 'error'` szinten kerül bejelentésre, ami a teljes táblázatot
lecseréli a hiba-felületre. Ez a hiba egyetlen próbálkozásról szól, ezért a `fetchData()` egy
későbbi sikeres kérésnél — még a válasz feldolgozása előtt — kitakarítja, így a táblázat magától
visszatér, oldal-újratöltés nélkül:

```typescript
await apiStore.fetchData(); // hibára fut → 'ApiResourcesStore.fetchData.api', a táblázat blokkolt
await apiStore.fetchData(); // sikeres → a hiba eltűnik, a táblázat újra megjelenik
```

A cross-origin blokk (`ApiResourcesStore.fetchData.authorization`) és a feldolgozhatatlan válasz
(`ApiResourcesStore.fetchData.validation`) ugyanígy törlődik: ha a konfiguráció vagy a válasz úgy
változik, hogy a következő kérés végigmegy, az első sikeres eltakarítja őket. Csak ez a három
kulcs törlődik — a válasz mezőnkénti validációs hibái és a más komponensek által bejelentett hibák
érintetlenek maradnak. A takarítás minden kimenetel előtt lefut, tehát az ismételten
elbukó kérés a legutóbbi próbálkozását jelenti, nem halmoz próbálkozásonként egy-egy azonos
riasztást.

#### Újrapróbálkozás gomb

A blokkoló hibaállapot a táblázattal együtt a toolbart is elrejti, tehát az ottani frissítés gomb
épp akkor nem elérhető, amikor kellene. Ezért ez az állapot saját **újrapróbálkozás gombot**
renderel, ami a `fetchData()`-t hívja; a fenti öntakarítással együtt egyetlen sikeres kérés
elég ahhoz, hogy a táblázat visszatérjen. A felirata a `retry` [label](#labels) (alapból
`'Retry'`), a gomb a tesztekben `[data-testid="aura-error-retry"]` alatt található.

### ECS Error objektum struktúra

```typescript
interface ECSError {
    severity: 'critical' | 'error' | 'warning' | 'info' | 'debug';
    timestamp: string; // ISO 8601 formátum
    component: string; // Komponens neve
    action: string; // Művelet neve
    level: ErrorSeverity; // Backwards compatibility
    type: 'validation' | 'network' | 'authentication' | 'authorization' | 'not_found' | 'server' | 'client' | 'api' | 'unknown';
    message: string; // Hibaüzenet
    key?: string; // Kulcs (pl. mező neve); megadás híján component.action.type alakban generált
    details?: string; // Részletes leírás
    id?: string; // Egyedi azonosító
    stack?: string; // Stack trace
    count?: number; // Előfordulások; hiányzik, amíg a hiba csak egyszer történt
    lastTimestamp?: string; // Legutóbbi előfordulás; hiányzik, amíg nem ismétlődött
    metadata?: Record<string, unknown>; // További adatok
}
```

### Core State integráció

A `useCoreStore` beépített error state-et tartalmaz az `errorStore` property-n keresztül:

```typescript
import { useCoreStore } from '@tamas-labs/aura';

const coreStore = useCoreStore('my-table', props);

// Error state elérése az errorStore-on keresztül
console.log(coreStore.errorStore.errors); // ECSError[]
console.log(coreStore.errorStore.hasErrors); // boolean
console.log(coreStore.errorStore.isValid); // boolean
```

### Példák

**Validációs hiba hozzáadása:**

```typescript
errorStore.addError({
    severity: 'error',
    component: 'LoginForm',
    action: 'validate',
    type: 'validation',
    message: 'Email is required',
    key: 'email',
});
```

**Hálózati hiba hozzáadása:**

```typescript
errorStore.addError({
    severity: 'critical',
    component: 'ApiService',
    action: 'fetchUsers',
    type: 'network',
    message: 'Failed to fetch users',
    details: 'Connection timeout after 30 seconds',
    metadata: { endpoint: '/api/users', statusCode: 0 },
});
```

**Hibák szűrése severity szerint:**

```typescript
const criticalErrors = errorStore.getErrorsBySeverity('critical');
const warnings = errorStore.getErrorsBySeverity('warning');
```

### Remote Error Reporting

Az Aura támogatja a hibák távoli szolgáltatásokba való küldését automatikus batch feldolgozással és retry logikával.

#### Beállítás

**Custom endpoint használata:**

```typescript
app.use(Aura, {
    errorReporting: true,
    errorReportingEndpoint: 'https://api.example.com/errors',
    errorReportingService: 'custom',
    errorReportingApiKey: 'optional-api-key',
});
```

**Szolgáltatások saját transzport nélkül:**

> ⚠️ A `sentry` / `logrocket` / `rollbar` **elfogadott, de nem implementált** érték —
> nincs mögöttük SDK-integráció. Ha ezek egyikét állítod be: nem blokkoló
> **warning banner**, a reporter pedig pontosan úgy küld az
> `errorReportingEndpoint`-ra, mintha `custom` lenne. **Endpoint nélkül nincs
> mire visszaesni**, ezért a küldés hibára fut, és a hiba az
> `errorReporting.failed` kulcs alatt megjelenik (ld. lentebb a reporter
> megfigyelhetőségét) — a hibák soha nem tűnnek el némán.

```typescript
// Elfogadott, de pontosan úgy viselkedik, mint a `custom` — az endpoint számít
app.use(Aura, {
    errorReporting: true,
    errorReportingService: 'sentry',
    errorReportingEndpoint: 'https://api.example.com/errors',
    errorReportingApiKey: 'optional-api-key',
});
```

Ha egy vendor SDK-nak akarod továbbadni a hibákat, olvasd ki őket a store-ból
(`useErrorHandlerStore(...).errors`) a hoszt alkalmazásban, vagy irányítsd az
`errorReportingEndpoint`-ot a saját backendedre, ami továbbítja őket.

#### Működés

- **Automatikus reporting**: Minden `addError()` hívás automatikusan elküldi a hibát a távoli szolgáltatásnak
- **Batch processing**: A hibák batch-ekben kerülnek küldésre (alapértelmezett: 10 hiba/batch)
- **Automatikus flush**: 30 másodpercenként automatikus küldés
- **Retry logic**: Maximum 3 újrapróbálkozás hálózati hiba esetén
- **Linear backoff**: Lineárisan növekvő várakozási idő újrapróbálkozások között (1s, 2s, 3s)
- **Sorhossz-korlát**: legfeljebb 100 hiba vár küldésre, efölött a legrégebbiek kiesnek — így
  egy elérhetetlen endpoint nem növelheti korlátlanul a sort (az ECS-hibák `context` objektumot
  is hordoznak, ezért a korlátlan sor valódi szivárgás egy hosszan futó SPA-ban)
- **Hiba utáni backoff**: sikertelen köteg után a következő próbálkozás egyre később indul
  (a flush-intervallumból kiindulva duplázódva, 5 percnél megállva) ahelyett, hogy minden
  ciklusban újrapróbálkozna
- **Élettartam**: a reporter a táblázat store-jáig él, nem egy komponensig — a `v-if`-fel
  elrejtett, majd újra megjelenített táblázat továbbra is jelent. A store megszűnésekor
  (egy utolsó flush-sal) áll le; a `useErrorHandlerStore(...).destroy()` ugyanezt teszi
  explicit módon, és **végleges** (utána a példány semmit nem fogad el)
- **Látható hibák**: a sikertelen flush és a sor túlcsordulása magába a hibastore-ba kerül be,
  az `errorReporting.failed`, illetve `errorReporting.dropped` kulcs alatt (kulcsonként
  egyszer, a `metadata`-ban az okkal, a várakozó hibák számával és a következő próbálkozás
  idejével). **Nem** a konzolra írjuk: a produkciós build minden `console.*` hívást eltávolít,
  márpedig épp ott fáj a legjobban a néma hibajelentő. Kiolvasás a
  `useErrorHandlerStore(...).errors`-ból:

    ```typescript
    const errorStore = useErrorHandlerStore('my-table-errors');
    const reportingBroken = errorStore.getErrorsByKey('errorReporting.failed').length > 0;
    ```

    A severitás szándékosan `info` — egy elérhetetlen telemetria-endpoint nem cserélheti le a
    táblázatot a hiba-felületre (`error`), és nem dobhat bannert a végfelhasználónak
    (`warning`)

#### Custom Endpoint Request Formátum

```typescript
POST https://api.example.com/errors
Content-Type: application/json
Authorization: Bearer your-api-key

{
  "errors": [
    {
      "severity": "error",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "component": "UserForm",
      "action": "validate",
      "level": "error",
      "type": "validation",
      "message": "Invalid email",
      "key": "email",
      "details": "Email must contain @ symbol",
      "metadata": {
        "receivedValue": "invalid-email",
        "receivedType": "string"
      }
    }
  ]
}
```

#### Konfigurációs opciók

Az error reporter az alábbi beállításokat használja:

- **batchSize**: 10 hiba/batch
- **flushInterval**: 30000 ms (30 másodperc)
- **maxRetries**: 3 újrapróbálkozás
- **retryDelay**: 1000 ms (1 másodperc) kezdeti késleltetés

#### Store cleanup

Az error reporter automatikusan megsemmisítésre kerül amikor a komponens unmount-olódik:

```typescript
// Manuális cleanup (ha szükséges)
await errorStore.destroy();
```

## Store API

Az Aura plugin Pinia store-okat használ az állapotkezeléshez. Minden store `storeId` alapján elérhető.

### Core Store

A Core Store tartalmazza az alapvető konfigurációt és integrál két dedikált store-t.

```typescript
import { useCoreStore } from '@tamas-labs/aura';

// Store létrehozása
const coreStore = useCoreStore('my-table-id', props);

// Config store elérése (tartalmazza az összes validált config értéket)
console.log(coreStore.config.debug);
console.log(coreStore.config.rowsNumber);
console.log(coreStore.config.siteName);

// Error handler store elérése
console.log(coreStore.errorStore.hasErrors);
console.log(coreStore.errorStore.errors);

// Props objektum elérése
console.log(coreStore.props);
```

#### Core Store properties

- **`config`**: Config Store instance (lásd Config Store)
- **`props`**: Az átadott props objektum
- **`errorStore`**: Error Handler Store instance (lásd Error Handler Store)

### Config Store

A Config Store minden validált konfigurációs értéket tárol `ref`-ként.

```typescript
import { useConfigStore } from '@tamas-labs/aura';

// Store létrehozása
const configStore = useConfigStore('my-table-id-config', mergedConfig, errorHandlerStoreId);

// Config értékek elérése (minden érték ref)
console.log(configStore.debug.value); // boolean
console.log(configStore.siteName.value); // string | null
console.log(configStore.rowsNumber.value); // number | null
console.log(configStore.icons.value); // Record<string, string[]>
console.log(configStore.variants.value); // Record<string, string>
```

#### Config Store properties (minden ref)

**Rendszerváltozók:**

- `storeId`: `string` - Store azonosító
- `debug`: `Ref<boolean | null>` - Debug mód
- `siteToken`: `Ref<boolean | string | null>` - Site token
- `siteName`: `Ref<string | null>` - Site neve
- `urlParameter`: `Ref<string | null>` - URL paraméter
- `href`: `Ref<string | null>` - API endpoint URL

**URL konfiguráció:**

- `urlParameterLastSegment`: `Ref<string | null>` - URL utolsó szegmense
- `urlStructure`: `Ref<string | null>` - URL struktúra sablon

**Lapozás:**

- `paginateValues`: `Ref<number[] | null>` - Elérhető lapozási értékek
- `rowsNumber`: `Ref<number | null>` - Sorok száma oldalanként
- `externalPaginator`: `Ref<boolean | null>` - Szerver oldali lapozás

**Megjelenítés:**

- `showFooter`: `Ref<boolean | null>` - Footer megjelenítése
- `actionButtons`: `Ref<ActionButtonItem[] | null>` - Action gombok
- `showHeaderSearch`: `Ref<boolean | null>` - Header keresés
- `classes`: `Ref<Record<string, string[]>>` - CSS osztályok
- `icons`: `Ref<Record<string, string[]>>` - Ikon konfiguráció
- `variants`: `Ref<Record<string, string>>` - Bootstrap variánsok

**Nemzetköziesítés:**

- `dateStyle`: `Ref<'short' | 'medium' | 'long' | null>` - Dátum megjelenítési stílus
- `timeZone`: `Ref<string | null>` - Időzóna
- `utcOffset`: `Ref<string | null>` - UTC offset
- `localization`: `Ref<string | null>` - Lokalizáció
- `currencyCode`: `Ref<string | null>` - Pénznem kód (ISO 4217)

**Megjelenítés (haladó):**

- `accentInsensitiveSearch`: `Ref<boolean | null>` - Ékezetek figyelmen kívül hagyása a kliensoldali keresésben
- `highlightSearchResults`: `Ref<boolean | null>` - Keresési találatok kiemelése
- `highlightClass`: `Ref<string | null>` - Kiemelés CSS osztálya

**Haladó:**

- `resources`: `Ref<boolean | null>` - Resources mód
- `requestMethod`: `Ref<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | null>` - HTTP metódus
- `disableSession`: `Ref<boolean | null>` - Session letiltás
- `sessionKey`: `Ref<string | null>` - sessionStorage-kulcs felülírása (null → a storeId-ból képződik)
- `emptyStateMessage`: `Ref<string | null>` - Üres állapot üzenete (a `labels.emptyState` elavult aliasa)
- `allowExternalApi`: `Ref<boolean | null>` - Külső API
- `errorReporting`: `Ref<boolean | null>` - Hiba jelentés
- `sliceEndText`: `Ref<string | null>` - Szöveg vágás karakterek
- `errorReportingEndpoint`: `Ref<string | null>` - Error reporting endpoint URL
- `errorReportingService`: `Ref<'sentry' | 'logrocket' | 'rollbar' | 'custom' | null>` - Error reporting szolgáltatás
- `errorReportingApiKey`: `Ref<string | null>` - Error reporting API kulcs

### Error Handler Store ECS-kompatibilis hibakezeléshez

Dedikált store az ECS-kompatibilis hibakezeléshez.

```typescript
import { useErrorHandlerStore } from '@tamas-labs/aura';

// Store létrehozása
const errorStore = useErrorHandlerStore('my-error-store');
```

#### Error Handler Store properties

- **`errors`**: `Ref<ECSError[]>` - Hibák tömbje
- **`hasErrors`**: `ComputedRef<boolean>` - Van-e hiba
- **`isValid`**: `ComputedRef<boolean>` - Érvényes-e az állapot
- **`criticalErrors`**: `ComputedRef<ECSError[]>` - Critical hibák
- **`errorLevelErrors`**: `ComputedRef<ECSError[]>` - Error szintű hibák
- **`warnings`**: `ComputedRef<ECSError[]>` - Figyelmeztetések

#### Error Handler Store methods

**Hiba hozzáadása:**

```typescript
errorStore.addError({
    severity: 'error',
    component: 'UserForm',
    action: 'validate',
    type: 'validation',
    message: 'Invalid email format',
    key: 'email',
    details: 'Email must contain @ symbol',
});
```

**Schema validation hiba hozzáadása:**

```typescript
errorStore.addSchemaValidationError(
    'BooleanValidator',
    'Invalid boolean value',
    'debug',
    'not-a-boolean',
    'Expected boolean, received string',
);
```

**Hibák törlése:**

```typescript
// Összes hiba törlése
errorStore.clearErrors();

// Kulcs alapján törlés
errorStore.clearByKey('email');

// Komponens alapján törlés
errorStore.clearByComponent('UserForm');

// Típus alapján törlés
errorStore.clearByType('validation');
```

**Hibák szűrése:**

```typescript
// Severity szerint
const criticalErrors = errorStore.getErrorsBySeverity('critical');
const warnings = errorStore.getErrorsBySeverity('warning');

// Komponens szerint
const formErrors = errorStore.getErrorsByComponent('UserForm');

// Kulcs szerint
const emailErrors = errorStore.getErrorsByKey('email');
```

**Store cleanup:**

```typescript
// Error reporter megsemmisítése
await errorStore.destroy();
```

## Használati Példák

### 1. Alapvető használat

```typescript
import { createApp } from 'vue';
import Aura from '@tamas-labs/aura';
import App from './App.vue';

const app = createApp(App);

// Plugin regisztráció alapértelmezett beállításokkal
app.use(Aura, {
    storeId: 'my-table',
    debug: true,
    rowsNumber: 10,
});

app.mount('#app');
```

### 2. Multi-instance használat

Több táblázat példány használata különböző store ID-kkal:

```typescript
import { createApp } from 'vue';
import Aura from '@tamas-labs/aura';

const app = createApp(App);

// Felhasználók táblázat
app.use(Aura, {
    storeId: 'users-table',
    debug: true,
    rowsNumber: 25,
    externalPaginator: true,
});

// Termékek táblázat
app.use(Aura, {
    storeId: 'products-table',
    debug: false,
    rowsNumber: 10,
    externalPaginator: false,
});

app.mount('#app');
```

### 3. Szerver oldali lapozás API integrációval

```typescript
import { createApp } from 'vue';
import Aura from '@tamas-labs/aura';

const app = createApp(App);

app.use(Aura, {
    storeId: 'server-table',
    externalPaginator: true, // Szerver oldali lapozás
    rowsNumber: 25,
    requestMethod: 'POST', // API request metódus
    href: '/api/v1/users/data', // API endpoint
});

app.mount('#app');
```

**Laravel-kompatibilis API válasz:**

```json
{
    "items": [
        { "id": 1, "name": "John Doe", "email": "john@example.com" },
        { "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
    ],
    "columns": [
        { "key": "id", "label": "ID" },
        { "key": "name", "label": "Név" },
        { "key": "email", "label": "Email" }
    ],
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 10,
        "per_page": 25,
        "to": 25,
        "total": 250
    },
    "links": {
        "first": "/api/v1/users/data?page=1",
        "last": "/api/v1/users/data?page=10",
        "prev": null,
        "next": "/api/v1/users/data?page=2"
    }
}
```

### 4. Egyedi ikonok használata (Lucide Icons)

```typescript
import { createApp } from 'vue';
import Aura from '@tamas-labs/aura';

const app = createApp(App);

app.use(Aura, {
    storeId: 'custom-icons-table',
    icons: {
        sortable: {
            up: ['lucide', 'arrow-up'],
            down: ['lucide', 'arrow-down'],
            both: ['lucide', 'arrows-up-down'],
        },
        filterable: ['lucide', 'filter'],
        search: ['lucide', 'search'],
        clear: ['lucide', 'x'],
        settings: ['lucide', 'settings'],
        edit: ['lucide', 'pencil'],
        destroy: ['lucide', 'trash-2'],
        show: ['lucide', 'eye'],
    },
});

app.mount('#app');
```

### 5. Nemzetközi (i18n) beállítások

```typescript
import { createApp } from 'vue';
import Aura from '@tamas-labs/aura';

const app = createApp(App);

// Angol lokalizáció, USD pénznem
app.use(Aura, {
    storeId: 'international-table',
    localization: 'en-US',
    currencyCode: 'USD',
    dateStyle: 'medium',
    timeZone: 'America/New_York',
    utcOffset: '-05:00',
});

app.mount('#app');
```

### 6. Teljes konfiguráció Bootstrap testreszabással

```typescript
import { createApp } from 'vue';
import Aura from '@tamas-labs/aura';

const app = createApp(App);

app.use(Aura, {
    storeId: 'custom-table',
    debug: false,
    siteName: 'My Admin Panel',
    rowsNumber: 50,
    paginateValues: [10, 25, 50, 100, 200],
    externalPaginator: true,

    // Megjelenítés
    showFooter: true,
    actionButtons: ['refresh', 'export', 'settings'],
    showHeaderSearch: true,

    // Bootstrap osztályok
    classes: {
        table: ['table-striped', 'table-hover', 'table-sm', 'table-bordered'],
        button: ['btn', 'btn-sm', 'mx-1'],
        icon: ['mx-2'],
        dataTypes: {
            numbers: ['text-end', 'fw-bold'],
            currency: ['text-end', 'text-success'],
            unit: ['text-end', 'text-muted'],
        },
    },

    // Bootstrap variánsok
    variants: {
        primary: 'primary',
        destroy: 'danger',
        edit: 'warning',
        show: 'info',
        success: 'success',
    },

    // HTTP konfiguráció
    requestMethod: 'POST',
    href: '/api/admin/resources',

    // Nemzetközi beállítások
    localization: 'hu-HU',
    currencyCode: 'HUF',
    dateStyle: 'short',
    timeZone: 'Europe/Budapest',
});

app.mount('#app');
```

### 7. Error Handling használat

```typescript
import { createApp } from 'vue';
import Aura from '@tamas-labs/aura';
import { useErrorHandlerStore, useCoreStore } from '@tamas-labs/aura';

const app = createApp(App);

app.use(Aura, {
    storeId: 'error-handling-table',
    debug: true,
    errorReporting: true,
});

app.mount('#app');

// Komponensen belül
export default {
    setup() {
        // Core store elérése
        const coreStore = useCoreStore('error-handling-table', props);

        // Error store elérése
        const errorStore = coreStore.errorStore;

        // Hibák kezelése
        watch(
            () => errorStore.hasErrors,
            (hasErrors) => {
                if (hasErrors) {
                    console.error('Hibák történtek:', errorStore.errors);

                    // Critical hibák külön kezelése
                    if (errorStore.criticalErrors.length > 0) {
                        alert('Kritikus hiba történt!');
                    }
                }
            },
        );

        return {
            hasErrors: errorStore.hasErrors,
            errors: errorStore.errors,
            isValid: errorStore.isValid,
        };
    },
};
```

## Publikus API-felület

Az itt felsorolt nevek a csomag belépési pontjából exportáltak, és szemantikus verziózás
védi őket: törő módon csak főverzió-emeléssel változhatnak. Ami **nincs** a listán, az
belső: az Aura fejlesztése közben a forrásfából importálható, a telepített csomagból nem.

| Fajta | Nevek |
| --- | --- |
| Plugin | `AuraPlugin` (egyben az alapértelmezett export) |
| Komponensek | `Aura`, `ErrorHandler` |
| Store factory-k | `useCoreStore`, `useConfigStore`, `useErrorHandlerStore`, `useApiResourcesStore` |
| Típusok | a [TypeScript Támogatás](#typescript-támogatás) fejezetben felsorolt 42 típus |

A komponensnek nincs `emits`-e és `expose()`-a, ezért a store factory-k jelentik a
támogatott módot arra, hogy a táblázat állapotát (kijelölés, lapozás, rendezés) kívülről
olvasd, vagy újratöltést válts ki.

### Belső — szándékosan nem exportált

Az alábbi segédfüggvényeket ez a README **belső architektúraként** dokumentálja, ezért a
példáik forrásútvonalról (`@/...`) importálnak, nem a `@tamas-labs/aura`-ból. Amíg a 0.x
sorozatban belsők maradnak, főverzió-emelés nélkül refaktorálhatók.

| Név | Forrás |
| --- | --- |
| `formatValue` | `src/features/table/utils/formatters/formatValue.ts` |
| `useFormattedContent` | `src/features/table/utils/composables/useFormattedContent.ts` |
| `resolveValue` | `src/utils/resolve-value.util.ts` |
| `filterItemsBySearch` | `src/utils/search-items.util.ts` |
| `sortItemsByRules` | `src/utils/sort-items.util.ts` |
| `htmlSanitizer` | `src/validators/sanitizers/html.sanitizer.ts` |
| `createLazyValidator` | `src/validators/utils/lazy-loader.ts` |
| `getOrigin` / `getHref` / `getParameter` | `src/utils/location.ts` |
| `ErrorItem` | `src/features/error-handler/components/ErrorItem.tsx` |

Ha alkalmazás-kódból szükséged van valamelyikre, nyiss egy issue-t — egy név publikussá
tétele minor release, a visszavonása viszont nem az.

## TypeScript Támogatás

A plugin teljes TypeScript támogatással rendelkezik. Minden típus elérhető importként:

```typescript
// Alap típusok
import type {
    AuraConfig,
    AuraProps,
    PropValidator,
    ECSError,
    ErrorSeverity,
    ErrorType,
    ErrorState,
    CoreStore,
    ConfigStore,
    ErrorHandlerStore,
} from '@tamas-labs/aura';

// Cell típusok
import type {
    BaseCellConfig,
    HeaderCellConfig,
    BodyCellConfig,
    FooterCellConfig,
} from '@tamas-labs/aura';

// API Response típusok
import type {
    ApiResponse,
    Header,
    HeaderCell,
    HeaderRow,
    HeaderSettings,
    Body,
    BodySettings,
    Footer,
    FooterRow,
    FooterSettings,
    ColumnConfig,
    CellType,
    SortItem,
    SortDirection,
    SearchItem,
    QueryParams,
    ApiResourcesStore,
    PaginationMeta,
    PaginationLinks,
    ConditionalOperator,
    ConditionalConfig,
    ConditionalRule,
    CellFormattingOptions,
    CellRules,
    RowRules,
    BootstrapColor,
    Align,
    Size,
} from '@tamas-labs/aura';

// Config típus használata
const config: AuraConfig = {
    storeId: 'typed-table',
    debug: true,
    rowsNumber: 25,
};

// Props típus használata
const props: AuraProps = {
    storeId: 'my-table',
    externalPaginator: true,
    rowsNumber: 10,
};

// Error objektum típus használata
const error: ECSError = {
    severity: 'error',
    timestamp: new Date().toISOString(),
    component: 'UserForm',
    action: 'validate',
    level: 'error',
    type: 'validation',
    message: 'Validation failed',
    key: 'email',
};
```

### TypeScript autocomplete

A TypeScript biztosítja az IntelliSense támogatást az IDE-ben:

```typescript
import Aura from '@tamas-labs/aura';

// Autocomplete működik a config objektumban
app.use(Aura, {
    storeId: 'my-table',
    debug: true,
    // IDE automatikusan javasolja az összes elérhető opciót
    rowsNumber: 10,
    externalPaginator: false,
    // ...
});
```

## Fejlesztés

### Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Type check
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test
npm run test:ui
npm run test:coverage
npm run test:coverage:ci   # egyszeri futás + lefedettségi küszöb-kapu (ezt futtatja a CI)

# Bundle analysis
npm run analyze

# Code duplication check
npm run jscpd

# Dependency graph
npm run graph
```

## Projekt struktúra

```text
src/
├── features/             # Feature modulok
│   ├── error-handler/    # ErrorHandler komponens
│   │   └── components/   # ErrorItem alkomponens
│   └── table/            # Táblázat funkció
│       ├── components/   # Komponensek (Pagination, TableBody, TableHeader, TableFooter, Toolbar)
│       └── utils/        # Cella-renderelési utility-k (UI réteg)
│           ├── composables/  # Composable-ök (useFormattedContent, useDebouncedCellInput)
│           ├── conditions/   # Feltételes renderelés (cellRules / rowRules)
│           ├── formatters/   # Formázók (date, number, text, special)
│           └── styles/       # Stílus utility-k (computeClasses, computeStyles)
├── lib/                  # Library kód
│   └── api/              # API integráció (axios config, headers, URL)
├── state/                # Pinia store modulok
│   ├── core/             # Core, Config, ErrorHandler store-ok
│   └── data/             # API Resources store
├── styles/               # CSS/SCSS fájlok
│   ├── _variables.scss   # Globális SCSS változók (highlight beállítások)
│   ├── _animations.scss  # Animációk (aura-fade-out)
│   └── components/       # Komponens stílusok
│       └── _highlight.scss  # Keresési kiemelés stílus (.aura-highlight)
├── types/                # TypeScript típusdefiníciók
│   ├── api-response.types.ts  # API válasz, header/body/footer, oszlop konfigok, paginációs típusok
│   ├── cell.types.ts          # Cella konfigurációk (BaseCellConfig, Header/Body/FooterCellConfig)
│   ├── config.types.ts        # AuraConfig interface
│   ├── error.types.ts         # ECSError, ErrorSeverity, ErrorType, ErrorState
│   ├── props.types.ts         # AuraProps, PropValidator
│   └── store.types.ts         # CoreStore, ConfigStore, ErrorHandlerStore
├── utils/                # Általános utility-k (UI-független, bármelyik réteg használhatja)
│   ├── composables/           # Keretrendszer-szintű composable-ök (useDebounce, watchAsyncEffect)
│   ├── preprocessors/         # API válasz normalizálás (preprocessResponse, icon/modal configok)
│   ├── location.ts            # Browser location helper-ek (getOrigin, getHref, getParameter)
│   ├── normalize-text.util.ts # Keresési szöveg normalizálás (foldAccents, foldSearchText)
│   ├── resolve-value.util.ts  # Objektum property feloldás nested path-szal
│   ├── safe-object.util.ts    # Prototípus-kulcs védelem (FORBIDDEN_PROTO_KEYS, hasSafeOwnKey, createNullObject)
│   ├── search-items.util.ts   # Kliens oldali keresés/szűrés (filterItemsBySearch)
│   └── sort-items.util.ts     # Kliens oldali rendezés (sortItemsByRules)
└── validators/           # Zod validátorok és sémák
    ├── props/                 # Vue 3 prop validátorok (defaultValidators)
    ├── rules/                 # Primitív típus szabályok (arrayRule, booleanRule, numberRule, stringRule, mixedRules)
    ├── sanitizers/            # HTML sanitizálás (htmlSanitizer - DOMPurify)
    ├── schemas/               # Magas szintű validátor függvények (error handling + fallback)
    │   ├── common/            # Általános: string, boolean, number, date-format, time-zone, stb.
    │   ├── config/            # Config-specifikus: classes, icons, variants, request-method, stb.
    │   └── response/          # API válasz validáció (header, rows, cells, settings)
    ├── utils/                 # createLazyValidator (code splitting) + getErrorSink (az egyetlen varrat a state réteg felé)
    └── zod/                   # Zod sémák (a schemas/ réteg által használt alapúl)
        ├── common/            # StringZod, BooleanZod, NumberZod, CurrencyCodeZod, stb.
        ├── config/            # ClassesZod, IconsZod, VariantsZod, RequestMethodZod, stb.
        ├── response/          # HeaderZod és kapcsolódó sémák
        └── utils/             # schema-cache (a séma-gyárak memoizálása)
```

## Utility függvények

> ⚠️ **Belső API.** Az ebben a fejezetben szereplő függvények **nem** exportáltak a
> `@tamas-labs/aura`-ból — a példák ezért importálnak forrásútvonalról. Azt dokumentálják,
> hogyan működik az Aura belülről; hogy egy alkalmazás mit importálhat ténylegesen, azt a
> [Publikus API-felület](#publikus-api-felület) fejezet írja le.

Ezek a segédfüggvények hajtják a táblázat belső működését; a fejezet a közreműködőknek szól.

### Formázó függvények

#### `formatValue`

Általános érték formázó függvény, amely képes kezelni számokat, pénznemeket, dátumokat és szöveges transzformációkat.

```typescript
import { formatValue } from '@/features/table/utils/formatters/formatValue';

// Alap használat
const formatted = formatValue(1234.56, { currency: 'USD' }); // "$1,234.56"

// Típus formázás kihagyása (pl. fejlécekhez)
const header = formatValue('USD', { currency: 'USD' }, 'en-US', undefined, { skipTypeFormatting: true });
// Eredmény: "USD" (nem próbálja számként formázni)
```

**Paraméterek:**

- `value`: Formázandó érték (string | number | boolean | null | undefined)
- `config`: Cella konfigurációs objektum (`CellFormatConfig`)
- `locale`: Lokalizáció kódja (pl. `'hu-HU'`), alapértelmezett: `'en-US'`
- `currencyCode`: Opcionális pénznem kód backup
- `options`: Opcionális beállítások
  - `skipTypeFormatting`: Ha `true`, kihagyja a szám/pénznem/dátum/telefon formázást, de megtartja a szöveg transzformációkat (uppercase, slice, stb.)

### Composable függvények

#### `useFormattedContent`

A cella tartalmának reaktív formázásáért felelős composable.

```typescript
import { useFormattedContent } from '@/features/table/utils/composables/useFormattedContent';

const { formattedContent } = useFormattedContent(
    () => cellConfig,  // Reactive cell config
    () => coreConfig,  // Reactive core config
    { skipTypeFormatting: true } // Opcionális: típus formázás kihagyása
);
```

### Location utility-k (`location.ts`)

Browser `window.location` wrapper függvények:

| Függvény | Visszatérési típus | Leírás | Példa |
|----------|-------------------|--------|-------|
| `getOrigin()` | `string` | Aktuális origin (protocol + host) | `"https://example.com"` |
| `getHref()` | `string` | Teljes URL | `"https://example.com/admin/users/resources"` |
| `getParameter()` | `string` | URL az origin nélkül | `"admin/users/resources"` |

### resolveValue (`resolve-value.util.ts`)

Objektum property érték feloldása string path alapján, nested útvonalak támogatásával:

```typescript
import { resolveValue } from '@/utils/resolve-value.util';

const user = { name: 'John', address: { city: 'New York' } };

resolveValue(user, 'name');          // 'John'
resolveValue(user, 'address.city');  // 'New York'
resolveValue(user, 'age');           // undefined
```

> 🛡️ **Csak saját tulajdonság.** Az útvonal minden szegmensének az objektum *saját*
> tulajdonságának kell lennie; öröklött tagok soha nem oldódnak fel, a `__proto__` /
> `constructor` / `prototype` nevek pedig saját kulcsként érkezve is tiltottak (a
> `JSON.parse` képes saját `__proto__`-t létrehozni). Az útvonal az API-válaszból jön
> (header-cella `field` / `data`), így a prototípus-lánc tagjai — pl. a függvényt visszaadó
> `toString` — nem kerülhetnek cellába, szűrő-listába vagy CSV-exportba. Gyakorlati
> következmény: egy `constructor`, `prototype` vagy `__proto__` **nevű** oszlop `undefined`-ot ad.

### filterItemsBySearch (`search-items.util.ts`)

Kliens oldali keresés/szűrés `SearchItem[]` kritériumok alapján. AND logikát használ (minden feltételnek teljesülnie kell).

Támogatott funkciók:

- Pontos és részleges egyezés (`exact` paraméter)
- Case-insensitive string összehasonlítás
- Nested property hozzáférés (`resolveValue` használatával)

```typescript
import { filterItemsBySearch } from '@/utils/search-items.util';
import type { SearchItem } from '@tamas-labs/aura';

const items = [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 },
];

const search: SearchItem[] = [{ field: 'name', term: 'j' }];
filterItemsBySearch(items, search); // mindkét elem (partial match)

const exactSearch: SearchItem[] = [{ field: 'name', term: 'John', exact: true }];
filterItemsBySearch(items, exactSearch); // csak John
```

### sortItemsByRules (`sort-items.util.ts`)

Kliens oldali rendezés `SortItem[]` szabályok alapján. Új tömböt ad vissza (shallow copy), az eredetit nem módosítja.

Támogatott funkciók:

- Multi-column rendezés (prioritás a tömb sorrendje alapján)
- String összehasonlítás `localeCompare`-rel (helyes I18N rendezés)
- Numerikus és boolean összehasonlítás
- `null`/`undefined` értékek kezelése (mindig a végére kerülnek)
- Nested property útvonalak (pl. `'user.name'`)

```typescript
import { sortItemsByRules } from '@/utils/sort-items.util';
import type { SortItem } from '@tamas-labs/aura';

const items = [
    { name: 'Charlie', age: 35 },
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
];

const rules: SortItem[] = [{ field: 'name', direction: 'asc' }];
sortItemsByRules(items, rules);
// [Alice, Bob, Charlie]

// Multi-column rendezés
const multiRules: SortItem[] = [
    { field: 'age', direction: 'desc' },
    { field: 'name', direction: 'asc' },
];
sortItemsByRules(items, multiRules);
// [Charlie (35), Alice (30), Bob (25)]
```

## Validációs rendszer

> ⚠️ **Belső API.** A validációs réteg nem része a publikus felületnek — a
> `htmlSanitizer` és a `createLazyValidator` nem exportált a `@tamas-labs/aura`-ból.
> Ez a fejezet a belső architektúrát írja le.

Az Aura háromrétegű validációs architektúrát használ, amely runtime típusellenőrzést, HTML sanitizálást és automatikus fallback értékeket biztosít.

### Architektúra

```text
1. Zod sémák (zod/)          → Alap validációs szabályok Zod-dal
2. Schema validátorok (schemas/) → Zod + error handling + fallback értékek
3. Prop validátorok (props/)    → Vue 3 prop validators a rules/ alapján
```

### Rules — Primitív típus szabályok

Egyszerű runtime típusellenőrző függvények, amelyeket a Vue 3 prop validátorok használnak:

| Függvény | Leírás |
|----------|--------|
| `stringRule(value)` | `typeof value === 'string'` |
| `numberRule(value)` | `typeof value === 'number'` és érvényes (`!isNaN`, `isFinite`) |
| `booleanRule(value)` | `typeof value === 'boolean'` |
| `arrayRule(value)` | `Array.isArray(value)` |
| `mixedRules(value)` | Primitív, tömb vagy plain object (null/undefined/function nem elfogadott) |

### Sanitizers — HTML sanitizálás

Az `htmlSanitizer` DOMPurify-t használ az XSS védelemhez. Minden HTML tag-et és attribútumot eltávolít:

```typescript
import { htmlSanitizer } from '@/validators/sanitizers/html.sanitizer';

htmlSanitizer('<script>alert("xss")</script>Hello'); // 'Hello'
htmlSanitizer('<b>Bold</b> text');                   // 'Bold text'
htmlSanitizer(123);                                  // 123 (nem string → érintetlen)
```

### Zod sémák

A Zod réteg definiálja az alap validációs szabályokat. Két kategória:

**Common (alap típusok):**

| Zod séma | Leírás |
|----------|--------|
| `StringZod(min, max)` | String validáció + HTML sanitizálás + nullable |
| `BooleanZod()` | Boolean validáció + nullable |
| `NumberZod(min, max)` | Number validáció + nullable |
| `CurrencyCodeZod()` | ISO 4217 pénznem kód enum + nullable |
| `DateStyleZod()`    | Dátum megjelenítési stílus enum ('short', 'medium', 'long') + nullable |
| `TimeZoneZod()`     | IANA időzóna string + nullable |
| `UtcOffsetZod()` | UTC offset formátum + nullable |
| `SliceEndTextZod()` | Szöveg vágás végén megjelenő karakterek + nullable |

**Config (config-specifikus):**

| Zod séma | Leírás |
|----------|--------|
| `RequestMethodZod()` | HTTP metódus enum (GET, POST, PUT, DELETE, PATCH) + nullable |
| `ClassesZod()` | CSS osztályok konfiguráció validáció |
| `IconsZod()` | Ikon konfiguráció validáció |
| `VariantsZod()` | Bootstrap variant konfiguráció validáció |
| `PaginateValuesZod()` | Lapozási értékek tömb validáció |
| `LocalizationZod()` | Lokalizációs string validáció |
| `ErrorReportingServiceZod()` | Error reporting szolgáltatás enum |
| `ErrorReportingApiKeyZod()` | API kulcs string validáció |
| `StoreIdZod()` | Store azonosító validáció |

> ⚡ **A gyárfüggvények memoizáltak.** Egy Zod séma **felépítése** nagyságrenddel drágább,
> mint a vele végzett parse (mérve: ~148 µs vs. ~10 µs a `StringZod(1, 250)` esetén), egy
> oszloponként hívott gyár pedig minden válasznál újraépítené. Ezért minden paraméter
> nélküli gyár **ugyanazt a példányt** adja vissza minden híváskor (`cacheSchema`), a
> `StringZod` pedig `(min, max)` páronként egy példányt cache-el (`cacheSchemaByArgs`,
> `src/validators/zod/utils/schema-cache.ts`). A megosztás azért biztonságos, mert a Zod
> sémák immutábilisak: a `.min()`, `.nullable()` és társaik új sémát adnak vissza, nem
> módosítják a meglévőt. Egy 20 oszlopos fejléc ~12 ms helyett ~1 ms alatt validálódik.

### Schema validátorok

A legmagasabb szintű validátorok, amelyek a Zod sémákat error handling-gel és fallback értékekkel csomagolják be. Hibás érték esetén:
1. Logolják a hibát az `errorStore`-ba (`addSchemaValidationError`)
2. Visszaadják az alapértelmezett fallback értéket

```typescript
// Példa: validateString használata
const result = validateString('Hello', 'my-store', 'siteName');  // 'Hello' (sanitized)
const result2 = validateString(123, 'my-store', 'siteName');     // fallback + error logged

// Példa: validateCurrencyCode használata
const code = validateCurrencyCode('HUF', 'my-store');   // 'HUF'
const code2 = validateCurrencyCode('XXX', 'my-store');  // 'HUF' (fallback + error logged)

// Példa: validateRequestMethod használata
const method = validateRequestMethod('POST', 'my-store');    // 'POST'
const method2 = validateRequestMethod('INVALID', 'my-store'); // 'POST' (fallback + error logged)
```

A **response/** almodul az API válasz struktúrát validálja (header, rows, cells, settings), és hiba esetén kivételt dob.

### Prototípus-kulcsok

Az API-válaszból épülő objektumok `null` prototípussal készülnek, a három prototípuslánc-név —
`__proto__`, `constructor`, `prototype` — pedig már a bemenetnél elutasításra kerül. A határ így a
validátor rétegben zárul, nem az egyes renderelők figyelmességén múlik:

- **Oszlop-config kulcsok.** A `createConfigValidator` az ismeretlen kulcsokkal együtt ezeket is
  eldobja, és a visszaadott confignak nincs prototípusa.
- **`mapping` bejegyzéskulcsok.** A bejegyzéskulcsok tetszőleges, válaszból jövő stringek (az
  illesztendő adatértékek), ezért egy `__proto__` kulcsú bejegyzés korábban nem bejegyzéssé vált,
  hanem **átállította a mapping objektum prototípusát** — a kulcsai olvashatóvá lettek a mapping
  objektumon, miközben az `Object.keys` nem látta őket. Az ilyen bejegyzés mostantól kiesik.
- **Oszlop-config `type`.** A `columnConfigs[...].type` értéke egy dispatch-táblából választja ki a
  validátort, tehát egy örökölt név prototípus-tagot adott vissza: a `constructor` az `Object`
  konstruktort találta meg, ami hívható, és a bejegyzést **validálatlanul** adta volna vissza —
  kihagyva azt a kulcs-szűrést, amiért a dispatch létezik. Az ilyen `type` mostantól ugyanúgy
  ismeretlen típus, mint bármi más: a bejegyzés figyelmeztetéssel kiesik.
- **Keresések.** A `mapping` mindig csak saját kulcs szerint olvasódik, tehát egy `toString` vagy
  `constructor` **cellaérték** találat-hiány, nem öröklött függvény; a `resolveValue` ugyanígy
  kizárólag saját property-t old fel.
- **Fejléccella-mezők.** A fejléccella mezői saját property-ként olvasódnak, tehát az a cella,
  amelyik a `content`-et csak **örökli**, hiányzó `content`-tel rendelkező cellának számít.

**Mit jelent ez a backendnek:** egy `mapping` bejegyzés nem lehet `__proto__`, `constructor` vagy
`prototype` kulcsú, és egy oszlop-config `type`-ja sem lehet ilyen név — az ilyen bejegyzés kiesik,
akárcsak bármelyik ismeretlen kulcs vagy típus. Valós adatérték nem hordozza ezeket a neveket, tehát
a gyakorlatban ez nem korlát.

### createLazyValidator — Code splitting

Generic lazy loader, amely dinamikus importtal tölti be a validátor függvényeket az első híváskor (code splitting támogatás):

```typescript
import { createLazyValidator } from '@/validators/utils/lazy-loader';

// A validátor csak akkor töltődik be, amikor először hívják
const lazyValidate = createLazyValidator(
    () => import('./my-validator'),
    'validate'
);

// Első hívás: modul betöltés + validáció
await lazyValidate(data);

// További hívások: cache-ből (nincs újra import)
await lazyValidate(data2);
```

## SCSS testreszabás

Az Aura beépített SCSS stílusokat tartalmaz, amelyek automatikusan betöltődnek a plugin használatakor.

### Keresési kiemelés (Highlight)

A `.aura-highlight` osztály automatikusan alkalmazható a keresési találatokra. A kiemelés egy fade-out animációval fokozatosan eltűnik.

### SCSS változók

A következő változók felülírhatók a host alkalmazásban a `!default` flag-nek köszönhetően:

| Változó | Alapértelmezett | Leírás |
|--------|----------------|--------|
| `$aura-highlight-bg` | `#fff3cd` | Kiemelés háttérszíne |
| `$aura-highlight-color` | `inherit` | Kiemelés szövegszíne |
| `$aura-highlight-duration` | `3000ms` | Fade-out animáció időtartama |

### SCSS változók felülírása

A változók felülírásához a saját SCSS fájlodban definiáld őket az Aura import **előtt**:

```scss
// styles/main.scss

// Aura változók felülírása
$aura-highlight-bg: #d1ecf1;
$aura-highlight-color: #0c5460;
$aura-highlight-duration: 5000ms;

// Aura stílusok importálása
@use '@tamas-labs/aura/src/styles';
```

## Technológiai stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Típusos JavaScript
- **Vite** - Build tool
- **Vitest** - Unit testing
- **Pinia** - State management
- **Bootstrap 5** - CSS framework
- **FontAwesome** - Ikonok
- **Zod** - Schema validation
- **ESLint** - Code linting
- **SonarJS** - Code quality

## Közreműködés és biztonság

🤝 **[CONTRIBUTING.md](./CONTRIBUTING.md)** (angol) — fejlesztői setup, minőségi kapu,
release-folyamat.

🔒 **[SECURITY.md](./SECURITY.md)** (angol) — sebezhetőség bejelentése.

## Licenc

MIT

## Szerző

Tamas Balint
