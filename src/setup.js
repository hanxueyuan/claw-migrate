#!/usr/bin/env node

/**
 * Setup wizard - Fully user-controlled
 * All backup content is optional, the user decides
 */

const readline = require('readline');
const { printHeader, printSuccess, printError, printWarning, printDivider } = require('./utils');
const { saveConfig, ensureConfigDir } = require('./config');
const { getOpenClawEnv } = require('./utils');

// All selectable backup content categories (full list)
const BACKUP_CATEGORIES = [
  // ========== Core Configuration (Recommended) ==========
  {
    id: 'core',
    name: '🔵 Core Config',
    description: 'AI persona and team definitions',
    files: ['AGENTS.md', 'SOUL.md', 'IDENTITY.md', 'USER.md', 'TOOLS.md', 'HEARTBEAT.md'],
    recommended: true,
    warning: null,
    sensitive: false
  },
  {
    id: 'skills',
    name: '🟢 Skills',
    description: 'All custom skills',
    files: ['skills/'],
    recommended: true,
    warning: null,
    sensitive: false
  },
  {
    id: 'memory',
    name: '🟣 Memory Data',
    description: 'Long-term memory and memory index',
    files: ['MEMORY.md', 'memory/'],
    recommended: true,
    warning: null,
    sensitive: false
  },
  {
    id: 'learnings',
    name: '🟡 Learning Records',
    description: 'Error logs and learning notes',
    files: ['.learnings/'],
    recommended: true,
    warning: null,
    sensitive: false
  },
  
  // ========== Optional Configuration ==========
  {
    id: 'cron',
    name: '⚪ Cron Jobs',
    description: 'Scheduled task configs',
    files: ['cron/', 'cron/jobs.json', 'cron/runs/'],
    recommended: false,
    warning: null,
    sensitive: false
  },
  {
    id: 'docs',
    name: '⚪ Project Docs',
    description: 'Files in the docs/ directory',
    files: ['docs/'],
    recommended: false,
    warning: null,
    sensitive: false
  },
  {
    id: 'scripts',
    name: '⚪ Scripts',
    description: 'Scripts in the scripts/ directory',
    files: ['scripts/'],
    recommended: false,
    warning: null,
    sensitive: false
  },
  {
    id: 'templates',
    name: '⚪ Templates',
    description: 'Template files in the templates/ directory',
    files: ['templates/'],
    recommended: false,
    warning: null,
    sensitive: false
  },
  
  // ========== Machine-Specific Configuration (User selectable) ==========
  {
    id: 'openclaw_json',
    name: '⚠️  OpenClaw Config',
    description: 'openclaw.json (contains machine-specific paths)',
    files: ['openclaw.json'],
    recommended: false,
    warning: '⚠️  Contains machine-specific config (e.g. browser.executablePath); may need manual editing for multi-device sync',
    sensitive: false
  },
  {
    id: 'channel_feishu',
    name: '⚠️  Feishu Config',
    description: 'feishu/ directory (contains pairing info)',
    files: ['feishu/'],
    recommended: false,
    warning: '⚠️  Contains pairing info (pairing/) and dedup IDs (dedup/); may need re-pairing for multi-device sync',
    sensitive: false
  },
  {
    id: 'channel_telegram',
    name: '⚠️  Telegram Config',
    description: 'telegram/ directory',
    files: ['telegram/'],
    recommended: false,
    warning: '⚠️  Contains session info; may need reconfiguration for multi-device sync',
    sensitive: false
  },
  {
    id: 'channel_other',
    name: '⚠️  Other Channel Config',
    description: 'Other channel config directories',
    files: ['discord/', 'whatsapp/', 'signal/'],
    recommended: false,
    warning: '⚠️  Contains device-specific config; may need reconfiguration for multi-device sync',
    sensitive: false
  },
  
  // ========== Sensitive Information (User selectable) ==========
  {
    id: 'env',
    name: '🔴 Environment Config',
    description: '.env and other env var files (contain API keys)',
    files: ['.env', '.env.*', '.env.local', '.env.example'],
    recommended: false,
    warning: '🔴 Contains API keys, tokens, and other sensitive info. Only back up to a trusted private repo!',
    sensitive: true
  },
  {
    id: 'credentials',
    name: '🔴 Credentials',
    description: 'credentials/ directory',
    files: ['credentials/'],
    recommended: false,
    warning: '🔴 Contains auth credentials. Only back up to a trusted private repo!',
    sensitive: true
  },
  {
    id: 'identity',
    name: '🔴 Device Auth',
    description: 'identity/ directory (device tokens)',
    files: ['identity/'],
    recommended: false,
    warning: '🔴 Contains device auth info. Only back up to a trusted private repo!',
    sensitive: true
  },
  
  // ========== Other Optional ==========
  {
    id: 'browser',
    name: '⚪ Browser Data',
    description: 'browser/ directory',
    files: ['browser/'],
    recommended: false,
    warning: '⚠️  Browser user data, may be large',
    sensitive: false
  },
  {
    id: 'memory_index',
    name: '⚪ Memory Index',
    description: 'memory/ index files',
    files: ['memory/*.json'],
    recommended: false,
    warning: null,
    sensitive: false
  },
  {
    id: 'sessions',
    name: '⚪ Session History',
    description: 'agents/*/sessions/ session records',
    files: ['agents/*/sessions/'],
    recommended: false,
    warning: '⚠️  Session history files, may be large. Back up as needed',
    sensitive: false
  },
  {
    id: 'logs',
    name: '⚪ Log Files',
    description: 'logs/ directory',
    files: ['logs/'],
    recommended: false,
    warning: '⚠️  Log files, may be large',
    sensitive: false
  },
  {
    id: 'github',
    name: '⚪ GitHub Config',
    description: '.github/ directory',
    files: ['.github/'],
    recommended: false,
    warning: null,
    sensitive: false
  },
  {
    id: 'tests',
    name: '⚪ Test Files',
    description: 'tests/ directory',
    files: ['tests/'],
    recommended: false,
    warning: null,
    sensitive: false
  }
];

class SetupWizard {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.config = {
      repo: '',
      branch: 'main',
      auth: { method: 'env' },
      backup: {
        content: [],
        frequency: 'manual'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.selectedCategories = new Set();
  }

  close() {
    this.rl.close();
  }

  askQuestion(query, validator = () => true, errorMsg = 'Invalid input', defaultValue = '') {
    return new Promise((resolve) => {
      const defaultText = defaultValue ? ` (default: ${defaultValue})` : '';
      this.rl.question(`${query}${defaultText}: `, (answer) => {
        const value = answer.trim() || defaultValue;
        if (validator(value)) {
          resolve(value);
        } else {
          printWarning(`${errorMsg}`);
          resolve(this.askQuestion(query, validator, errorMsg, defaultValue));
        }
      });
    });
  }

  // Show main menu
  async showMainMenu() {
    printHeader('claw-migrate installed!');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Please select an operation:\n');
    console.log('   1. 🔵 Configure Backup');
    console.log('      Back up local config to a private GitHub repo');
    console.log('      For: regular backups, multi-device sync\n');
    console.log('   2. 🟢 Restore Configuration');
    console.log('      Restore config from a GitHub repo to local');
    console.log('      For: new machines, config recovery\n');
    console.log('   3. ⚪ Configure Later\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return new Promise((resolve) => {
      this.rl.question('   Choose [1-3]: ', (answer) => {
        const choice = parseInt(answer.trim()) || 3;
        resolve(choice);
      });
    });
  }

  // Select backup content - full version
  async selectBackupContent() {
    printHeader('Select Backup Content');
    
    console.log('\n📋 Select content to back up (multiple selection)\n');
    console.log('   Legend:');
    console.log('   🔵🟢🟣🟡 Recommended - Core content to back up');
    console.log('   ⚪ Optional - Select based on your needs');
    console.log('   ⚠️  Caution - Contains machine-specific config');
    console.log('   🔴 Sensitive - Contains API keys and other secrets\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Group display
    const groups = {
      'Core Configuration (Recommended)': BACKUP_CATEGORIES.filter(c => c.recommended),
      'Optional Configuration': BACKUP_CATEGORIES.filter(c => !c.recommended && !c.sensitive && !c.warning?.includes('machine-specific') && !c.warning?.includes('multi-device')),
      'Machine-Specific Configuration': BACKUP_CATEGORIES.filter(c => c.warning?.includes('machine-specific') || c.warning?.includes('multi-device')),
      'Sensitive Information': BACKUP_CATEGORIES.filter(c => c.sensitive)
    };

    let index = 1;
    const indexMap = {};

    for (const [groupName, categories] of Object.entries(groups)) {
      if (categories.length === 0) continue;
      
      console.log(`\n📁 ${groupName}\n`);
      
      for (const cat of categories) {
        const icon = cat.sensitive ? '🔴' : (cat.warning ? '⚠️' : '⚪');
        console.log(`   [${index}] ${icon} ${cat.name}`);
        console.log(`       ${cat.description}`);
        if (cat.warning) {
          console.log(`       ${cat.warning}`);
        }
        console.log();
        
        indexMap[index] = cat.id;
        index++;
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('   💡 Selection options:');
    console.log('   • Enter numbers to select (e.g.: 1 2 3 5 8)');
    console.log('   • Enter a to select all (including sensitive)');
    console.log('   • Enter r for recommended only');
    console.log('   • Enter s for recommended + optional (no sensitive)');
    console.log('   • Press Enter to skip (back up nothing)\n');

    const input = await this.askQuestion('   Your selection');
    
    if (input.toLowerCase() === 'a') {
      // Select all
      BACKUP_CATEGORIES.forEach(cat => this.selectedCategories.add(cat.id));
    } else if (input.toLowerCase() === 'r') {
      // Recommended only
      BACKUP_CATEGORIES
        .filter(cat => cat.recommended)
        .forEach(cat => this.selectedCategories.add(cat.id));
    } else if (input.toLowerCase() === 's') {
      // Recommended + optional (no sensitive or machine-specific)
      BACKUP_CATEGORIES
        .filter(cat => cat.recommended || (!cat.sensitive && !cat.warning?.includes('machine-specific')))
        .forEach(cat => this.selectedCategories.add(cat.id));
    } else {
      // Manual selection
      const choices = input.trim().split(/\s+/).filter(Boolean);
      for (const choice of choices) {
        const num = parseInt(choice);
        if (indexMap[num]) {
          this.selectedCategories.add(indexMap[num]);
        }
      }
    }

    // Display selection results
    console.log('\n📋 Selected:\n');
    if (this.selectedCategories.size === 0) {
      console.log('   (nothing selected)\n');
    } else {
      for (const catId of this.selectedCategories) {
        const cat = BACKUP_CATEGORIES.find(c => c.id === catId);
        const icon = cat.sensitive ? '🔴' : (cat.warning ? '⚠️' : '✅');
        console.log(`   ${icon} ${cat.name} - ${cat.description}`);
      }
      console.log();
    }

    // Sensitive info confirmation
    const sensitiveSelected = Array.from(this.selectedCategories).some(id => {
      const cat = BACKUP_CATEGORIES.find(c => c.id === id);
      return cat?.sensitive;
    });

    if (sensitiveSelected) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      printWarning('You selected to back up sensitive information!\n');
      console.log('   Please confirm:');
      console.log('   1. Your GitHub repository is Private');
      console.log('   2. You trust the repository access controls');
      console.log('   3. You understand the potential leak risks\n');
      
      const confirm = await this.askQuestion('   Confirm backing up sensitive info? (y/n): ', (v) => ['y', 'n', 'Y', 'N'].includes(v.trim()));
      
      if (confirm.toLowerCase() !== 'y') {
        // Remove sensitive options
        BACKUP_CATEGORIES
          .filter(cat => cat.sensitive)
          .forEach(cat => this.selectedCategories.delete(cat.id));
        
        console.log('\n✅ Sensitive info options removed\n');
      }
    }

    // Final confirmation
    const finalConfirm = await this.askQuestion('   Confirm final selection? (Y/n)', (v) => ['', 'y', 'n', 'Y', 'N'].includes(v.trim()), '', 'Y');
    
    if (finalConfirm.toLowerCase() === 'n') {
      return this.selectBackupContent();
    }

    // Save to config
    this.config.backup.content = Array.from(this.selectedCategories);
  }

  // Run setup wizard
  async runWizard() {
    printHeader('Configure Backup');

    // Step 1: GitHub repository
    console.log('\n📝 Step 1: GitHub Repository Configuration\n');
    this.config.repo = await this.askQuestion(
      '❓ GitHub repository name (format: owner/repo)\n   Example: hanxueyuan/openclaw-backup',
      (v) => v.includes('/'),
      'Repository format should be owner/repo, e.g.: hanxueyuan/openclaw-backup'
    );

    this.config.branch = await this.askQuestion(
      '\n❓ Branch name',
      (v) => v.length > 0,
      'Branch name cannot be empty',
      'main'
    );

    // Step 2: Authentication method
    console.log('\n📝 Step 2: Authentication Method\n');
    console.log('   1. Use GITHUB_TOKEN environment variable (recommended)');
    console.log('   2. Enter token manually (this session only)\n');
    
    const authChoice = await this.askQuestion('   Choose [1-2]: ', (v) => ['1', '2'].includes(v.trim()));
    this.config.auth.method = authChoice === '1' ? 'env' : 'manual';

    // Step 3: Select backup content
    console.log('\n📝 Step 3: Select Backup Content\n');
    await this.selectBackupContent();

    // Step 4: Confirm configuration
    console.log('\n📝 Step 4: Confirm Configuration\n');
    printDivider();
    console.log('\n📊 Configuration Summary\n');
    console.log(`   Repository: ${this.config.repo}`);
    console.log(`   Branch: ${this.config.branch}`);
    console.log(`   Auth: ${this.config.auth.method === 'env' ? 'GITHUB_TOKEN' : 'Manual input'}`);
    console.log(`   Backup content (${this.config.backup.content.length} items):`);
    
    for (const catId of this.config.backup.content) {
      const cat = BACKUP_CATEGORIES.find(c => c.id === catId);
      const icon = cat?.sensitive ? '🔴' : (cat?.warning ? '⚠️' : '✅');
      console.log(`      ${icon} ${cat?.name || catId}`);
    }
    
    console.log(`\n   Created: ${this.config.createdAt}\n`);
    printDivider();

    const confirm = await this.askQuestion('\n   Confirm configuration? (y/n): ', (v) => ['y', 'n', 'Y', 'N'].includes(v.trim()));
    
    if (confirm.toLowerCase() === 'y') {
      ensureConfigDir();
      await saveConfig(this.config);
      
      printSuccess('\nConfiguration saved!\n');
      console.log('📌 Next steps:\n');
      console.log('   1. Run your first backup:');
      console.log('      openclaw skill run claw-migrate backup\n');
      console.log('   2. View configuration:');
      console.log('      openclaw skill run claw-migrate config\n');
      console.log('   3. Modify configuration:');
      console.log('      openclaw skill run claw-migrate config --edit\n');
    } else {
      printWarning('\nConfiguration cancelled\n');
      console.log('   Run when ready: openclaw skill run claw-migrate setup\n');
    }
  }

  // Run restore wizard
  async runRestoreWizard() {
    printHeader('Restore Configuration');

    console.log('\n📝 Step 1: GitHub Repository Configuration\n');
    const repo = await this.askQuestion(
      '❓ GitHub repository name (format: owner/repo)',
      (v) => v.includes('/'),
      'Repository format should be owner/repo'
    );

    const branch = await this.askQuestion(
      '\n❓ Branch name',
      (v) => v.length > 0,
      'Branch name cannot be empty',
      'main'
    );

    console.log('\n📝 Step 2: Authentication Method\n');
    console.log('   1. Use GITHUB_TOKEN environment variable (recommended)');
    console.log('   2. Enter token manually\n');
    
    const authChoice = await this.askQuestion('   Choose [1-2]: ', (v) => ['1', '2'].includes(v.trim()));

    const tempConfig = {
      repo,
      branch,
      auth: { method: authChoice === '1' ? 'env' : 'manual' }
    };

    console.log('\n✅ Configuration complete! Starting restore...\n');
    
    const { RestoreExecutor } = require('./restore');
    const executor = new RestoreExecutor(tempConfig, { verbose: false, dryRun: false });
    await executor.init();
    await executor.execute();
  }
}

module.exports = { SetupWizard, BACKUP_CATEGORIES };
