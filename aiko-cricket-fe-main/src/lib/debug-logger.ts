const ENABLE_TEST_LOGS = process.env.NEXT_PUBLIC_TESTING_LOGS === "true";

export const log = (...args: unknown[]) => {
  if (ENABLE_TEST_LOGS && typeof console !== "undefined" && console.log) {
    console.log(...(args as [unknown, ...unknown[]]));
  }
};

export const info = (...args: unknown[]) => {
  if (ENABLE_TEST_LOGS && typeof console !== "undefined" && console.info) {
    console.info(...(args as [unknown, ...unknown[]]));
  }
};

export const warn = (...args: unknown[]) => {
  if (ENABLE_TEST_LOGS && typeof console !== "undefined" && console.warn) {
    console.warn(...(args as [unknown, ...unknown[]]));
  }
};

export const error = (...args: unknown[]) => {
  if (ENABLE_TEST_LOGS && typeof console !== "undefined" && console.error) {
    console.error(...(args as [unknown, ...unknown[]]));
  }
};
