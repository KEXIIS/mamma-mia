# Trattoria Mamma Mia — strona internetowa · spec projektowy

Data: 2026-09-12
Status: do implementacji

## 1. Cel

Zastąpić `mammamia.net.pl` — stronę datowaną w stopce na „©2008-2012", z menu wrzuconym jako
skany papierowej karty, niedziałającymi placeholderami tłumaczeń (`lang.siecFolk`) i osobnym
linkiem „wersja mobilna" zamiast responsywności.

Restauracja ma 4,4/5 przy 8 150 opiniach w Google, rozpoznawalność napędzaną TikTokiem
i Instagramem oraz dużą część gości spoza Polski. Obecna strona jest rażąco nieadekwatna do tej
skali — i to jest główny argument sprzedażowy.

Najważniejszy pojedynczy cel techniczny: **menu jako tekst w źródle strony**, indeksowalne przez
Google i czytelne na telefonie. Wszystkie decyzje architektoniczne w tym dokumencie podporządkowane
są temu celowi.

## 2. Zakres

Jedna statyczna strona (one-pager) w HTML/CSS/JS, bez frameworka i bez kroku budowania —
zgodnie z konwencją projektu `Strony/Kancelaria`.

Poza zakresem: system rezerwacji i sprzedaż bonów (restauracja ma już wdrożony
CoverManager — podlinkowujemy oba), CMS, blog.

## 3. Ustalenia wejściowe

### 3.1 Treść — odzyskana ze starej strony

Menu zostało odczytane ze skanów i przepisane do tekstu. Źródła:
- karta dań, październik 2025, 2 strony (`photos/karta_dan/2025/menu_mamma_mia_pazdziernik_druk-1..2.jpg`)
- karta napojów, marzec 2026, 4 strony (`photos/karta_dan/2026/mamma_marzec26_1..4.jpg`)

Obie karty są **już dwujęzyczne PL/EN**, z gramaturami, cenami i znacznikami diet. Pełna
transkrypcja (~60 dań, ~150 pozycji barowych) leży w `docs/menu-transkrypcja.md` i stanowi
materiał wejściowy do implementacji. Notatka z analizy inspiracji — `docs/inspiracja-dinnerladies.md`.

Zapisy ze stopki karty, które muszą trafić na stronę:
- wszystkie dania ze świeżych produktów, na indywidualne zamówienie; czas oczekiwania ok. 45 minut
- serwis 12,5%–17% wg uznania gościa; przy rezerwacji powyżej 4 osób automatycznie 12,5%
- karta alergenów u managera; pół porcji = 60% ceny
- kuchnia używa produktów z glutenem — możliwe śladowe ilości w daniach bezglutenowych;
  dostępny makaron bezglutenowy
- zamówienia na wynos: +2 zł za opakowanie

### 3.2 Zdjęcia — odzyskane ze starej strony

10 zdjęć w pełnej rozdzielczości: 7 z galerii (dania w zbliżeniu, profesjonalne, ciepłe światło)
i 3 panoramiczne 938×310 (wnętrze). Łącznie ~3 MB w JPEG — do konwersji na WebP.

Adresy źródłowe (gdyby trzeba było pobrać ponownie):
- galeria: `https://mammamia.net.pl/photos/galerie/21/{1761592961..1761592967}.jpg`
- wnętrze: `https://mammamia.net.pl/photos/topy/66/938x310/{1600335514..1600335516}.jpg`
- logo: `https://mammamia.net.pl/media/dom/gfx/logo.png` (200×194)

Wnętrze na zdjęciach: oliwkowa boazeria, terakotowe kafle, gięte krzesła, lodówka na wino,
marmurowe blaty.

### 3.3 Identyfikacja wizualna — istniejąca

Restauracja ma realną identyfikację, której nie ma na stronie:
- logo: okrągła pieczęć, podwójny pierścień, trzech kucharzy z łopatkami, napis „mamma mia"
- drukowana karta: pionowe pasy fiolet + szałwiowa zieleń, kremowy panel w falbaniastej ramce,
  romby-separatory, kropkowane leadery do cen, tłumaczenia EN kursywą

### 3.4 Systemy zewnętrzne

- **CoverManager** — rezerwacje, już wdrożone; przyciski „Rezerwuj stolik" prowadzą tam
- **Stripe** — obsługa płatności wewnątrz CoverManagera, poza zakresem tej strony

**„Sklep" na starej stronie to sprzedaż bonów.** Podstrona `310,sklep.html` osadzała ramkę
`covermanager.com/eco/buy_products/restaurante-mammamia/polish` — czterokrokowy koszyk
z jednym produktem: kartą podarunkową. Osobna podstrona `296,bony-upominkowe.html` opisywała
te same bony słowami. Na nowej stronie obie role pełni jedna sekcja **#bony**, z przyciskiem
prowadzącym do tego samego koszyka CoverManagera (adresy `/polish` i `/english`).

Ramka nie jest osadzana: czterokrokowa płatność wewnątrz one-pagera czyta się gorzej niż
przejście do koszyka, a osadzenie wciąga do strony ciasteczka zewnętrznego dostawcy.

## 4. Decyzje architektoniczne

### 4.1 Menu na twardo w HTML (nie renderowane z JS)

Rozważone trzy warianty:

| Wariant | SEO na dania | Utrzymanie | Krok budowania |
|---|---|---|---|
| A — dane w pliku JS, render w przeglądarce | słabe, opóźnione | najlepsze | nie |
| **B — menu w HTML, i18n przez data-atrybuty** | **pełne** | średnie | **nie** |
| C — JSON + generator w Node | pełne | najlepsze | tak |

Wybrany **wariant B**. Uzasadnienie: indeksowalne menu jest głównym argumentem sprzedażowym
wobec starej strony, więc dania muszą istnieć w źródle. Wariant C rozwiązuje to samo lepiej pod
kątem utrzymania, ale wprowadza krok budowania do projektu, który ma zostać przekazany klientowi —
po wdrożeniu nikt go nie uruchomi. Koszt wariantu B to `index.html` o rozmiarze ~89 KB
(dla porównania Kancelaria: 13 KB) i edycja cen w dużym pliku; klient i tak nie edytuje HTML-a.

Konsekwencje:
- menu działa przy wyłączonym JS — to jest wymóg, nie miła cecha
- zakładki kategorii chowają treść przez `display`, ale wszystkie pozycje zostają w źródle
- blok menu w `index.html` musi być wyraźnie odgraniczony komentarzami, żeby dało się go znaleźć

### 4.2 Odsiew karty barowej

Koktajle, mocktaile, wina, piwa i napoje bezalkoholowe pokazane normalnie. Około 80 pozycji
czystego alkoholu (whisky, gin, rum, wódka, tequila, koniaki, wermuty, likiery, grappa) trafia do
zwijanego bloku „pełna karta alkoholi" — nikt nie szuka w Google „Gordon's London Dry Kraków",
a lista zaśmieca stronę. Pozycje zostają w HTML, więc nic nie ginie.

### 4.3 Dwujęzyczność przez atrybuty

Każdy węzeł tekstowy niesie `data-pl` i `data-en`. Skrypt podmienia `textContent` i ustawia
`lang` na `<html>`. Wybór zapamiętany w `localStorage`, język domyślny z `navigator.language`
z fallbackiem na polski.

**Wyjątek: opisy dań są dwujęzyczne na stałe.** Nie przełączają się razem z resztą strony —
pod polskim opisem zawsze stoi angielski kursywą, dokładnie tak jak w drukowanej karcie.
Przełącznik obsługuje całą pozostałą treść. Dzięki temu turysta czyta danie niezależnie od
ustawionego języka, a opisy nie muszą być duplikowane w atrybutach.

Angielskie opisy dań pochodzą wprost z drukowanej karty, więc największa część tłumaczenia jest
gotowa i wierna oryginałowi.

Uwaga implementacyjna: przy wyłączonym JS strona zostaje po polsku z pełnym menu — polskie
warianty są treścią domyślną w HTML, angielskie żyją w atrybutach.

## 5. System wizualny

Kierunek: **włoska pizzeria w Nowym Jorku.** Układ i skala typografii z dinnerladies.com.au,
len i orzech z Houseplanta jako podłoże, pomidorowa czerwień i bazyliowa zieleń jako akcenty.

### 5.0 Zmiana kierunku wobec pierwszej wersji

Pierwsza wersja strony została zbudowana wiernie wobec wyeksportowanej tabelki tokenów
Houseplanta, z fioletem i szałwią przeniesionymi z drukowanej karty. Wyszła poprawna,
stonowana i pozbawiona wyrazu — oddawała tokeny, ale nie oddawała tego, jak referencja
wygląda. Zrzut ekranu systemu Houseplant pokazuje ukośny klin w kolorze pomidora, tłusty
retro skrypt położony na skosie, zieloną kolumnę w paski z daszkiem, podwójne czerwone
hairline'y i pełnoszerokie kadry — czyli chwyty kompozycyjne, których żaden plik tokenów
nie zapisuje.

Decyzja: fiolet i szałwia wypadają w całości. Spójność z drukowaną kartą zostaje poświęcona
na rzecz klimatu, bo kartę i tak prędzej czy później się przedrukuje, a strona jest ważniejsza.

### 5.1 Tokeny — trzy warstwy

Architektura jak w `Strony/Kancelaria/css/style.css`: prymitywy → semantyka → komponenty.

Prymitywy:

```
--p-walnut:        #321E1E   /* Houseplant — tekst, ciemne sekcje, pasek nawigacji */
--p-linen:         #F4F1E0   /* Houseplant — canvas strony */
--p-graphite:      #464545   /* Houseplant — tekst drugorzędny */
--p-sand:          #EFE9D7   /* ocieplone; Houseplant podaje chłodne #F4F4F4 */
--p-pomodoro:      #C33A1F   /* jedna czerwień: klin, markiza, skrypt, etykiety, przyciski */
--p-pomodoro-ink:  #9C2B15   /* drobny tekst; na piaskowym 6,3:1 */
--p-basilico:      #5FA95A   /* kolumna, markiza, wypełnienia */
--p-basilico-ink:  #2E6B2A   /* drobny tekst na lnie, 5,7:1 */
--p-basilico-deep: #23512A   /* ciemny wariant bazylii, obecnie nieużywany */
--p-oliva:         #46592E   /* sekcja z tarasem; len na niej 6,8:1 */
```

Zasada trzech wariantów każdego akcentu jest wymogiem dostępności, nie ozdobą: wariant jasny
idzie wyłącznie na duże płaszczyzny i tekst display, `-deep` pod biały tekst na wypełnieniu,
`-ink` na tekst poniżej 24 px. Sam `#DC4527` na lnie daje 3,75:1 — dość dla display, za mało
dla akapitu.

Neutralne `#F4F4F4` z Houseplanta zostało ocieplone do `#EFE9D7`, bo w palecie
pomidorowo-bazyliowej ta chłodna szarość czytała się jak brud.

Świadomie pominięta terakota z wnętrza — przy czerwieni i zieleni byłaby trzecim,
rozmywającym akcentem.

### 5.2 Typografia

Trzy rodziny, **hostowane lokalnie** w katalogu `fonts/` (patrz 5.21):

- **Archivo** (400/500/600/700) — hasła, nagłówki, nawigacja, UI, ceny, znaczniki.
  Zastępuje niedostępny krój Houseplant (DESIGN.md wskazuje Archivo jako substytut).
- **Yellowtail** — tłusty retro skrypt sygnowany na skosie: „Mamma Mia" w hero, nazwy działów
  karty, „Trattoria" nad wordmarkiem w stopce. To on niesie cały nowojorski luz; bez niego
  strona wraca do bycia poprawnym butikiem.
- **Petrona** — włoskie nazwy dań; jej **kursywa** na angielskie tłumaczenia pod spodem,
  odwzorowując drukowaną kartę.

Tracking: na wersalikach w dużych rozmiarach **dodatni** `+0.02em` — chwyt z dinnerladies.
Reguła Houseplanta o ujemnym trackingu przy 45px+ dotyczy tekstu mieszanego i tu nie obowiązuje,
bo wersaliki zawsze wymagają rozstrzelenia.

### 5.21 Kroje hostowane lokalnie, nie z Google Fonts

Pliki `woff2` leżą w `fonts/`, reguły `@font-face` w sekcji 0 arkusza. Powód jest
wydajnościowy: znikają dwa obce origin (`fonts.googleapis.com` i `fonts.gstatic.com`),
czyli dwa komplety DNS + TCP + TLS, a łańcuch krytyczny skraca się o jeden przeskok —
przeglądarka nie musi najpierw pobrać arkusza Google, żeby poznać adresy plików.
Dopiero lokalne pliki dają się też sensownie `preload`ować.

**Argument o współdzielonym cache między witrynami jest nieaktualny** — przeglądarki
partycjonują cache po stronie osadzającej od 2020 roku, więc font pobrany na innej
stronie i tak nie zostanie ponownie użyty.

Pobierane są tylko potrzebne podzbiory: `latin` i `latin-ext` (polskie znaki),
bez wietnamskiego. Yellowtail tylko `latin` — służy do „Mamma Mia", „Trattoria"
i nazw działów karty, same znaki ASCII. Razem 7 plików, 171 KB na dysku, z czego
pierwsze wejście pobiera 6 (153 KB).

**Archivo to font zmienny.** Jeden plik na podzbiór obsługuje wagi 400–700, więc liczba
użytych wag nie zmienia wagi pobrania — inaczej niż przy Petronie, gdzie każda odmiana
to osobny plik.

Preload obejmuje tylko to, co widać od razu: Archivo (`latin` i `latin-ext`) oraz
Yellowtail. Petrona jest poniżej pierwszego ekranu.

Licencje krojów leżą obok plików — Archivo i Petrona na OFL, Yellowtail na Apache 2.0.
Obie licencje wymagają, by tekst licencji towarzyszył plikom.

### 5.3 Chwyty kompozycyjne

- **Ukośny klin** — hero to pomidorowy blok ścięty po skosie (`clip-path`), ze zdjęciem
  wchodzącym na krawędź ekranu bez ramki i bez zaokrągleń.
- **Markiza** — separator w pionowe pasy czerwieni i zieleni na kremie, domknięty ciemną
  kreską z góry i z dołu, jak płótno nad wejściem. Występuje **na każdym przejściu
  barwnym** (6 miejsc), więc każdy kolorowy blok jest nią oprawiony z obu stron.
  Dwa pasy nigdy nie stoją obok siebie.
- **Szachownica** — wąski pas czerwono-kremowej kratki pod wordmarkiem, ukłon w stronę obrusu.
- **Pełnoszerokie pasmo zdjęciowe** z wielką wersalikową etykietą wchodzącą na kadr od prawej.

Ozdobniki zawsze wychodzą **zza** treści: klin ma `z-index` wyższy niż kolumna i linie, żeby
żaden element dekoracyjny nie przeciął przycisku ani tekstu.

### 5.4 Kształty

Promień 4 px na przyciskach i znacznikach, 8 px na kartach. Nigdy więcej — reguła Houseplanta
zostaje w mocy. Cień wyłącznie `rgba(0,0,0,0.1) 0 2px 8px` na kartach. Bez gradientów,
bez poświat, bez glassmorfizmu.

### 5.41 Rytm barwny sekcji

Pierwsza wersja miała sześć beżowych pasów na dziesięć — kolor pojawiał się tylko w hero
i przy tarasie, przez co strona wracała do stonowania, od którego mieliśmy uciec.
Obecny rytm od góry:

| Pas | Tło |
|---|---|
| nagłówek | len |
| hero | czerwień |
| stemple | oliwka |
| o nas | len |
| pasmo zdjęciowe | zdjęcie |
| karta dań | piaskowy |
| galeria | czerwień |
| taras | oliwka |
| kontakt | len |
| stopka | czerwień |

**Zasada: jasne tło zostaje wyłącznie tam, gdzie służy czytaniu** — „O nas", karta dań
i kontakt z mapą. Wszystko inne niesie kolor. Barwne pasy są zaimplementowane jako klasy
`.section--red` i `.section--olive`, które przestawiają też kolor nagłówka i eyebrow,
więc dołożenie kolejnego pasa to jedna klasa w znacznikach.

Konsekwencja dla ozdobników: obręcze stempli dziedziczą kolor tekstu sekcji zamiast mieć
własny czerwony i zielony. Czerwona obręcz na oliwce miała 1,4:1 i po prostu znikała.

### 5.42 Sekcja z tarasem — oliwka

Sekcja „Taras i rezerwacje" była jedynym ciemnym pasem na stronie i jako orzechowy brąz
nie rozmawiała z niczym innym w systemie len-plus-czerwień. Dostała oliwkę `#46592E`, która
powtarza boazerię widoczną na zdjęciu użytym w tej właśnie sekcji. Czerwień była drugą
rozważaną opcją i wygląda dobrze, ale występuje już jako wielka płaszczyzna w hero —
drugi taki pas przechyliłby stronę w monotonię. Zmiana to jedna linia:
`--c-bg-feature: var(--c-accent-fill)`.

Konsekwencja: przycisk rezerwacji w tej sekcji musi być kremowy. Czerwony miałby na czerwieni
1,0:1, a na oliwce 1,4:1 — w obu wariantach tła znikałby jako element.

### 5.43 Jedna czerwień zamiast dwóch

Pierwotnie system miał `#DC4527` na płaszczyzny i `#C33A1F` na przyciski. Dwa prawie
identyczne odcienie obok siebie czytały się jak niedopasowanie, a przy okazji jaśniejszy
wariant nie przechodził dostępności: kremowy tekst na `#DC4527` dawał 3,75:1, biel 4,26:1 —
poniżej progu AA przy 16 px niezależnie od krycia. Zejście do jednego `#C33A1F` naprawia
lead i przycisk w hero (oba 4,7:1) i likwiduje zgrzyt.

### 5.44 Pasek nawigacji — forma

**Pasek ma zawsze jeden rząd, na każdej szerokości** (106 px na desktopie, 98 px w środkowym przedziale, 86 px na telefonie). To jest wymóg,
nie preferencja: wcześniej w przedziale 640–1040 px łamał się na dwa rzędy i puchnął do
142 px, z przyciskiem rezerwacji porzuconym w drugim rzędzie. Był to zarazem jedyny
przedział, w którym oglądaliśmy stronę w panelu podglądu (732 px), więc wada rzucała się
w oczy przy każdej ocenie i była brana za problem koloru.

**Pasek to siatka trzech stref: `1fr | rezerwa na pieczęć | 1fr`.** Środkowa kolumna
(rozpórka `.site-header__spacer`, 168 / 148 / 118 px zależnie od progu) trzyma szerokość
pieczęci, więc żadna strefa na nią nie wchodzi. Sama pieczęć zostaje pozycjonowana
bezwzględnie i wyśrodkowana — bez rezerwy przełącznik języka nachodził na nią o 23 px,
a po prawej zostawało 296 px pustki.

**Podział: sterowanie po lewej, akcja po prawej, pieczęć na środku.** Przełącznik
języka stoi po lewej razem z nawigacją, a nie po prawej przy rezerwacji — obok CTA wchodził
pod wycentrowaną pieczęć, bo oba mieszczą się tam dopiero od ok. 758 px. Wszystkie kontrolki
paska mają jedną wysokość 40 px; bez tego lewa i prawa strona wyglądają jak z dwóch projektów.

Na telefonie symetryczna siatka trzech stref **nie ma prawa zadziałać**: hamburger plus
przełącznik są razem szersze niż pół paska. Grupa lewej strefy dostaje tam `display: contents`,
przez co hamburger trafia do kolumny pierwszej, a przełącznik do trzeciej. Rezerwacja schodzi
do rozwijanej nawigacji, blok akcji znika.

Rozwijana nawigacja jest panelem `position: absolute` pod paskiem, nie drugim rzędem w środku
paska — dzięki temu otwarcie menu nie zmienia wysokości nagłówka (zmierzone: 74 px przed
i po otwarciu).

Etykieta przycisku rezerwacji ma `white-space: nowrap`; bez tego polskie „REZERWUJ STOLIK"
rozpadało się w węższej prawej strefie na dwa wiersze.

Elementy odchudzają się progami, zamiast pozwolić paskowi rosnąć:

| Szerokość | Wordmark | Przycisk nawigacji | Rezerwacja |
|---|---|---|---|
| > 1040 px | pełny | ukryty (widać linki) | w pasku |
| 641–1040 px | pełny | słowo „Nawigacja" | w rozwijanej nawigacji |
| ≤ 640 px | „Mamma Mia" | trzy kreski | w rozwijanej nawigacji |

**Pieczęć jest wycentrowana i wychodzi poniżej paska.** Marka jest wyjęta z układu
(`position: absolute`, `left: 50%`), więc wysokość paska nie zależy od pieczęci, a pieczęć
siedzi dokładnie na osi ekranu niezależnie od szerokości nawigacji i akcji. Napis
„Trattoria Mamma Mia" zniknął z paska do warstwy dla czytników ekranu — wycentrowana
pieczęć niesie nazwę w otoku, a hero powtarza ją zaraz pod spodem.

**Rysunek wypełnia koło do krawędzi.** Element nie ma dopełnienia ani ramki; plik jest
przycięty dokładnie do ciemnego pierścienia pieczęci (promień 83 px w oryginale). Obrys leży
na zewnątrz jako podwójny `box-shadow`: ciemna kreska 2 px, tej samej grubości co ta pod
paskiem, a za nią kremowa obwódka 9 px oddzielająca pieczęć od czerwieni hero.

Uwaga przy sprawdzaniu kolizji: `getBoundingClientRect` **nie liczy `box-shadow`**, więc
realny zasięg pieczęci jest o 9 px większy z każdej strony. Prostokąt trzeba powiększyć
ręcznie, inaczej test przepuści dotknięcie obwódki o skrypt hero.

 Ma 132 px na desktopie, 112 px w przedziale
641–1040 px i 88 px na telefonie, a zwisa odpowiednio 46 / 34 / 24 px pod dolną krawędź
paska, wchodząc w pomidorowy klin. Ujemny margines dolny sprawia, że nie podnosi wysokości
paska. Kremowy pierścień oddziela ją od czerwieni pod spodem.

Konsekwencja: klin hero potrzebuje większego górnego dopełnienia, inaczej zwisająca pieczęć
nachodzi na skrypt „Mamma Mia". Sprawdzać prostokątami, nie okiem — przy rotacji skryptu
o -5° jego ramka rośnie i kolizja pojawia się, zanim litery zaczną się stykać.
Mniejsza była nieczytelna — to kreskowy rysunek trzech kucharzy, który przy 38 px zlewał się
w plamę.

**Plik logo został przerobiony.** Oryginał (`images/logo-oryginal.png`, 200×194 px) nie był
wyśrodkowaną pieczęcią, tylko rdzawym prostokątem `#CC4519` z białą pieczęcią przesuniętą
w lewo i do góry: środek ciemnego pierścienia wypadał w (90,5, 90,0) przy środku kanwy
(99,5, 96,5). Przy `border-radius: 50%` koło CSS wycinało się z kanwy, więc pieczęć była
widocznie przesunięta, a niekwadratowa kanwa dodatkowo ją zniekształcała.

Obecny `images/logo.png` to kwadrat 340×340 px, przycięty wokół zmierzonego środka pierścienia,
z maską kołową usuwającą rdzawe tło. Środek rysunku pokrywa się ze środkiem elementu co do piksela.

**Ograniczenie źródła pozostaje:** realna szczegółowość to nadal ok. 165 px z oryginału. Przy 88 px wygląda dobrze
na zwykłym ekranie, ale na ekranie o podwójnej gęstości potrzebowałby 176 px i zacznie
mięknąć. Powyżej ok. 100 px raster się kończy — dalsze powiększanie wymaga przerysowania
pieczęci na SVG albo pliku w wyższej rozdzielczości od klienta.

Adres pod wordmarkiem został usunięty — podnosił pasek o kilkanaście pikseli, a powtarzał
to, co i tak krzyczy nagłówek hero („KARMELICKA 14.") i sekcja kontaktu.

Uwaga: samo `flex-wrap: nowrap` nie wystarczy. Przy 375 px zakaz łamania zamienił łamanie
na przepełnienie poziome (`scrollWidth` 454 przy `clientWidth` 375) i przełącznik języka
wyjechał poza ekran. Zawartość musi się realnie zmieścić.

### 5.45 Pasek nawigacji — kolor

Pasek nie dzieli koloru z sekcją ciemną i **jest jasny**: len `#F4F1E0`, tekst orzechowy,
czerwony wypełniony przycisk rezerwacji, a całość domyka dwupikselowa orzechowa kreska na dole.
Definiuje go ta kreska, nie wypełnienie.

Droga do tego wiodła przez dwa odrzucone warianty i wniosek jest ogólniejszy niż wybór barwy:
**każdy ciemny pasek sąsiadujący wprost z pomidorowym klinem konkuruje z nim o uwagę.**
Orzech `#321E1E` dawał dwa ciepłe, ciemne kolory walczące o to samo miejsce. Głęboka zieleń
`#23512A` rozwiązywała problem temperatury, ale nadal stawiała ciężką płaszczyznę tam, gdzie
uderzenie ma należeć do hero — i dodatkowo wymuszała rezygnację z czerwonego CTA.
Jasny pasek oddaje czerwieni całą scenę.

Zieleń `--p-basilico-deep` zostaje w tokenach, bo nic nie kosztuje, a przydaje się jako ciemny
wariant bazylii.

### 5.5 Hierarchia wezwania do działania

Dwa warianty:
- **pasek nawigacji (len) i sekcja ciemna (orzech)** — czerwony wypełniony `--p-pomodoro-deep`,
  biały tekst, 5,3:1. Na lnie przycisk odcina się od paska kontrastem powierzchni 4,7:1.
- **hero (czerwień)** — obrysowany w lnie; czerwony na czerwonym nie działa.

Uwaga z pomiarów: kontrast powierzchni przycisku wobec tła paska trzeba liczyć osobno od
kontrastu tekstu. Na ciemnej zieleni tekst przycisku spełniał AA, a sam przycisk miał wobec
paska 1,75:1 i znikał jako element. Czerwony na czerwonym nie działa,
ale rezerwacja musi zostać najgłośniejszym elementem strony.

## 6. Struktura strony

1. **Nagłówek** — sticky, na orzechu. Pieczęć-logo, nawigacja, przełącznik `PL | EN`,
   przycisk „Rezerwuj stolik" → CoverManager. Na mobile nawigacja zwijana.

2. **Hero** — dwie kolumny: pomidorowy klin ścięty po skosie i pełnoszerokie zdjęcie wnętrza.
   W klinie skrypt „Mamma Mia" położony pod kątem, pod nim wersaliki
   **„WŁOCHY. / KARMELICKA 14."** (EN: „ITALY. / KARMELICKA 14.") — dwa człony, nie trzy,
   dowcip geograficzny, który od razu podaje adres. W rogu zdjęcia przyklejona okrągła naklejka
   „4,4 · 8150 opinii". Poniżej markiza jako separator.
   Na telefonie klin i zdjęcie układają się jeden pod drugim.

   Zielona kolumna z daszkiem i podwójne czerwone linie na szwie klina zostały usunięte —
   przy wycentrowanej, zwisającej pieczęci robiło się w tym miejscu za gęsto.

3. **Pasek stempli** — cztery kółka z mikro-copy, chwyt z dinnerladies: ocena Google,
   „Karmelicka 14 — 5 minut od Rynku", „Taras pod lampkami", „Wszystko świeże, na zamówienie".

4. **O nas** — dwie kolumny: zdjęcie wnętrza i tekst. Obok wyrwany wielki cytat z prawdziwej
   opinii Google — **osobnej dla każdego języka**, bo polski gość i turysta reagują na co innego.
   PL: „Przepyszna pizza – idealne ciasto, składniki bardzo dobrej jakości i fajnie skomponowane
   połączenia smaków." EN: „Believe the hype. The food here is insane. You have to try the lasagne."
   Obie są prawdziwe i pobrane z Google Maps; **nie wolno ich wymyślać ani tłumaczyć jednej na drugą**,
   bo to byłaby spreparowana opinia. Wzmianka o przynależności do niezależnej krakowskiej grupy
   (La Campana, Kogel-Mogel) — nie franczyza.

   Mechanizm: dwa bloki z atrybutem `data-only="pl"` / `data-only="en"`, przełączane w CSS po
   `lang` na `<html>`. Skrypt i18n podmienia tylko `textContent` elementów bez dzieci, więc cytat
   ze stopką autora nie dałby się przełączyć jego mechanizmem.

5. **Menu** — zakładki: Antipasti · Zuppe · Focaccia · Insalate · Pizza · Pasta e risotto ·
   Pesce · Carne · Contorni · Dolci · Napoje. Zakładka „Napoje" grupuje w sobie wszystkie
   podsekcje barowe jako nagłówki drugiego poziomu w jednym panelu (koktajle, mocktaile, wino,
   piwo, napoje gorące, napoje zimne, woda) — nie są osobnymi zakładkami.
   Pozycja: nazwa (Petrona), opis PL, opis EN
   kursywą, gramatura, cena z kropkowanym leaderem, znaczniki diet (polecane przez szefa,
   bezglutenowe, wegetariańskie, wegańskie, pikantne). Pod spodem zwijana pełna karta alkoholi.
   Na końcu drobnym drukiem zapisy ze stopki karty (§3.1).

6. **Galeria** — sześć kadrów w siatce trzy na dwa.

6a. **Pasmo pełnoszerokie** przed sekcją menu — zdjęcie sali z czerwoną etykietą
   „Prosto z pieca" wchodzącą na kadr od prawej krawędzi.

7. **Sekcja ciemna** — pełna szerokość na orzechu, chwyt „Dark Feature" Houseplanta:
   o tarasie i rezerwacjach, z przyciskiem obrysowanym w lnie.

8. **Kontakt** — godziny otwarcia w tabeli (pon-czw 13–22, pt 13–23, sob 12–23, nd 12–22),
   adres Karmelicka 14, telefon +48 12 430 04 92 jako `tel:`, mapa, dojazd.

8a. **Bony upominkowe** — pas na czerwieni, dwie kolumny: tekst z przyciskiem
   „Kup bon online" prowadzącym do koszyka CoverManagera, obok zdjęcie. Zastępuje
   dwie podstrony starego serwisu: „Sklep" i „Bony upominkowe".

9. **Stopka** — linki, siostrzane lokale grupy, nad nimi czerwony skrypt „Trattoria"
   nachodzący na wielki wordmark „MAMMA MIA" wypełniający szerokość viewportu w jednej linii
   (chwyt Houseplanta), a pod wszystkim wąski pas szachownicy.

## 7. Pliki

```
index.html                 cała strona, menu w źródle
css/style.css              tokeny, reset, sekcje, komponenty
                           (wpinane jako ?v=N — przy wdrożeniu zmian podnieś numer,
                            inaczej goście dostaną stary arkusz z pamięci podręcznej)
js/script.js               i18n, zakładki, nawigacja mobilna, rok w stopce
images/                    10 zdjęć w WebP + logo
docs/superpowers/specs/    ten dokument
```

## 8. Weryfikacja

Statyczna strona bez logiki biznesowej nie ma sensownej warstwy testów jednostkowych —
projekt Kancelaria również ich nie miał. Weryfikacja prowadzona w przeglądarce:

0. **Ograniczenie narzędzia.** Panel podglądu w Claude Code nie dostarcza zdarzeń
   przewijania (`scroll` nie pada ani na `window`, ani na `document`, mimo że `scrollY`
   się zmienia), nie wykonuje skoku do fragmentu URL i nie odświeża zrzutu po przewinięciu.
   Zachowań zależnych od przewijania — przyklejonego nagłówka —
   nie da się tam zweryfikować; trzeba je obejrzeć w zwykłej przeglądarce.
   Obejście do zrzutów: bardzo wysoki viewport plus ujemny `margin-top` na `body`.

1. zrzuty ekranu desktop (1440) i mobile (375)
1a. pełny przegląd kontrastu: skrypt obchodzi **każdy** liść tekstowy na stronie
   (przy odsłoniętych wszystkich zakładkach menu i rozwiniętej karcie alkoholi — 659 elementów),
   zamiast punktowej listy selektorów. Punktowa lista przeoczyła dwa błędy w stopce.
2. przejście przez wszystkie zakładki menu — każda pokazuje swoje pozycje
3. przełącznik języka w obie strony, z odświeżeniem strony pomiędzy (sprawdzenie `localStorage`)
4. kontrast tekstu — zmierzony skryptem w przeglądarce, ma przechodzić WCAG AA (4,5:1;
   3:1 dla tekstu od 24 px lub 18,66 px pogrubionego). **Uwaga na parser kolorów:**
   `getComputedStyle` zwraca `color-mix()` jako `color(srgb 0.95 0.94 0.87 / 0.82)`, a nie
   jako `rgb()`. Naiwne wyciąganie liczb regexem czyta te składowe 0–1 jak wartości 0–255,
   czyli praktycznie jak czerń, i daje wyniki bez związku z rzeczywistością — w obie strony.
   Parser musi rozpoznawać obie składnie, a liczenie musi uwzględniać zarówno alfę koloru,
   jak i `opacity` elementu. Pierwsza wersja audytu tego nie robiła i przepuściła trzy
   realne niezgodności.
5. strona z wyłączonym JS — menu musi pozostać w całości widoczne
6. nawigacja klawiaturą po zakładkach i przyciskach

## 8a. Animacja wejścia sekcji — usunięta

Sekcje miały wjeżdżać z przezroczystości przy przewijaniu. Efekt został **usunięty w całości**:
reguły CSS, kod w `script.js` i klasy `reveal` w znacznikach. Strona renderuje treść od razu.

Powód poza samą preferencją: efekt kosztował nieproporcjonalnie dużo. Wymagał dwóch
niezależnych mechanizmów (przegląd początkowy plus obserwator), bo sam obserwator zostawiał
sekcje niewidoczne przy wejściu z linku prowadzącego wprost do kotwicy. Do tego jako jedyny
element strony był zależny od przewijania, którego panel podglądu nie obsługuje — więc jako
jedyny nie dawał się tam zweryfikować. Usunięcie zdejmuje całą tę klasę ryzyka: treść nie ma
już żadnej drogi do bycia trwale ukrytą.

## 8b. Blokada indeksowania — DO USUNIĘCIA PRZED WDROŻENIEM

Wersja demonstracyjna stoi publicznie na GitHub Pages (`kexiis.github.io/mamma-mia/`).
Repozytorium jest prywatne, ale **sama strona jest publiczna** — API Pages zwraca
`"public": true`. Wisi tam komplet zdjęć i pełne menu klienta, z którym nie ma jeszcze umowy.

Indeksowanie blokuje `<meta name="robots" content="noindex, nofollow">` w `index.html`.

**`robots.txt` w tym repozytorium nie działa.** Roboty czytają wyłącznie plik z korzenia
domeny, czyli `kexiis.github.io/robots.txt`, a strona stoi w podkatalogu `/mamma-mia/`.
Plik jest w repo, bo zacznie działać po przepięciu na własną domenę, ale dziś jest martwy.

**Przed wdrożeniem u klienta usuń meta tag i `robots.txt`.** Zostawione na produkcji
sprawią, że strona nie pojawi się w Google — czyli zniweczą główny cel całego projektu
opisany w sekcji 1.

## 8c. Wydajność — co faktycznie kosztowało

Pierwszy pomiar Lighthouse dał 28 punktów. Po kolejnych poprawkach 80. Kolejność przyczyn
okazała się inna, niż podpowiadała intuicja.

| Przyczyna | Waga | Naprawa |
|---|---|---|
| Kroje z Google Fonts | 7 plików, 243 KB, blokujące | hosting lokalny, preload (5.21) |
| Logo PNG 144 KB na elemencie 112 px | ciężkie, wcześnie | `logo.webp` 19 KB + osobna favikona 11 KB |
| Osadzona mapa Google | ~890 KB skryptów, 1,5 s wątku głównego | atrapa ładowana na kliknięcie |
| Kompresja zdjęć | — | przekodowanie z oryginałów, jakość 74: 508 KB → 383 KB |

**Mapa była największym pojedynczym kosztem**, a nie widać jej w naszych zasobach — ramka jest
z innego origin, więc jej wnętrze nie pojawia się w `performance.getEntriesByType('resource')`.
Diagnostyka Lighthouse pokazywała 888 KiB nieużywanego JavaScriptu przy naszym skrypcie ważącym
2 KB; to była właśnie mapa.

Atrapa ma dokładnie tę samą wysokość co ramka (441 px), więc podmiana nie przesuwa układu.
Przy okazji strona nie ustawia ciasteczek Google, dopóki gość sam nie kliknie.

**Czego nie da się naprawić na GitHub Pages:** ostrzeżenie o czasie życia cache. Pages
ustawia własne nagłówki i nie pozwala ich nadpisać. Zniknie po przeniesieniu na hosting
docelowy klienta.

**Uwaga o wyniku SEO:** spadł do 63, bo blokujemy indeksowanie meta tagiem (8b). To koszt
wersji demonstracyjnej, nie usterka — po usunięciu blokady wraca do 100.

## 8d. Rozdzielczość zdjęć wnętrz

Zdjęcia wnętrz były widocznie rozmyte. Przyczyną nie była kompresja, tylko **rozciąganie**:
źródło ma proporcje 3:1 (960×333), a kontenery są niemal kwadratowe, więc `object-fit: cover`
przycina kadr i skaluje go w hero **2,55×**, a w pełnoszerokim paśmie 1,70×.

Stara strona nie ma lepszych źródeł. Pełne pliki leżą pod ścieżką bez segmentu rozmiaru
(`photos/topy/66/{id}.jpg` zamiast `photos/topy/66/938x310/{id}.jpg`), ale mają tylko
960×333 zamiast 938×310 — różnica bez znaczenia. Zdjęcia dań nie mają wariantu większego
niż 549×823.

Rozwiązanie doraźne: warianty `-1600.webp` powiększone Lanczosem z delikatnym wyostrzeniem.
**To nie dodaje detalu**, ale wypada wyraźnie lepiej niż naiwne skalowanie w przeglądarce —
krawędzie mebli i listew są czytelne zamiast rozmazanych. Podpięte przez `srcset`, więc telefon
pobiera lekki plik (44–49 KB), a szerokie ekrany ostry (138–156 KB).

**Pułapka przy `sizes`:** atrybut opisuje szerokość, a o doborze pliku decyduje tu wysokość
kontenera po przycięciu. Przy szczerym `sizes="50vw"` przeglądarka wybierała mały plik mimo
trzykrotnego rozciągnięcia. Wartości są więc celowo zawyżone (130vw dla hero, 95vw dla sekcji
tarasu) i wymagają komentarza w znacznikach, bo wyglądają na błąd.

**Właściwe rozwiązanie to pliki od klienta.** Zdjęcia dań są robione profesjonalnie, więc
oryginały istnieją. Warto o nie poprosić razem z potwierdzeniem cen i praw do zdjęć.

## 9. Świadomie pominięte

- formularz rezerwacji (CoverManager już działa)
- sklep i bony (Stripe, poza zakresem)
- terakota jako trzeci akcent (rozmywa system)
- krok budowania / generator HTML z JSON (nie przetrwa przekazania klientowi)
- osobna podstrona menu (ustalono one-pager)

## 10. Ryzyka

- **Ceny mogą być nieaktualne.** Karta dań pochodzi z października 2025, napoje z marca 2026.
  Do potwierdzenia z restauracją przed wdrożeniem. Na potrzeby prezentacji sprzedażowej wystarczą.
- **Prawa do zdjęć.** Zdjęcia pochodzą ze starej strony restauracji, więc należą do klienta —
  ale przy wdrożeniu warto to potwierdzić, bo mógł je robić zewnętrzny fotograf.
- **Rozmiar `index.html`.** ~89 KB to dużo jak na statyczną stronę; gdyby menu urosło
  dwukrotnie, wariant C (generator) przestaje być przesadą.

### 8e. Miękki kadr bohatera — przyczyna była w proporcjach, nie w kompresji

Po wprowadzeniu wariantów 1600 px (sekcja 8d) zdjęcie w sekcji bohatera nadal
wyglądało na rozpikselizowane. Pomiar w przeglądarce wyjaśnił dlaczego: kontener
ma około 617×746 px, czyli jest niemal pionowy, a stało w nim zdjęcie o proporcji
3:1. `object-fit: cover` skaluje kadr tak, aby wypełnił krótszy wymiar, więc plik
był powiększany 1,29× — i to powiększenie nakładało się na wcześniejsze programowe
powiększenie z 960 px. Dwa upscale'e jeden na drugim dają dokładnie ten efekt,
który klient zgłosił.

Sprawdziliśmy jeszcze raz, czy stara strona ma lepsze źródła. Ścieżka
`photos/galerie/21/<id>.jpg` (bez segmentu rozmiaru) zwraca pełne pliki, ale mają
one 549×823 px, a kadry wnętrz `photos/topy/66/<id>.jpg` kończą się na 960×333.
Lepszych oryginałów w serwisie nie ma.

Rozwiązaniem było dopasowanie kształtu, a nie rozdzielczości. W sekcji bohatera
stoi teraz pionowe zdjęcie stolika (makaron z burratą, wino, miedziany dzbanek),
którego proporcje odpowiadają ramce — przeglądarka je **pomniejsza** (współczynnik
0,69), więc kadr jest ostry z definicji. Wariant 1098 px dla ekranów gęstych waży
70 kB, czyli o połowę mniej niż poprzedni plik 1600 px. Zwolniony kadr wnętrza
trafił do galerii, gdzie kafelek ma 352×300 px i również oznacza pomniejszenie.

Przy okazji `.hero__photo img` dostał `position: absolute; inset: 0`. Bez tego
proporcje nowego, pionowego pliku rozpychały wiersz siatki o blisko 200 px.

Wniosek na przyszłość: zanim doda się kolejny wariant `srcset`, warto zmierzyć
stosunek ramki do kadru. Powiększanie zdjęcia, które po prostu ma złe proporcje,
jest leczeniem objawu.

### 8f. Powiększanie sieciowe (EDSR) zamiast Lanczosa

Kadry wnętrz w pasie „Prosto z pieca" i w sekcji tarasu nadal wyglądały miękko.
Przyczyna była inna niż w sekcji bohatera: tutaj proporcje ramki pasują do zdjęcia,
ale pas rozciąga się na całą szerokość okna, więc przy 1440 px zajmuje 1425 px,
a prawdziwy materiał ma tylko 960 px. Wariant 1600 px powiększony Lanczosem nie
dokładał detalu — dokładał tylko ostre krawędzie z widocznym ringingiem.

Zamiast tego pliki powstają teraz z sieci **EDSR ×2** (`cv2.dnn_superres`,
model `EDSR_x2.pb`). Wejście 960×333 daje 1920×666 w około 80 sekundach na kadr.
Po powiększeniu idzie już tylko delikatne wyostrzenie (radius 1,0, percent 40),
bo sieć zwraca obraz wystarczająco kontrastowy. Porównanie 1:1 na krawędzi blatu
i oparciach krzeseł pokazuje wyraźnie mniej aureoli niż wariant Lanczosa.

Pliki `wnetrze-{1,2,3}-1600.webp` zastąpione przez `wnetrze-{1,2,3}-1920.webp`
(129/146/136 kB). Szersza rozdzielczość obsługuje też ekrany o większej gęstości.

Uwaga metodologiczna: sieć nadal nie wie, co było na zdjęciu — zgaduje wiarygodnie.
Zdanie z sekcji 8d pozostaje w mocy: naprawdę dobry wynik dadzą dopiero oryginalne
pliki od klienta.

### 8g. Koniec z powiększaniem — każdy kadr pracuje poniżej rozdzielczości własnej

Powiększanie, nawet siecią EDSR, dokładało wiarygodne, ale zmyślone piksele.
Zamiast szukać lepszego algorytmu, ograniczyliśmy miejsce, jakie zdjęcia zajmują,
tak aby przeglądarka zawsze je pomniejszała. Pomniejszanie jest operacją bezstratną
percepcyjnie — traci detal, ale nie wprowadza miękkości ani aureoli.

Trzy zmiany:

1. **Pas „Prosto z pieca" stał się tryptykiem.** Zamiast jednego kadru rozciągniętego
   na 1425 px stoją trzy kafelki po 473 px. Dodatkowo wysokość pasa ma górną granicę
   320 px, czyli poniżej 333 px wysokości materiału źródłowego — dzięki temu również
   wymiar pionowy oznacza pomniejszenie. Współczynnik wynosi 0,96.
2. **Sekcja tarasu dostała pionowe zdjęcie pizzy** (549×824) zamiast kadru wnętrza,
   który był tam powiększany 1,32×. Kadr pasuje też tematycznie: pizza podana na
   tarasie. Współczynnik 0,93.
3. **Galeria zawiera teraz same dania** — cztery kadry w dwóch kolumnach. Kadry wnętrz
   przeniosły się do pasa.

Po zmianie żadne zdjęcie na stronie nie jest powiększane. Zmierzone współczynniki
przy 1440 px: logo 0,50, bohater 0,63, piec 0,93, kafelki pasa 0,96, galeria 0,98,
taras 0,93, bony 0,79.

### 8h. Pas „Prosto z pieca" usunięty

Pas zniknął ze strony wraz z regułami `.band` i `.band__label`. W jego miejscu
stoi markiza, więc rytm sekcji pozostaje bez zmian: „O nas" — markiza — menu.

Wraz z pasem z repozytorium wyleciały wszystkie kadry wnętrz
(`wnetrze-{1,2,3}.webp` i warianty `-1920`), bo nie miały już żadnego odwołania.
W katalogu `images/` zostaje dziewięć plików, wszystkie używane. Materiał EDSR
opisany w sekcji 8f jest tym samym nieaktualny dla tej strony — zostaje
w dokumentacji jako notatka metodyczna.

### 9. Teksty oparte na materiale klienta

Klient dostarczył własny opis restauracji — o tęsknocie za Włochami, o pizzy
na cienkim cieście z pieca opalanego drewnem, makaronach według włoskich receptur,
wędlinach i serach z Półwyspu Apenińskiego, oliwie z oliwek pierwszej jakości
i winach z włoskich winnic. Wszystkie teksty o restauracji zostały na nim oparte.

Zmienione: meta description, og:description, akapit wprowadzający hero, stempel
o piecu, cała sekcja „O nas" (nowy tytuł „Z tęsknoty za Włochami" i trzy akapity),
akapit wprowadzający menu oraz akapit sekcji tarasu. Angielskie odpowiedniki
w atrybutach `data-en` przetłumaczone razem z polskimi.

Zachowane fakty spoza materiału klienta, pochodzące z profilu biznesowego:
przynależność do niezależnej grupy z La Campaną i Koglem-Moglem, brak franczyzy
i kuchni centralnej, taras na dziedzińcu. Zachowane też obie prawdziwe opinie
z Google — restauracja nie cytuje samej siebie.
