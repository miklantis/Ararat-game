# Karten-App – Konzept & Plan (Entwurf v1)

Begleit-App zum Brettspiel „Ararat – Die Reise zum Gipfel". Läuft als statische
Web-App im Browser auf dem iPhone (GitHub Pages, keine Installation). Am Tisch
tippt jemand eine Bereichsfarbe an, die App zieht eine Karte aus diesem Bereich,
zeigt minimalen Text und spielt den Kurmancî-Text als Audio vor.

> **Arbeitsweise.** Sagst du „lass uns Karten-App weitermachen" (oder „entwickeln"), liest Claude
> diesen Plan, knüpft am nächsten offenen Punkt an und führt die Umsetzung fort.
> Was erledigt wurde, wird hier protokolliert; fertige Punkte werden abgehakt
> (`[x]`), aber erst nach deiner Freigabe über die Live-Seite. Braucht ein
> Bereich mehrere Schritte, darf Claude darunter neue Unterpunkte als eigene
> Checkboxen ergänzen.

---

## 1. Datenquelle (das Herzstück)

Die App erfindet nichts und legt nichts fest. Sie liest die Brettdefinition aus
ihrem eigenen Ordner: `karten-app/ararat-board.json` – dieselben Daten, die im
Editor der Simulation gepflegt werden. Alles –
Bereichsfarben, Namen, Symbole, Karten, Texte, Effekte – kommt aus dieser Datei.
Nichts ist in der App fest verdrahtet. Editierst du die JSON, ändert sich die
App beim nächsten Laden entsprechend.

**Datenfluss**

```
Du editierst das Brett  ->  du gibst mir die aktuelle ararat-board.json
                        ->  ich aktualisiere sie im Repo (main)
                        ->  Karten-App liest sie per fetch aus dem Repo
                        +->  Audio aus karten-app/audio/<id>_<lang>.mp3
```

**Kartenschema** (so wie es real in der JSON steht):

| Feld        | Bedeutung                                                        |
|-------------|------------------------------------------------------------------|
| `id`        | z. B. `dorf-01` – liefert auch den Audio-Dateinamen              |
| `bereich`   | Zuordnung zu einem Bereich aus `zones`                          |
| `typ`       | Art des Ereignisses (siehe Effekt-Tabelle unten)                |
| `wert`      | Zahl oder leer (z. B. `vorwaerts`/`3` = drei vor)               |
| `text_kmr`  | Kurmancî (Audio-Sprache)                                         |
| `text_de`   | Deutsch (für den Spielleiter)                                    |
| `text_tr`   | Türkisch (Brücke)                                                |
| `audio`     | optionaler Pfad; ist er leer, gilt die Namenskonvention         |

**Bereiche** kommen vollständig aus `zones` (je mit `id`, `name`, `color`,
`symbol`). Aktueller Stand nur als Beispiel – die App nimmt immer das, was in der
JSON steht, und legt keine Werte selbst fest:

| id (Beispiel) | Name (Beispiel)   | Farbe (Beispiel) | Symbol (Beispiel) |
|---------------|-------------------|------------------|-------------------|
| `dorf`        | Dorf (Karapazar)  | aus JSON         | aus JSON          |
| `felder`      | Felder / Weide    | aus JSON         | aus JSON          |
| `stadt`       | Stadt             | aus JSON         | aus JSON          |
| `ararat`      | Ararat            | aus JSON         | aus JSON          |

**Audio**: liegt unter `karten-app/audio/` mit der Konvention
`<id>_<lang>.mp3`, z. B. `karten-app/audio/dorf-01_kmr.mp3`. Die App prüft, ob
die Datei vorhanden ist: wenn ja, wird abgespielt; wenn nicht, läuft sie still
weiter (kein Fehler). Ist im Feld `audio` ein Pfad gesetzt, hat dieser Vorrang.

---

## 2. Effekt-Anzeige in der Ecke

Aus `typ` + `wert` wird ein dezentes, halbtransparentes Eck-Symbol mit kurzem
Label. So sieht man die Wirkung der Karte, ohne den Text verstehen zu müssen.
Ein-/ausschaltbar in den Einstellungen. Die App interpretiert die `typ`-Werte,
die in der JSON vorkommen:

| `typ`               | Anzeige (Beispiel)            |
|---------------------|-------------------------------|
| `vorwaerts`         | „+N vor"                      |
| `rueckwaerts`       | „−N zurück"                   |
| `aussetzen`         | „aussetzen"                   |
| `erneut`            | „nochmal würfeln"             |
| `tausch_fuehrender` | „Tausch mit Führendem"        |
| `tausch_hinterster` | „Tausch mit Letztem"          |
| `vor_zu_naechstem`  | „vor zum nächsten Feld"       |

---

## 3. Bildschirme & Bedienung

### Stapel-Ansicht (Start)
- Vier Karten gleichzeitig, je eine pro Bereich, in der Bereichsfarbe aus der JSON.
- Jede Karte wirkt wie die Oberseite eines Stapels: Bereichsfarbe als Fläche,
  das Bereichssymbol als großes, leicht transparentes Wasserzeichen – man ahnt
  die Zugehörigkeit, ohne dass es aufdringlich wird.
- Großzügige Tap-Flächen, iPhone-Hochformat, gut greifbar.
- Einstellungs-Icon in einer Ecke (Menü kommt in Phase 5).

### Karte öffnen (Vollbild)
- Tippen auf eine Bereichskarte zieht **zufällig eine Karte aus diesem Bereich**.
- Die Karte dreht sich und öffnet sich auf den ganzen Bildschirm.
- Inhalt: Text in **einer** Sprache je nach Einstellung (Kurmancî / Deutsch /
  Türkisch). Passend dazu wird – falls Audiodatei vorhanden – automatisch
  vorgelesen.
- In einer Ecke die halbtransparente Effekt-Anzeige (siehe Abschnitt 2).
- In einer Ecke ein **X-Button**: schließt die Karte, sie schiebt sich zur Seite
  weg, zurück zur Stapel-Ansicht.

### Einstellungen (Menü hinter dem Icon)
Zunächst diese Schalter:
- angezeigte **Textsprache** (Kurmancî / Deutsch / Türkisch),
- **Audiosprache** und Audio an/aus,
- **Effekt-Anzeige** in der Ecke an/aus.

Weitere Einstellungen besprechen wir später.

---

## 4. Phasen & Fortschritt

Vorgehen je Phase: umsetzen → pushen → du testest über die Live-Seite → bei
Freigabe wird abgehakt → nächste Phase. `[ ]` = offen, `[x]` = von dir freigegeben.

- [x] **Phase 0 – Gerüst & Datenanbindung**
  Statisches Grundgerüst (HTML/CSS/JS, kein Framework). App lädt
  `ararat-board.json` aus dem Repo per fetch und baut intern das Datenmodell.
  Klare Meldung, falls die JSON nicht erreichbar ist.
  - Freigegeben über Live-Test. Datenanbindung steht (fetch `no-store`, Modell
    mit Bereichen indexiert und Karten je Bereich gruppiert, Fehlermeldung bei
    nicht erreichbarer JSON). Das Test-Diagnosebild wurde durch die echte
    Stapel-Ansicht (Phase 1) ersetzt.

- [x] **Phase 1 – Stapel-Ansicht**
  Vier Bereichskarten in Bereichsfarbe mit Symbol-Wasserzeichen (alles aus der
  JSON), iPhone-Layout, Einstellungs-Icon (Menü noch leer).
  - Freigegeben über Live-Test. Vier Karten als 2×2-Raster, Bereichsfarbe +
    Symbol-Wasserzeichen, keine Texte, Einstellungs-Icon oben rechts.
    (Zwischenfix: Lade-Ebene blendete nicht aus und fing Klicks ab – behoben
    mit `[hidden] { display: none !important; }`.)

- [ ] **Phase 2 – Karte öffnen & schließen**
  Tippen zieht zufällig eine Karte aus dem Bereich, Dreh-/Aufklapp-Animation auf
  Vollbild, zunächst nur Text (Deutsch als Vorgabe). X-Button schließt mit
  Weg-Schieben.
  - Umgesetzt (wartet auf Live-Test): Antippen zieht rein zufällig eine Karte
    aus dem Bereich und klappt sie auf Vollbild auf (Aufklapp-Animation mit
    leichter Drehung), Bereichsfarbe als Fläche, Symbol als Wasserzeichen,
    deutscher Text (Fallback auf kmr/tr, falls leer). X-Button oben rechts
    schließt mit Weg-Schieben. Lock verhindert Doppelöffnen; reduced-motion
    wird respektiert.

- [ ] **Phase 3 – Sprache & Audio**
  Dreisprachige Texte, angezeigte Sprache je Einstellung. Auto-Audio beim Öffnen
  aus `karten-app/audio/<id>_<lang>.mp3` (sonst stiller Fallback) plus Button zum
  erneuten Abspielen.
  - [ ] Audio umgesetzt (wartet auf Live-Test): Beim Öffnen wird das
    Kurmancî-Audio (`audio/<id>_kmr.mp3`, ein gesetztes `audio`-Feld hat Vorrang)
    automatisch abgespielt; ein Wiederhol-Button unten rechts spielt es erneut.
    Fehlt die Datei, bleibt es still und der Button erscheint nicht. Audio stoppt
    beim Schließen. Hinweis: aktuell liegen noch keine Audiodateien im Repo, der
    Button erscheint also erst mit vorhandener Datei.
  - [ ] Angezeigte Textsprache je Einstellung – offen, kommt mit dem
    Einstellungsmenü (Phase 5). Vorerst Deutsch als Anzeige.

- [ ] **Phase 4 – Effekt-Anzeige in der Ecke**
  Halbtransparentes Eck-Symbol aus `typ` + `wert`, ein-/ausschaltbar.

- [ ] **Phase 5 – Einstellungsmenü**
  Menü hinter dem Icon: Textsprache, Audiosprache, Audio an/aus, Effekt-Anzeige
  an/aus.

- [ ] **Phase 6 – Feinschliff**
  Animationen, Touch-Feedback, große Schrift/Kontrast.

---

## 5. Festgelegte Entscheidungen

- **Kein Supabase, kein Backend.** Einzige Datenquelle ist die Repo-JSON
  `karten-app/ararat-board.json`.
- **Nichts fest verdrahtet.** Farben, Namen, Symbole, Texte und Effekte kommen
  alle aus der JSON; ändert sich die JSON, ändert sich die App.
- **JSON-Aktualisierung:** du gibst mir die jeweils aktuelle JSON, ich committe
  sie ins Repo. Die App liest immer den Repo-Stand.
- **Ziehen:** rein zufällig aus dem Bereich.
- **Audio:** unter `karten-app/audio/` als `<id>_<lang>.mp3`; vorhanden →
  abspielen, sonst still.
