import fs from 'fs';
import yaml from 'js-yaml';

export const loadYaml = (path: string): unknown => {
  const file = fs.readFileSync(path, 'utf8');
  return yaml.load(file);
};
