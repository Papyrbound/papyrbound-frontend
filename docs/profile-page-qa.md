# Reader profile page

Visual QA result: blocked.

The supplied references establish a banner, overlapping avatar, identity and bio, profile statistics, and a distinct edit action. The implementation adapts those elements to Papyrbound using its existing cover artwork, avatar component, account data, and library stores. No follower counts or social features are fabricated.

The profile menu header navigates to `/profile`. Its separate Edit profile item and the page's Edit profile button open the existing editor. Changes to the saved profile flow back into the page and sidebar through the account store. Reading, Highlights, and Activity controls switch the displayed section; statistic links navigate to the corresponding library screens.

ESLint, TypeScript, and `next build --webpack` passed; the production export includes `/profile`. The in-app browser timed out opening `http://localhost:3000/profile`, so desktop/mobile layout, light/dark appearance, and UI interactions have not been visually verified. This document does not claim visual acceptance.
