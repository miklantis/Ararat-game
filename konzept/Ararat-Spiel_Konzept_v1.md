# Ararat – Die Reise zum Gipfel

Konzeptdokument · **Version 1** · Stand: 10. Juni 2026

---

## 1. Worum es geht

Ein haptisches Brettspiel für einen über 80-jährigen kurdischen Herrn aus der Ararat-Region, der heute in einem Pflegeheim lebt. Bis zu vier Personen würfeln mit zwei großen Würfeln und führen ihre Spielfigur eine ansteigende Spirale hinauf bis zum Gipfel des Ararat. Wer zuerst oben ist, gewinnt.

Unterwegs liegen farbige Kartenfelder. Wer darauf landet, zieht eine Karte aus dem passenden Stapel und erlebt ein kurzes, gern humorvolles Ereignis – immer eingebettet in den Ort, an dem man gerade ist.

## 2. Die eigentliche Idee

Der Herr ist der Einzige am Tisch, der Kurdisch versteht. Im Heim ist er meist der, dem geholfen wird – an diesem Tisch ist er der Experte, die Autorität, der Übersetzer. Das ist nicht ein Detail, sondern das Herzstück des Spiels. Die Karten sprechen auf Kurmancî zu ihm; er gibt den anderen weiter, was passiert. Die Orte auf dem Brett sind die Orte seines Lebens.

## 3. Das Spielprinzip

- Bis zu vier Spielfiguren, Start an einem gemeinsamen Startpunkt am äußeren Rand der Spirale.
- Pro Zug wirft man zwei große Würfel und zieht die Summe an Feldern weiter.
- Der Weg führt als Spirale von außen nach innen und steigt dabei haptisch an, bis zum Gipfel in der Mitte (Feld „Ende“).
- Landet man auf einem farbigen Kartenfeld, zieht man eine Karte aus dem Stapel in derselben Farbe und führt aus, was sie sagt.
- Wer als Erster das Gipfelfeld erreicht, gewinnt.

## 4. Das Spielbrett

Format: 42 cm × 45 cm. Das Brett zeigt eine Spirale, die vom Start außen nach innen zum Gipfel verläuft. Die Spielfläche – der Weg mit seinen Feldern – muss jederzeit klar sichtbar bleiben und darf nicht von Illustrationen überdeckt werden. Illustrationen liegen ringsum am Rand und im Zentrum (der Berg selbst).

### 4.1 Die vier Bereiche

Der Weg ist in vier thematische Bereiche aus dem Leben des Beschenkten geteilt. Jeder Bereich hat eine eigene Farbe; die zugehörigen Kartenfelder und der zugehörige Kartenstapel tragen dieselbe Farbe, damit klar ist, woher man zieht.

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

Das ergibt einen Lebensbogen, der am Berg endet. Die Reihenfolge ist als Vorschlag zu verstehen und bleibt frei wählbar – das ist eine der offenen Entscheidungen (siehe Abschnitt 10).

### 4.3 Felder und Kartenfelder

- Jeder Bereich hat eine bestimmte Anzahl Felder; ein Teil davon sind farbige Kartenfelder seiner Bereichsfarbe.
- Anzahl der Felder pro Bereich und die Verteilung der Kartenfelder werden im Test-Prototyp eingestellt und durch Simulation austariert (siehe Schritt 2).

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

### 5.3 Eine einzige Datenquelle

Alle Karten kommen aus einer strukturierten Datenquelle (JSON). Aus ihr speisen sich App, Audio und spätere Druckvorlagen gleichermaßen. Vorschlag für die Felder pro Karte:

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

Das Kurmancî-Audio wird über **kurdishtts.com** erzeugt – eine Plattform mit Text-to-Speech für Kurmancî, mehreren Stimmen und einer REST-API. Der Text jeder Karte wird einmal vorab in eine Audiodatei umgewandelt; die Web-App spielt diese Datei beim Scannen nur noch ab. Jede Karte trägt einen scannbaren Code; ein Handy scannt ihn, die kleine Web-App spielt den hinterlegten kurdischen Text ab. Als freie Rückfalloption existiert Metas offenes Modell `facebook/mms-tts-kmr-script_latin`. Das `audio`-Feld im Datenmodell funktioniert sowohl mit generierten als auch mit selbst aufgenommenen Dateien – falls man eine echte, vertraute Stimme aufnehmen möchte.

## 8. Zugänglichkeit

Er kann nicht mehr gut lesen. Deshalb gilt durchgehend:

- Große, griffige Würfel und Spielfiguren.
- So wenig Text auf dem Brett wie möglich.
- Karteninhalt als Audio auf Kurmancî, abrufbar per Scan.
- Bereiche zusätzlich über Farbe **und** Symbol erkennbar, nicht über Farbe allein.
- Die Bühne ist haptisch erhöht: ein echter, ansteigender Berg statt eines flachen Bretts.
- Der Weg bleibt jederzeit frei sichtbar, Illustrationen drängen sich nicht in den Spielraum.

## 9. Vorgehen in Schritten

Erst digital, dann physisch.

### Schritt 1 – Konzeptdokument (dieses Dokument)

Die gemeinsame Grundlage. Beschreibt Idee, Brett, Bereiche, Karten, Sprache, Audio und Zugänglichkeit.

### Schritt 2 – Digitaler Prototyp mit Testumgebung

Eine eigenständige Single-File-HTML-App, mit der man sofort spielen, testen und simulieren kann. Sie soll:

- Das Brett als Spirale mit den vier Bereichen darstellen.
- **Einstellbar machen:** Anzahl Felder pro Bereich, Position der Kartenfelder, Anzahl Karten je Stapel.
- 2 bis 4 Spieler unterstützen, Würfeln mit zwei Würfeln.
- Die Karteneffekte (+N, −N, aussetzen, erneut würfeln) ausführen.
- Ein Spiel **sichtbar abspielen** und die Geschwindigkeit regelbar machen (schneller / langsamer).
- **Mehrere Spiele simulieren** und auswerten: Wie lange dauert eine Partie im Schnitt, wie viele Züge, funktioniert die Feld- und Kartenverteilung?

Ziel: Mit diesem Artefakt entscheiden wir gemeinsam, wie viele Felder wohin kommen und wie die Stapel aussehen sollen.

### Schritt 3 – Karteninhalte

Zuerst ganz simple Karten (reine Mechanik). Danach die eigentlichen Inhalte: kurze Geschichten je Bereich, eingebettet in Dorf, Felder, Stadt und Ararat. Hierfür ggf. jemanden aus Karapazar einbeziehen, der mit ihm dort gelebt hat und erzählen kann, was an diesen Orten passieren könnte.

### Schritt 4 – Illustrationen (KI)

Passende Prompts schreiben und damit die Landschaft erzeugen: den Berg im Zentrum sowie Motive aus den vier Bereichen am Rand – im Stil aufeinander abgestimmt und so platziert, dass der Weg frei bleibt.

### Schritt 5 – Audio erzeugen und prüfen

Die Kurmancî-Texte über kurdishtts.com vertonen und eine Qualitätsprüfung machen (Aussprache, Stimme, Verständlichkeit). Alternativ oder ergänzend echte Aufnahmen.

### Schritt 6 – Physisches Spiel

Übertragung in das echte Spiel mit Berg-Bühne. Materialoptionen: stapelbare Holzklötze, Hartschaum (Styrodur) oder faltbare Karton-Würfelrohlinge für die Bergstruktur; Spielfiguren und Würfel z. B. über spielmaterial.de; Modellbaumaterial über modulor.de. Für professionell gedruckte Komponenten später ggf. The Game Crafter.

## 10. Offene Entscheidungen

- **Sprache bestätigen:** Kurmancî (`kmr`) durch Nachfrage bei ihm oder der Familie absichern.
- **Reihenfolge der Bereiche** entlang der Spirale festlegen (Vorschlag: Dorf → Felder → Stadt → Ararat).
- **Farben und Symbole** pro Bereich endgültig wählen.
- **Anzahl Felder je Bereich** und **Verteilung der Kartenfelder** – über die Testumgebung austarieren.
- **Anzahl Karten je Stapel** und Mischung der Kartenarten.
- **Stimme(n)** fürs Audio: generiert über kurdishtts.com oder echte Aufnahme.
