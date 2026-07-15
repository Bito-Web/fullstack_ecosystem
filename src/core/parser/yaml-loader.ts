import fs from 'fs';
import YAML from 'yaml';

export class YamlLoader {
  static load(content: string): any {
    return YAML.parse(content);
  }
}

export const loadYaml = (path: string): unknown => {
  const file = fs.readFileSync(path, 'utf8');
  return YamlLoader.load(file);
};
