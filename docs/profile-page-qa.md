# Reader profile page

Visual QA result: blocked.

The supplied references establish a banner, overlapping avatar, identity and bio, profile statistics, and a distinct edit action. The implementation adapts those elements to Papyrbound using its existing cover artwork, avatar component, account data, and library stores. No follower counts or social features are fabricated.

The profile menu header navigates to `/profile`. The page's Edit profile button opens the existing editor; the redundant menu shortcut has been removed. Changes to the saved profile flow back into the page and sidebar through the account store. Reading, Highlights, and Library activity controls switch the displayed section; statistic links navigate to the corresponding library screens. The Reading section links to the detailed Reading activity page, so that page remains accessible after removing its redundant dropdown shortcut. Library activity records library events rather than reading sessions.

The profile uses shared shadcn Card, CardContent, CardTitle, Avatar (through ReaderAvatar), and Button components. Its section switcher uses the project's configured shadcn Tabs, TabsList, TabsTrigger, and TabsContent, with keyboard navigation and associated tab panels supplied by Base UI. The Tabs component was added with the shadcn CLI using the existing base-rhea configuration.

The taller profile editor now includes a banner preview with Add/Change and Remove actions. Selected images stay in draft until Save profile; Cancel leaves the saved banner unchanged. JPG, PNG, and WebP files up to 10 MB are resized to fit 1600 × 600, encoded as a bounded JPEG data URL, and stored with the local account. Existing accounts receive the default artwork; explicit removal persists as `null`. Invalid persisted URLs fall back to the default. The editor reduces spacing and preview height in shorter desktop windows, without adding internal scrolling.

Banner helper checks passed for type/size rejection, corrupt-image handling, persisted URL validation, output dimensions, and bitmap cleanup. These checks mocked browser image/canvas APIs; an actual file-picker flow and visual layout remain unverified.

ESLint, TypeScript, and `next build --webpack` passed; the production export includes `/profile`. The in-app browser timed out opening `http://localhost:3000/profile`, so desktop/mobile layout, light/dark appearance, and UI interactions have not been visually verified. This document does not claim visual acceptance.
