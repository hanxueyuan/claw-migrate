#!/usr/bin/env node

/**
 * Search command module
 * Search configurations on ClawTalent platform
 */

const https = require('https');
const { 
  printHeader, 
  printSuccess, 
  printError, 
  printWarning, 
  printInfo,
  printDivider
} = require('./utils');
const { getClawTalentApiUrl } = require('./config');

class SearchExecutor {
  constructor(options = {}) {
    this.options = options;
    this.verbose = options.verbose || false;
    this.limit = options.limit || 20;
  }

  // Execute search
  async execute(query, userOptions = {}) {
    printHeader('Search ClawTalent');

    Object.assign(this.options, userOptions);

    if (!query || query.trim() === '') {
      printError('Search query is required');
      console.log('\nUsage:');
      console.log('  claw-migrate search "multi-agent"');
      console.log('  claw-migrate search "home assistant" --tags automation');
      console.log('  claw-migrate search --tags tech,life');
      return;
    }

    try {
      console.log(`\n🔍 Searching for: "${query}"`);
      
      const results = await this.searchClawTalent(query);
      
      if (results.length === 0) {
        printWarning('No configurations found');
        return;
      }

      printSuccess(`Found ${results.length} configuration(s)`);
      console.log();
      
      this.printResults(results);
      this.printSearchTips();

    } catch (err) {
      printError(`Search failed: ${err.message}`);
      if (this.verbose) {
        console.error(err.stack);
      }
      
      // Show demo results if API fails
      console.log('\n💡 Showing demo results (API unavailable):');
      const demoResults = this.getDemoResults(query);
      this.printResults(demoResults);
    }
  }

  // Search ClawTalent API
  async searchClawTalent(query) {
    const apiUrl = getClawTalentApiUrl();
    const tags = this.options.tags || '';
    const limit = this.limit;

    return new Promise((resolve, reject) => {
      let searchPath = `/api/search?q=${encodeURIComponent(query)}`;
      
      if (tags) {
        searchPath += `&tags=${encodeURIComponent(tags)}`;
      }
      
      searchPath += `&limit=${limit}`;

      const req = https.request({
        hostname: new URL(apiUrl).hostname,
        path: searchPath,
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
              const result = JSON.parse(data);
              // Handle different API response formats
              if (Array.isArray(result)) {
                resolve(result);
              } else if (result.configurations && Array.isArray(result.configurations)) {
                resolve(result.configurations);
              } else if (result.data && Array.isArray(result.data)) {
                resolve(result.data);
              } else {
                resolve([result]);
              }
            } catch (e) {
              reject(new Error('Failed to parse search results'));
            }
          } else {
            reject(new Error(`API error: ${res.statusCode}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.end();
    });
  }

  // Get demo results (for testing/API unavailable)
  getDemoResults(query) {
    return [
      {
        short_id: 'CT-1001',
        name: 'Lisa Team',
        description: 'Multi-agent team configuration for productivity and life management',
        author_name: 'Han Xueyuan',
        author_github: 'hanxueyuan',
        tags: ['multi-agent', 'productivity', 'life'],
        language: 'en',
        agent_count: 7,
        skill_names: ['feishu-doc', 'feishu-wiki', 'github', 'weather', 'healthcheck'],
        star_count: 128,
        deploy_count: 456,
        comment_count: 23,
        openclaw_min_version: '1.0.0',
        created_at: '2026-01-15T10:00:00Z'
      },
      {
        short_id: 'CT-1015',
        name: 'Home Assistant',
        description: 'Smart home automation with OpenClaw agents',
        author_name: 'SmartHome Dev',
        author_github: 'smarthome-dev',
        tags: ['home', 'automation', 'iot'],
        language: 'en',
        agent_count: 3,
        skill_names: ['home-assistant', 'schedule', 'notification'],
        star_count: 56,
        deploy_count: 89,
        comment_count: 12,
        openclaw_min_version: '1.2.0',
        created_at: '2026-02-01T14:30:00Z'
      },
      {
        short_id: 'CT-1023',
        name: '金融分析助手 (Financial Analyst)',
        description: 'Stock market analysis and financial reporting agent',
        author_name: 'FinTech Lab',
        author_github: 'fintech-lab',
        tags: ['finance', 'analysis', 'zh'],
        language: 'zh-CN',
        agent_count: 2,
        skill_names: ['stock-api', 'chart', 'report'],
        star_count: 234,
        deploy_count: 567,
        comment_count: 45,
        openclaw_min_version: '1.0.0',
        created_at: '2026-01-20T09:15:00Z'
      },
      {
        short_id: 'CT-1042',
        name: 'Research Assistant',
        description: 'Academic research helper with paper search and summarization',
        author_name: 'Academic AI',
        author_github: 'academic-ai',
        tags: ['research', 'academic', 'papers'],
        language: 'en',
        agent_count: 4,
        skill_names: ['scholar', 'arxiv', 'summarize', 'citation'],
        star_count: 89,
        deploy_count: 156,
        comment_count: 18,
        openclaw_min_version: '1.1.0',
        created_at: '2026-02-10T16:45:00Z'
      },
      {
        short_id: 'CT-1058',
        name: 'DevOps Bot',
        description: 'CI/CD automation and deployment monitoring',
        author_name: 'DevOps Pro',
        author_github: 'devops-pro',
        tags: ['devops', 'ci-cd', 'monitoring'],
        language: 'en',
        agent_count: 5,
        skill_names: ['github', 'docker', 'k8s', 'monitor', 'alert'],
        star_count: 167,
        deploy_count: 289,
        comment_count: 31,
        openclaw_min_version: '1.2.0',
        created_at: '2026-02-15T11:20:00Z'
      }
    ].filter(r => {
      const q = query.toLowerCase();
      return r.name.toLowerCase().includes(q) || 
             r.description.toLowerCase().includes(q) ||
             r.tags.some(t => t.toLowerCase().includes(q));
    });
  }

  // Print search results
  printResults(results) {
    console.log('┌─────────────────────────────────────────────────────────────────────────┐');
    console.log('│ ID     │ Name                    │ ⭐    │ 📦    │ Agents │ Skills      │');
    console.log('├─────────────────────────────────────────────────────────────────────────┤');

    for (const result of results.slice(0, 20)) {
      const id = (result.short_id || result.id || 'N/A').padEnd(6);
      const name = this.truncate(result.name || 'Unknown', 23);
      const stars = String(result.star_count || 0).padEnd(5);
      const deploys = String(result.deploy_count || 0).padEnd(5);
      const agents = String(result.agent_count || 0).padEnd(6);
      const skills = String((result.skill_names || []).length || 0);

      console.log(`│ ${id} │ ${name} │ ${stars}│ ${deploys}│ ${agents} │ ${skills.padEnd(11)} │`);
    }

    console.log('└─────────────────────────────────────────────────────────────────────────┘');

    if (results.length > 20) {
      console.log(`\n   ... and ${results.length - 20} more results`);
    }

    console.log();
    console.log('💡 Deploy a configuration:');
    console.log(`   claw-migrate deploy ${results[0]?.short_id || 'CT-XXXX'}`);
  }

  // Truncate string
  truncate(str, maxLength) {
    if (!str) return '';
    if (str.length <= maxLength) return str.padEnd(maxLength);
    return str.slice(0, maxLength - 2) + '..';
  }

  // Print search tips
  printSearchTips() {
    console.log('\n📌 Search Tips:');
    console.log('   • Use quotes for exact phrases: "multi-agent team"');
    console.log('   • Filter by tags: --tags tech,life');
    console.log('   • Search by author: --author hanxueyuan');
    console.log('   • Limit results: --limit 10');
    console.log('   • Sort by stars: --sort stars');
  }
}

module.exports = { SearchExecutor };
