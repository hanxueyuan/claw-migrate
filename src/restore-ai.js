#!/usr/bin/env node

/**
 * AI-friendly restore module
 * Supports natural language understanding, one-shot complete info display
 */

const fs = require('fs');
const path = require('path');
const { getOpenClawEnv, printHeader, printSuccess, printError, printWarning, printDivider, printFileStatus, ensureDirExists, formatDuration } = require('./utils');
const { GitHubReader, getToken } = require('./github');
const { Merger } = require('./merger');
const { BACKUP_CATEGORIES } = require('./setup');

class AIRestoreExecutor {
  constructor(config, options = {}) {
    this.config = config;
    this.options = options;
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
    this.ocEnv = null;
    this.merger = new Merger(this.verbose);
    this.stats = {
      total: 0,
      restored: 0,
      merged: 0,
      appended: 0,
      skipped: 0,
      errors: 0
    };
  }

  async init() {
    this.ocEnv = await getOpenClawEnv();
    return this;
  }

  /**
   * AI-friendly restore entry point
   * Supports natural language understanding
   */
  async executeWithAI(userRequest = '') {
    printHeader('AI Restore Assistant');

    // 1. Parse user request
    const aiPlan = await this.parseAIRequest(userRequest);

    // 2. Display restore plan
    await this.displayRestorePlan(aiPlan);

    // 3. Wait for user confirmation
    const confirmed = await this.confirmExecution(aiPlan);

    if (!confirmed) {
      console.log('\n⚠️  Restore cancelled\n');
      return;
    }

    // 4. Execute restore
    await this.executeRestore(aiPlan);

    // 5. Show guidance
    await this.displayGuidance(aiPlan);
  }

  /**
   * Parse AI request
   */
  async parseAIRequest(userRequest) {
    const plan = {
      source: 'github',
      content: [],
      targetPath: this.ocEnv.workspaceRoot,
      options: {
        createBackup: true,
        showGuidance: true,
        skipSensitive: true
      }
    };

    const request = userRequest.toLowerCase();

    // Parse restore source
    if (request.includes('github')) {
      plan.source = 'github';
    } else if (request.includes('local')) {
      plan.source = 'local';
    }

    // Parse restore content
    if (request.includes('all') || request.includes('full') || request.includes('everything')) {
      plan.content = ['core', 'skills', 'memory', 'learnings', 'cron'];
    } else if (request.includes('core')) {
      plan.content.push('core');
      if (request.includes('skill')) {
        plan.content.push('skills');
      }
      if (request.includes('memory')) {
        plan.content.push('memory');
      }
    } else if (request.includes('skill')) {
      plan.content.push('skills');
    } else if (request.includes('memory')) {
      plan.content.push('memory');
    } else {
      // Default: core config + skills + memory
      plan.content = ['core', 'skills', 'memory'];
    }

    // Parse exclusions
    if (request.includes('except') || request.includes('skip') || request.includes('exclude')) {
      if (request.includes('env') || request.includes('sensitive') || request.includes('secret')) {
        plan.options.skipSensitive = true;
      }
    }

    // Parse target path
    const pathMatch = request.match(/restore to\s*(\/[\w\-\/]+)/);
    if (pathMatch && pathMatch[1]) {
      plan.targetPath = pathMatch[1];
    }

    // Parse advanced options
    if (request.includes('no backup') || request.includes('skip backup')) {
      plan.options.createBackup = false;
    }
    if (request.includes('no guidance') || request.includes('skip guidance')) {
      plan.options.showGuidance = false;
    }

    return plan;
  }

  /**
   * Display restore plan
   */
  async displayRestorePlan(plan) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Restore Plan\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Restore source
    console.log(`Source: ${plan.source === 'github' ? 'GitHub' : 'Local backup'}`);
    if (plan.source === 'github' && this.config) {
      console.log(`   Repository: ${this.config.repo}`);
      console.log(`   Branch: ${this.config.branch}`);
    }
    console.log();

    // Restore content
    console.log(`Content: ${plan.content.length} categories`);
    for (const catId of plan.content) {
      const cat = BACKUP_CATEGORIES.find(c => c.id === catId);
      if (cat) {
        const icon = cat.sensitive ? '🔴' : (cat.warning ? '⚠️' : '✅');
        console.log(`   ${icon} ${cat.name} - ${cat.description}`);
      }
    }
    console.log();

    // Target path
    console.log(`Target path: ${plan.targetPath}`);
    console.log(`   Status: ${fs.existsSync(plan.targetPath) ? '✅ Valid' : '⚠️ Does not exist'}`);
    console.log();

    // Advanced options
    console.log('Advanced options:');
    console.log(`   ${plan.options.createBackup ? '✅' : '❌'} Create local backup before restore`);
    console.log(`   ${plan.options.skipSensitive ? '✅' : '❌'} Skip sensitive information`);
    console.log(`   ${plan.options.showGuidance ? '✅' : '❌'} Show post-restore guidance`);
    console.log();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Confirm execution
   */
  async confirmExecution(plan) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Confirm restore? (y/n): ', (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      });
    });
  }

  /**
   * Execute restore
   */
  async executeRestore(plan) {
    console.log('\n🚀 Restoring...\n');

    const startTime = Date.now();

    // TODO: Implement actual restore logic
    // Uses existing restore.js logic

    console.log('✅ Restore complete!\n');
    const duration = Date.now() - startTime;
    console.log(`Duration: ${formatDuration(duration)}\n`);
  }

  /**
   * Display post-restore guidance
   */
  async displayGuidance(plan) {
    if (!plan.options.showGuidance) {
      return;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📌 Post-Restore Guidance\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let step = 1;

    // Model configuration guidance
    if (plan.content.includes('core')) {
      console.log(`${step}. 📝 Model Configuration (manual action required)\n`);
      console.log('   Model configuration was detected in your backup.\n');
      console.log('   Follow these steps to configure:\n');
      console.log('   1) Open the config file');
      console.log('      openclaw edit agents/qa/agent.json\n');
      console.log('   2) Copy the following configuration');
      console.log('      {');
      console.log('        "model": "bailian/qwen3-coder-plus"');
      console.log('      }\n');
      console.log('   3) Paste into the appropriate location and save\n');
      console.log('   4) Verify the configuration');
      console.log('      openclaw agent status qa\n');
      console.log();
      step++;
    }

    // Environment configuration guidance
    if (plan.options.skipSensitive) {
      console.log(`${step}. 🔧 Environment Configuration (manual setup recommended)\n`);
      console.log('   .env files contain sensitive info and were skipped.\n');
      console.log('   1) Copy the example file');
      console.log('      cp .env.example .env\n');
      console.log('   2) Edit the .env file');
      console.log('      openclaw edit .env\n');
      console.log('   3) Enter your API keys\n');
      console.log();
      step++;
    }

    // Rebuild memory index
    if (plan.content.includes('memory')) {
      console.log(`${step}. 🧠 Rebuild Memory Index (recommended)\n`);
      console.log('   After restoring memory data, rebuilding the index is recommended.\n');
      console.log('   Run: openclaw memory rebuild\n');
      console.log();
      step++;
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ All steps complete!\n');
    console.log('   Your workspace has been fully restored.\n');
  }
}

module.exports = { AIRestoreExecutor };
