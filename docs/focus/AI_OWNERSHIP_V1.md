# Creator Lab V1 — Verantwortlichkeiten und Übergaben

**Aktiv ab 2026-10-16.** Gilt für `memetreza34-ux/Creator-lab`. Diese Datei regelt **wer an welcher Aufgabe arbeitet**. Sie ersetzt weder die Sicherheitsanforderungen in `AGENTS.md` noch die aktuellen Freigabe-Gates in `docs/focus/NEXT_ACTIONS.md`.

## Ein Eigentümer pro Aufgabe

| Rolle | Führt aus | Übergibt | Nicht erlaubt / nicht zuständig |
| --- | --- | --- | --- |
| **ChatGPT in diesem Chat — technischer Koordinator / Integrator** | Prüft neuesten `main`, PR-Stack, CI, Risikogates und Umfang; schneidet ein kleines Ticket zu; portiert und integriert vorhandene Arbeit bei Bedarf; prüft Testergebnisse, Konflikte, Sicherheitsbedingungen und Release-Status; kann fokussierte GitHub-Korrekturen selbst vornehmen | Eindeutige Codex-Aufgabe mit Dateien und Akzeptanzkriterien; Claude-Reviewauftrag mit exaktem Commit; technischer Status an den Besitzer | Weder automatisch laufender Supervisor noch Ersatz für reale Auth-/Browser-Tests oder unabhängige menschliche Sicherheitsfreigabe |
| **Codex — primärer Implementierer** | Implementiert **nur** das jeweils freigegebene Code-Ticket in einem eigenen Branch/PR; übernimmt bestehende PR-Arbeit statt doppelt zu bauen; ergänzt Unit-, Integrations- und Browser-Tests; behebt nach Review nachgewiesene Defekte | PR-Link, geänderte Dateien, exakte CI-Ausführung, Risiken, ungeprüfte Fälle | Keine eigenen Produkt-Features, kein Merging/Deployment, keine Änderung an echten Kundendaten, keine Produktionstokens |
| **Claude — unabhängiger Prüfer** | Bewertet **den fertigen Codex-PR** gegen `main` und Spezifikation: Datenlecks/Auth/RLS/Storage, Race Conditions, Accessibility, Mobile, reale Fallbacks, versteckte Fake-States; meldet konkrete reproduzierbare Findings mit Datei/Zeile/Priorität | Review-Notizen und separate `BLOCKER`/`WARNING`/`SUGGESTION`-Liste; Codex erhält nur akzeptierte, begrenzte Nacharbeiten | Keine parallele Neuentwicklung derselben Funktion, kein unkontrollierter Refactor, kein selbstständiger PR-Merge; AI-Review ist **keine** menschliche Sicherheitszertifizierung |
| **Projektinhaber (du) — Konto/Produkt/Release** | Erstellt **zwei bestätigte separate Supabase-Testkonten**, hinterlegt fünf verschlüsselte Actions-Secrets gemäß Runbook, verwaltet Domain/Hosting/Email-Redirects, stellt Browsergeräte/echte Testpersonen bereit, entscheidet über Aufwand, Kosten und öffentlichen Launch | Sichere Testbereitstellung, Bugberichte, tatsächliches Go/No-Go | Keine Passwörter/JWTs/privaten Keys in Chats, Issues, PR-Text oder Commits; keine Handarbeit am Quellcode nötig |

**Wichtig:** Das Eintragen einer Rolle startet **weder Codex noch Claude**. Diese Anwendungen müssen durch den Projektinhaber separat geöffnet/verbunden und ausdrücklich beauftragt werden. Keine Hintergrund-Ausführung behaupten. Keine GitHub-Account-Zuweisung an fiktive Bots.

## Aktueller Zustand und exakt eine Freigabekette

**Ausgangs-`main`:** `52a801a9778d66ce52e996d36c94f5e87f22e523` am 2026-10-16; vor jedem weiteren Schritt neu prüfen. Das M1-Ziel bleibt: **ein einziger ehrlicher** Auth → Idee → Entwurf → private Medien → manuelle Planung → manueller Export-Workflow. Keine automatische Provider-Veröffentlichung in V1.

| Reihenfolge | Eigentümer | Arbeitsauftrag und konkreter Beleg | Blockiert durch |
| --- | --- | --- | --- |
| **0 / P0** | **Du**, technische Begleitung **ChatGPT** | Zwei echte bestätigte Test-Identitäten **A und B** in der bestehenden Supabase Auth anlegen und fünf verschlüsselte Secrets gemäß `docs/v1/LIVE_RLS_ACTIONS_RUNBOOK.md` hinterlegen; main-only `Live two-user Supabase RLS acceptance` manuell auslösen. ChatGPT bewertet nur sanitisierten Lauf/Ergebnis, vier SECURITY-DEFINER-Warnungen und aktualisiert [#36](https://github.com/memetreza34-ux/Creator-lab/issues/36). | **Aktuell BLOCKED:** letzte überprüfte Auth-User-Zahl = **0**. Erst echte A/B JWT + private Storage/SQL-Cross-Access + bestätigtes Cleanup zählen als bestanden. |
| **1 / Cloud-Integration** | **Codex**, fachliche Abnahme **ChatGPT** | Nach Freigabe #36: bestehenden, grün getesteten [Auth PR #39](https://github.com/memetreza34-ux/Creator-lab/pull/39) bewerten und seine geprüften Teile in den aktuellen schlanken Hauptablauf integrieren. Für Pipeline/Entwürfe/Medien bestehende gestapelten [#25](https://github.com/memetreza34-ux/Creator-lab/pull/25) → [#26](https://github.com/memetreza34-ux/Creator-lab/pull/26) → [#27](https://github.com/memetreza34-ux/Creator-lab/pull/27) → [#29](https://github.com/memetreza34-ux/Creator-lab/pull/29) → [#31](https://github.com/memetreza34-ux/Creator-lab/pull/31) **selektiv portieren**, nicht blind alte App-Layout/Analytics/Experiment-Routen zusammenführen. Cloud speichert serverseitig unter RLS, kein dauerhaftes separates Produkt `/cloud`. | Live Auth/RLS/Storage-Sicherheitsgate; kein riskanter öffentlicher Cloud-Rollout ohne Nachweis. |
| **2 / Manuelle Planung und Export** | **Codex**, Koordination **ChatGPT** | Authentifizierte Idee → Entwurf → privates Bild/Datei → lokalzeitliche **manuelle** Veröffentlichungsabsicht → klar beschrifteter Copy-/Export-Ablauf. Nur vom Nutzer kontrollierte, **separate** Planungsdaten: `creator_posts.status=scheduled` oder `scheduled_at` niemals clientseitig fälschen. Persistenz, DST/Zeitzonen, fehlende Netzverbindung testen. | Integrations-PR und notwendiger gesonderter Planungsdatenspeicher müssen überprüft sein. |
| **3 / Unabhängige Audit-Runde** | **Claude**, Entscheidung über Findings **ChatGPT** | Den **genauen PR-Commit** lesen, keine hypothetischen Erfolge behaupten. Sicherheits- und UX-Review mit reproduzierbaren Befunden: Auth/RLS/Storage, Race Conditions, Cross-Workspace, Token-Umgang, Fehlermeldungen, Mobile/Keyboard. `BLOCKER` müssen von Codex gefixt und anschließend neu geprüft werden. Für kritische Live-Security-Gates braucht es zusätzlich reale Tests und ggf. menschliche Sicherheitsprüfung. | Stabiler Integrations-PR vorhanden. |
| **4 / Release-E2E und Beta** | **Codex** (E2E-Automation), **ChatGPT** (Gate-Prüfung), **du** (echte Browser/Hosting/Launch) | Signup/Confirm/Login/Reset/Logout, zwei Geräte, Nutzer A/B, Feed/Entwurf/Medien/Upload/Download, Offline-/429-Fehler, Mobile 375px, Keyboard, Löschung, lokale Planungszeit incl. DST; CI und **echte** Browserbelege verlinken. Du prüfst Domain/SMTP/Redirects, Hosting und endgültiges Go/No-Go. | Alle P0-Blocker behoben und produktiver Konfigurationsweg nachgewiesen. |

**Keine parallelen Feature-PRs:** Während Schritt 0 blockiert ist, keine neuen ungeprüften Cloud-Daten für echte Nutzer freischalten. Vorbereitung und Reviews dürfen weiterlaufen, müssen aber klar `NOT LIVE VERIFIED` heißen. M2 (OAuth-Autoposting, Billing, Analytics, Experimente, neue Plattformen) ausdrücklich **ausgeschlossen**.

## Übergabeprotokoll für jede Aufgabe

1. **ChatGPT** benennt *ein* aktives Ticket, Eigentümer, Basis-SHA, vorhandene PRs, in-scope Dateien, Sicherheitsgrenzen und überprüfbare Akzeptanz. Doppelte Umsetzung vermeiden.
2. **Codex** arbeitet in einem **eigenen Branch**, liefert PR und `npm ci && npm test && npm run lint && npm run build`-Ergebnis. Bei Misserfolg keine Erfolgsmeldung.
3. **Claude** reviewed ausschließlich den tatsächlichen PR-Diff und verifizierte Belege; konkrete Befunde mit `BLOCKER`/`WARNING`/`SUGGESTION`, kein vages "alles gut".
4. **Codex** behebt bestätigte Blocker im **gleichen PR**, erneut vollständige CI; **ChatGPT** prüft finalen Head, Diff, Gates und Dokumentation. Nach sicherer Freigabe nur ein Integrator merged.
5. **Du** führst notwendige Konto-/Deployment-Schritte aus und gibst bei öffentlichem Launch das letzte Go. Immer vollständigen Freigabestatus mit verbleibenden ungeprüften Punkten dokumentieren.

### Copy-fertige Arbeitsanweisungen für getrennte Anwendungen

**Codex (erst nach freigegebenem Gate #36):**

> Arbeite im Repository `memetreza34-ux/Creator-lab`. Lies zuerst `AGENTS.md`, `docs/focus/README.md`, `docs/focus/NEXT_ACTIONS.md` und `docs/focus/AI_OWNERSHIP_V1.md`. Deine Rolle ist **allein Implementierung**. Prüfe neuesten main und PR #39 sowie die gestapelten #25/#26/#27/#29/#31. Portiere die kleinste Cloud-Integration für den V1-Kernablauf, ohne die schlanke M1-Oberfläche durch alte Routen zu ersetzen. Kein Fake-Publishing, kein Billing/Analytics, keine Produktionssecrets. Eigenen Branch/PR öffnen, Tests ergänzen, CI nachweisen, nicht selbst mergen. Wenn das Live-Auth-Gate #36 nicht bestanden ist, keine Cloud-Freigabe oder unautorisierten DB-Änderungen behaupten.

**Claude (wenn Codex einen reviewbaren PR bereitstellt):**

> Prüfe im Repository `memetreza34-ux/Creator-lab` den von ChatGPT benannten **exakten Integrations-PR/Head-SHA** als **unabhängiger Reviewer**. Lies `AGENTS.md` und `docs/focus/AI_OWNERSHIP_V1.md`. Suche insbesondere Auth- und Token-Races, Cross-User/Workspace-Leaks, Supabase RLS/Storage-Annahmen, unsichere Löschungen, echte Lade-/Fehlerzustände, mobile/Keyboard-UX, DST-Planung und falsche Publishing-Claims. Schreibe nur konkrete Findings mit Datei/Zeile, Reproduktion, Risiko und Schweregrad. Keine parallele Reimplementierung, keine Freigabe ohne echte Sicherheits-/Browserbelege.

### Release-Zuständigkeit und aktuelle Wahrheit

- **CI grün ≠ reale Sicherheit geprüft.** PR #39 hat die bisherigen automatisierten Tests bestanden, bleibt aber Draft/unmerged.
- [#36](https://github.com/memetreza34-ux/Creator-lab/issues/36) ist der **einzige derzeitige P0-Gate-Blocker**. Der manuelle GitHub Security-Workflow existiert auf `main` via gemergtem PR #40, ist aber noch nicht mit zwei echten Benutzern bestanden.
- ChatGPT, Codex oder Claude dürfen keine realen Konten, Secrets oder bestandene Tests erfinden. **Du** triffst die letzte Entscheidung, wann Creator Lab öffentlich geht.
