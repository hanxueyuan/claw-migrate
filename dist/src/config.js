#!/usr/bin/env node

/**
 * Configuration management module
 * Unified config loading, saving, and validation
 */

const fs = require('fs');
const path = require('path');
const { getOpenClawEnv } = require('./utils');

// Config file path
const CONFIG_DIR = path.join(getOpenClawEnv().openclawRoot, 'claw-migrate');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * Ensure config directory exists
 */
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Load configuration
 * @returns {Promise<Object|null>} Config object, or null if not found
 */
async function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return null;
    }
    const content = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to load config:', err.message);
    return null;
  }
}

/**
 * Save configuration
 * @param {Object} config Config object
 * @returns {Promise<boolean>} Whether save was successful
 */
async function saveConfig(config) {
  try {
    ensureConfigDir();
    config.updatedAt = new Date().toISOString();
    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(CONFIG_FILE, content, 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to save config:', err.message);
    return false;
  }
}

/**
 * Delete configuration
 * @returns {Promise<boolean>} Whether deletion was successful
 */
async function deleteConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }
    return true;
  } catch (err) {
    console.error('Failed to delete config:', err.message);
    return false;
  }
}

/**
 * Check if configuration exists
 * @returns {Promise<boolean>}
 */
async function configExists() {
  return fs.existsSync(CONFIG_FILE);
}

/**
 * Validate configuration
 * @param {Object} config Config object
 * @returns {Object} Validation result
 */
function validateConfig(config) {
  const errors = [];
  
  if (!config) {
    errors.push('Config is empty');
    return { valid: false, errors };
  }
  
  if (!config.repo || !config.repo.includes('/')) {
    errors.push('Repository format should be owner/repo');
  }
  
  if (!config.branch) {
    errors.push('Branch name cannot be empty');
  }
  
  if (!config.backup?.content || config.backup.content.length === 0) {
    errors.push('No backup content selected');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get config file path (for display)
 * @returns {string}
 */
function getConfigPath() {
  return CONFIG_FILE;
}

// ClawTalent API configuration
const CLAWTALENT_CONFIG = {
  apiUrl: process.env.CLAWTALENT_API || 'https://clawtalent.shop/api',
  defaultShareMethod: process.env.DEFAULT_SHARE_METHOD || 'github'
};

/**
 * Get ClawTalent API URL
 * @returns {string}
 */
function getClawTalentApiUrl() {
  return CLAWTALENT_CONFIG.apiUrl;
}

/**
 * Get default share method
 * @returns {string} 'github' or 'supabase'
 */
function getDefaultShareMethod() {
  return CLAWTALENT_CONFIG.defaultShareMethod;
}

module.exports = {
  ensureConfigDir,
  loadConfig,
  saveConfig,
  deleteConfig,
  configExists,
  validateConfig,
  getConfigPath,
  // ClawTalent config
  getClawTalentApiUrl,
  getDefaultShareMethod
};
