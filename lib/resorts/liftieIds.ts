/**
 * Maps BestLine resort keys to the resort slugs used by liftie.info.
 * null means the resort is not tracked — lift status falls back to "unknown".
 */
export const LIFTIE_RESORT_IDS: Record<string, string | null> = {
  "deer-valley": "deer-valley",
  "park-city": "parkcity", // liftie uses no hyphen
  snowbird: "snowbird",
  brighton: "brighton",
  solitude: "solitude",
};
