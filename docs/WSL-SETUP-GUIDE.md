# WSL2 Setup Guide for Microchip Socket Intelligence

## Prerequisites

- Windows 11 (or Windows 10 version 2004+)
- Administrator access
- Virtualization enabled in BIOS/UEFI
- At least 8GB RAM (16GB recommended)
- 20GB free disk space

## Step 1: Enable WSL2

### Option A: Quick Install (Recommended)
```powershell
# Open PowerShell as Administrator
wsl --install

# This installs WSL2 with Ubuntu by default
# Restart your computer when prompted
```

### Option B: Manual Install
```powershell
# Enable WSL feature
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart computer
Restart-Computer

# Set WSL2 as default
wsl --set-default-version 2

# Install Ubuntu
wsl --install -d Ubuntu
```

## Step 2: Configure Ubuntu

### Initial Setup
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y \
    curl \
    git \
    build-essential \
    python3 \
    python3-pip \
    nodejs \
    npm

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@microchip.com"
```

### Create Working Directory
```bash
# Create development folder
mkdir -p ~/projects
cd ~/projects
```

## Step 3: Optimize WSL2 Performance

### Create WSL Configuration
```powershell
# In Windows, create .wslconfig file
notepad "$env:USERPROFILE\.wslconfig"
```

Add this configuration:
```ini
[wsl2]
memory=8GB          # Limit memory (adjust based on your system)
processors=4        # Number of processors
swap=4GB           # Swap size
localhostForwarding=true

[experimental]
autoMemoryReclaim=gradual
sparseVhd=true
```

### Enable systemd (Better Performance)
```bash
# In WSL Ubuntu
sudo nano /etc/wsl.conf
```

Add:
```ini
[boot]
systemd=true

[network]
hostname=mchp-dev
generateHosts=true
generateResolvConf=true

[interop]
enabled=true
appendWindowsPath=true

[user]
default=your_username
```

Then restart WSL:
```powershell
# In PowerShell
wsl --shutdown
wsl
```

## Step 4: Install Node.js (Correct Version)

### Using Node Version Manager (NVM)
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js 18 LTS
nvm install 18
nvm use 18
nvm alias default 18

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

## Step 5: SSH Key Setup for GitHub

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@microchip.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to agent
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub
# Copy this output and add to GitHub Settings > SSH Keys
```

## Step 6: Network Configuration

### If Behind Corporate Proxy
```bash
# Set proxy for git
git config --global http.proxy http://proxy.microchip.com:8080
git config --global https.proxy http://proxy.microchip.com:8080

# Set proxy for npm
npm config set proxy http://proxy.microchip.com:8080
npm config set https-proxy http://proxy.microchip.com:8080

# Set proxy for apt
sudo nano /etc/apt/apt.conf.d/proxy.conf
# Add:
# Acquire::http::Proxy "http://proxy.microchip.com:8080/";
# Acquire::https::Proxy "http://proxy.microchip.com:8080/";
```

## Step 7: File System Best Practices

### Performance Tips
- Keep project files in WSL filesystem (`~/projects/`)
- Avoid accessing Windows files from WSL frequently
- Use `/mnt/c/` only when necessary

### Access WSL Files from Windows
```powershell
# In Windows Explorer, navigate to:
\\wsl$\Ubuntu\home\your_username\projects
```

### Access Windows Files from WSL
```bash
# Windows drives are mounted under /mnt/
cd /mnt/c/Users/YourWindowsUsername/Documents
```

## Step 8: Visual Studio Code Integration

```powershell
# Install VS Code with WSL extension
winget install Microsoft.VisualStudioCode

# In WSL, open project in VS Code
cd ~/projects/microchip-socket-intelligence-mcp
code .
```

## Step 9: Docker Integration (Optional)

```bash
# Install Docker Desktop for Windows
# Enable WSL2 integration in Docker Desktop settings

# Verify Docker works in WSL
docker --version
docker run hello-world
```

## Troubleshooting

### WSL2 Not Starting
```powershell
# Check virtualization is enabled
systeminfo | findstr /C:"Virtualization"

# Reset WSL
wsl --shutdown
wsl --unregister Ubuntu
wsl --install -d Ubuntu
```

### Network Issues
```bash
# Reset network
sudo rm /etc/resolv.conf
sudo bash -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'
sudo bash -c 'echo "[network]" > /etc/wsl.conf'
sudo bash -c 'echo "generateResolvConf = false" >> /etc/wsl.conf'
```

### Permission Issues
```bash
# Fix permissions for npm
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Memory Issues
```powershell
# Check WSL memory usage
wsl --status

# Clear WSL cache
wsl --shutdown
# Delete %LOCALAPPDATA%\Temp\* files
```

## Verification Checklist

Run these commands to verify setup:
```bash
# Check WSL version
wsl -l -v  # Should show Ubuntu with VERSION 2

# Check Ubuntu version
lsb_release -a  # Should show Ubuntu 22.04 or newer

# Check Node.js
node --version  # Should be v18.x.x
npm --version   # Should be v9.x.x

# Check Git
git --version  # Should be 2.x.x

# Check network
ping google.com  # Should succeed

# Check file system
df -h  # Should show adequate space
```

## Next Steps

1. Clone the repository:
```bash
cd ~/projects
git clone git@github.com:jonzo97/microchip-socket-intelligence-mcp.git
cd microchip-socket-intelligence-mcp
```

2. Run the setup script:
```bash
./scripts/setup.sh
```

3. Configure Claude Desktop:
See [Claude Desktop Setup Guide](CLAUDE-DESKTOP-SETUP.md)

---

**Tips for Best Performance:**
- Close unnecessary Windows applications
- Use WSL2 terminal instead of Windows terminal when possible
- Keep WSL2 updated: `wsl --update`
- Restart WSL periodically: `wsl --shutdown` then restart