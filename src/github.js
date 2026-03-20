#!/usr/bin/env node

/**
 * GitHub API access module
 * Unified GitHub read/write operations
 */

const https = require('https');
const { throwGitHubError } = require('./utils');

// ==================== GitHub API Base Class ====================

class GitHubClient {
  constructor(token, repo, branch = 'main') {
    this.token = token;
    this.repo = repo; // Format: owner/repo
    this.branch = branch;
    this.baseUrl = 'https://api.github.com';
    this.repoOwner = repo.split('/')[0];
    this.repoName = repo.split('/')[1];
  }

  // Send GitHub API request
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    return new Promise((resolve, reject) => {
      const reqOptions = {
        hostname: 'api.github.com',
        path: endpoint,
        method: options.method || 'GET',
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'claw-migrate'
        }
      };

      if (options.body) {
        const body = JSON.stringify(options.body);
        reqOptions.headers['Content-Length'] = Buffer.byteLength(body);
        reqOptions.headers['Content-Type'] = 'application/json';
      }

      const req = https.request(reqOptions, (res) => {
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(data ? JSON.parse(data) : null);
            } catch (e) {
              resolve(data);
            }
          } else {
            let errorMsg = `GitHub API error (${res.statusCode})`;
            try {
              const errorBody = JSON.parse(data);
              if (errorBody.message) {
                errorMsg += `: ${errorBody.message}`;
              }
            } catch (e) {
              // Avoid leaking raw response data in error messages
              errorMsg += ': unexpected response';
            }
            reject(new Error(errorMsg));
          }
        });
      });

      req.on('error', (err) => reject(new Error(`Network error: ${err.message}`)));
      
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      req.end();
    });
  }

  // Test connection
  async testConnection() {
    try {
      const repoInfo = await this.request(`/repos/${this.repoOwner}/${this.repoName}`);
      return repoInfo;
    } catch (err) {
      throwGitHubError(`Cannot connect to repository ${this.repo}: ${err.message}`, err);
    }
  }
}

// ==================== GitHub Reader ====================

class GitHubReader extends GitHubClient {
  // Get file list
  async getFileList(type = 'all') {
    const files = [];
    await this.walkDirectory('', files, 0);
    return files;
  }

  // Recursively walk directory
  async walkDirectory(dirPath, files, depth, maxDepth = 5) {
    if (depth >= maxDepth) {
      return;
    }

    const pathStr = dirPath ? `contents/${dirPath}` : 'contents';
    const params = `?ref=${this.branch}`;
    
    const contents = await this.request(`${pathStr}${params}`);
    
    if (!Array.isArray(contents)) {
      return;
    }

    for (const item of contents) {
      // Skip files that should not be backed up
      if (this.shouldSkip(item.path)) {
        continue;
      }

      if (item.type === 'file') {
        files.push({
          path: item.path,
          sha: item.sha,
          size: item.size
        });
      } else if (item.type === 'dir') {
        await this.walkDirectory(item.path, files, depth + 1, maxDepth);
      }
    }
  }

  // Check if a file should be skipped
  shouldSkip(filePath) {
    const skipPatterns = [
      '.git/',
      'node_modules/',
      '.migrate-backup/',
      'logs/'
    ];
    
    return skipPatterns.some(pattern => 
      filePath === pattern || filePath.startsWith(pattern) || filePath.endsWith('.lock')
    );
  }

  // Get file content
  async getFileContent(filePath) {
    try {
      const response = await this.request(`contents/${filePath}?ref=${this.branch}`);
      
      if (!response.content) {
        throw new Error('File content is empty');
      }
      
      // Base64 decode
      return Buffer.from(response.content, 'base64').toString('utf8');
    } catch (err) {
      throwGitHubError(`Cannot read file ${filePath}: ${err.message}`, err);
    }
  }
}

// ==================== GitHub Writer ====================

class GitHubWriter extends GitHubClient {
  // Update/create file
  async updateFile(filePath, content, message, isBinary = false) {
    try {
      // Check if file exists
      let sha = null;
      try {
        const existing = await this.request(`contents/${filePath}?ref=${this.branch}`);
        sha = existing.sha;
      } catch (e) {
        // File does not exist, will create new
      }

      // Base64 encode (handle both string and buffer)
      const encodedContent = isBinary || Buffer.isBuffer(content) 
        ? Buffer.from(content).toString('base64')
        : Buffer.from(content, 'utf8').toString('base64');

      const body = {
        message,
        content: encodedContent,
        branch: this.branch
      };

      if (sha) {
        body.sha = sha;
      }

      const result = await this.request(`contents/${filePath}`, {
        method: 'PUT',
        body
      });

      return result;
    } catch (err) {
      throwGitHubError(`Cannot write file ${filePath}: ${err.message}`, err);
    }
  }

  // Delete file
  async deleteFile(filePath, message) {
    try {
      const existing = await this.request(`contents/${filePath}?ref=${this.branch}`);
      
      const result = await this.request(`contents/${filePath}`, {
        method: 'DELETE',
        body: {
          message,
          sha: existing.sha,
          branch: this.branch
        }
      });

      return result;
    } catch (err) {
      throwGitHubError(`Cannot delete file ${filePath}: ${err.message}`, err);
    }
  }
}

// ==================== Token Retrieval ====================

/**
 * Get GitHub Token
 * @param {Object} config Config object
 * @returns {Promise<string|null>}
 */
async function getToken(config) {
  // 1. Prefer environment variable
  if (process.env.GITHUB_TOKEN) {
    return process.env.GITHUB_TOKEN;
  }

  // 2. Use token from config (if available)
  if (config?.token) {
    return config.token;
  }

  // 3. Try to get from gh CLI (using execFile for safer command execution)
  try {
    const { execFile } = require('child_process');
    return await new Promise((resolve) => {
      const child = execFile('gh', ['auth', 'token'], { encoding: 'utf8', stdio: 'pipe' });
      let stdout = '';
      child.stdout.on('data', (data) => { stdout += data; });
      child.on('close', () => {
        if (stdout.trim()) resolve(stdout.trim());
        else resolve(null);
      });
      child.on('error', () => resolve(null));
    });
  } catch (e) {
    // gh CLI not available or not authenticated - this is expected
  }

  return null;
}

module.exports = {
  GitHubReader,
  GitHubWriter,
  GitHubClient,
  getToken
};
