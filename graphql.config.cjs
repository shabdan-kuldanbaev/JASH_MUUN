const fs = require('node:fs');
const path = require('node:path');

function readEnvFile(filepath) {
  if (!fs.existsSync(filepath)) return {};

  const content = fs.readFileSync(filepath, 'utf8');
  const result = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

const root = __dirname;
const generatedSchemaPath = path.join(root, '.generated', 'datocms-schema.json');
const env = {
  ...readEnvFile(path.join(root, '.env')),
  ...readEnvFile(path.join(root, '.env.local')),
  ...process.env,
};

const token = env.DATO_CMS_READONLY_TOKEN;

const schema = fs.existsSync(generatedSchemaPath)
  ? generatedSchemaPath
  : token
    ? [
        {
          'https://graphql.datocms.com/': {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        },
      ]
    : [];

module.exports = {
  schema,
  documents: ['src/**/*.{ts,svelte,graphql,gql}'],
};
