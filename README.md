# Ararat-game

Haptisches Brettspiel „Ararat – Die Reise zum Gipfel“ für einen über 80-jährigen
kurdischen Herrn aus der Ararat-Region. Spiral-Brett mit vier thematischen
Bereichen (Dorf, Felder, Stadt, Ararat), farbigen Kartenfeldern und Kurmancî-Audio.

## Struktur

- `konzept/` – Konzeptdokumente (Versionen v1, v2, v3, …). Aktueller Stand: **v3**.
- `karten-app/` – Begleit-App: vier Farb-Schaltflächen, zieht eine Karte aus dem
  gewählten Bereich, zeigt sie und spielt das Kurmancî-Audio ab. Statische Web-App,
  Bereitstellung über GitHub Pages, Daten aus Supabase.
- `simulation/` – Test-Prototyp: lädt eine Brett-/Karten-JSON von außen, spielt
  Computer gegen Computer, Turbo-Modus für viele Partien und Auswertung
  (Spieldauer, Siege, Statistik). Eigenständige Single-File-HTML-App, kein Supabase.

## Stand

Konzept liegt vor (siehe `konzept/Ararat-Spiel_Konzept_v3.md`). Als Nächstes:
Test-Prototyp in `simulation/` bauen.
