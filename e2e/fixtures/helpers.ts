import { Page } from '@playwright/test';

/**
 * Bypass the EnsureAuth consent modal and the onboarding tour for anonymous flows.
 *
 * Three things normally block a fresh anonymous session: (1)
 * `AuthProvider.initialAnonAuth` runs reCAPTCHA, (2) `EnsureAuth.jsx` renders
 * the consent modal, (3) `Tutorial.jsx` mounts the Joyride overlay that
 * intercepts every click. We bypass all three by seeding the relevant
 * `localStorage` keys via `page.addInitScript` BEFORE navigation, so the app
 * sees the seeded values on its very first read.
 *
 * Tests that hit catalog/visualisation APIs will still get 401s from the
 * backend (the token is not real), but the UI is unblocked. Tests that only
 * need the UI shell (e.g. tab navigation, modal opening) will pass.
 *
 * IMPORTANT: must be called BEFORE `page.goto(...)` so the init script runs
 * on the initial document load. Calling it after navigation has no effect.
 *
 * Why not click the "Anonymously" button? In headless Chromium, Google's
 * reCAPTCHA detects automation and never returns a site response, so the
 * real anon token is never set and the modal never unmounts. See #1051.
 */
export async function dismissAnonymousSession(page: Page) {
  await page.addInitScript(() => {
    // Mark the recaptcha consent so EnsureAuth.jsx's modal does not render.
    localStorage.setItem('cdsebrowser_recaptcha_consent', 'true');

    // Suppress the Joyride onboarding tour — otherwise its full-page overlay
    // intercepts every pointer event and blocks all subsequent interactions.
    // Matches SHOW_TUTORIAL_LC in src/const.ts and the check in Tutorial.jsx.
    localStorage.setItem('cdsebrowser_show_tutorial', 'false');

    // Craft a fake but non-expired JWT so AuthProvider.initialAnonAuth skips
    // captcha and ThemesProvider unblocks. The JWT is decoded client-side
    // (jwtDecode) to read its `exp` claim — no signature verification is
    // performed locally. Set expiry one hour from now.
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const fakeJwt = `${header}.${payload}.`;
    localStorage.setItem(
      'cdsebrowser_anon_auth',
      JSON.stringify({ access_token: fakeJwt, expires_in: 3600 }),
    );
  });
}
