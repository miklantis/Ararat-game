# Ararat – Die Reise zum Gipfel

Konzeptdokument · **Version 3** · Stand: 10. Juni 2026

> Änderungen gegenüber Version 2: GitHub-Repository und lokaler Ordner `Ararat-game` ergänzt; Repository-Struktur mit zwei getrennten Apps beschrieben (Karten-Begleit-App und Test-/Simulations-Prototyp); der Test-Prototyp lädt eine externe JSON-Datei, lässt Computer gegen Computer spielen, bietet einen Turbo-Modus für viele Partien und misst Spieldauer, Siege und weitere Kennzahlen.

---

## 1. Worum es geht

Ein haptisches Brettspiel für einen über 80-jährigen kurdischen Herrn aus der Ararat-Region, der heute in einem Pflegeheim lebt. Bis zu vier Personen würfeln mit großen, griffigen Würfeln und führen ihre Spielfigur eine ansteigende Spirale hinauf bis zum Gipfel des Ararat. Wer zuerst oben ist, gewinnt.

Unterwegs liegen farbige Kartenfelder. Wer darauf landet, ruft eine Karte aus dem passenden Bereich auf und erlebt ein kurzes, gern humorvolles Ereignis – immer eingebettet in den Ort, an dem man gerade ist.

## 2. Die eigentliche Idee

Der Herr ist der Einzige am Tisch, der Kurdisch versteht. Im Heim ist er meist der, dem geholfen wird – an diesem Tisch ist er der Experte, die Autorität, der Übersetzer. Das ist nicht ein Detail, sondern das Herzstück des Spiels. Die Karten sprechen auf Kurmancî zu ihm; er gibt den anderen weiter, was passiert. Die Orte auf dem Brett sind die Orte seines Lebens.

## 3. Das Spielprinzip

- Bis zu vier Spielfiguren, Start an einem gemeinsamen Startpunkt am äußeren Rand der Spirale.
- Pro Zug wird gewürfelt und die Augenzahl an Feldern weitergezogen. Ob mit **einem oder zwei** großen Würfeln gespielt wird, ist noch offen: Das hängt davon ab, wie viele Felder es insgesamt gibt und wie groß ein einzelner Schritt sein soll (siehe Abschnitt 11). Diese Frage klären wir über die Testumgebung in Schritt 2.
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
├─ konzept/                   Konzeptdokumente (v1, v2, v3, …)
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

Eine eigenständige Single-File-HTML-App zum Entwerfen und Austarieren des Bretts. Sie ist von Supabase unabhängig: Ihre Daten kommen als **JSON, das man von außen hochlädt** (Brettaufbau, Felder pro Bereich, Kartenfelder, Würfelanzahl, Kartenstapel). Details siehe Schritt 2. Beide Apps können dasselbe JSON-Format für die Karten verwenden, sodass Inhalte zwischen Test-Prototyp und Begleit-App austauschbar bleiben.

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
- **Eine JSON-Datei von außen einlesen** (Upload), die Brettaufbau und Karten beschreibt: Anzahl Felder pro Bereich, Position der Kartenfelder, Anzahl Karten je Stapel, ein oder zwei Würfel. Der aktuelle Stand lässt sich auch wieder als JSON exportieren.
- 2 bis 4 Spieler unterstützen und **Computer gegen Computer** spielen lassen (automatischer Spielablauf, keine Eingaben nötig).
- Die Karteneffekte (+N, −N, aussetzen, erneut würfeln) ausführen.
- Ein einzelnes Spiel **sichtbar abspielen** mit regelbarer Geschwindigkeit (schneller / langsamer).
- Einen **Turbo-Modus** bieten: viele Partien hintereinander ohne Animation durchrechnen.
- **Auswerten und messen:** durchschnittliche Spieldauer (Züge/Runden), Verteilung der Siege (z. B. nach Startposition), kürzeste/längste Partie und ob die Feld- und Kartenverteilung funktioniert – damit lässt sich auch die Würfelfrage beantworten.

Ziel: Mit diesem Artefakt entscheiden wir gemeinsam über Feldzahl, Schrittgröße/Würfel und Kartenmischung.

### Schritt 3 – Karteninhalte

Zuerst ganz simple Karten (reine Mechanik). Danach die eigentlichen Inhalte: kurze Geschichten je Bereich, eingebettet in Dorf, Felder, Stadt und Ararat. Hierfür ggf. jemanden aus Karapazar einbeziehen, der mit ihm dort gelebt hat und erzählen kann, was an diesen Orten passieren könnte.

### Schritt 4 – Illustrationen (KI)

Passende Prompts schreiben und damit die Landschaft erzeugen: den Berg im Zentrum sowie Motive aus den vier Bereichen am Rand – im Stil aufeinander abgestimmt und so platziert, dass der Weg frei bleibt.

### Schritt 5 – Audio erzeugen und prüfen

Die Kurmancî-Texte über kurdishtts.com vertonen oder echte Aufnahmen machen und eine Qualitätsprüfung durchführen (Aussprache, Stimme, Verständlichkeit). Dateien in Supabase Storage ablegen.

### Schritt 6 – Begleit-App entwickeln (`karten-app/`)

Die statische Web-App bauen: vier Farb-Schaltflächen, Karte aus dem gewählten Bereich ziehen, Inhalt zeigen und Audio abspielen. Code ins GitHub-Repository, Bereitstellung über GitHub Pages, Karten und Audio aus Supabase.

### Schritt 7 – Physisches Spiel

Übertragung in das echte Spiel mit Berg-Bühne. Materialoptionen: stapelbare Holzklötze, Hartschaum (Styrodur) oder faltbare Karton-Würfelrohlinge für die Bergstruktur; Spielfiguren und Würfel z. B. über spielmaterial.de; Modellbaumaterial über modulor.de. Für professionell gedruckte Komponenten später ggf. The Game Crafter.

## 11. Offene Entscheidungen

- **Würfelanzahl:** ein oder zwei große Würfel – abhängig von Feldzahl und gewünschter Schrittgröße, über die Testumgebung zu klären.
- **Sprache bestätigen:** Kurmancî (`kmr`) durch Nachfrage bei ihm oder der Familie absichern.
- **Reihenfolge der Bereiche** entlang der Spirale festlegen (Vorschlag: Dorf → Felder → Stadt → Ararat).
- **Farben und Symbole** pro Bereich endgültig wählen.
- **Anzahl Felder je Bereich** und **Verteilung der Kartenfelder** – über die Testumgebung austarieren.
- **Anzahl Karten je Stapel** und Mischung der Kartenarten.
- **Audio-Quelle:** generiert über kurdishtts.com oder echte Aufnahme (oder eine Mischung).
- **Gedruckte Karten:** zusätzlich zur App ja oder nein.
