#!/usr/bin/env node

/**
 * Database Update Script for Microchip Socket Intelligence
 * 
 * This script updates the main intelligence database with new data,
 * performs maintenance tasks, and manages database versions.
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATABASE_PATH = path.join(PROJECT_ROOT, 'intelligence-database');
const MAIN_DB_PATH = path.join(DATABASE_PATH, 'socket-intelligence-database.json');
const ENHANCED_CONTEXT_PATH = path.join(DATABASE_PATH, 'enhanced-context');
const BACKUPS_PATH = path.join(DATABASE_PATH, 'backups');

// Utility functions
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
        info: '\x1b[36m',
        success: '\x1b[32m',
        warning: '\x1b[33m',
        error: '\x1b[31m',
        reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        log(`Created directory: ${dirPath}`);
    }
}

function createDatabaseBackup(reason = 'manual') {
    ensureDirectoryExists(BACKUPS_PATH);
    
    if (fs.existsSync(MAIN_DB_PATH)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(BACKUPS_PATH, `socket-intelligence-db-${timestamp}-${reason}.json`);
        fs.copyFileSync(MAIN_DB_PATH, backupPath);
        log(`Database backed up to: ${backupPath}`, 'success');
        return backupPath;
    } else {
        log('No existing database to backup', 'warning');
        return null;
    }
}

function loadMainDatabase() {
    if (fs.existsSync(MAIN_DB_PATH)) {
        try {
            const data = fs.readFileSync(MAIN_DB_PATH, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            log(`Error loading database: ${error.message}`, 'error');
            throw new Error('Failed to load main database');
        }
    } else {
        log('Creating new database structure', 'info');
        return {
            version: "1.0.0",
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            categories: {},
            metadata: {
                total_categories: 0,
                last_full_update: null,
                update_frequency: "weekly"
            }
        };
    }
}

function saveMainDatabase(database) {
    try {
        database.updated = new Date().toISOString();
        database.metadata.total_categories = Object.keys(database.categories).length;
        
        const jsonString = JSON.stringify(database, null, 2);
        fs.writeFileSync(MAIN_DB_PATH, jsonString);
        log('Main database saved successfully', 'success');
        return true;
    } catch (error) {
        log(`Error saving database: ${error.message}`, 'error');
        return false;
    }
}

function scanEnhancedContextFiles() {
    const files = [];
    
    if (!fs.existsSync(ENHANCED_CONTEXT_PATH)) {
        log('Enhanced context directory not found', 'warning');
        return files;
    }
    
    const items = fs.readdirSync(ENHANCED_CONTEXT_PATH);
    
    items.forEach(item => {
        const fullPath = path.join(ENHANCED_CONTEXT_PATH, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile() && (item.endsWith('.json') || item.endsWith('.md'))) {
            files.push({
                name: item,
                path: fullPath,
                modified: stat.mtime,
                size: stat.size
            });
        }
    });
    
    return files.sort((a, b) => b.modified - a.modified);
}

function extractCategoryFromFilename(filename) {
    // Extract category from filenames like "enhanced-automotive-results-2024-01-01.json"
    const match = filename.match(/^enhanced-([^-]+)-.*\.(json|md)$/);
    return match ? match[1] : null;
}

function processEnhancedContextFile(filePath) {
    try {
        const ext = path.extname(filePath).toLowerCase();
        
        if (ext === '.json') {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return data;
        } else if (ext === '.md') {
            // For markdown files, extract structured data
            const content = fs.readFileSync(filePath, 'utf8');
            return {
                content: content,
                format: 'markdown',
                processed: new Date().toISOString()
            };
        }
    } catch (error) {
        log(`Error processing file ${filePath}: ${error.message}`, 'error');
        return null;
    }
}

function updateCategoryInDatabase(database, category, newData, mergeStrategy = 'update') {
    if (!database.categories[category]) {
        database.categories[category] = {
            created: new Date().toISOString(),
            data: {}
        };
    }
    
    const existing = database.categories[category];
    
    switch (mergeStrategy) {
        case 'replace':
            database.categories[category].data = newData;
            break;
            
        case 'merge':
            database.categories[category].data = {
                ...existing.data,
                ...newData
            };
            break;
            
        case 'update':
        default:
            // Deep merge with preference for new data
            database.categories[category].data = deepMerge(existing.data, newData);
            break;
    }
    
    database.categories[category].last_updated = new Date().toISOString();
    log(`Updated category: ${category}`, 'success');
}

function deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
    }
    
    return result;
}

function validateDatabase(database) {
    const errors = [];
    const warnings = [];
    
    // Check required fields
    if (!database.version) errors.push('Missing version field');
    if (!database.categories) errors.push('Missing categories field');
    if (!database.updated) errors.push('Missing updated field');
    
    // Check categories
    if (database.categories) {
        Object.keys(database.categories).forEach(category => {
            const catData = database.categories[category];
            if (!catData.last_updated) {
                warnings.push(`Category ${category} missing last_updated`);
            }
        });
    }
    
    return { errors, warnings };
}

function generateDatabaseStats(database) {
    const stats = {
        version: database.version,
        total_categories: Object.keys(database.categories || {}).length,
        last_updated: database.updated,
        categories: {}
    };
    
    if (database.categories) {
        Object.keys(database.categories).forEach(category => {
            const catData = database.categories[category];
            stats.categories[category] = {
                last_updated: catData.last_updated,
                has_data: !!catData.data,
                data_keys: catData.data ? Object.keys(catData.data).length : 0
            };
        });
    }
    
    return stats;
}

// CLI Commands
program
    .version('1.0.0')
    .description('Update and maintain the Microchip Socket Intelligence Database');

program
    .command('full-update')
    .description('Perform a full database update from all enhanced context files')
    .option('-b, --backup', 'Create backup before update', true)
    .option('-s, --strategy <strategy>', 'Merge strategy (update|merge|replace)', 'update')
    .action(async (options) => {
        try {
            log('Starting full database update...', 'info');
            
            // Create backup
            if (options.backup) {
                createDatabaseBackup('full-update');
            }
            
            // Load main database
            const database = loadMainDatabase();
            
            // Scan for enhanced context files
            const files = scanEnhancedContextFiles();
            log(`Found ${files.length} enhanced context files`, 'info');
            
            let updatedCategories = 0;
            
            // Process each file
            for (const file of files) {
                const category = extractCategoryFromFilename(file.name);
                
                if (category) {
                    log(`Processing category: ${category}`, 'info');
                    
                    const data = processEnhancedContextFile(file.path);
                    if (data) {
                        updateCategoryInDatabase(database, category, data, options.strategy);
                        updatedCategories++;
                    }
                } else {
                    log(`Could not extract category from: ${file.name}`, 'warning');
                }
            }
            
            // Update metadata
            database.metadata.last_full_update = new Date().toISOString();
            
            // Save database
            if (saveMainDatabase(database)) {
                log(`Full update completed: ${updatedCategories} categories updated`, 'success');
            }
            
        } catch (error) {
            log(`Full update failed: ${error.message}`, 'error');
            process.exit(1);
        }
    });

program
    .command('incremental')
    .description('Update only recently modified files')
    .option('-d, --days <days>', 'Files modified within N days', '7')
    .option('-b, --backup', 'Create backup before update', true)
    .action(async (options) => {
        try {
            log(`Starting incremental update (${options.days} days)...`, 'info');
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(options.days));
            
            if (options.backup) {
                createDatabaseBackup('incremental');
            }
            
            const database = loadMainDatabase();
            const files = scanEnhancedContextFiles();
            
            const recentFiles = files.filter(file => file.modified > cutoffDate);
            log(`Found ${recentFiles.length} recently modified files`, 'info');
            
            let updatedCategories = 0;
            
            for (const file of recentFiles) {
                const category = extractCategoryFromFilename(file.name);
                
                if (category) {
                    log(`Processing category: ${category}`, 'info');
                    
                    const data = processEnhancedContextFile(file.path);
                    if (data) {
                        updateCategoryInDatabase(database, category, data, 'update');
                        updatedCategories++;
                    }
                }
            }
            
            if (saveMainDatabase(database)) {
                log(`Incremental update completed: ${updatedCategories} categories updated`, 'success');
            }
            
        } catch (error) {
            log(`Incremental update failed: ${error.message}`, 'error');
            process.exit(1);
        }
    });

program
    .command('validate')
    .description('Validate database integrity')
    .option('-f, --fix', 'Attempt to fix common issues')
    .action(async (options) => {
        try {
            log('Validating database...', 'info');
            
            const database = loadMainDatabase();
            const validation = validateDatabase(database);
            
            if (validation.errors.length > 0) {
                log('Validation errors found:', 'error');
                validation.errors.forEach(error => log(`  - ${error}`, 'error'));
            }
            
            if (validation.warnings.length > 0) {
                log('Validation warnings:', 'warning');
                validation.warnings.forEach(warning => log(`  - ${warning}`, 'warning'));
            }
            
            if (validation.errors.length === 0 && validation.warnings.length === 0) {
                log('Database validation passed!', 'success');
            }
            
            // Show stats
            const stats = generateDatabaseStats(database);
            console.log('\nDatabase Statistics:');
            console.log(`  Version: ${stats.version}`);
            console.log(`  Categories: ${stats.total_categories}`);
            console.log(`  Last Updated: ${stats.last_updated}`);
            
        } catch (error) {
            log(`Validation failed: ${error.message}`, 'error');
            process.exit(1);
        }
    });

program
    .command('backup')
    .description('Create a manual database backup')
    .option('-r, --reason <reason>', 'Backup reason', 'manual')
    .action((options) => {
        createDatabaseBackup(options.reason);
    });

program
    .command('stats')
    .description('Show database statistics')
    .action(() => {
        try {
            const database = loadMainDatabase();
            const stats = generateDatabaseStats(database);
            
            console.log('Socket Intelligence Database Statistics:');
            console.log('=====================================');
            console.log(`Version: ${stats.version}`);
            console.log(`Total Categories: ${stats.total_categories}`);
            console.log(`Last Updated: ${new Date(stats.last_updated).toLocaleString()}`);
            
            if (stats.total_categories > 0) {
                console.log('\nCategory Details:');
                Object.keys(stats.categories).forEach(category => {
                    const catStats = stats.categories[category];
                    const lastUpdated = catStats.last_updated ? 
                        new Date(catStats.last_updated).toLocaleDateString() : 'Never';
                    console.log(`  ${category}: ${catStats.data_keys} data points (updated ${lastUpdated})`);
                });
            }
            
        } catch (error) {
            log(`Stats generation failed: ${error.message}`, 'error');
            process.exit(1);
        }
    });

program
    .command('cleanup')
    .description('Clean up old backups and temporary files')
    .option('-k, --keep <days>', 'Keep backups newer than N days', '30')
    .action((options) => {
        try {
            log('Starting cleanup...', 'info');
            
            const keepDays = parseInt(options.keep);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - keepDays);
            
            // Clean old backups
            if (fs.existsSync(BACKUPS_PATH)) {
                const backups = fs.readdirSync(BACKUPS_PATH);
                let deletedCount = 0;
                
                backups.forEach(backup => {
                    const backupPath = path.join(BACKUPS_PATH, backup);
                    const stat = fs.statSync(backupPath);
                    
                    if (stat.mtime < cutoffDate) {
                        fs.unlinkSync(backupPath);
                        deletedCount++;
                    }
                });
                
                log(`Deleted ${deletedCount} old backup files`, 'success');
            }
            
            log('Cleanup completed', 'success');
            
        } catch (error) {
            log(`Cleanup failed: ${error.message}`, 'error');
            process.exit(1);
        }
    });

// Parse CLI arguments
if (require.main === module) {
    program.parse(process.argv);
    
    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
}