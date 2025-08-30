# Intelligence Generation Guide

> How to generate, enhance, and update competitive intelligence for the Socket Intelligence Database

## Overview

The Socket Intelligence system uses AI-powered prompts to research and analyze competitive landscapes across various product categories. This guide shows you how to generate new intelligence and enhance existing data.

## Quick Start

### Generate Intelligence for a Category
```bash
# Generate intelligence for a specific category
node scripts/generate-intelligence.js --category "automotive"

# Generate with custom parameters
node scripts/generate-intelligence.js \
  --category "power-management" \
  --depth "deep" \
  --competitors 10
```

### Update Entire Database
```bash
# Full database update (all categories)
node scripts/update-database.js --full

# Update specific categories only
node scripts/update-database.js --categories "automotive,industrial,power"
```

## Understanding the Intelligence Pipeline

```mermaid
graph LR
    A[Research Prompt] --> B[AI Analysis]
    B --> C[Raw Output]
    C --> D[Enhancement]
    D --> E[Validation]
    E --> F[Database Update]
    F --> G[MCP Server Access]
```

## Available Categories

### Core Technology Sockets
- `wireless-connectivity` - WiFi, Bluetooth, Zigbee
- `high-speed-serdes` - SERDES, PCIe, USB
- `rf-transceivers` - Sub-GHz, LoRa, proprietary RF
- `memory-controllers` - DDR, Flash, SRAM controllers
- `security-processors` - Crypto engines, secure elements

### Market Segments
- `automotive` - Body control, ADAS, infotainment
- `industrial` - PLCs, sensors, fieldbus
- `medical` - Ultra-low power, regulatory compliant
- `datacenter` - Infrastructure, networking
- `consumer` - Gaming, audio/video, smart home

### Power & Analog
- `power-management` - DC-DC, LDO, PMIC
- `battery-management` - Chargers, fuel gauges
- `precision-analog` - Op-amps, ADCs, DACs

[Full Category List →](../prompts/README.md)

## Creating Custom Research Prompts

### Prompt Structure
```markdown
# [CATEGORY_NAME] Socket Research Prompt

## Research Objectives
- Define specific goals
- Identify key competitors
- Specify technical parameters

## Target Applications
- List primary use cases
- Define market segments

## Competitive Analysis Requirements
- Key vendors to analyze
- Technical specifications needed
- Pricing/availability data

## Output Format
- Structured JSON database entry
- Competitive matrix
- Win probability factors
```

### Example Custom Prompt
Create a new file: `prompts/custom/my-category.md`

```markdown
# USB4 Controllers Socket Research

## Research Objectives
- Identify all USB4 controller vendors
- Compare throughput, power, features
- Analyze ecosystem support

## Key Competitors
- Intel Thunderbolt controllers
- ASMedia USB4 solutions
- Realtek implementations

## Technical Parameters
- Data rates (20/40 Gbps)
- Power delivery capabilities
- Display port alt mode support
- PCIe tunneling

## Output Requirements
Generate structured analysis with:
1. Vendor comparison matrix
2. Technical specifications
3. Design win factors
4. Microchip positioning
```

### Run Custom Prompt
```bash
node scripts/generate-intelligence.js \
  --prompt "prompts/custom/my-category.md" \
  --output "intelligence-database/enhanced-context/"
```

## Enhancement Pipeline

### Step 1: Initial Generation
```bash
# Generate raw intelligence
node scripts/generate-intelligence.js \
  --category "automotive" \
  --model "claude-3" \
  --output "raw-output.json"
```

### Step 2: Enhancement
```bash
# Enhance with additional context
node scripts/enhance-intelligence.js \
  --input "raw-output.json" \
  --context "microchip-products.json" \
  --depth "comprehensive"
```

### Step 3: Validation
```bash
# Validate and clean data
node scripts/validate-intelligence.js \
  --input "enhanced-output.json" \
  --fix-errors \
  --remove-duplicates
```

### Step 4: Database Integration
```bash
# Merge into main database
node scripts/update-database.js \
  --source "validated-output.json" \
  --merge-strategy "update" \
  --backup
```

## Advanced Generation Options

### Deep Research Mode
```bash
# Comprehensive competitive analysis
node scripts/generate-intelligence.js \
  --category "automotive" \
  --mode "deep-research" \
  --include-patents \
  --include-financials \
  --include-roadmaps
```

### Competitive Focus
```bash
# Target specific competitors
node scripts/generate-intelligence.js \
  --category "power" \
  --competitors "TI,ADI,Maxim,ST" \
  --comparison-depth "detailed"
```

### Market Intelligence
```bash
# Generate market analysis
node scripts/generate-intelligence.js \
  --category "industrial" \
  --analysis-type "market" \
  --include-tam \
  --include-growth-rates \
  --forecast-years 5
```

## Batch Processing

### Create Batch Configuration
`batch-config.json`:
```json
{
  "categories": [
    {
      "name": "automotive",
      "depth": "deep",
      "competitors": ["NXP", "Infineon", "ST"]
    },
    {
      "name": "industrial",
      "depth": "standard",
      "focus": "fieldbus"
    }
  ],
  "output": {
    "format": "enhanced",
    "directory": "intelligence-database/batch-output/",
    "merge": true
  }
}
```

### Run Batch Process
```bash
# Process multiple categories
node scripts/batch-generate.js --config batch-config.json

# Monitor progress
tail -f logs/batch-generation.log
```

## Using Claude Desktop for Generation

Once MCP server is configured, you can generate intelligence directly in Claude:

### Interactive Generation
```
@generate-intelligence for automotive body control modules focusing on CAN transceivers

@deep-research on Silicon Carbide gate drivers comparing to TI and Infineon

@market-analysis for EV charging infrastructure semiconductor opportunities
```

### Bulk Updates
```
@update-all-categories with latest competitive data

@refresh-database --categories "power,automotive" --depth comprehensive
```

## Quality Assurance

### Verify Generated Data
```bash
# Check data quality
node scripts/qa-check.js \
  --file "intelligence-database/enhanced-context/automotive.json" \
  --checks "completeness,accuracy,formatting"
```

### Compare with Previous Version
```bash
# Diff analysis
node scripts/compare-versions.js \
  --old "backup/database-v1.json" \
  --new "intelligence-database/socket-intelligence-database.json" \
  --report "comparison-report.html"
```

## Scheduling Automated Updates

### Setup Cron Job (Linux/WSL)
```bash
# Edit crontab
crontab -e

# Add weekly update (Sundays at 2 AM)
0 2 * * 0 cd /home/user/microchip-socket-intelligence-mcp && ./scripts/weekly-update.sh

# Add daily incremental updates
0 1 * * * cd /home/user/microchip-socket-intelligence-mcp && node scripts/update-database.js --incremental
```

### Windows Task Scheduler
```powershell
# Create scheduled task
$action = New-ScheduledTaskAction -Execute "wsl.exe" `
  -Argument "-e bash -c 'cd ~/microchip-socket-intelligence-mcp && ./scripts/update-database.sh'"

$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 2am

Register-ScheduledTask -TaskName "Socket Intelligence Update" `
  -Action $action -Trigger $trigger
```

## Export and Reporting

### Generate Reports
```bash
# Export to Excel
node scripts/export-intelligence.js \
  --format "excel" \
  --categories "all" \
  --output "reports/competitive-analysis.xlsx"

# Generate PDF report
node scripts/generate-report.js \
  --template "executive-summary" \
  --data "intelligence-database/" \
  --output "reports/executive-brief.pdf"
```

### Custom Dashboards
```bash
# Generate interactive dashboard
node scripts/create-dashboard.js \
  --data "intelligence-database/" \
  --port 3000

# Access at http://localhost:3000
```

## Best Practices

### 1. Regular Updates
- Run incremental updates daily
- Full refresh weekly
- Deep research monthly

### 2. Version Control
- Commit changes after each update
- Tag stable versions
- Keep backups of working databases

### 3. Quality Checks
- Validate all generated content
- Review competitive data accuracy
- Verify Microchip product mappings

### 4. Documentation
- Document custom prompts
- Log enhancement decisions
- Track intelligence sources

## Troubleshooting

### Generation Failures
```bash
# Check logs
tail -f logs/generation.log

# Retry with verbose output
node scripts/generate-intelligence.js \
  --category "automotive" \
  --verbose \
  --debug
```

### Database Corruption
```bash
# Validate database
node scripts/validate-database.js --repair

# Restore from backup
cp backups/database-backup-YYYYMMDD.json intelligence-database/socket-intelligence-database.json
```

### Performance Issues
```bash
# Optimize database
node scripts/optimize-database.js

# Clear cache
rm -rf cache/*

# Reduce batch size
node scripts/batch-generate.js --batch-size 5
```

## Contributing New Intelligence

### Adding a New Category
1. Create prompt template in `prompts/`
2. Define category schema in `schemas/`
3. Add to category index
4. Test generation
5. Submit pull request

### Improving Existing Data
1. Identify gaps in current intelligence
2. Create enhancement prompt
3. Generate and validate
4. Update documentation
5. Submit changes

## API Reference

### Core Scripts

#### `generate-intelligence.js`
```javascript
Options:
  --category    Product category to research
  --prompt      Custom prompt file
  --depth       Research depth (basic|standard|deep)
  --output      Output directory
  --format      Output format (json|markdown|html)
  --model       AI model to use
```

#### `update-database.js`
```javascript
Options:
  --full        Update all categories
  --categories  Comma-separated category list
  --incremental Only update changed items
  --backup      Create backup before update
  --merge       Merge strategy (update|replace|append)
```

#### `enhance-intelligence.js`
```javascript
Options:
  --input       Input file to enhance
  --context     Additional context files
  --depth       Enhancement depth
  --output      Enhanced output file
```

## Next Steps

1. Start with a single category test
2. Review generated output quality
3. Customize prompts for your needs
4. Set up automated updates
5. Create custom reports

---

**Support**: FAE Intelligence Team | **Version**: 1.0.0