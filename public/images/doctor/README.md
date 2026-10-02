# Doctor portraits

- Primary: `portrait.jpg` is the active supplied production portrait. Its integrity is checked by `npm run validate:images`. Do not generate or retouch it.
- Secondary: the unedited supplied original is kept at `assets/doctor/secondary-original.jpg`, outside the published directory. No secondary portrait is active yet. An approved later version belongs at `public/images/doctor/secondary.jpg`.
- On a load failure, the application displays the doctor's name.
