FROM php:8.0-apache

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Update Apache configuration to allow .htaccess overrides
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Set working directory
WORKDIR /var/www/html

# Copy backend files
COPY . /var/www/html/backend

# Adjust permissions
RUN chown -R www-data:www-data /var/www/html

# Expose port 80
EXPOSE 80
