# Audio-Dateien (TTS oder Aufnahme)

Hier liegen die abspielbaren MP3-Dateien je Karte und Sprache.

## Namensschema

```
<karten-id>_<sprache>.mp3
```

Sprachkürzel:
- `kr` = Kurmancî (gesprochen, fürs Spiel)
- `de` = Deutsch (Spielleiter)
- `tr` = Türkisch (Brücke)

Beispiel für die Karte `dorf-01`:

```
dorf-01_kr.mp3
dorf-01_de.mp3
dorf-01_tr.mp3
```

## Wie es im Editor wirkt

Im Karten-Bearbeiten-Dialog (Tab „Kartenliste") prüft die App beim Öffnen
automatisch, ob diese Dateien vorhanden sind:

- Datei vorhanden → Play-Knopf aktiv (anklickbar, spielt ab).
- Datei fehlt → Play-Knopf ausgegraut.

So lässt sich pro Karte direkt hören, was schon eingesprochen ist.
Die MP3-Dateien werden selbst erzeugt (z. B. kurdishtts.com) oder aufgenommen
und hierher hochgeladen.
