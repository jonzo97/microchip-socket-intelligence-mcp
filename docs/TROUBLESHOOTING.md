# Troubleshooting Guide

## Common Issues

### MCP Server Not Connecting

**Problem**: Claude Desktop doesn't show the MCP server

**Solutions**:
1. Check WSL is running: `wsl --status`
2. Verify server builds: `cd mcp-server && npm run build`
3. Check Claude config path: `~/.claude/claude_desktop_config.json`
4. Restart Claude Desktop completely

### Node.js Version Issues

**Problem**: Scripts fail with Node version errors

**Solutions**:
1. Install correct version: `nvm install 18 && nvm use 18`
2. Update npm: `npm install -g npm@latest`
3. Clear npm cache: `npm cache clean --force`

### Permission Denied Errors

**Problem**: Scripts can't execute

**Solutions**:
```bash
chmod +x scripts/*.sh
chmod +x scripts/*.js
```

### Database Connection Issues

**Problem**: Can't access intelligence database

**Solutions**:
1. Check database file exists
2. Verify permissions
3. Run database validation: `node scripts/update-database.js validate`

## Getting Help

1. Check the logs in `logs/` directory
2. Run diagnostic commands in the scripts
3. Contact FAE Support Team
