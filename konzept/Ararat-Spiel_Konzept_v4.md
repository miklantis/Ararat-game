# Ararat – Die Reise zum Gipfel

Konzeptdokument · **Version 4** · Stand: 11. Juni 2026

> Änderungen gegenüber Version 3: Der Test-Prototyp wurde verfeinert. Der Spielweg wird im JSON als Master-Kurve (Catmull-Rom-Spline) definiert, auf der die App die Felder per Bogenlänge verteilt; Design-Parameter (Kachelgröße, Eckenrundung, Abstand, Ausrichtung) liegen als eigener JSON-Block bei und sind ohne Codeänderung anpassbar. Die Würfelkonfiguration (ein oder zwei Würfel) ist ebenfalls JSON-Stellschraube; die Simulation vergleicht beide Varianten im Turbo-Modus und bietet zusätzlich einen manuellen Wurfmodus zum Selbst-Testen.

---

## 1. Worum es geht

Ein haptisches Brettspiel für einen über 80-jährigen kurdischen Herrn aus der Ararat-Region, der heute in einem Pflegeheim lebt. Bis zu vier Personen würfeln mit großen, griffigen Würfeln und führen ihre Spielfigur eine ansteigende Spirale hinauf bis zum Gipfel des Ararat. Wer zuerst oben ist, gewinnt.

Unterwegs liegen farbige Kartenfelder. Wer darauf landet, ruft eine Karte aus dem passenden Bereich auf und erlebt ein kurzes, gern humorvolles Ereignis – immer eingebettet in den Ort, an dem man gerade ist.

## 2. Die eigentliche Idee

Der Herr ist der Einzige am Tisch, der Kurdisch versteht. Im Heim ist er meist der, dem geholfen wird – an diesem Tisch ist er der Experte, die Autorität, der Übersetzer. Das ist nicht ein Detail, sondern das Herzstück des Spiels. Die Karten sprechen auf Kurmancî zu ihm; er gibt den anderen weiter, was passiert. Die Orte auf dem Brett sind die Orte seines Lebens.

## 3. Das Spielprinzip

- Bis zu vier Spielfiguren, Start an einem gemeinsamen Startpunkt am äußeren Rand der Spirale.
- Pro Zug wird gewürfelt und die Augenzahl an Feldern weitergezogen. Ob mit **einem oder zwei** großen Würfeln gespielt wird, ist noch offen: Das hängt davon ab, wie viele Felder es insgesamt gibt und wie groß ein einzelner Schritt sein soll (siehe Abschnitt 11). Diese Frage klären wir über die Testumgebung in Schritt 2, die beide Varianten direkt vergleichen kann.
- Der Weg führt als Spirale von außen nach innen und steigt dabei haptisch an, bis zum Gipfel in der Mitte (Feld „Ende“).
- Landet man auf einem farbigen Kartenfeld, ruft man eine Karte aus dem Bereich in derselben Farbe auf und führt aus, was sie sagt.
- Wer als Erster das Gipfelfeld erreicht, gewinnt.

## 4. Das Spielbrett

Format: 42 cm × 45 cm. Das Brett zeigt eine Spirale, die vom Start außen nach innen zum Gipfel verläuft. Die Spielfläche – der Weg mit seinen Feldern – muss jederzeit klar sichtbar bleiben und darf nicht von Illustrationen überdeckt werden. Illustrationen liegen ringsum am Rand und im Zentrum (der Berg selbst).

### 4.1 Die vier Bereiche

Der Weg ist in vier thematische Bereiche aus dem Leben des Beschenkten geteilt. Jeder Bereich hat eine eigene Farbe; die zugehörigen Kartenfelder, der zugehörige Kartenstapel und die Farb-Schaltfläche in der Begleit-App tragen dieselbe Farbe, damit klar ist, woher man zieht.

| Bereich | Bedeutung | Vorschlag Farbe | Vorschlag Symbol |
|---|---|---|---|
| Dorf (Karapazar) | Sein Heimatdorf | Terrakotta / Warmrot | Haus |
| Felder / Weide | Wo er als Schäfer gearbeitet hat | Grün | Schaf |
| Stadt | Die weitere Welt | Blau | Gebäude / Tor |
| Ararat (Gipfel) | Wo er geboren ist, der Berg, das Ziel | Weiß / Schnee-Grau | Bergspitze |

Die Symbole sind ein bewusster Zusatz zur Farbe: Bei nachlassender Sehkraft sind Farbe und Form zusammen leichter zu unterscheiden als Farbe allein.

### 4.2 Reihenfolge entlang der Spirale

Nach der Skizze verläuft der Weg vom Start (oben rechts) über das Dorf, die Felder und die Stadt nach innen zum Ararat-Gipfel:

**Start → Dorf → Felder → Stadt → Ararat (Gipfel, Ende)**

Das ergibt einen Lebensbogen, der am Berg endet. Die Reihenfolge ist als Vorschlag zu verstehen und bleibt frei wählbar – das ist eine der offenen Entscheidungen (siehe Abschnitt 11).

### 4.3 Felder und Kartenfelder

- Jeder Bereich hat eine bestimmte Anzahl Felder; ein Teil davon sind farbige Kartenfelder seiner Bereichsfarbe.
- Anzahl der Felder pro Bereich, Schrittgröße (und damit die Würfelfrage) und die Verteilung der Kartenfelder werden im Test-Prototyp eingestellt und durch Simulation austariert (siehe Schritt 2).
- Die geometrische Form des Wegs (die Spirale) wird im Test-Prototyp nicht im Code festgelegt, sondern als **Master-Kurve im JSON** beschrieben (siehe 8.3 und Schritt 2). Dieselbe Kurve dient später als Vorlage für das physische Brett.

### 4.4 Illustration

Ringsum und im Zentrum entsteht eine illustrierte Landschaft: der Ararat in der Mitte, dazu Motive aus Dorf, Weide und Stadt am Rand. Die Illustrationen sollen die Reise erzählen, ohne den Weg zu verdecken. Sie werden mit KI erzeugt; dafür entstehen passende Prompts (siehe Schritt 4).

## 5. Die Karten

### 5.1 Kartenarten

1. **Vorwärts (+N):** Figur zieht N Felder vor.
2. **Rückwärts (−N):** Figur zieht N Felder zurück.
3. **Aussetzen:** eine Runde aussetzen.
4. **Erneut würfeln:** sofort noch einmal würfeln und ziehen.
5. **Mitspieler-abhängig:** Effekt bezieht andere Spieler ein, z. B. Platz tauschen, zu einem Mitspieler aufschließen oder einen Mitspieler zu sich holen.

Für den ersten Prototyp werden die Karten bewusst einfach gehalten (vor allem +N, −N, aussetzen, erneut würfeln). Die mitspieler-abhängigen Karten und die inhaltlichen Geschichten kommen in einem späteren Schritt dazu.

### 5.2 Kontext statt nackter Zahl

Jede Karte verpackt ihren Effekt in den Ort, an dem man steht. Die Mechanik (+2, −5, aussetzen) bleibt gleich, aber der Text passt zum Bereich. Beispiele:

- **Dorf:** „Im Dorf wird gefeiert, alle brauchen dich – geh 2 Felder zurück.“
- **Ararat:** „Ein Sturm zieht auf am Berg – geh 10 Felder zurück.“
- **Unterwegs / Felder:** „Jemand nimmt dich im Auto mit – geh 5 Felder vor.“

So entsteht aus jeder Zahl ein kleines Stück Erzählung aus seiner Welt.

### 5.3 Karten digital: die Begleit-App

Weil der Herr nicht gut lesen kann, werden die Karteninhalte vor allem über eine kleine **Begleit-App** ausgespielt, die im Browser auf Handy oder Tablet läuft – ohne Installation. Der Ablauf:

1. Man landet auf einem farbigen Kartenfeld.
2. Man öffnet die App und sieht die **vier Bereichsfarben als große Schaltflächen**.
3. Man tippt die passende Farbe an.
4. Die App zieht eine Karte aus diesem Bereich, zeigt sie mit minimalem Text und spielt den Kurmancî-Text als Audio vor.

Gedruckte physische Karten bleiben **optional** möglich (z. B. mit aufgedrucktem Scan-Code, der dieselbe App öffnet), sind aber nicht nötig – die App ist der einfachere, bevorzugte Weg.

### 5.4 Eine einzige Datenquelle

Alle Karten kommen aus einer strukturierten Datenquelle. In der Begleit-App liegt diese in **Supabase** (siehe Abschnitt 8); für den Test-Prototyp und spätere Druckvorlagen lässt sie sich als JSON exportieren und importieren. Vorschlag für die Felder pro Karte:

- `id` – eindeutige Kennung
- `bereich` – dorf | felder | stadt | ararat
- `typ` – vorwaerts | rueckwaerts | aussetzen | erneut | mitspieler
- `wert` – Zahl (z. B. +2, −5; bei aussetzen/erneut leer)
- `text_kmr` – Kurmancî (gesprochen, Audio)
- `text_de` – Deutsch (für den Spielleiter)
- `text_tr` – Türkisch (zusätzliche Brücke)
- `audio` – Verweis auf die vorab erzeugte Audiodatei

## 6. Sprache

Der Herr stammt aus der Ararat-Gegend, seine Sprache ist mit hoher Wahrscheinlichkeit **Kurmancî** (Nordkurdisch, ISO-Code `kmr`). Das wird vor dem Start abgesichert – am schönsten, indem man ihn oder seine Familie direkt fragt. Das Sprachfeld bleibt flexibel, falls doch eine andere kurdische Variante herauskommt.

Jede Karte wird dreisprachig gepflegt:

- **Kurmancî** – die gesprochene Sprache der Karten (Audio)
- **Deutsch** – damit der Spielleiter den Inhalt versteht und notfalls erklären kann
- **Türkisch** – als zusätzliche Brücke

## 7. Audio

Der Karteninhalt wird als Audio bereitgestellt und beim Antippen in der App vorgelesen. Zwei Wege sind möglich und werden vom Datenmodell beide unterstützt:

- **Text-to-Speech** über **kurdishtts.com** – eine Plattform mit Kurmancî-TTS, mehreren Stimmen und einer REST-API. Als freie Rückfalloption existiert Metas offenes Modell `facebook/mms-tts-kmr-script_latin`.
- **Echte Aufnahme** – jemand spricht die Karteninhalte ein, jede Karte als eigene Audiodatei. Das erlaubt eine vertraute, persönliche Stimme.

In beiden Fällen wird der Text jeder Karte **einmal vorab** in eine Audiodatei umgewandelt bzw. aufgenommen; die App spielt diese Datei nur noch ab. Die Dateien liegen in **Supabase Storage** (oder im Repository) und werden über das `audio`-Feld der Karte referenziert.

## 8. Technische Architektur

Das ganze Projekt liegt in einem gemeinsamen Repository – lokal im Ordner `Ararat-game`, online unter `https://github.com/miklantis/Ararat-game`. Darin entstehen **zwei getrennte Apps**:

### 8.1 Repository-Struktur

```
Ararat-game/                  lokaler Ordner + GitHub-Repo (miklantis/Ararat-game)
├─ konzept/                   Konzeptdokumente (v1, v2, v3, v4, …)
├─ karten-app/                Begleit-App: Karten ziehen + Audio
└─ simulation/                Test-Prototyp: Brett entwerfen, JSON laden, simulieren
```

### 8.2 Begleit-App (`karten-app/`)

Die Begleit-App ist eine **statische Web-App**, die im mobilen Browser läuft und keine Installation braucht.

- **Code & Hosting:** Quellcode im GitHub-Repository, Bereitstellung über **GitHub Pages**. Der Link lässt sich auf dem Handy als Lesezeichen ablegen.
- **Datenbank:** **Supabase** ist die zentrale Datenquelle für die Karten; die App liest sie je Bereich direkt über den Supabase-Client aus.
- **Audio:** Die vorab erzeugten oder aufgenommenen Audiodateien liegen in Supabase Storage (oder im Repository) und werden beim Antippen abgespielt.
- **Hinweis:** GitHub Pages ist reines statisches Hosting; die Verbindung zur Datenbank läuft direkt vom Browser zu Supabase. Für die spätere Pflege der Inhalte genügt ein Bearbeiten der Daten in Supabase, ohne den Code anzufassen.

### 8.3 Test-Prototyp (`simulation/`)

Eine eigenständige Single-File-HTML-App zum Entwerfen und Austarieren des Bretts. Sie ist von Supabase unabhängig: Ihre Daten kommen als **JSON, das man von außen hochlädt**. Das JSON beschreibt das Brett vollständig – nicht nur Felder und Karten, sondern auch die **geometrische Form des Wegs (Master-Kurve)**, die **Design-Parameter** der Darstellung und die **Würfelkonfiguration** (siehe Schritt 2 für die Details). Beide Apps können dasselbe JSON-Format für die Karten verwenden, sodass Inhalte zwischen Test-Prototyp und Begleit-App austauschbar bleiben.

## 9. Zugänglichkeit

Er kann nicht mehr gut lesen. Deshalb gilt durchgehend:

- Große, griffige Würfel und Spielfiguren.
- So wenig Text auf dem Brett wie möglich.
- Karteninhalt als Audio auf Kurmancî, abrufbar über die Begleit-App (große Farb-Schaltflächen, antippen statt lesen).
- Bereiche zusätzlich über Farbe **und** Symbol erkennbar, nicht über Farbe allein.
- Die Bühne ist haptisch erhöht: ein echter, ansteigender Berg statt eines flachen Bretts.
- Der Weg bleibt jederzeit frei sichtbar, Illustrationen drängen sich nicht in den Spielraum.

## 10. Vorgehen in Schritten

Erst digital, dann physisch.

### Schritt 1 – Konzeptdokument (dieses Dokument)

Die gemeinsame Grundlage. Beschreibt Idee, Brett, Bereiche, Karten, Sprache, Audio, Technik und Zugänglichkeit. Liegt im Repository unter `konzept/`.

### Schritt 2 – Test-Prototyp mit Simulation (`simulation/`)

Eine eigenständige Single-File-HTML-App, mit der man das Brett entwirft und durchrechnet. Sie soll:

- Das Brett als Spirale mit den vier Bereichen darstellen.
- **Eine JSON-Datei von außen einlesen** (Upload), die das Brett vollständig beschreibt: Master-Kurve des Wegs, Felder pro Bereich, Position der Kartenfelder, Design-Parameter, Würfelkonfiguration, Anzahl Karten je Stapel. Der aktuelle Stand lässt sich auch wieder als JSON exportieren.
- 2 bis 4 Spieler unterstützen und **Computer gegen Computer** spielen lassen (automatischer Spielablauf, keine Eingaben nötig).
- Die Karteneffekte (+N, −N, aussetzen, erneut würfeln) ausführen.
- Ein einzelnes Spiel **sichtbar abspielen** mit regelbarer Geschwindigkeit (schneller / langsamer).
- Einen **manuellen Modus** bieten: Schritt für Schritt selbst würfeln (Klick = Wurf), um Varianten am Bildschirm zu erleben, bevor Material gekauft wird.
- Einen **Turbo-Modus** bieten: viele Partien hintereinander ohne Animation durchrechnen.
- **Auswerten und messen:** durchschnittliche Spieldauer (Züge/Runden), Verteilung der Siege (z. B. nach Startposition), kürzeste/längste Partie, Trefferquote der Kartenfelder und ob die Feld- und Kartenverteilung funktioniert – damit lässt sich auch die Würfelfrage beantworten.

Ziel: Mit diesem Artefakt entscheiden wir gemeinsam über Feldzahl, Schrittgröße/Würfel, Wegform und Kartenmischung.

#### 2a Pfaddefinition im JSON

Der Spielweg wird nicht im Code, sondern vollständig im JSON beschrieben. Die App liest drei getrennte Bausteine und zeichnet daraus das Brett:

1. **Master-Kurve** – die geometrische Form des Wegs
2. **Felder** – die logische Abfolge der Spielfelder
3. **Design-Parameter** – wie die Felder auf der Kurve aussehen

Alle drei sind unabhängig voneinander änderbar. Eine Änderung im JSON genügt; die App passt die Darstellung beim nächsten Laden an. Es ist kein Eingriff in den Code nötig.

**Master-Kurve.** Die Kurve wird als Catmull-Rom-Spline definiert: eine Liste von Punkten, durch die der Weg verläuft. Vorteil gegenüber roher Bézier-Definition: Jeder Punkt liegt **auf** der Kurve und lässt sich von Hand im JSON verschieben, ohne abstrakte Kontrollpunkte verstehen zu müssen. Intern wandelt die App die Punktliste in Bézier-Segmente um.

- Koordinaten normiert (0–1), unabhängig von der Bildschirmgröße.
- `tension` steuert global die Rundheit der Kurve: niedriger Wert = eckiger, höherer Wert = weicher. Das ist der zentrale „mach den Weg runder“-Regler.
- Optionales `h` pro Punkt (0–1) als Höheninformation für die spätere Berg-Darstellung (Schattierung, Skalierung, 3D-Andeutung) und als Vorlage für die physische Berg-Bühne.

**Felder.** Die Felder kennen die Kurve nicht. Sie sind eine geordnete Liste mit Zone und Typ. Die App misst die Bogenlänge der Master-Kurve und verteilt die Felder **gleichabständig** darauf (Arc-Length-Parametrisierung). Konsequenz: Felder können hinzukommen oder wegfallen, ohne die Kurve zu ändern – und die Kurvenform kann sich ändern, ohne die Feldliste anzufassen. Feldanzahl und Wegform sind zwei getrennte Stellschrauben.

**Design-Parameter.** Alle gestalterischen Werte liegen als relativer Block im JSON:

| Parameter      | Bedeutung                                              | Wertebereich |
|----------------|--------------------------------------------------------|--------------|
| `tileSize`     | Kachelgröße relativ zur Brettbreite                    | z. B. 0.04–0.08 |
| `cornerRadius` | Eckenrundung relativ zur Kachelgröße (0.5 = Kreis)     | 0–0.5 |
| `tileGap`      | Abstand zwischen Kacheln, als Anteil des Feldabstands  | 0–0.5 |
| `orientTiles`  | Ausrichtung: `"tangent"` (der Kurve folgend) oder `"fixed"` | – |
| `pathStroke`   | Sichtbare Weglinie unter den Kacheln (an/aus, Breite, Farbe) | – |

Optional kann eine Zone einzelne Werte überschreiben (z. B. Gipfelfeld größer als normale Felder).

**Beispiel:**

```json
{
  "board": {
    "path": {
      "curveType": "catmullRom",
      "closed": false,
      "tension": 0.5,
      "points": [
        { "x": 0.12, "y": 0.92, "h": 0.0 },
        { "x": 0.55, "y": 0.85, "h": 0.1 },
        { "x": 0.80, "y": 0.65, "h": 0.3 },
        { "x": 0.40, "y": 0.55, "h": 0.5 },
        { "x": 0.25, "y": 0.35, "h": 0.7 },
        { "x": 0.55, "y": 0.25, "h": 0.85 },
        { "x": 0.50, "y": 0.10, "h": 1.0 }
      ]
    },
    "design": {
      "tileShape": "roundedRect",
      "tileSize": 0.06,
      "cornerRadius": 0.35,
      "tileGap": 0.25,
      "orientTiles": "tangent",
      "pathStroke": { "show": true, "width": 0.012, "color": "#b8a98c" }
    },
    "fields": [
      { "index": 0, "zone": "dorf",   "type": "start" },
      { "index": 1, "zone": "dorf",   "type": "normal" },
      { "index": 2, "zone": "dorf",   "type": "karte" },
      { "index": 3, "zone": "weide",  "type": "normal" }
    ]
  }
}
```

#### 2b Würfelkonfiguration

Auch die Würfel sind eine Stellschraube im JSON, kein fester Code-Wert:

```json
{
  "dice": {
    "count": 1,
    "faces": 6
  }
}
```

- `count`: 1 oder 2 Würfel. Bei zwei Würfeln zählt die Summe.
- `faces`: Augenzahl (Standard 6, für Experimente änderbar).

Zwei Würfel verändern das Spiel spürbar: Das Spiel wird schneller (durchschnittlich 7 statt 3,5 Augen pro Zug), und die Wurfergebnisse verteilen sich anders – mittlere Summen (6, 7, 8) fallen häufig, Extremwerte (2, 12) selten. Das beeinflusst, wie oft Kartenfelder getroffen werden und wie eng das Rennen bleibt.

Die Simulation soll beide Varianten direkt vergleichbar machen: Im Turbo-Modus jeweils viele Partien mit 1 und mit 2 Würfeln laufen lassen und in der Auswertung gegenüberstellen – Spieldauer (Züge), Streuung zwischen den Spielern, Trefferquote der Kartenfelder. So lässt sich datenbasiert entscheiden, welche Variante zum Feldlayout passt, bzw. die Feldanzahl an die gewählte Würfelvariante anpassen. Der manuelle Modus (Klick = Wurf) deckt zusätzlich den eigenen Test beider Varianten am Bildschirm ab.

#### 2c Arbeitsweise beim Austarieren

Typische Anpassungen und der jeweils einzige nötige Eingriff:

- **Weg runder machen** → `tension` erhöhen oder einzelne Punkte glätten
- **Weg verlängern/verkürzen** → Punkte verschieben oder ergänzen
- **Mehr/weniger Felder** → Einträge in `fields` ändern
- **Kacheln runder, größer, enger** → Werte in `design` ändern
- **Ein oder zwei Würfel** → `dice.count` ändern

JSON aktualisieren, App lädt neu – das Brett zeichnet sich entsprechend. Dieselbe Pfaddefinition dient später als Vorlage für das physische Brett (Ausdruck der gerenderten Kurve als Schnitt-/Klebevorlage für die Berg-Bühne).

### Schritt 3 – Karteninhalte

Zuerst ganz simple Karten (reine Mechanik). Danach die eigentlichen Inhalte: kurze Geschichten je Bereich, eingebettet in Dorf, Felder, Stadt und Ararat. Hierfür ggf. jemanden aus Karapazar einbeziehen, der mit ihm dort gelebt hat und erzählen kann, was an diesen Orten passieren könnte.

### Schritt 4 – Illustrationen (KI)

Passende Prompts schreiben und damit die Landschaft erzeugen: den Berg im Zentrum sowie Motive aus den vier Bereichen am Rand – im Stil aufeinander abgestimmt und so platziert, dass der Weg frei bleibt.

### Schritt 5 – Audio erzeugen und prüfen

Die Kurmancî-Texte über kurdishtts.com vertonen oder echte Aufnahmen machen und eine Qualitätsprüfung durchführen (Aussprache, Stimme, Verständlichkeit). Dateien in Supabase Storage ablegen.

### Schritt 6 – Begleit-App entwickeln (`karten-app/`)

Die statische Web-App bauen: vier Farb-Schaltflächen, Karte aus dem gewählten Bereich ziehen, Inhalt zeigen und Audio abspielen. Code ins GitHub-Repository, Bereitstellung über GitHub Pages, Karten und Audio aus Supabase.

### Schritt 7 – Physisches Spiel

Übertragung in das echte Spiel mit Berg-Bühne. Materialoptionen: stapelbare Holzklötze, Hartschaum (Styrodur) oder faltbare Karton-Würfelrohlinge für die Bergstruktur; Spielfiguren und Würfel z. B. über spielmaterial.de; Modellbaumaterial über modulor.de. Für professionell gedruckte Komponenten später ggf. The Game Crafter. Die im JSON gepflegte Master-Kurve dient dabei als geometrische Vorlage für den physischen Weg.

## 11. Offene Entscheidungen

- **Würfelanzahl:** ein oder zwei große Würfel – über den Variantenvergleich der Testumgebung (Turbo-Modus, Abschnitt 2b) datenbasiert klären.
- **Sprache bestätigen:** Kurmancî (`kmr`) durch Nachfrage bei ihm oder der Familie absichern.
- **Reihenfolge der Bereiche** entlang der Spirale festlegen (Vorschlag: Dorf → Felder → Stadt → Ararat).
- **Farben und Symbole** pro Bereich endgültig wählen.
- **Wegform:** Verlauf der Master-Kurve (Spirale) und ihre Rundheit (`tension`) – über die Testumgebung austarieren.
- **Anzahl Felder je Bereich** und **Verteilung der Kartenfelder** – über die Testumgebung austarieren.
- **Anzahl Karten je Stapel** und Mischung der Kartenarten.
- **Audio-Quelle:** generiert über kurdishtts.com oder echte Aufnahme (oder eine Mischung).
- **Gedruckte Karten:** zusätzlich zur App ja oder nein.
