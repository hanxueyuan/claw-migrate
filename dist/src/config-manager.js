#!/usr/bin/env node

/**
 * Configuration manager module
 * View, modify, and reset configuration
 */

const readline = require('readline');
const { loadConfig, saveConfig, deleteConfig } = require('./config');
const { printHeader, printSuccess, printError, printWarning, printDivider } = require('./utils');
const { BACKUP_CATEGORIES } = require('./setup');

class ConfigManager {
  constructor() {
    this.config = null;
  }

  // Initialize
  async init() {
    this.config = await loadConfig();
    return this;
  }

  // Show configuration
  async showConfig() {
    printHeader('Current Configuration');
    
    if (!this.config) {
      console.log('\n⚠️  Config file not found\n');
      console.log('   Please run: openclaw skill run claw-migrate setup\n');
      return;
    }
    
    console.log('\n📋 Configuration\n');
    console.log(`   Repository: ${this.config.repo}`);
    console.log(`   Branch: ${this.config.branch}`);
    console.log(`   Auth: ${this.config.auth?.method || 'env'}`);
    
    console.log(`   Backup content:`);
    if (this.config.backup?.content?.length > 0) {
      for (const catId of this.config.backup.content) {
        const cat = BACKUP_CATEGORIES.find(c => c.id === catId);
        const name = cat ? cat.name : catId;
        console.log(`      • ${name}`);
      }
    } else {
      console.log(`      (none selected)`);
    }
    
    console.log(`   Created: ${new Date(this.config.createdAt).toLocaleString()}`);
    console.log(`   Updated: ${new Date(this.config.updatedAt).toLocaleString()}\n`);
  }

  // Edit configuration
  async editConfig() {
    printHeader('Edit Configuration');
    
    if (!this.config) {
      console.log('\n⚠️  Config file not found\n');
      console.log('   Please run: openclaw skill run claw-migrate setup\n');
      return;
    }
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const question = (query) => new Promise((resolve) => {
      rl.question(query, resolve);
    });
    
    try {
      console.log('\n📝 Edit Configuration\n');
      console.log(`   Current repository: ${this.config.repo}`);
      console.log(`   Current branch: ${this.config.branch}\n`);
      
      const repo = await question(`   New repository name (press Enter to keep current): `);
      if (repo.trim()) {
        this.config.repo = repo.trim();
      }
      
      const branch = await question(`   New branch name (press Enter to keep current): `);
      if (branch.trim()) {
        this.config.branch = branch.trim();
      }
      
      const confirm = await question('\n   Confirm save? (y/n): ');
      if (confirm.trim().toLowerCase() === 'y') {
        this.config.updatedAt = new Date().toISOString();
        await saveConfig(this.config);
        printSuccess('\nConfiguration updated!\n');
      } else {
        console.log('\n⚠️  Edit cancelled\n');
      }
      
    } catch (err) {
      printError(`Edit failed: ${err.message}`);
    } finally {
      rl.close();
    }
  }

  // Reset configuration
  async resetConfig() {
    printHeader('Reset Configuration');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const question = (query) => new Promise((resolve) => {
      rl.question(query, resolve);
    });
    
    try {
      console.log('\n⚠️  Warning: This will delete all configuration\n');
      
      const confirm = await question('   Confirm reset? (y/n): ');
      
      if (confirm.trim().toLowerCase() === 'y') {
        await deleteConfig();
        printSuccess('\nConfiguration reset!\n');
        console.log('   Please run: openclaw skill run claw-migrate setup\n');
      } else {
        console.log('\n⚠️  Reset cancelled\n');
      }
      
    } catch (err) {
      printError(`Reset failed: ${err.message}`);
    } finally {
      rl.close();
    }
  }

  // Show status
  async showStatus() {
    printHeader('Backup Status');
    
    if (!this.config) {
      console.log('\n⚠️  Backup not configured\n');
      console.log('   Please run: openclaw skill run claw-migrate setup\n');
      return;
    }
    
    console.log('\n📊 Status\n');
    console.log(`   Repository: ${this.config.repo}`);
    console.log(`   Branch: ${this.config.branch}`);
    console.log(`   Status: ✅ Configured`);
    console.log(`   Backup frequency: ${this.config.backup?.frequency || 'manual'}\n`);
    
    console.log('💡 Tips:');
    console.log('   • Run backup: openclaw skill run claw-migrate backup');
    console.log('   • Run restore: openclaw skill run claw-migrate restore');
    console.log('   • Edit config: openclaw skill run claw-migrate config --edit\n');
  }
}

module.exports = { ConfigManager };
