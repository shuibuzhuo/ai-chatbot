import { generateDummyPassword } from "./db/utils";

export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();

/**
 * Determines if a secure cookie should be used based on the URL.
 * Secure cookies are only used when the request is made over HTTPS.
 */
export function shouldUseSecureCookie(url: string | URL): boolean {
  const urlObject = typeof url === "string" ? new URL(url) : url;
  return urlObject.protocol === "https:";
}
