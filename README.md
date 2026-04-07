# Simulateur Vision Luneo

Application web autonome pour **visualiser en conditions réalistes** les déformations perçues avec des **verres progressifs**.

## Fonctionnalités

- Interface premium (glassmorphism, rendu moderne, responsive).
- Simulation temps réel sur canvas :
  - déformation latérale,
  - flou périphérique,
  - aberration chromatique,
  - vignettage subtil.
- **Zones de vision arrondies** (loin / intermédiaire / près) pour un comportement plus naturel que des bandes droites.
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

Puis ouvrir :

`http://localhost:8080`

## Conseils d’utilisation

- Utilisez des photos avec **lignes verticales/horizontales** pour bien visualiser les déformations.
- Montez la valeur de **swim effect** pour reproduire une adaptation difficile.
- Réduisez flou + chromatique pour simuler un porteur expérimenté.
