# audio – Sprachdateien der Karten-App

Hier liegen die vorab erzeugten Audiodateien, die die Karten-App abspielt.

- Namenskonvention: `<id>_<lang>.mp3`
  Beispiele: `dorf-01_kmr.mp3`, `dorf-01_de.mp3`, `dorf-01_tr.mp3`
- `<id>` = Karten-Id aus `simulation/ararat-board.json`
- `<lang>` = `kmr` (Kurmancî), `de` (Deutsch), `tr` (Türkisch)

Die App leitet den Dateinamen automatisch aus der Karten-Id und der gewählten
Sprache ab. Ist eine Datei nicht vorhanden, läuft die App still weiter.
