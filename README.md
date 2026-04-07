# Simulateur Vision Luneo

Application web autonome pour **opticiens** afin de visualiser en conditions réalistes les déformations perçues avec des **verres progressifs**.

## Fonctionnalités clés

- Interface premium orientée démonstration magasin.
- Simulation temps réel sur canvas : déformation latérale, flou périphérique, aberration chromatique, vignettage subtil.
- Zones de vision arrondies (loin / intermédiaire / près) plus proches du comportement ressenti.
- Curseur de comparaison **original ↔ simulation** pour expliquer simplement au patient.
- Bloc d’**insight clinique** qui aide à formuler l’explication (adaptation forte / intermédiaire / confortable).
- Profils prêts à l’emploi : nouveau porteur, porteur adapté, personnalisé.
- Import d’image réelle (rayons, route, escaliers…) + scène de démo.

## Démarrage

Ouvrez simplement `index.html` dans un navigateur moderne.

Ou lancez un serveur local :
Application web autonome pour **visualiser en conditions réalistes** les déformations perçues avec des **verres progressifs**.

## Fonctionnalités

- Simulation temps réel sur canvas (déformation latérale, flou périphérique, aberration chromatique).
- Profils prêts à l’emploi :
  - Nouveau porteur
  - Porteur adapté
  - Mode personnalisé
- Réglages fins : couloir progressif, écart de puissance (ADD), effet de tangage, flou, inclinaison de tête.
- Import d’image personnalisée pour tester des situations réelles (route, magasin, escaliers…).
- Scène de démo intégrée.

## Lancer l’application

Ouvrez simplement `index.html` dans un navigateur moderne.

Option locale via serveur statique :

```bash
python3 -m http.server 8080
```

Puis ouvrir : `http://localhost:8080`
Puis ouvrir :

`http://localhost:8080`

## Conseils d’utilisation

- Utilisez des photos avec **lignes verticales/horizontales** pour bien visualiser les déformations.
- Montez la valeur de **swim effect** pour reproduire une adaptation difficile.
- Réduisez flou + chromatique pour simuler un porteur expérimenté.
