// src/generators/adapters/apache.adapter.ts
import { Adapter, GeneratedFile } from './base.adapter';
import { UnifiedAST } from '../../core/ast/ast-builder';

export class ApacheAdapter implements Adapter {
  public name = 'ApacheAdapter';

  public generate(ast: UnifiedAST): GeneratedFile[] {
    const { server } = ast;
    const engineLower = (server.engine || '').toLowerCase();

    if (!engineLower.includes('apache') && !engineLower.includes('httpd')) {
      return [];
    }

    const httpdConfig = `
# Generado automáticamente por Mystack CLI para Apache HTTPD
ServerName localhost
ServerRoot "/usr/local/apache2"
Listen ${server.ports[0] || 80}

# Módulos del Sistema Obligatorios en Docker/Linux
LoadModule mpm_event_module modules/mod_mpm_event.so
LoadModule unixd_module modules/mod_unixd.so
LoadModule log_config_module modules/mod_log_config.so
LoadModule logio_module modules/mod_logio.so

# Módulos de Funcionalidad y Seguridad
LoadModule authn_core_module modules/mod_authn_core.so
LoadModule authz_core_module modules/mod_authz_core.so
LoadModule dir_module modules/mod_dir.so
LoadModule mime_module modules/mod_mime.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule headers_module modules/mod_headers.so

ServerAdmin admin@localhost
DocumentRoot "/usr/local/apache2/htdocs"

<Directory "/usr/local/apache2/htdocs">
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>

# Proxy para el backend en Node.js
ProxyPass /api/ http://backend:3000/api/
ProxyPassReverse /api/ http://backend:3000/api/
`.trim();

    return [
      {
        relativePath: 'server/httpd.conf',
        content: httpdConfig,
      },
    ];
  }
}