# Lake Daydance Challenge - Landing Page & Browser Minigame

Eine moderne, mobile-first Landingpage für das Musik-Event **Daydance in Frastanz (Untere Au)** mit einem integrierten, verifizierten Browser-Minigame namens **"Lake Jump Challenge"**.

Das Spiel basiert auf einem 2D-Canvas, läuft im Hochformat (9:16) auf Mobilgeräten und Desktops, besitzt einen dynamischen Schwierigkeitsgrad und ist mit einem serverseitig validierten Highscore-System gegen Manipulationen geschützt.

---

## Features & Technologie

*   **Frontend**: Next.js 14 (App Router) mit TypeScript und **Vanilla CSS** (für maßgeschneidertes, responsives Glassmorphismus- und Neon-Styling).
*   **Aesthetics**: "Neon Sunset Lake"-Vibe mit farbenfrohen, weichen Verläufen, See-Elementen (Photos der Location integriert), animierten Wellen und einem kleinen Retro-Raver als Spielfigur.
*   **Game Engine**: Eigenständige 2D-Canvas Physikschleife mit Web Audio API-synthetisierten Audioeffekten (Jump, Splash, Level Up).
*   **Anti-Cheat-System**:
    *   Sitzungsbasierte Initiierung mit einem Server-seitigen Zufallssamen (Seed).
    *   Deterministische Platformgenerierung auf Client und Server.
    *   Detaillierte Analyse des eingereichten Spielverlaufs (Zeiten, Geschwindigkeiten, Klick-Frequenzen, Koordinatenübereinstimmungen).
    *   Loggen verdächtiger Läufe in der Collection `flaggedScores`.
*   **GDPR / Datenschutz**: E-Mail-Adressen werden auf dem Server via SHA-256 gehasht. Es werden zu keinem Zeitpunkt E-Mail-Adressen an den Client gesendet oder im öffentlichen Leaderboard angezeigt.

---

## Projekt-Struktur

```
├── public/                     # Statische Bilder (lake-view.jpg, lake-island.jpg)
├── src/
│   ├── app/                    # Next.js App Router (Layouts & API Routes)
│   │   ├── api/
│   │   │   ├── session/
│   │   │   │   ├── start/      # Generiert Spielsitzungen mit Seeds
│   │   │   │   └── submit/     # Validiert Scores & schreibt in Firestore
│   │   │   └── global.css      # Zentrales Styling-System (Custom CSS)
│   │   ├── layout.tsx          # HTML-Struktur & Viewport-Meta-Tags
│   │   └── page.tsx            # Landingpage (Hero, Infos, Game, Leaderboard)
│   ├── components/             # React UI-Komponenten (Infos, GameContainer, Leaderboard)
│   ├── game/                   # Spiellogik (PRNG, PlatformManager, GameEngine, Audio)
│   └── lib/                    # Firebase-Initialisierungen (Client & Admin)
├── firestore.rules             # Firestore Sicherheitsregeln
├── firebase.json               # Firebase Projekt-Konfiguration
├── .env.example                # Vorlage für Umgebungsvariablen
└── package.json                # NPM Skripte & Abhängigkeiten
```

---

## Firebase Setup & Konfiguration

### 1. Projekt erstellen
1.  Öffne die [Firebase Console](https://console.firebase.google.com/).
2.  Klicke auf **Projekt hinzufügen** und nenne es z. B. `lake-daydance-challenge`.
3.  Erstelle eine neue **Web-App** im Projekt-Dashboard und kopiere die Konfigurationsdaten (`apiKey`, `authDomain`, etc.).

### 2. Firestore Datenbank aktivieren
1.  Gehe im linken Menü auf **Firestore-Datenbank** und klicke auf **Datenbank erstellen**.
2.  Wähle den **Produktionsmodus** und wähle einen Server-Standort (z. B. `europe-west3` für Deutschland/Österreich/Schweiz).
3.  Gehe auf den Reiter **Rules** und kopiere den Inhalt der Datei [firestore.rules](file:///Users/philippgartler/Documents/untere%20Au%20Gewinnspiel/firestore.rules) hinein. Klicke auf **Veröffentlichen**.

### 3. Server-Admin-Schlüssel erstellen (für Score-Submit API)
1.  Gehe in den **Projekteinstellungen** (Zahnrad-Symbol oben links) auf den Reiter **Dienstkonten** (Service Accounts).
2.  Klicke auf **Neuen privaten Schlüssel generieren**.
3.  Eine JSON-Datei wird auf deinen Computer heruntergeladen. Kopiere deren kompletten JSON-Inhalt.

---

## Lokale Einrichtung

### 1. Repository-Installation & Vorbereitung
Führe im Hauptverzeichnis aus:

```bash
# Kopiere Umgebungsvariablen
cp .env.example .env
```

Öffne die Datei `.env` in einem Texteditor und trage deine Firebase-Daten ein:
*   Trage die Client-Daten (aus Schritt 1) bei den `NEXT_PUBLIC_FIREBASE_...` Feldern ein.
*   Trage das kopierte JSON-Dokument deines Dienstkontos (aus Schritt 3) auf einer einzigen Zeile beim Feld `FIREBASE_SERVICE_ACCOUNT` ein (ersetze Zeilenumbrüche im privaten Schlüssel mit `\n`).

### 2. Dependencies installieren & Starten
Da wir Node.js verwenden, installierst du die Abhängigkeiten und startest den Entwicklungsserver:

```bash
# Installiert alle Module
npm install   # Oder pnpm install

# Startet den Server auf http://localhost:3000
npm run dev   # Oder pnpm run dev
```

*Hinweis: Wenn keine Firebase-Umgebungsvariablen hinterlegt sind, startet das Spiel automatisch in einem lokalen Entwicklungsmodus mit simulierten Speicherungen, sodass die Seite sofort voll funktionsfähig getestet werden kann.*

---

## Deployment Anleitung

Der Next.js Server lässt sich sehr einfach auf Plattformen wie **Vercel** oder **Netlify** deployen. Alternativ kannst du Firebase Hosting mit Cloud Run/Serverless verwenden.

### Deployment auf Vercel:
1.  Installiere das Vercel CLI oder verknüpfe das GitHub-Repository in der Vercel-Konsole.
2.  Füge beim Anlegen des Projekts in Vercel alle Umgebungsvariablen aus deiner `.env` unter **Environment Variables** hinzu.
3.  Vercel erkennt Next.js automatisch, führt `next build` aus und stellt die Seite online zur Verfügung.
