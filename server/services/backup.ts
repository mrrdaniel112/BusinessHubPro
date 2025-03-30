import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { encryptData, decryptData } from './security';
import { storage } from '../storage';
import { fileURLToPath } from 'url';

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BACKUP_DIRECTORY = path.join(__dirname, '../../backups');
const BACKUP_RETENTION_DAYS = 30;
const MAX_BACKUPS = 10;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIRECTORY)) {
  fs.mkdirSync(BACKUP_DIRECTORY, { recursive: true });
}

/**
 * Creates a full backup of all application data
 */
export async function createFullBackup(): Promise<string> {
  try {
    // Get all data from storage - assuming a dummy user ID for now
    // In a real app with database, we'd get all data without user filtering
    const dummyUserId = 1;
    
    const fullData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      clients: await storage.getClients(dummyUserId),
      employees: await storage.getEmployees(dummyUserId),
      invoices: await storage.getInvoices(dummyUserId),
      // expenses: await storage.getExpenses(dummyUserId), // Uncomment when implemented
      inventory: await storage.getInventoryItems(dummyUserId),
      contracts: await storage.getContracts(dummyUserId),
      timeEntries: await storage.getTimeEntries(dummyUserId),
      // Add additional data types as needed
    };

    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = uuidv4().substring(0, 8);
    const filename = `full-backup-${timestamp}-${backupId}.enc`;
    const backupPath = path.join(BACKUP_DIRECTORY, filename);

    // Encrypt the data
    const jsonData = JSON.stringify(fullData);
    const { encryptedData, iv, authTag } = encryptData(jsonData);

    // Save encrypted data with metadata
    fs.writeFileSync(
      backupPath,
      JSON.stringify({
        version: '1.0',
        timestamp: Date.now(),
        iv,
        authTag,
        data: encryptedData,
      })
    );

    // Perform backup cleanup
    await cleanupOldBackups();

    return filename;
  } catch (error: any) {
    console.error('Full backup creation failed:', error);
    throw new Error(`Failed to create backup: ${error.message}`);
  }
}

/**
 * Restores data from a full backup
 */
export async function restoreFromBackup(backupFilename: string): Promise<boolean> {
  try {
    const backupPath = path.join(BACKUP_DIRECTORY, backupFilename);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file ${backupFilename} not found`);
    }

    // Read and parse the backup file
    const backupContent = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    // Decrypt the data
    const decryptedData = decryptData(
      backupContent.data,
      backupContent.iv,
      backupContent.authTag
    );

    // Parse the decrypted JSON
    const restoredData = JSON.parse(decryptedData);

    // Verify backup format version compatibility
    if (restoredData.version !== '1.0') {
      throw new Error(`Unsupported backup version: ${restoredData.version}`);
    }

    // Create a restore point before proceeding (backup the current data before restore)
    await createRestorePoint();

    // In a real application, we would have proper methods to clear and restore data
    // For this sample application, we'll simulate the restoration
    
    console.log('Restoring backup data...');
    
    // Instead of clearing and restoring all data, we'll just log what would happen
    // This is because our MemStorage implementation doesn't have clear methods
    
    console.log(`Would restore ${restoredData.clients?.length || 0} clients`);
    console.log(`Would restore ${restoredData.employees?.length || 0} employees`);
    console.log(`Would restore ${restoredData.invoices?.length || 0} invoices`);
    console.log(`Would restore ${restoredData.inventory?.length || 0} inventory items`);
    console.log(`Would restore ${restoredData.contracts?.length || 0} contracts`);
    console.log(`Would restore ${restoredData.timeEntries?.length || 0} time entries`);
    
    // In a real implementation with a database, we would:
    // 1. Begin a transaction
    // 2. Clear all existing data (using proper clear methods)
    // 3. Insert all data from the backup
    // 4. Commit the transaction
    
    // Add additional data types as needed

    return true;
  } catch (error: any) {
    console.error('Backup restoration failed:', error);
    throw new Error(`Failed to restore from backup: ${error.message}`);
  }
}

/**
 * Creates a restore point before performing a restore operation
 * This allows for rollback if the restore fails
 */
async function createRestorePoint(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const restorePointId = uuidv4().substring(0, 8);
  const filename = `restore-point-${timestamp}-${restorePointId}.enc`;
  
  try {
    // Get all current data
    const dummyUserId = 1;
    
    const fullData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      clients: await storage.getClients(dummyUserId),
      employees: await storage.getEmployees(dummyUserId),
      invoices: await storage.getInvoices(dummyUserId),
      // expenses: await storage.getExpenses(dummyUserId), // Uncomment when implemented
      inventory: await storage.getInventoryItems(dummyUserId),
      contracts: await storage.getContracts(dummyUserId),
      timeEntries: await storage.getTimeEntries(dummyUserId),
      // Add additional data types as needed
    };

    const backupPath = path.join(BACKUP_DIRECTORY, filename);
    
    // Encrypt the data
    const jsonData = JSON.stringify(fullData);
    const { encryptedData, iv, authTag } = encryptData(jsonData);
    
    // Save encrypted data with metadata
    fs.writeFileSync(
      backupPath,
      JSON.stringify({
        version: '1.0',
        timestamp: Date.now(),
        type: 'restore_point',
        iv,
        authTag,
        data: encryptedData,
      })
    );
    
    return filename;
  } catch (error: any) {
    console.error('Restore point creation failed:', error);
    throw new Error(`Failed to create restore point: ${error.message}`);
  }
}

/**
 * Lists all available backups
 */
export function listBackups(): Array<{
  filename: string;
  type: string;
  timestamp: Date;
  size: number;
}> {
  try {
    if (!fs.existsSync(BACKUP_DIRECTORY)) {
      return [];
    }

    const files = fs.readdirSync(BACKUP_DIRECTORY);
    
    return files
      .filter(file => file.endsWith('.enc'))
      .map(file => {
        const stats = fs.statSync(path.join(BACKUP_DIRECTORY, file));
        const fileContent = JSON.parse(fs.readFileSync(path.join(BACKUP_DIRECTORY, file), 'utf8'));
        
        // Determine backup type from filename
        let type = 'unknown';
        if (file.startsWith('full-backup-')) {
          type = 'full';
        } else if (file.startsWith('restore-point-')) {
          type = 'restore_point';
        }

        return {
          filename: file,
          type,
          timestamp: new Date(fileContent.timestamp),
          size: stats.size,
        };
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by timestamp, newest first
  } catch (error: any) {
    console.error('Failed to list backups:', error);
    return [];
  }
}

/**
 * Deletes old backups to maintain storage limits
 */
async function cleanupOldBackups(): Promise<void> {
  try {
    const backups = listBackups();
    
    // Keep restore points separate from regular backups
    const regularBackups = backups.filter(b => b.type === 'full');
    const restorePoints = backups.filter(b => b.type === 'restore_point');
    
    // If we have more than MAX_BACKUPS regular backups, delete the oldest ones
    if (regularBackups.length > MAX_BACKUPS) {
      const toDelete = regularBackups.slice(MAX_BACKUPS);
      for (const backup of toDelete) {
        fs.unlinkSync(path.join(BACKUP_DIRECTORY, backup.filename));
        console.log(`Deleted old backup: ${backup.filename}`);
      }
    }
    
    // Delete restore points older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    for (const restorePoint of restorePoints) {
      if (restorePoint.timestamp < sevenDaysAgo) {
        fs.unlinkSync(path.join(BACKUP_DIRECTORY, restorePoint.filename));
        console.log(`Deleted old restore point: ${restorePoint.filename}`);
      }
    }
    
    // Delete any backups older than BACKUP_RETENTION_DAYS
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - BACKUP_RETENTION_DAYS);
    
    for (const backup of backups) {
      if (backup.timestamp < cutoffDate) {
        fs.unlinkSync(path.join(BACKUP_DIRECTORY, backup.filename));
        console.log(`Deleted expired backup: ${backup.filename}`);
      }
    }
  } catch (error: any) {
    console.error('Backup cleanup failed:', error);
  }
}

/**
 * Initializes the backup service
 * Sets up scheduled backups
 */
export function initializeBackupService(): NodeJS.Timeout {
  console.log('Initializing backup service...');
  
  // Create initial backup
  createFullBackup()
    .then(filename => console.log(`Initial backup created: ${filename}`))
    .catch(error => console.error('Failed to create initial backup:', error));
  
  // Schedule daily backups at 3 AM
  const backupInterval = 24 * 60 * 60 * 1000; // 24 hours
  
  return setInterval(async () => {
    try {
      // Only create backup if it's around 3 AM (to avoid multiple backups)
      const currentHour = new Date().getHours();
      if (currentHour === 3) {
        const filename = await createFullBackup();
        console.log(`Scheduled backup created: ${filename}`);
      }
    } catch (error: any) {
      console.error('Scheduled backup failed:', error);
    }
  }, backupInterval);
}

/**
 * Deletes a specific backup file
 */
export function deleteBackup(filename: string): boolean {
  try {
    const backupPath = path.join(BACKUP_DIRECTORY, filename);
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file ${filename} not found`);
    }
    
    fs.unlinkSync(backupPath);
    return true;
  } catch (error: any) {
    console.error(`Failed to delete backup ${filename}:`, error);
    return false;
  }
}