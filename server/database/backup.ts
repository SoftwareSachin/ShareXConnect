/**
 * Database Backup and Restore System for Local Development
 * Provides data safety and easy reset capabilities
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { databaseManager } from './connection';

const execAsync = promisify(exec);

export class BackupManager {
  private backupDir: string;

  constructor() {
    this.backupDir = join(process.cwd(), 'backups');
    this.ensureBackupDirectory();
  }

  private ensureBackupDirectory(): void {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
      console.log(`📁 Created backup directory: ${this.backupDir}`);
    }
  }

  private getDatabaseConfig() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Parse DATABASE_URL
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: url.port || '5432',
      database: url.pathname.slice(1),
      username: url.username,
      password: url.password
    };
  }

  async createBackup(name?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = name || `backup-${timestamp}`;
    const backupPath = join(this.backupDir, `${backupName}.sql`);

    console.log(`🔄 Creating database backup: ${backupName}`);

    try {
      const config = this.getDatabaseConfig();
      
      // Create environment for pg_dump
      const env = {
        ...process.env,
        PGPASSWORD: config.password
      };

      // Use pg_dump to create backup
      const command = `pg_dump -h ${config.host} -p ${config.port} -U ${config.username} -d ${config.database} --no-password --clean --if-exists > "${backupPath}"`;
      
      await execAsync(command, { env });
      
      // Create metadata file
      const metadata = {
        name: backupName,
        timestamp: new Date().toISOString(),
        database: config.database,
        size: require('fs').statSync(backupPath).size
      };
      
      writeFileSync(
        join(this.backupDir, `${backupName}.json`),
        JSON.stringify(metadata, null, 2)
      );

      console.log(`✅ Backup created successfully: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error(`❌ Backup failed:`, error);
      throw error;
    }
  }

  async restoreBackup(backupName: string): Promise<void> {
    const backupPath = join(this.backupDir, `${backupName}.sql`);
    const metadataPath = join(this.backupDir, `${backupName}.json`);

    if (!existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    console.log(`🔄 Restoring database from backup: ${backupName}`);

    try {
      const config = this.getDatabaseConfig();
      
      // Create environment for psql
      const env = {
        ...process.env,
        PGPASSWORD: config.password
      };

      // Use psql to restore backup
      const command = `psql -h ${config.host} -p ${config.port} -U ${config.username} -d ${config.database} --no-password < "${backupPath}"`;
      
      await execAsync(command, { env });

      console.log(`✅ Database restored successfully from: ${backupName}`);
    } catch (error) {
      console.error(`❌ Restore failed:`, error);
      throw error;
    }
  }

  async listBackups(): Promise<Array<{
    name: string;
    timestamp: string;
    database: string;
    size: number;
    path: string;
  }>> {
    const backups: any[] = [];
    
    const files = require('fs').readdirSync(this.backupDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const metadataPath = join(this.backupDir, file);
          const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
          const sqlPath = join(this.backupDir, `${metadata.name}.sql`);
          
          if (existsSync(sqlPath)) {
            backups.push({
              ...metadata,
              path: sqlPath
            });
          }
        } catch (error) {
          console.warn(`Warning: Could not read backup metadata: ${file}`);
        }
      }
    }

    return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async deleteBackup(backupName: string): Promise<void> {
    const backupPath = join(this.backupDir, `${backupName}.sql`);
    const metadataPath = join(this.backupDir, `${backupName}.json`);

    try {
      if (existsSync(backupPath)) {
        require('fs').unlinkSync(backupPath);
      }
      if (existsSync(metadataPath)) {
        require('fs').unlinkSync(metadataPath);
      }
      
      console.log(`✅ Backup deleted: ${backupName}`);
    } catch (error) {
      console.error(`❌ Failed to delete backup: ${backupName}`, error);
      throw error;
    }
  }

  // Quick data export for development
  async exportDevelopmentData(): Promise<string> {
    console.log('🔄 Exporting development data...');
    
    try {
      const client = await databaseManager.getConnection();
      const data: any = {};
      
      // Export key tables
      const tables = ['users', 'colleges', 'projects', 'comments'];
      
      for (const table of tables) {
        try {
          const result = await client.query(`SELECT * FROM ${table}`);
          data[table] = result.rows;
          console.log(`📊 Exported ${result.rows.length} rows from ${table}`);
        } catch (error) {
          console.warn(`Warning: Could not export ${table}:`, error.message);
          data[table] = [];
        }
      }
      
      client.release();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const exportPath = join(this.backupDir, `dev-data-${timestamp}.json`);
      
      writeFileSync(exportPath, JSON.stringify(data, null, 2));
      
      console.log(`✅ Development data exported: ${exportPath}`);
      return exportPath;
    } catch (error) {
      console.error(`❌ Development data export failed:`, error);
      throw error;
    }
  }

  // Automated backup scheduling for local development
  startAutomaticBackups(intervalMinutes: number = 60): void {
    console.log(`🕐 Starting automatic backups every ${intervalMinutes} minutes`);
    
    setInterval(async () => {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await this.createBackup(`auto-${timestamp}`);
        
        // Keep only last 5 automatic backups
        const backups = await this.listBackups();
        const autoBackups = backups.filter(b => b.name.startsWith('auto-'));
        
        if (autoBackups.length > 5) {
          for (let i = 5; i < autoBackups.length; i++) {
            await this.deleteBackup(autoBackups[i].name);
          }
        }
      } catch (error) {
        console.error('❌ Automatic backup failed:', error);
      }
    }, intervalMinutes * 60 * 1000);
  }
}

export const backupManager = new BackupManager();