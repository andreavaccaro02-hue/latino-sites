# Come pubblicare il sito — Guida passo passo

## Prerequisiti

Devi avere installato sul tuo Mac:
- **Git** (di solito è già presente — verifica aprendo Terminale e digitando `git --version`)
- Un **account GitHub** gratuito su [github.com](https://github.com)

---

## Passo 1 — Crea il repository su GitHub

1. Vai su [github.com/new](https://github.com/new)
2. **Repository name:** `latino-sites` (o il nome che preferisci)
3. **Description:** `Sito didattico — Lingua e Cultura Latina`
4. Seleziona **Public**
5. **NON** spuntare "Add a README" (il sito ha già il suo index.html)
6. Clicca **Create repository**
7. Resta sulla pagina che appare — ti serviranno i comandi

---

## Passo 2 — Apri il Terminale sul Mac

1. Apri **Terminale** (lo trovi in Applicazioni → Utility, oppure cerca "Terminale" con Spotlight)
2. Naviga nella cartella del sito. Se la cartella si chiama `latino-sites` e si trova sulla Scrivania:

```bash
cd ~/Desktop/latino-sites
```

Se non sai il percorso esatto, trascina la cartella dal Finder nella finestra del Terminale dopo aver scritto `cd `.

---

## Passo 3 — Inizializza Git e fai il primo commit

Copia e incolla questi comandi uno alla volta nel Terminale:

```bash
git init
```

```bash
git branch -m main
```

```bash
git add .
```

```bash
git commit -m "Primo commit: sito Lingua e Cultura Latina"
```

---

## Passo 4 — Collega a GitHub e carica

Sostituisci `TUO-UTENTE` con il tuo username GitHub:

```bash
git remote add origin https://github.com/TUO-UTENTE/latino-sites.git
```

```bash
git push -u origin main
```

Ti chiederà le credenziali GitHub. Se è la prima volta, potrebbe chiederti di installare le credenziali — segui le istruzioni a schermo.

> **Nota:** GitHub non accetta più la password dell'account. Dovrai usare un **Personal Access Token**. Per crearlo: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token. Seleziona almeno lo scope `repo`. Usa il token al posto della password.

---

## Passo 5 — Attiva GitHub Pages

1. Vai al repository su GitHub: `https://github.com/TUO-UTENTE/latino-sites`
2. Clicca **Settings** (icona ingranaggio in alto)
3. Nel menu a sinistra, clicca **Pages**
4. Sotto **Source**, seleziona:
   - Branch: `main`
   - Folder: `/ (root)`
5. Clicca **Save**
6. Aspetta 1-2 minuti

Il tuo sito sarà online a:

**`https://TUO-UTENTE.github.io/latino-sites/`**

---

## Aggiornamenti futuri

Ogni volta che modifichi il sito, per aggiornare la versione online:

```bash
cd ~/Desktop/latino-sites
git add .
git commit -m "Descrizione della modifica"
git push
```

Il sito si aggiorna automaticamente in pochi secondi.

---

## Opzionale — Dominio personalizzato

Se vuoi un indirizzo tipo `latinoprof.it`:

1. Acquista il dominio (es. su Aruba, Register.it, Namecheap — circa 10-15€/anno)
2. Nel pannello DNS del registrar, aggiungi un record CNAME che punta a `TUO-UTENTE.github.io`
3. In GitHub → Settings → Pages, scrivi il tuo dominio nel campo "Custom domain"
4. Spunta "Enforce HTTPS"
