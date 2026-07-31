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
# Generado automáticamente por Fullstack_ecosystem CLI para Apache HTTPD
ServerName localhost
ServerRoot "/usr/local/apache2"

Listen 80
Listen 443

# --- MPM Module ---
LoadModule mpm_event_module modules/mod_mpm_event.so

# --- Core & Access Modules ---
LoadModule unixd_module modules/mod_unixd.so
LoadModule authz_core_module modules/mod_authz_core.so

# --- Standard Modules ---
LoadModule ssl_module modules/mod_ssl.so
LoadModule socache_shmcb_module modules/mod_socache_shmcb.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule alias_module modules/mod_alias.so
LoadModule dir_module modules/mod_dir.so

# --- MIME Types ---
LoadModule mime_module modules/mod_mime.so
TypesConfig conf/mime.types

DirectoryIndex index.html home.html

# --- HTTP (Port 80) ---
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot "/usr/local/apache2/htdocs"

    Alias /.well-known/acme-challenge/ /var/www/certbot/.well-known/acme-challenge/
    <Directory "/var/www/certbot">
        AllowOverride None
        Require all granted
    </Directory>

    RewriteEngine On
    RewriteCond %{REQUEST_URI} !^/\\.well-known/acme-challenge
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
</VirtualHost>

# --- HTTPS (Port 443) ---
<VirtualHost *:443>
    ServerName localhost
    DocumentRoot "/usr/local/apache2/htdocs"

    SSLEngine on
    SSLCertificateFile "/etc/ssl/custom/fullchain.pem"
    SSLCertificateKeyFile "/etc/ssl/custom/privkey.pem"

    <Directory "/usr/local/apache2/htdocs">
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted

        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_URI} !^/api/
        RewriteRule ^ index.html [L]
    </Directory>

    # Proxy a Express Backend
    ProxyPreserveHost On
    ProxyPass /api/v1/ http://backend:3000/api/v1/
    ProxyPassReverse /api/v1/ http://backend:3000/api/v1/
</VirtualHost>
`.trim();

    return [
      {
        relativePath: 'server/httpd.conf',
        content: httpdConfig,
      },
    ];
  }
}