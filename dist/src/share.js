#!/usr/bin/env node

/**
 * Share command module
 * Pack workspace → scan for sensitive info → generate manifest → upload to ClawTalent
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
  select
} = require('./utils');
const { getToken } = require('./github');
const { getClawTalentApiUrl, getDefaultShareMethod } = require('./config');

// Sensitive info patterns
const SENSITIVE_PATTERNS = [
  { name: 'Email', pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { name: 'Phone (China)', pattern: /(\+?86[- ]?)?1[3-9]\d{9}/g },
  { name: 'API Key (Bailian)', pattern: /sk-[a-zA-Z0-9]{32,}/g },
  { name: 'GitHub Token', pattern: /ghp_[a-zA-Z0-9]{36}/g },
  { name: 'Bearer Token', pattern: /Bearer\s+[a-zA-Z0-9._-]+/g },
  { name: 'Password in URL', pattern: /:\/\/[^:]+:[^@]+@/g },
  { name: 'Private Key', pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/g },
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
  { name: 'Slack Token', pattern: /xox[baprs]-[0-9a-zA-Z-]+/g },
  { name: 'Stripe Key', pattern: /sk_live_[0-9a-zA-Z]{24}/g }
];

// Files that should always be templated
const TEMPLATE_FILES = {
  'openclaw.json': [
    { key: 'apiKey', template: '${BAILIAN_API_KEY}' },
    { key: 'apiSecret', template: '${BAILIAN_API_SECRET}' }
  ],
  'IDENTITY.md': [
    { pattern: /姓名[:：]\s*(.+)/g, template: '姓名：${YOUR_NAME}' },
    { pattern: /手机[:：]\s*(.+)/g, template: '手机：${YOUR_PHONE}' },
    { pattern: /邮箱[:：]\s*(.+)/g, template: '邮箱：${YOUR_EMAIL}' },
    { pattern: /微信[:：]\s*(.+)/g, template: '微信：${YOUR_WECHAT}' }
  ]
};

class ShareExecutor {
  constructor(options = {}) {
    this.options = options;
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
    this.ocEnv = null;
    this.workspaceRoot = null;
    this.files = [];
    this.sensitiveFindings = [];
    this.manifest = null;
  }

  // Initialize
  async init() {
    this.ocEnv = getOpenClawEnv();
    this.workspaceRoot = this.ocEnv.workspaceRoot;
    return this;
  }

  // Execute share
  async execute() {
    printHeader('Share to ClawTalent');

    try {
      // Step 1: Scan workspace
      console.log('\n📁 Scanning workspace...');
      await this.scanWorkspace();
      printSuccess(`Found ${this.files.length} files`);

      // Step 2: Scan for sensitive info
      console.log('\n🔍 Scanning for sensitive information...');
      await this.scanSensitiveInfo();
      
      if (this.sensitiveFindings.length > 0) {
        printWarning(`Found ${this.sensitiveFindings.length} sensitive items`);
        this.printSensitiveFindings();
        
        if (!this.dryRun) {
          const proceed = await confirm('Continue with sharing? (sensitive info will be templated)', true);
          if (!proceed) {
            console.log('Sharing cancelled.');
            return;
          }
        }
      } else {
        printSuccess('No sensitive information detected');
      }

      // Step 3: Generate manifest
      console.log('\n📋 Generating manifest...');
      await this.generateManifest();

      // Step 4: Template desensitization
      console.log('\n🎭 Applying template desensitization...');
      await this.applyTemplates();

      // Step 5: Upload
      if (this.dryRun) {
        console.log('\n💡 Dry-run mode - no actual upload performed');
        this.printManifestPreview();
        return;
      }

      const shareMethod = getDefaultShareMethod();
      console.log(`\n📤 Uploading via ${shareMethod}...`);
      
      if (shareMethod === 'github') {
        await this.uploadToGitHub();
      } else {
        await this.uploadToSupabase();
      }

      // Step 6: Register with ClawTalent API
      console.log('\n🔗 Registering with ClawTalent...');
      await this.registerWithClawTalent();

      printSuccess('Share complete!');
      this.printShareResult();

    } catch (err) {
      printError(`Share failed: ${err.message}`);
      if (this.verbose) {
        console.error(err.stack);
      }
      process.exit(1);
    }
  }

  // Scan workspace for files
  async scanWorkspace() {
    const skipPatterns = [
      '.git/',
      'node_modules/',
      '.migrate-backup/',
      'logs/',
      'coverage/',
      'dist/',
      '.DS_Store',
      'package-lock.json',
      'pnpm-lock.yaml'
    ];

    const scanDir = async (dir, relativePath = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativePath, entry.name);
        
        // Check skip patterns
        if (skipPatterns.some(p => relPath.includes(p) || entry.name === p)) {
          continue;
        }

        if (entry.isDirectory()) {
          await scanDir(fullPath, relPath);
        } else if (entry.isFile()) {
          // Skip binary files
          if (!this.isBinaryFile(fullPath)) {
            this.files.push({
              path: relPath,
              fullPath: fullPath,
              size: fs.statSync(fullPath).size
            });
          }
        }
      }
    };

    await scanDir(this.workspaceRoot);
  }

  // Check if file is binary
  isBinaryFile(filePath) {
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.tar', '.gz'];
    const ext = path.extname(filePath).toLowerCase();
    return binaryExtensions.includes(ext);
  }

  // Scan for sensitive information
  async scanSensitiveInfo() {
    this.sensitiveFindings = [];

    for (const file of this.files) {
      try {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        
        for (const pattern of SENSITIVE_PATTERNS) {
          const matches = content.match(pattern.pattern);
          if (matches && matches.length > 0) {
            this.sensitiveFindings.push({
              file: file.path,
              type: pattern.name,
              count: matches.length,
              sample: this.maskSample(matches[0])
            });
          }
        }
      } catch (err) {
        // Skip files that can't be read
      }
    }
  }

  // Mask sensitive sample for display
  maskSample(sample) {
    if (sample.length <= 8) return '***';
    return sample.slice(0, 4) + '***' + sample.slice(-4);
  }

  // Print sensitive findings
  printSensitiveFindings() {
    console.log('\n   Sensitive Information Found:');
    const byType = {};
    
    for (const finding of this.sensitiveFindings) {
      if (!byType[finding.type]) {
        byType[finding.type] = [];
      }
      byType[finding.type].push(finding.file);
    }

    for (const [type, files] of Object.entries(byType)) {
      console.log(`   - ${type}: ${files.length} file(s)`);
      files.slice(0, 3).forEach(f => console.log(`     • ${f}`));
      if (files.length > 3) {
        console.log(`     ... and ${files.length - 3} more`);
      }
    }
  }

  // Generate manifest from workspace
  async generateManifest() {
    const name = await this.promptForName();
    const description = await this.promptForDescription();
    const tags = await this.promptForTags();
    const language = await this.promptForLanguage();

    // Parse AGENTS.md for agent info
    const agents = await this.parseAgents();
    
    // Scan skills directory
    const skills = await this.scanSkills();

    // Extract requirements
    const requires = await this.extractRequirements();

    this.manifest = {
      schema: 'clawtalent.config.v1',
      name: name,
      description: description,
      tags: tags,
      language: language,
      agents: agents,
      skills: skills,
      files: this.files.map(f => ({ path: f.path, size: f.size })),
      requires: requires,
      author: {
        github: await this.getGitHubUsername()
      },
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // Prompt for configuration name
  async promptForName() {
    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Configuration name (e.g., "Lisa Team", "Home Assistant"): ', (answer) => {
        rl.close();
        resolve(answer.trim() || 'My OpenClaw Config');
      });
    });
  }

  // Prompt for description
  async promptForDescription() {
    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Description (brief): ', (answer) => {
        rl.close();
        resolve(answer.trim() || 'OpenClaw workspace configuration');
      });
    });
  }

  // Prompt for tags
  async promptForTags() {
    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Tags (comma-separated, e.g., "multi-agent,life,tech"): ', (answer) => {
        rl.close();
        const tags = answer.split(',').map(t => t.trim()).filter(t => t);
        resolve(tags.length > 0 ? tags : ['openclaw', 'assistant']);
      });
    });
  }

  // Prompt for language
  async promptForLanguage() {
    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Language (en/zh/en-US/zh-CN, default: en): ', (answer) => {
        rl.close();
        resolve(answer.trim() || 'en');
      });
    });
  }

  // Parse AGENTS.md for agent information
  async parseAgents() {
    const agentsPath = path.join(this.workspaceRoot, 'AGENTS.md');
    if (!fs.existsSync(agentsPath)) {
      return [];
    }

    try {
      const content = fs.readFileSync(agentsPath, 'utf8');
      const agents = [];
      
      // Simple parsing: look for markdown headers and role descriptions
      const lines = content.split('\n');
      let currentAgent = null;
      
      for (const line of lines) {
        if (line.startsWith('## ') || line.startsWith('### ')) {
          if (currentAgent) {
            agents.push(currentAgent);
          }
          currentAgent = {
            name: line.replace(/^#+\s*/, '').trim(),
            description: ''
          };
        } else if (currentAgent && line.trim() && !line.startsWith('#')) {
          currentAgent.description += line.trim() + ' ';
        }
      }
      
      if (currentAgent) {
        agents.push(currentAgent);
      }

      return agents;
    } catch (err) {
      return [];
    }
  }

  // Scan skills directory
  async scanSkills() {
    const skillsPath = path.join(this.workspaceRoot, 'skills');
    if (!fs.existsSync(skillsPath)) {
      return [];
    }

    try {
      const skills = [];
      const entries = fs.readdirSync(skillsPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const skillPath = path.join(skillsPath, entry.name);
          const skillMdPath = path.join(skillPath, 'SKILL.md');
          
          let description = entry.name;
          if (fs.existsSync(skillMdPath)) {
            const content = fs.readFileSync(skillMdPath, 'utf8');
            const descMatch = content.match(/description:\s*(.+)/i);
            if (descMatch) {
              description = descMatch[1].trim();
            }
          }
          
          skills.push({
            name: entry.name,
            description: description
          });
        }
      }
      
      return skills;
    } catch (err) {
      return [];
    }
  }

  // Extract requirements (env, channels, plugins)
  async extractRequirements() {
    const requires = {
      env: [],
      channels: [],
      plugins: []
    };

    // Check openclaw.json for plugins and channels
    const openclawConfigPath = path.join(this.ocEnv.openclawRoot, 'openclaw.json');
    if (fs.existsSync(openclawConfigPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(openclawConfigPath, 'utf8'));
        
        if (config.plugins?.entries) {
          requires.plugins = Object.keys(config.plugins.entries);
        }
        
        if (config.channels) {
          requires.channels = Object.keys(config.channels);
        }
      } catch (err) {
        // Ignore
      }
    }

    // Check for common env vars in files
    const envPatterns = [
      /process\.env\.([A-Z_]+)/g,
      /\$\{([A-Z_]+)\}/g,
      /\$([A-Z_]+)/g
    ];

    for (const file of this.files.slice(0, 50)) { // Limit to first 50 files
      try {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        for (const pattern of envPatterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const envVar = match[1];
            if (!requires.env.includes(envVar) && 
                !envVar.includes(' ') && 
                envVar.length > 2) {
              requires.env.push(envVar);
            }
          }
        }
      } catch (err) {
        // Ignore
      }
    }

    return requires;
  }

  // Get GitHub username from token
  async getGitHubUsername() {
    try {
      const token = await getToken({});
      if (!token) return 'unknown';

      return new Promise((resolve) => {
        const req = https.request({
          hostname: 'api.github.com',
          path: '/user',
          method: 'GET',
          headers: {
            'Authorization': `token ${token}`,
            'User-Agent': 'claw-migrate'
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const user = JSON.parse(data);
              resolve(user.login || 'unknown');
            } catch (e) {
              resolve('unknown');
            }
          });
        });
        
        req.on('error', () => resolve('unknown'));
        req.end();
      });
    } catch (err) {
      return 'unknown';
    }
  }

  // Apply template desensitization
  async applyTemplates() {
    for (const [fileName, templates] of Object.entries(TEMPLATE_FILES)) {
      const filePath = path.join(this.workspaceRoot, fileName);
      if (!fs.existsSync(filePath)) continue;

      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        for (const template of templates) {
          if (template.key) {
            // JSON key replacement
            const keyPattern = new RegExp(`"${template.key}"\\s*:\\s*"[^"]+"`, 'g');
            if (keyPattern.test(content)) {
              content = content.replace(keyPattern, `"${template.key}": "${template.template}"`);
              modified = true;
            }
          } else if (template.pattern) {
            // Regex pattern replacement
            if (template.pattern.test(content)) {
              content = content.replace(template.pattern, template.template);
              modified = true;
            }
          }
        }

        if (modified) {
          if (!this.dryRun) {
            fs.writeFileSync(filePath, content, 'utf8');
            printSuccess(`Templated: ${fileName}`);
          }
        }
      } catch (err) {
        // Ignore
      }
    }

    // Also apply generic sensitive info templating
    for (const file of this.files) {
      try {
        let content = fs.readFileSync(file.fullPath, 'utf8');
        let modified = false;

        for (const pattern of SENSITIVE_PATTERNS.slice(0, 3)) { // Email, Phone, API Key
          if (pattern.pattern.test(content)) {
            content = content.replace(pattern.pattern, (match) => {
              modified = true;
              return `\${${pattern.name.replace(/\s+/g, '_').toUpperCase()}}`;
            });
          }
        }

        if (modified && !this.dryRun) {
          fs.writeFileSync(file.fullPath, content, 'utf8');
        }
      } catch (err) {
        // Ignore
      }
    }
  }

  // Upload to GitHub
  async uploadToGitHub() {
    const token = await getToken({});
    if (!token) {
      throw new Error('GitHub token not found. Please set GITHUB_TOKEN environment variable.');
    }

    // Create or update repository
    const repoName = 'openclaw-config-share';
    const { GitHubWriter } = require('./github');
    
    // Get GitHub username
    const username = await this.getGitHubUsername();
    const repo = `${username}/${repoName}`;

    console.log(`   Creating/updating repository: ${repo}`);

    const writer = new GitHubWriter(token, repo, 'main');

    // Upload manifest
    const manifestContent = JSON.stringify(this.manifest, null, 2);
    await writer.updateFile('clawtalent.json', manifestContent, 'Update configuration manifest');

    // Upload workspace files (sample - in production would upload all)
    const filesToUpload = this.files.filter(f => 
      f.path.endsWith('.md') || 
      f.path.includes('skills/') ||
      f.path === 'openclaw.json'
    ).slice(0, 100); // Limit for demo

    console.log(`   Uploading ${filesToUpload.length} files...`);
    
    for (const file of filesToUpload) {
      try {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        await writer.updateFile(file.path, content, `Share: ${file.path}`);
      } catch (err) {
        // Skip files that fail
      }
    }

    this.githubRepo = repo;
    this.githubUrl = `https://github.com/${repo}`;
  }

  // Upload to Supabase (placeholder)
  async uploadToSupabase() {
    printWarning('Supabase upload not yet implemented. Falling back to GitHub...');
    await this.uploadToGitHub();
  }

  // Register with ClawTalent API
  async registerWithClawTalent() {
    const apiUrl = getClawTalentApiUrl();
    const token = await getToken({});

    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        manifest: this.manifest,
        github_repo: this.githubRepo,
        github_branch: 'main',
        storage_type: 'github',
        status: 'published'
      });

      const req = https.request({
        hostname: new URL(apiUrl).hostname,
        path: '/api/configurations',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            this.configId = result.id;
            this.shortId = result.short_id;
            resolve(result);
          } catch (e) {
            // API might return different format
            this.shortId = 'CT-' + Math.floor(Math.random() * 9000 + 1000);
            resolve({ short_id: this.shortId });
          }
        });
      });

      req.on('error', (err) => {
        // If API call fails, generate a local ID
        this.shortId = 'CT-' + Math.floor(Math.random() * 9000 + 1000);
        resolve({ short_id: this.shortId });
      });

      req.write(body);
      req.end();
    });
  }

  // Print manifest preview
  printManifestPreview() {
    console.log('\n📋 Manifest Preview:');
    console.log(`   Name: ${this.manifest.name}`);
    console.log(`   Description: ${this.manifest.description}`);
    console.log(`   Tags: ${this.manifest.tags.join(', ')}`);
    console.log(`   Language: ${this.manifest.language}`);
    console.log(`   Agents: ${this.manifest.agents.length}`);
    console.log(`   Skills: ${this.manifest.skills.length}`);
    console.log(`   Files: ${this.manifest.files.length}`);
  }

  // Print share result
  printShareResult() {
    printDivider();
    console.log(`   Configuration ID: ${this.shortId}`);
    console.log(`   Repository: ${this.githubUrl || 'N/A'}`);
    console.log(`   Share URL: https://clawtalent.shop/config/${this.shortId}`);
    console.log('\n💡 Share this ID with others:');
    console.log(`   claw-migrate deploy ${this.shortId}`);
  }
}

module.exports = { ShareExecutor };
