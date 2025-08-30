#!/usr/bin/env node

/**
 * Intelligence Generation Script for Microchip Socket Intelligence
 * 
 * This script generates competitive intelligence using AI prompts and
 * updates the socket intelligence database.
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATABASE_PATH = path.join(PROJECT_ROOT, 'intelligence-database');
const PROMPTS_PATH = path.join(PROJECT_ROOT, 'prompts');
const OUTPUT_PATH = path.join(DATABASE_PATH, 'enhanced-context');

// Available categories
const CATEGORIES = [
    'wireless-connectivity',
    'high-speed-serdes', 
    'rf-transceivers',
    'audio-codecs',
    'display-controllers',
    'usb-controllers',
    'memory-controllers',
    'clock-generation',
    'interface-bridges',
    'security-processors',
    'automotive',
    'industrial',
    'medical',
    'power-management',
    'precision-analog'
];

// Utility functions
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
        info: '\x1b[36m',    // Cyan
        success: '\x1b[32m', // Green
        warning: '\x1b[33m', // Yellow
        error: '\x1b[31m',   // Red
        reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        log(`Created directory: ${dirPath}`);
    }
}

function loadPromptTemplate(category) {
    const promptPath = path.join(PROMPTS_PATH, `${category}.md`);
    if (!fs.existsSync(promptPath)) {
        throw new Error(`Prompt template not found: ${promptPath}`);
    }
    return fs.readFileSync(promptPath, 'utf8');
}

function generateIntelligencePrompt(category, options = {}) {
    const template = loadPromptTemplate(category);
    
    // Basic prompt enhancement based on options
    let enhancedPrompt = template;
    
    if (options.competitors) {
        enhancedPrompt += `\n\nFocus specifically on these competitors: ${options.competitors.join(', ')}\n`;
    }
    
    if (options.depth === 'deep') {
        enhancedPrompt += `\n\nPerform deep competitive analysis including:\n`;
        enhancedPrompt += `- Financial performance data\n`;
        enhancedPrompt += `- Patent analysis\n`;
        enhancedPrompt += `- Product roadmaps\n`;
        enhancedPrompt += `- Market share analysis\n`;
    }
    
    if (options.includeMarket) {
        enhancedPrompt += `\n\nInclude market intelligence:\n`;
        enhancedPrompt += `- TAM/SAM analysis\n`;
        enhancedPrompt += `- Growth rate forecasts\n`;
        enhancedPrompt += `- Key market trends\n`;
    }
    
    return enhancedPrompt;
}

function simulateAIResponse(category, prompt) {
    // This is a simulation - in a real implementation, this would call
    // an AI service like OpenAI, Claude, or Gemini
    
    log(`Generating intelligence for category: ${category}`, 'info');
    log('In a real implementation, this would call an AI service', 'warning');
    
    // Simulate response structure
    const response = {
        category: category,
        generated: new Date().toISOString(),
        competitive_analysis: {
            key_vendors: [
                "Vendor A - Market leader with 35% share",
                "Vendor B - Strong in automotive applications", 
                "Vendor C - Focused on low-power solutions"
            ],
            technical_comparison: {
                performance_metrics: "Performance data would be here",
                power_consumption: "Power analysis data",
                cost_analysis: "Cost comparison data"
            }
        },
        microchip_positioning: {
            strengths: ["Integrated solutions", "Low power", "Automotive qualified"],
            opportunities: ["Industrial automation", "IoT applications"],
            threats: ["Price competition", "Technology disruption"]
        },
        market_intelligence: {
            tam_sam: "Market size data",
            growth_rate: "5-7% CAGR",
            key_trends: ["Trend 1", "Trend 2", "Trend 3"]
        },
        recommendations: [
            "Focus on automotive applications",
            "Emphasize low-power advantages", 
            "Develop ecosystem partnerships"
        ]
    };
    
    return response;
}

function saveIntelligenceOutput(category, data, format = 'json') {
    ensureDirectoryExists(OUTPUT_PATH);
    
    const timestamp = new Date().toISOString().split('T')[0];
    let filename, content;
    
    if (format === 'json') {
        filename = `enhanced-${category}-results-${timestamp}.json`;
        content = JSON.stringify(data, null, 2);
    } else if (format === 'markdown') {
        filename = `enhanced-${category}-results-${timestamp}.md`;
        content = generateMarkdownReport(data);
    }
    
    const outputPath = path.join(OUTPUT_PATH, filename);
    fs.writeFileSync(outputPath, content);
    
    log(`Intelligence saved to: ${outputPath}`, 'success');
    return outputPath;
}

function generateMarkdownReport(data) {
    let markdown = `# ${data.category} Intelligence Report\n\n`;
    markdown += `**Generated:** ${data.generated}\n\n`;
    
    markdown += `## Competitive Analysis\n\n`;
    if (data.competitive_analysis?.key_vendors) {
        markdown += `### Key Vendors\n`;
        data.competitive_analysis.key_vendors.forEach(vendor => {
            markdown += `- ${vendor}\n`;
        });
        markdown += `\n`;
    }
    
    markdown += `## Microchip Positioning\n\n`;
    if (data.microchip_positioning) {
        if (data.microchip_positioning.strengths) {
            markdown += `### Strengths\n`;
            data.microchip_positioning.strengths.forEach(strength => {
                markdown += `- ${strength}\n`;
            });
        }
        
        if (data.microchip_positioning.opportunities) {
            markdown += `\n### Opportunities\n`;
            data.microchip_positioning.opportunities.forEach(opp => {
                markdown += `- ${opp}\n`;
            });
        }
    }
    
    if (data.recommendations) {
        markdown += `\n## Recommendations\n\n`;
        data.recommendations.forEach((rec, i) => {
            markdown += `${i + 1}. ${rec}\n`;
        });
    }
    
    return markdown;
}

function updateMainDatabase(category, data) {
    const mainDbPath = path.join(DATABASE_PATH, 'socket-intelligence-database.json');
    
    let mainDb;
    if (fs.existsSync(mainDbPath)) {
        mainDb = JSON.parse(fs.readFileSync(mainDbPath, 'utf8'));
    } else {
        mainDb = {
            version: "1.0.0",
            updated: new Date().toISOString(),
            categories: {}
        };
    }
    
    // Update category data
    mainDb.categories[category] = {
        ...data,
        last_updated: new Date().toISOString()
    };
    
    mainDb.updated = new Date().toISOString();
    
    // Create backup
    if (fs.existsSync(mainDbPath)) {
        const backupPath = path.join(DATABASE_PATH, `socket-intelligence-database-backup-${Date.now()}.json`);
        fs.copyFileSync(mainDbPath, backupPath);
        log(`Database backed up to: ${backupPath}`);
    }
    
    // Save updated database
    fs.writeFileSync(mainDbPath, JSON.stringify(mainDb, null, 2));
    log('Main database updated', 'success');
}

// CLI setup
program
    .version('1.0.0')
    .description('Generate competitive intelligence for Microchip socket analysis');

program
    .command('generate')
    .alias('g')
    .description('Generate intelligence for a category')
    .option('-c, --category <category>', 'Product category to research')
    .option('-d, --depth <level>', 'Research depth (basic|standard|deep)', 'standard')
    .option('-o, --output <format>', 'Output format (json|markdown|both)', 'json')
    .option('-f, --file <path>', 'Custom prompt file path')
    .option('--competitors <list>', 'Comma-separated list of specific competitors')
    .option('--include-market', 'Include market analysis')
    .option('--update-db', 'Update main database after generation')
    .action(async (options) => {
        try {
            // Validate category
            if (!options.category && !options.file) {
                log('Category or custom prompt file required', 'error');
                process.exit(1);
            }
            
            if (options.category && !CATEGORIES.includes(options.category)) {
                log(`Invalid category. Available categories: ${CATEGORIES.join(', ')}`, 'error');
                process.exit(1);
            }
            
            // Parse competitors
            const competitors = options.competitors ? 
                options.competitors.split(',').map(c => c.trim()) : null;
            
            const generateOptions = {
                depth: options.depth,
                competitors,
                includeMarket: options.includeMarket
            };
            
            log('Starting intelligence generation...', 'info');
            
            // Load and enhance prompt
            const category = options.category || 'custom';
            let prompt;
            
            if (options.file) {
                if (!fs.existsSync(options.file)) {
                    throw new Error(`Custom prompt file not found: ${options.file}`);
                }
                prompt = fs.readFileSync(options.file, 'utf8');
            } else {
                prompt = generateIntelligencePrompt(category, generateOptions);
            }
            
            // Generate intelligence (simulated)
            const intelligence = simulateAIResponse(category, prompt);
            
            // Save output
            if (options.output === 'both' || options.output === 'json') {
                saveIntelligenceOutput(category, intelligence, 'json');
            }
            
            if (options.output === 'both' || options.output === 'markdown') {
                saveIntelligenceOutput(category, intelligence, 'markdown');
            }
            
            // Update main database if requested
            if (options.updateDb) {
                updateMainDatabase(category, intelligence);
            }
            
            log('Intelligence generation completed successfully!', 'success');
            
        } catch (error) {
            log(`Error: ${error.message}`, 'error');
            process.exit(1);
        }
    });

program
    .command('list')
    .alias('ls')
    .description('List available categories')
    .action(() => {
        console.log('Available categories:');
        CATEGORIES.forEach(cat => {
            console.log(`  - ${cat}`);
        });
    });

program
    .command('status')
    .description('Show database status')
    .action(() => {
        const mainDbPath = path.join(DATABASE_PATH, 'socket-intelligence-database.json');
        
        if (fs.existsSync(mainDbPath)) {
            const db = JSON.parse(fs.readFileSync(mainDbPath, 'utf8'));
            console.log('Database Status:');
            console.log(`  Version: ${db.version}`);
            console.log(`  Last Updated: ${db.updated}`);
            console.log(`  Categories: ${Object.keys(db.categories || {}).length}`);
            
            if (db.categories) {
                console.log('\nCategory Status:');
                Object.keys(db.categories).forEach(cat => {
                    const lastUpdated = db.categories[cat].last_updated || 'Never';
                    console.log(`  ${cat}: ${lastUpdated}`);
                });
            }
        } else {
            console.log('Database not found. Run setup first.');
        }
    });

// Parse CLI arguments
if (require.main === module) {
    program.parse(process.argv);
    
    // Show help if no command provided
    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
}