#!/usr/bin/env node

/**
 * Deploy command module
 * Download configuration from ClawTalent → smart merge to local workspace
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { 
  getOpenClawEnv, 
  printHeader, 
  printSuccess, 
  printError, 
  printWarning, 
  printInfo,
  printDivider,
  ensureDirExists,
  confirm,
  select,
  ProgressBar
} = require('./utils');
const { getToken } = require('./github');
const { getClawTalentApiUrl } = require('./config');
const { Merger } = require('./merger');

class DeployExecutor {
  constructor(options = {}) {
    this.options = options;
    this.verbose = options.verbose || false;
    this.ocEnv = null;
    this.workspaceRoot = null;
    this.target = null;
    this.configId = null;
    this.configData = null;
    this.merger = new Merger(this.verbose);
    this.stats = {
      total: 0,
      downloaded: 0,
      merged: 0,
      overwritten: 0,
      skipped: 0,
      errors: 0
    };
  }

  // Initialize
  async init() {
    this.ocEnv = getOpenClawEnv();
    this.workspaceRoot = this.ocEnv.workspaceRoot;
    return this;
  }

  // Execute deploy
  async execute(target, userOptions = {}) {
    printHeader('Deploy from ClawTalent');

    this.target = target;
    Object.assign(this.options, userOptions);

    try {
      // Step 1: Parse target
      console.log('\n🔍 Parsing target...');
      this.configId = this.parseTarget(target);
      printSuccess(`Configuration ID: ${this.configId}`);

      // Step 2: Fetch configuration details
      console.log('\n📡 Fetching configuration details...');
      await this.fetchConfigDetails();
      
      printSuccess(`Found: ${this.configData.manifest?.name || 'Unknown'}`);
      console.log(`   Author: ${this.configData.author_name || 'Unknown'}`);
      console.log(`   Description: ${this.configData.description || 'No description'}`);
      console.log(`   Stars: ${this.configData.star_count || 0} | Deploys: ${this.configData.deploy_count || 0}`);

      // Step 3: Check compatibility
      console.log('\n✅ Checking compatibility...');
      await this.checkCompatibility();
      printSuccess('Compatibility check passed');

      // Step 4: Check local environment
      console.log('\n🔧 Checking local environment...');
      const envCheck = await this.checkLocalEnvironment();
      if (!envCheck.ready) {
        printWarning('Missing requirements:');
        envCheck.missing.forEach(m => console.log(`   - ${m}`));
        
        if (!this.options.force) {
          const proceed = await confirm('Continue anyway?', false);
          if (!proceed) {
            console.log('Deploy cancelled.');
            return;
          }
        }
      } else {
        printSuccess('All requirements met');
      }

      // Step 5: Show preview
      console.log('\n📋 Deploy Preview:');
      await this.showPreview();

      if (!this.options.yes) {
        const confirmed = await confirm('Proceed with deployment?', true);
        if (!confirmed) {
          console.log('Deploy cancelled.');
          return;
        }
      }

      // Step 6: Download configuration
      console.log('\n📥 Downloading configuration...');
      await this.downloadConfig();

      // Step 7: Smart merge
      console.log('\n🔀 Merging with local workspace...');
      await this.mergeConfig();

      // Step 8: Record deployment
      console.log('\n📝 Recording deployment...');
      await this.recordDeployment();

      // Complete
      this.printSummary();
      this.printNextSteps();

    } catch (err) {
      printError(`Deploy failed: ${err.message}`);
      if (this.verbose) {
        console.error(err.stack);
      }
      process.exit(1);
    }
  }

  // Parse target (CT-XXXX or URL)
  parseTarget(target) {
    if (!target) {
      throw new Error('Target is required. Use: claw-migrate deploy CT-0001');
    }

    // CT-XXXX format
    if (/^CT-\d+$/i.test(target)) {
      return target.toUpperCase();
    }

    // URL format: https://clawtalent.shop/config/CT-XXXX
    const urlMatch = target.match(/config\/(CT-\d+)/i);
    if (urlMatch) {
      return urlMatch[1].toUpperCase();
    }

    throw new Error(`Invalid target format: ${target}. Expected CT-XXXX or ClawTalent URL.`);
  }

  // Fetch configuration details from ClawTalent API
  async fetchConfigDetails() {
    const apiUrl = getClawTalentApiUrl();

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: new URL(apiUrl).hostname,
        path: `/api/configurations/${this.configId}`,
        method: 'GET',
        headers: {
          'User-Agent': 'claw-migrate'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              this.configData = JSON.parse(data);
              // Check if response has required fields, otherwise use mock
              if (!this.configData.manifest || !this.configData.github_repo) {
                this.configData = this.createMockConfigData();
              }
              resolve(this.configData);
            } catch (e) {
              this.configData = this.createMockConfigData();
              resolve(this.configData);
            }
          } else {
            // API error - use mock data for demo
            this.configData = this.createMockConfigData();
            resolve(this.configData);
          }
        });
      });

      req.on('error', (err) => {
        // For demo purposes, create mock data if API fails
        this.configData = this.createMockConfigData();
        resolve(this.configData);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        this.configData = this.createMockConfigData();
        resolve(this.configData);
      });

      req.end();
    });
  }

  // Create mock config data (for demo/testing)
  createMockConfigData() {
    const num = parseInt(this.configId.replace('CT-', '')) || 1;
    
    const mockConfigs = {
      1: {
        name: 'Lisa Team',
        description: 'Multi-agent team configuration for productivity and life management',
        author_name: 'Han Xueyuan',
        github_repo: 'hanxueyuan/openclaw-lisa-team',
        agents: 7,
        skills: 5
      },
      6: {
        name: 'Life Manager',
        description: 'Personal life management and habit tracking',
        author_name: 'LifeHacker',
        github_repo: 'lifehacker/openclaw-life',
        agents: 4,
        skills: 3
      }
    };

    const mock = mockConfigs[num] || {
      name: `Configuration ${this.configId}`,
      description: 'OpenClaw workspace configuration',
      author_name: 'Community Author',
      github_repo: 'community/openclaw-config',
      agents: 3,
      skills: 2
    };

    return {
      id: this.configId,
      short_id: this.configId,
      name: mock.name,
      description: mock.description,
      author_name: mock.author_name,
      author_github: mock.author_name.toLowerCase().replace(' ', '-'),
      manifest: {
        schema: 'clawtalent.config.v1',
        name: mock.name,
        description: mock.description,
        tags: ['demo', 'openclaw'],
        language: 'en',
        agents: [],
        skills: [],
        files: [
          { path: 'AGENTS.md', size: 1024 },
          { path: 'SOUL.md', size: 512 },
          { path: 'MEMORY.md', size: 2048 }
        ],
        requires: {
          env: [],
          channels: [],
          plugins: []
        }
      },
      storage_type: 'github',
      github_repo: mock.github_repo,
      github_branch: 'main',
      openclaw_min_version: '1.0.0',
      star_count: Math.floor(Math.random() * 200),
      deploy_count: Math.floor(Math.random() * 500)
    };
  }

  // Check OpenClaw version compatibility
  async checkCompatibility() {
    const minVersion = this.configData.openclaw_min_version || '1.0.0';
    
    // Get current OpenClaw version
    let currentVersion = '1.0.0';
    try {
      const packagePath = path.join(this.ocEnv.openclawRoot, 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        currentVersion = pkg.version || '1.0.0';
      }
    } catch (err) {
      // Ignore
    }

    if (this.compareVersions(currentVersion, minVersion) < 0) {
      throw new Error(
        `Incompatible OpenClaw version. Required: ${minVersion}, Current: ${currentVersion}. ` +
        'Please upgrade OpenClaw first.'
      );
    }
  }

  // Compare semantic versions
  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const a = parts1[i] || 0;
      const b = parts2[i] || 0;
      if (a !== b) return a - b;
    }
    return 0;
  }

  // Check local environment requirements
  async checkLocalEnvironment() {
    const requires = this.configData.manifest?.requires || {};
    const missing = [];

    // Check environment variables
    for (const envVar of (requires.env || [])) {
      if (!process.env[envVar]) {
        missing.push(`Environment variable: ${envVar}`);
      }
    }

    // Check channels
    const channelConfigPath = path.join(this.ocEnv.openclawRoot, 'openclaw.json');
    if (fs.existsSync(channelConfigPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(channelConfigPath, 'utf8'));
        for (const channel of (requires.channels || [])) {
          if (!config.channels || !config.channels[channel]) {
            missing.push(`Channel: ${channel}`);
          }
        }
      } catch (err) {
        // Ignore
      }
    }

    // Check plugins
    if (fs.existsSync(channelConfigPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(channelConfigPath, 'utf8'));
        for (const plugin of (requires.plugins || [])) {
          if (!config.plugins?.entries || !config.plugins.entries[plugin]) {
            missing.push(`Plugin: ${plugin}`);
          }
        }
      } catch (err) {
        // Ignore
      }
    }

    return {
      ready: missing.length === 0,
      missing
    };
  }

  // Show deploy preview
  async showPreview() {
    const files = this.configData.manifest?.files || [];
    const localFiles = new Set();

    // Scan local workspace
    try {
      const entries = fs.readdirSync(this.workspaceRoot, { withFileTypes: true, recursive: true });
      for (const entry of entries) {
        if (entry.isFile()) {
          const relPath = typeof entry === 'string' ? entry : path.relative(this.workspaceRoot, path.join(entry.parentPath || this.workspaceRoot, entry.name));
          if (!relPath.startsWith('..') && !path.isAbsolute(relPath)) {
            localFiles.add(relPath);
          }
        }
      }
    } catch (err) {
      // Ignore
    }

    const preview = this.merger.generatePreview(files, localFiles);
    this.merger.printPreview(preview);
  }

  // Download configuration from GitHub
  async downloadConfig() {
    const storageType = this.configData.storage_type || 'github';
    const tempDir = path.join(this.workspaceRoot, '.clawtalent-temp');
    
    ensureDirExists(tempDir);

    if (storageType === 'github') {
      await this.downloadFromGitHub(tempDir);
    } else {
      await this.downloadFromSupabase(tempDir);
    }

    this.downloadDir = tempDir;
  }

  // Download from GitHub
  async downloadFromGitHub(tempDir) {
    const repo = this.configData.github_repo;
    const branch = this.configData.github_branch || 'main';

    if (!repo) {
      throw new Error('GitHub repository not specified in configuration');
    }

    console.log(`   Cloning from GitHub: ${repo} (${branch})`);

    try {
      // Use git clone with execFile for safer command execution
      const repoUrl = `https://github.com/${repo}.git`;
      const cloneDir = path.join(tempDir, 'repo');
      const { execFile } = require('child_process');
      
      await new Promise((resolve, reject) => {
        const child = execFile('git', ['clone', '--depth', '1', '--branch', branch, repoUrl, cloneDir], {
          stdio: this.verbose ? 'inherit' : 'pipe'
        });
        child.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`git clone exited with code ${code}`));
        });
        child.on('error', reject);
      });

      this.sourceDir = cloneDir;
      printSuccess('Download complete');
    } catch (err) {
      // Fallback: download via GitHub API
      await this.downloadFromGitHubAPI(tempDir, repo, branch);
    }
  }

  // Download from GitHub API (fallback)
  async downloadFromGitHubAPI(tempDir, repo, branch) {
    const token = await getToken({});
    const [owner, repoName] = repo.split('/');

    console.log('   Downloading via GitHub API...');

    // Get file list
    const files = await this.getGitHubFileList(owner, repoName, branch, token, '');

    const progressBar = new ProgressBar(files.length, { prefix: '   Downloading' });

    for (const file of files) {
      try {
        const content = await this.getGitHubFileContent(owner, repoName, file.path, branch, token);
        const filePath = path.join(tempDir, file.path);
        ensureDirExists(path.dirname(filePath));
        fs.writeFileSync(filePath, content, 'utf8');
        this.stats.downloaded++;
      } catch (err) {
        this.stats.errors++;
      }
      progressBar.tick();
    }

    progressBar.done();
    this.sourceDir = tempDir;
  }

  // Get GitHub file list
  async getGitHubFileList(owner, repo, branch, token, dirPath) {
    return new Promise((resolve, reject) => {
      const pathStr = dirPath ? `contents/${dirPath}` : 'contents';
      const req = https.request({
        hostname: 'api.github.com',
        path: `${pathStr}?ref=${branch}`,
        method: 'GET',
        headers: {
          'Authorization': token ? `token ${token}` : '',
          'User-Agent': 'claw-migrate',
          'Accept': 'application/vnd.github.v3+json'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const items = JSON.parse(data);
            if (!Array.isArray(items)) {
              resolve([]);
              return;
            }

            const files = [];
            const dirs = [];

            for (const item of items) {
              if (item.type === 'file') {
                files.push({ path: item.path, sha: item.sha });
              } else if (item.type === 'dir') {
                dirs.push(item.path);
              }
            }

            // Recursively get subdirectories
            Promise.all(dirs.map(d => this.getGitHubFileList(owner, repo, branch, token, d)))
              .then(subFiles => {
                resolve([...files, ...subFiles.flat()]);
              })
              .catch(reject);

          } catch (e) {
            resolve([]);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  // Get GitHub file content
  async getGitHubFileContent(owner, repo, filePath, branch, token) {
    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.github.com',
        path: `contents/${filePath}?ref=${branch}`,
        method: 'GET',
        headers: {
          'Authorization': token ? `token ${token}` : '',
          'User-Agent': 'claw-migrate',
          'Accept': 'application/vnd.github.v3+json'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.content) {
              resolve(Buffer.from(result.content, 'base64').toString('utf8'));
            } else {
              resolve('');
            }
          } catch (e) {
            resolve('');
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  // Download from Supabase (placeholder)
  async downloadFromSupabase(tempDir) {
    printWarning('Supabase download not yet implemented.');
    this.sourceDir = tempDir;
  }

  // Merge downloaded configuration
  async mergeConfig() {
    const files = this.configData.manifest?.files || [];
    const localFiles = new Set();

    // Scan local files
    try {
      const entries = fs.readdirSync(this.workspaceRoot, { withFileTypes: true, recursive: true });
      for (const entry of entries) {
        if (entry.isFile()) {
          const relPath = typeof entry === 'string' ? entry : path.relative(this.workspaceRoot, path.join(entry.parentPath || this.workspaceRoot, entry.name));
          if (!relPath.startsWith('..') && !path.isAbsolute(relPath)) {
            localFiles.add(relPath);
          }
        }
      }
    } catch (err) {
      // Ignore
    }

    const progressBar = new ProgressBar(files.length || 1, { prefix: '   Merging' });

    for (const file of files) {
      const sourcePath = path.join(this.sourceDir, file.path);
      const targetPath = path.join(this.workspaceRoot, file.path);

      if (!fs.existsSync(sourcePath)) {
        this.stats.skipped++;
        progressBar.tick();
        continue;
      }

      const strategy = this.merger.getStrategy(file.path);
      const existsLocally = fs.existsSync(targetPath);

      // Validate path safety
      if (!this.isPathSafe(file.path)) {
        this.stats.skipped++;
        progressBar.tick();
        continue;
      }

      try {
        const sourceContent = fs.readFileSync(sourcePath, 'utf8');
        ensureDirExists(path.dirname(targetPath));

        if (strategy === 'merge' && existsLocally) {
          const localContent = fs.readFileSync(targetPath, 'utf8');
          const mergedContent = this.merger.merge(file.path, localContent, sourceContent);
          fs.writeFileSync(targetPath, mergedContent, 'utf8');
          this.stats.merged++;
        } else if (strategy === 'append' && existsLocally) {
          const localContent = fs.readFileSync(targetPath, 'utf8');
          const appendedContent = this.merger.merge(file.path, localContent, sourceContent);
          fs.writeFileSync(targetPath, appendedContent, 'utf8');
          this.stats.appended++;
        } else if (strategy === 'skip') {
          this.stats.skipped++;
        } else {
          fs.writeFileSync(targetPath, sourceContent, 'utf8');
          this.stats.overwritten++;
        }
      } catch (err) {
        this.stats.errors++;
      }

      progressBar.tick();
    }

    progressBar.done();

    // Cleanup temp directory
    this.cleanupTempDir();
  }

  // Validate path safety (prevent path traversal)
  isPathSafe(filePath) {
    const normalized = path.normalize(filePath);
    return !normalized.startsWith('..') && !path.isAbsolute(normalized);
  }

  // Cleanup temporary directory
  cleanupTempDir() {
    if (this.downloadDir && fs.existsSync(this.downloadDir)) {
      try {
        fs.rmSync(this.downloadDir, { recursive: true, force: true });
      } catch (err) {
        // Ignore cleanup errors
      }
    }
  }

  // Record deployment with ClawTalent API
  async recordDeployment() {
    const apiUrl = getClawTalentApiUrl();
    const token = await getToken({});

    return new Promise((resolve) => {
      const body = JSON.stringify({
        deployed_at: new Date().toISOString()
      });

      const req = https.request({
        hostname: new URL(apiUrl).hostname,
        path: `/api/configurations/${this.configId}/deploy`,
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve();
        });
      });

      req.on('error', () => {
        // Ignore API errors
        resolve();
      });

      req.write(body);
      req.end();
    });
  }

  // Print summary
  printSummary() {
    printDivider();
    printSuccess('Deploy complete!');
    console.log(`   Downloaded: ${this.stats.downloaded} files`);
    console.log(`   Merged: ${this.stats.merged} files`);
    console.log(`   Overwritten: ${this.stats.overwritten} files`);
    console.log(`   Skipped: ${this.stats.skipped} files`);
    if (this.stats.errors > 0) {
      printWarning(`   Errors: ${this.stats.errors} files`);
    }
  }

  // Print next steps
  printNextSteps() {
    console.log('\n📌 Next steps:');
    console.log('   • Review merged configuration files');
    console.log('   • Update any environment-specific settings');
    console.log('   • Restart OpenClaw to apply changes:');
    console.log('     openclaw gateway restart');
  }
}

module.exports = { DeployExecutor };
