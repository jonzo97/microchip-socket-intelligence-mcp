# 🚀 Launch Guide - Socket Intelligence System

## Quick Launch (Background Mode)

### One-Command Launch Script
```bash
# Create this launch script once
cat > ~/launch-socket-intel.sh << 'EOF'
#!/bin/bash
# Socket Intelligence Launch Script

echo "🚀 Starting Socket Intelligence System..."

# Check if ChromaDB is already running
if ! docker ps | grep -q chromadb/chroma; then
    echo "📊 Starting ChromaDB in background..."
    docker run -d --name chromadb-socket \
        --restart unless-stopped \
        -p 8000:8000 \
        chromadb/chroma
    sleep 3
else
    echo "✅ ChromaDB already running"
fi

# Check ChromaDB health
if curl -s http://localhost:8000/api/v2/heartbeat > /dev/null; then
    echo "✅ ChromaDB healthy"
else
    echo "❌ ChromaDB not responding"
    exit 1
fi

# Start MCP Server in background using nohup
cd ~/prompt_dev/mcp-server
echo "🔧 Starting MCP Server in background..."
nohup npm run start > ~/mcp-server.log 2>&1 &
echo $! > ~/mcp-server.pid

echo "✅ System launched successfully!"
echo ""
echo "📝 Log files:"
echo "  MCP Server: ~/mcp-server.log"
echo "  ChromaDB: docker logs chromadb-socket"
echo ""
echo "🛑 To stop: ~/stop-socket-intel.sh"
EOF

chmod +x ~/launch-socket-intel.sh
```

### One-Command Stop Script
```bash
# Create this stop script once
cat > ~/stop-socket-intel.sh << 'EOF'
#!/bin/bash
# Socket Intelligence Stop Script

echo "🛑 Stopping Socket Intelligence System..."

# Stop MCP Server
if [ -f ~/mcp-server.pid ]; then
    PID=$(cat ~/mcp-server.pid)
    if ps -p $PID > /dev/null; then
        kill $PID
        echo "✅ MCP Server stopped"
    fi
    rm ~/mcp-server.pid
fi

# Stop ChromaDB
docker stop chromadb-socket 2>/dev/null
docker rm chromadb-socket 2>/dev/null
echo "✅ ChromaDB stopped"

echo "🛑 System stopped"
EOF

chmod +x ~/stop-socket-intel.sh
```

## Daily Usage

### Start Everything (Background)
```bash
~/launch-socket-intel.sh
```

### Stop Everything
```bash
~/stop-socket-intel.sh
```

### Check Status
```bash
# Check if services are running
docker ps | grep chroma
ps aux | grep "npm run start" | grep -v grep

# View logs
tail -f ~/mcp-server.log        # MCP Server logs
docker logs chromadb-socket -f   # ChromaDB logs
```

## Alternative: Using tmux (Recommended for Development)

### Install tmux
```bash
sudo apt-get update
sudo apt-get install tmux
```

### Create tmux Launch Script
```bash
cat > ~/launch-socket-intel-tmux.sh << 'EOF'
#!/bin/bash
# Launch with tmux for easy monitoring

# Create new tmux session
tmux new-session -d -s socket-intel

# Window 0: ChromaDB
tmux rename-window -t socket-intel:0 'ChromaDB'
tmux send-keys -t socket-intel:0 'docker run --rm -p 8000:8000 chromadb/chroma' C-m

# Window 1: MCP Server
tmux new-window -t socket-intel:1 -n 'MCP-Server'
tmux send-keys -t socket-intel:1 'cd ~/prompt_dev/mcp-server && npm run dev' C-m

# Window 2: Monitoring
tmux new-window -t socket-intel:2 -n 'Monitor'
tmux send-keys -t socket-intel:2 'htop' C-m

echo "✅ Socket Intelligence launched in tmux"
echo "📺 View with: tmux attach -t socket-intel"
echo "🔄 Switch windows: Ctrl+B then 0/1/2"
echo "📤 Detach: Ctrl+B then D"
EOF

chmod +x ~/launch-socket-intel-tmux.sh
```

### tmux Commands
```bash
# Launch system
~/launch-socket-intel-tmux.sh

# Attach to session
tmux attach -t socket-intel

# Navigation (while attached)
Ctrl+B then 0  # ChromaDB window
Ctrl+B then 1  # MCP Server window
Ctrl+B then 2  # Monitor window
Ctrl+B then D  # Detach (keeps running)

# Kill session
tmux kill-session -t socket-intel
```

## Alternative: Using systemd Services (Production)

### Create ChromaDB Service
```bash
sudo tee /etc/systemd/system/chromadb-socket.service << EOF
[Unit]
Description=ChromaDB for Socket Intelligence
After=docker.service
Requires=docker.service

[Service]
Restart=always
ExecStart=/usr/bin/docker run --rm --name chromadb-socket -p 8000:8000 chromadb/chroma
ExecStop=/usr/bin/docker stop chromadb-socket

[Install]
WantedBy=multi-user.target
EOF
```

### Create MCP Server Service
```bash
sudo tee /etc/systemd/system/mcp-socket-server.service << EOF
[Unit]
Description=MCP Socket Intelligence Server
After=chromadb-socket.service

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/prompt_dev/mcp-server
ExecStart=/usr/bin/npm run start
Restart=on-failure
Environment="NODE_ENV=production"
Environment="OPENAI_API_KEY=$OPENAI_API_KEY"

[Install]
WantedBy=multi-user.target
EOF
```

### Enable Services
```bash
sudo systemctl daemon-reload
sudo systemctl enable chromadb-socket
sudo systemctl enable mcp-socket-server
sudo systemctl start chromadb-socket
sudo systemctl start mcp-socket-server
```

### Service Management
```bash
# Check status
sudo systemctl status chromadb-socket
sudo systemctl status mcp-socket-server

# View logs
sudo journalctl -u chromadb-socket -f
sudo journalctl -u mcp-socket-server -f

# Restart services
sudo systemctl restart chromadb-socket
sudo systemctl restart mcp-socket-server
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
sudo lsof -i :8000
# Kill it if needed
sudo kill -9 <PID>
```

### ChromaDB Won't Start
```bash
# Clean up old containers
docker ps -a | grep chroma | awk '{print $1}' | xargs docker rm -f

# Restart Docker
sudo service docker restart
```

### MCP Server Connection Issues
```bash
# Check if OPENAI_API_KEY is set
echo $OPENAI_API_KEY

# Test ChromaDB connection
curl http://localhost:8000/api/v2/heartbeat

# Check MCP logs
tail -100 ~/mcp-server.log
```

### Reset Everything
```bash
# Stop all services
~/stop-socket-intel.sh

# Clear ChromaDB data
docker volume rm $(docker volume ls -q | grep chroma)

# Reinstall dependencies
cd ~/prompt_dev/mcp-server
rm -rf node_modules
npm install

# Rebuild database
npm run setup-db

# Restart
~/launch-socket-intel.sh
```

## Performance Tips

1. **Docker Memory**: Ensure Docker has at least 4GB RAM allocated
2. **Background Mode**: Use `npm run start` instead of `npm run dev` for production
3. **Log Rotation**: Set up logrotate for MCP server logs to prevent disk fill

## Quick Health Check
```bash
# Create health check script
cat > ~/check-socket-intel.sh << 'EOF'
#!/bin/bash
echo "🔍 Socket Intelligence Health Check"
echo "===================================="

# Check ChromaDB
if curl -s http://localhost:8000/api/v2/heartbeat > /dev/null 2>&1; then
    echo "✅ ChromaDB: Running"
else
    echo "❌ ChromaDB: Not responding"
fi

# Check MCP Server
if ps aux | grep -q "[n]pm run start"; then
    echo "✅ MCP Server: Running"
else
    echo "❌ MCP Server: Not running"
fi

# Check disk space
echo ""
echo "💾 Disk Usage:"
df -h / | tail -1 | awk '{print "   Available: " $4 " (" $5 " used)"}'

# Check memory
echo "🧠 Memory Usage:"
free -h | grep Mem | awk '{print "   Available: " $7 " of " $2}'
EOF

chmod +x ~/check-socket-intel.sh
```

Run health check:
```bash
~/check-socket-intel.sh
```