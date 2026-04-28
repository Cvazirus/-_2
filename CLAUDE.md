# Project Instructions

## Language
All responses and internal reasoning/thinking must be in Russian.

## Device
The user works on a phone (not a tablet). The project is cloned to ~/sklad on the phone via Termux.

## Deploy workflow

**During development** (testing only for self, does NOT affect other users):
```
cd ~/sklad && firebase hosting:channel:deploy dev --project sklad-afa39
```

**Release** (updates the public URL for all users — use only when ready):
```
cd ~/sklad && firebase deploy --only hosting --project sklad-afa39
```

At the end of every response, always show the DEV channel command (the first one).
The user copies it from the response to run in Termux.
App URL: https://sklad-afa39.web.app/
