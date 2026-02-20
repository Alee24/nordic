# VPS Image Upload Setup

## Step 1: Create uploads directory
```bash
# SSH into your VPS, then run:
mkdir -p /var/www/html/backend/uploads/rooms
```

## Step 2: Set proper permissions
```bash
chmod -R 777 /var/www/html/backend/uploads
chown -R www-data:www-data /var/www/html/backend/uploads
```

## Step 3: Verify upload API exists
```bash
ls -la /var/www/html/backend/api/upload.php
```

If the file doesn't exist, you'll need to transfer it from your local machine.

## Step 4: Test upload endpoint
```bash
curl -X GET http://localhost/backend/api/upload.php
```

You should get a "Method not allowed" error, which means the endpoint exists.

## Troubleshooting

### If upload.php doesn't exist
You need to copy it from your local codebase:

**From Windows (your local machine):**
```powershell
cd c:\Users\Metto\Desktop\Codes\NORDIC
scp backend/api/upload.php root@your-server-ip:/var/www/html/backend/api/
```

**Or manually create it on VPS:**
```bash
nano /var/www/html/backend/api/upload.php
```
Then paste the upload.php code.

### Verify Apache can write to uploads
```bash
# Check Apache user
ps aux | grep apache
# Usually www-data on Ubuntu/Debian

# Set ownership
chown -R www-data:www-data /var/www/html/backend/uploads

# Test write access
sudo -u www-data touch /var/www/html/backend/uploads/test.txt
```

## Expected File Structure
```
/var/www/html/backend/
├── api/
│   ├── upload.php          # Upload endpoint
│   ├── dashboard.php       # Dashboard API
│   └── suites.php          # Suites API
└── uploads/
    ├── rooms/              # Room images (writable)
    └── README.md
```
