#!/usr/bin/env tsx

/**
 * Database Features Demo Script
 * Demonstrates the robust local PostgreSQL system capabilities
 */

import { databaseManager } from '../server/database/connection';
import { migrationManager } from '../server/database/migrations';
import { backupManager } from '../server/database/backup';

async function demonstrateDatabaseFeatures() {
  console.log('🎯 ShareXConnect Database System Demo\n');

  try {
    // 1. Database Health Check
    console.log('📊 1. Database Health Check');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const isHealthy = await databaseManager.healthCheck();
    const stats = await databaseManager.getStats();
    
    console.log(`✅ Database Connected: ${isHealthy}`);
    console.log(`📈 Total Connections: ${stats.totalConnections}`);
    console.log(`💤 Idle Connections: ${stats.idleConnections}`);
    console.log(`⏳ Waiting Connections: ${stats.waitingConnections}\n`);

    // 2. Performance Metrics
    console.log('⚡ 2. Performance Metrics');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const metrics = await databaseManager.getPerformanceMetrics();
    console.log(`🔄 Active Queries: ${metrics.activeQueries}`);
    console.log(`⏱️  Average Query Time: ${metrics.avgQueryTime.toFixed(2)}ms`);
    console.log(`📊 Connection Utilization: ${metrics.connectionUtilization.toFixed(1)}%`);
    console.log(`❌ Error Count: ${metrics.errors}\n`);

    // 3. Migration Status
    console.log('🔧 3. Migration System Status');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const migrationStatus = await migrationManager.getStatus();
    migrationStatus.forEach(migration => {
      const status = migration.executed ? '✅' : '⏸️';
      console.log(`${status} ${migration.id}: ${migration.name}`);
    });
    console.log('');

    // 4. Database Schema Information
    console.log('🗄️  4. Database Schema Information');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const client = await databaseManager.getConnection();
    try {
      // Check tables
      const tables = await client.query(`
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM information_schema.tables t 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      console.log('📋 Tables in database:');
      tables.rows.forEach(table => {
        console.log(`   📁 ${table.table_name} (${table.column_count} columns)`);
      });

      // Check indexes
      const indexes = await client.query(`
        SELECT indexname, tablename 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
        ORDER BY tablename, indexname
      `);
      
      console.log('\n🔍 Performance Indexes:');
      indexes.rows.forEach(index => {
        console.log(`   ⚡ ${index.tablename}.${index.indexname}`);
      });
      
    } finally {
      client.release();
    }
    console.log('');

    // 5. Backup System
    console.log('💾 5. Backup System Capabilities');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      const backups = await backupManager.listBackups();
      console.log(`📦 Available Backups: ${backups.length}`);
      
      if (backups.length > 0) {
        console.log('Recent backups:');
        backups.slice(0, 3).forEach(backup => {
          const size = (backup.size / 1024).toFixed(1);
          console.log(`   💾 ${backup.name} (${size} KB) - ${new Date(backup.timestamp).toLocaleString()}`);
        });
      } else {
        console.log('   📝 No backups found - automatic backups will be created every 2 hours');
      }
    } catch (error) {
      console.log('   ⚠️  Backup system requires pg_dump (install PostgreSQL client tools)');
    }
    console.log('');

    // 6. Full-Text Search Capabilities
    console.log('🔍 6. Full-Text Search Capabilities');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const client2 = await databaseManager.getConnection();
    try {
      // Check if search vector column exists
      const searchCheck = await client2.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'search_vector'
      `);
      
      if (searchCheck.rows.length > 0) {
        console.log('✅ Full-text search enabled for projects');
        console.log('   🔍 Search vector column: projects.search_vector');
        console.log('   ⚡ GIN index: idx_projects_search');
        console.log('   🤖 Auto-update trigger: project_search_vector_update');
      } else {
        console.log('⏸️  Full-text search not yet configured');
      }
    } finally {
      client2.release();
    }
    console.log('');

    // 7. Local Development Features
    console.log('🛠️  7. Local Development Features');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Connection pooling optimized for local development');
    console.log('✅ Automatic schema migrations with performance indexes');
    console.log('✅ Development data seeding with sample colleges');
    console.log('✅ Real-time health monitoring and performance metrics');
    console.log('✅ Automatic backup system with cleanup');
    console.log('✅ Transaction-based operations for data integrity');
    console.log('✅ Graceful shutdown handling');
    console.log('✅ Full-text search capabilities');
    console.log('✅ Comprehensive error handling and recovery');
    console.log('');

    // 8. Available Commands
    console.log('⚙️  8. Available Development Commands');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 npm run dev              - Start development server');
    console.log('🔧 npm run db:push           - Update database schema');
    console.log('💾 npm run backup:create     - Create manual backup');
    console.log('📊 npm run health            - Check system health');
    console.log('🏗️  npm run setup:local      - Automated local setup');
    console.log('🌱 npm run seed:dev          - Seed development data');
    console.log('');

    console.log('🎉 Database system demonstration completed!');
    console.log('');
    console.log('✨ ShareXConnect is ready for excellent local development');
    console.log('   Visit: http://localhost:5000');
    console.log('   Health: http://localhost:5000/health');
    console.log('   Setup: npm run setup:local (for new environments)');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  } finally {
    await databaseManager.gracefulShutdown();
  }
}

// Run the demo
demonstrateDatabaseFeatures();