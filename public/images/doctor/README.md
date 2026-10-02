# Doctor portraits

- Primary: `portrait.jpg` is the active supplied production portrait. Its integrity is checked by `npm run validate:images`. Do not generate or retouch it.
- Editorial: `secondary.webp` is the approved transparent cutout, used in the lower homepage editorial block and Doctor timeline. Its untouched approved source is `assets/doctor/secondary-approved.png`; the separate unedited original remains `assets/doctor/secondary-original.jpg`.
- On a load failure, the application displays the doctor's name.
- Processing, brand usage and asset provenance are documented in `docs/branding.md`.
