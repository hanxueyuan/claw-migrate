#!/usr/bin/env node

/**
 * claw-migrate - OpenClaw workspace backup & restore tool
 * 
 * Simplified main entry point (refactored)
 */

const { printHeader, printError, printSuccess } = require('./utils');
const { loadConfig, configExists } = require('./config');
const { SetupWizard } = require('./setup');

// Command line argument parsing
function parseArgs(args) {
  const options = {
    command: null,
    verbose: false,
    dryRun: false,
    edit: false,
    reset: false,
    force: false,
    yes: false,
    limit: 20,
    tags: null
  };

  let command = null;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    // Commands (positional or with dash)
    if (arg === 'setup' || arg === '--setup') {
      command = 'setup';
    } else if (arg === 'backup' || arg === '--backup') {
      command = 'backup';
    } else if (arg === 'restore' || arg === '--restore') {
      command = 'restore';
    } else if (arg === 'config' || arg === '--config') {
      command = 'config';
    } else if (arg === 'status' || arg === '--status') {
      command = 'status';
    } else if (arg === 'share' || arg === '--share') {
      command = 'share';
    } else if (arg === 'deploy' || arg === '--deploy') {
      command = 'deploy';
    } else if (arg === 'search' || arg === '--search') {
      command = 'search';
    } else if (arg === '--edit') {
      options.edit = true;
    } else if (arg === '--reset') {
      options.reset = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--force' || arg === '-f') {
      options.force = true;
    } else if (arg === '--yes' || arg === '-y') {
      options.yes = true;
    } else if (arg === '--limit') {
      options.limit = parseInt(args[++i]) || 20;
    } else if (arg === '--tags') {
      options.tags = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith('-') && !command) {
      // First non-dash argument is the command
      command = arg;
    }
  }

  options.command = command;
  options.args = args.filter(a => !a.startsWith('-') && 
    !['setup', 'backup', 'restore', 'config', 'status', 'share', 'deploy', 'search'].includes(a)
  );

  return options;
}

function printHelp() {
  console.log(`
claw-migrate - OpenClaw workspace backup & restore tool

Usage:
  openclaw skill run claw-migrate [command] [options]

Commands:
  🔵 setup       Start the setup wizard
  🔵 backup      Back up to GitHub
  🟢 restore     Restore from GitHub
  🟣 share       Share to ClawTalent platform
  🟠 deploy      Deploy from ClawTalent (CT-XXXX)
  🔍 search      Search ClawTalent configurations
  📋 config      View config (--edit to modify, --reset to reset)
  📊 status      View status

Options:
  --dry-run     Preview mode, no actual writes
  --verbose, -v Verbose output
  --force, -f   Force operation (skip checks)
  --yes, -y     Auto-confirm prompts
  --limit       Search result limit (default: 20)
  --tags        Filter by tags (comma-separated)
  --help, -h    Show help

Examples:
  openclaw skill run claw-migrate setup
  openclaw skill run claw-migrate backup
  openclaw skill run claw-migrate restore
  openclaw skill run claw-migrate share --dry-run
  openclaw skill run claw-migrate deploy CT-1001
  openclaw skill run claw-migrate search "multi-agent" --tags tech
  openclaw skill run claw-migrate config --edit
`);
}

// Execute command
async function executeCommand(command, options) {
  switch (command) {
    case 'setup': {
      const wizard = new SetupWizard();
      await wizard.runWizard();
      wizard.close();
      break;
    }

    case 'backup': {
      const { BackupExecutor } = require('./backup');
      const config = await loadConfig();
      
      if (!config) {
        printError('Error: Config file not found');
        console.log('   Please run first: openclaw skill run claw-migrate setup');
        process.exit(1);
      }
      
      const backup = new BackupExecutor(config, options);
      await backup.init();
      await backup.execute();
      break;
    }

    case 'restore': {
      const { AIRestoreExecutor } = require('./restore-ai');
      const config = await loadConfig();
      
      // AI-friendly restore: supports natural language
      const userRequest = process.argv.slice(2).join(' ');
      
      const restore = new AIRestoreExecutor(config, options);
      await restore.init();
      await restore.executeWithAI(userRequest);
      break;
    }

    case 'share': {
      const { ShareExecutor } = require('./share');
      const share = new ShareExecutor(options);
      await share.init();
      await share.execute();
      break;
    }

    case 'deploy': {
      const { DeployExecutor } = require('./deploy');
      const deploy = new DeployExecutor(options);
      await deploy.init();
      const target = options.args[0];
      await deploy.execute(target, options);
      break;
    }

    case 'search': {
      const { SearchExecutor } = require('./search');
      const search = new SearchExecutor(options);
      const query = options.args.join(' ') || options.tags || '';
      await search.execute(query, options);
      break;
    }

    case 'config': {
      const { ConfigManager } = require('./config-manager');
      const manager = new ConfigManager();
      await manager.init();
      
      if (options.reset) {
        await manager.resetConfig();
      } else if (options.edit) {
        await manager.editConfig();
      } else {
        await manager.showConfig();
      }
      break;
    }

    case 'status': {
      const { ConfigManager } = require('./config-manager');
      const manager = new ConfigManager();
      await manager.init();
      await manager.showStatus();
      break;
    }

    default:
      printHelp();
  }
}

// Main function
async function main() {
  printHeader('claw-migrate');

  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // Show debug info
  if (options.verbose) {
    const { getOpenClawEnv } = require('./utils');
    const env = getOpenClawEnv();
    console.log('OpenClaw Environment:');
    console.log(`  Root: ${env.openclawRoot}`);
    console.log(`  Workspace: ${env.workspaceRoot}\n`);
  }

  // Execute command
  if (options.command) {
    await executeCommand(options.command, options);
    return;
  }

  // No command: show help
  printHelp();
}

// Run
main().catch(err => {
  printError(`Error: ${err.message}`);
  if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
    console.error(err.stack);
  }
  process.exit(1);
});
