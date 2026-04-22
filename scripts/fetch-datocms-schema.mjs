import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outputDir = path.join(root, '.generated');
const outputFile = path.join(outputDir, 'datocms-schema.json');

function parseEnv(content) {
  const env = {};

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

    env[key] = value;
  }

  return env;
}

async function loadEnv() {
  const files = ['.env', '.env.local'];
  const result = {};

  for (const file of files) {
    try {
      const content = await fs.readFile(path.join(root, file), 'utf8');
      Object.assign(result, parseEnv(content));
    } catch {
      // Ignore missing local env files and continue with the next source.
    }
  }

  Object.assign(result, process.env);
  return result;
}

const introspectionQuery = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type {
      ...TypeRef
    }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

const env = await loadEnv();
const token = env.DATO_CMS_READONLY_TOKEN;

if (!token) {
  console.error('DATO_CMS_READONLY_TOKEN is not set in .env, .env.local, or the shell environment.');
  process.exit(1);
}

const response = await fetch('https://graphql.datocms.com/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ query: introspectionQuery }),
});

if (!response.ok) {
  console.error(`DatoCMS schema fetch failed: HTTP ${response.status} ${response.statusText}`);
  process.exit(1);
}

const payload = await response.json();

if (payload.errors?.length) {
  for (const error of payload.errors) {
    console.error(error.message);
  }
  process.exit(1);
}

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(outputFile, JSON.stringify(payload.data, null, 2) + '\n', 'utf8');

console.log(`DatoCMS schema saved to ${path.relative(root, outputFile)}`);
