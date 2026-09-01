/** Read a required env var, or print an error and exit 1 if it's unset. */
export const getEnv = (name: string, exampleFile: string): string => {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    console.error(`See ${exampleFile} for the full list.`);
    process.exit(1);
  }
  return value;
};
