# ARGEKA Sync Installation Guide

This guide is for non-technical users. The goal is simple: download the setup file from the website and run ARGEKA Sync on your own computer.

## What you should know first

- ARGEKA Sync is not a cloud service hosted on our servers.
- It is installed on your own Windows computer or Windows server.
- Database passwords and transferred data stay in your own environment.
- After installation, the app opens in the browser at `http://localhost:8080`.
- Later, you can start it from the `ARGEKA Sync.exe` file on your desktop.

## Requirements

- Windows 10 or Windows 11
- Internet connection
- Permission to approve administrator prompts during setup
- At least 4 GB RAM, 8 GB recommended

The setup checks what is needed. If Git, Docker Desktop or WSL is missing, the setup will guide you.

## Install from the website

1. Open the ARGEKA Sync download page.
2. Click `Download Windows setup`.
3. The file `ARGEKA-Sync-Setup.exe` will be downloaded.
4. Double-click the file.
5. If Windows shows a security warning, choose `More info`, then `Run anyway`. This can happen because the setup is not code-signed yet.
6. Choose a language:
   - `1` Turkish
   - `2` English
7. Keep the setup window open. Git, Docker Desktop, WSL and the ARGEKA Sync services will be checked automatically.
8. If Windows asks for a restart, restart the computer.
9. After restart, run the same `ARGEKA-Sync-Setup.exe` file again.
10. When setup finishes, the browser opens.

## Open the program

After installation, this file is created on your desktop:

```text
ARGEKA Sync.exe
```

Double-click it to open ARGEKA Sync. If the browser does not open, type this address manually:

```text
http://localhost:8080
```

## First login

Demo user:

```text
Email: admin@argeka.local
Password: admin123
```

Change the password before real use.

## First test

1. Open `http://localhost:8080`.
2. Sign in with the demo user.
3. Open `Connections` and check the demo source/target connections.
4. Open `Sync Jobs`.
5. Click `Run` on the demo PostgreSQL job.
6. Open `Run History` and check that the job completed.

If these steps work, the installation is successful.

## Common questions

### Docker Desktop asks for GitHub sign-in

GitHub sign-in is not required. You can choose `Skip`.

### Windows asked for a restart

Restart the computer. Then run the setup file again.

### The page does not open

Double-click `ARGEKA Sync.exe` on the desktop. If it still does not open, type this in the browser:

```text
http://localhost:8080
```

### I want to move to another computer

1. Take a backup on the old computer.
2. Install ARGEKA Sync on the new computer.
3. Copy the backup file to the new computer.
4. Restore the backup.

For backup and restore, it is better to ask technical support if you are not comfortable with command-line tools.
