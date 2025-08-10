import { db } from '../db.js';
import { getOpenAIClient } from './openai-api-service.js';
export class PersonaDocumentSyncService {
    static instance;
    syncOperations = new Map();
    static getInstance() {
        if (!PersonaDocumentSyncService.instance) {
            PersonaDocumentSyncService.instance = new PersonaDocumentSyncService();
        }
        return PersonaDocumentSyncService.instance;
    }
    async getSyncStatus(personaId, config) {
        try {
            const postgresResult = await db.execute(`SELECT id, title, content, document_type, category, enabled, 
                created_at, updated_at, file_size, openai_file_id,
                CASE 
                  WHEN openai_file_id IS NOT NULL AND openai_file_id != '' THEN 'synced'
                  ELSE 'pending'
                END as sync_status
         FROM training_documents 
         WHERE assigned_personas @> $1 AND deleted_at IS NULL
         ORDER BY updated_at DESC`, [JSON.stringify([personaId])]);
            let openaiDocuments = [];
            try {
                const client = getOpenAIClient(config.projectType);
                const vectorStoreFiles = await client.beta.vectorStores.files.list(config.vectorStoreId);
                openaiDocuments = await Promise.all(vectorStoreFiles.data.map(async (fileRef) => {
                    try {
                        const file = await client.files.retrieve(fileRef.id);
                        const matchingDoc = postgresResult.find(doc => doc.openai_file_id === file.id);
                        return {
                            id: file.id,
                            filename: file.filename,
                            bytes: file.bytes,
                            created_at: file.created_at,
                            purpose: file.purpose,
                            status: fileRef.status,
                            postgresDocumentId: matchingDoc?.id || null
                        };
                    }
                    catch (error) {
                        console.warn(`Failed to get file details for ${fileRef.id}:`, error);
                        return null;
                    }
                }));
                openaiDocuments = openaiDocuments.filter(doc => doc !== null);
            }
            catch (error) {
                console.warn(`Failed to get OpenAI documents for ${personaId}:`, error);
            }
            const postgresCount = postgresResult.length;
            const openaiCount = openaiDocuments.length;
            const syncedCount = postgresResult.filter(doc => doc.openai_file_id).length;
            const pendingCount = postgresCount - syncedCount;
            let overallStatus = 'synced';
            if (pendingCount > 0) {
                overallStatus = 'unsynced';
            }
            else if (postgresCount !== openaiCount) {
                overallStatus = 'partial';
            }
            return {
                personaId,
                config,
                postgresDocuments: postgresResult,
                openaiDocuments,
                summary: {
                    postgresCount,
                    openaiCount,
                    syncedCount,
                    pendingCount
                },
                overallStatus,
                lastSync: null
            };
        }
        catch (error) {
            console.error(`Error getting sync status for ${personaId}:`, error);
            throw error;
        }
    }
    async performFullSync(personaId, config) {
        const operations = [];
        const result = {
            success: true,
            uploaded: 0,
            updated: 0,
            deleted: 0,
            errors: [],
            operationDetails: operations
        };
        try {
            const client = getOpenAIClient(config.projectType);
            const postgresDocuments = await db.execute(`SELECT id, title, content, document_type, category, file_size, openai_file_id
         FROM training_documents 
         WHERE assigned_personas @> $1 AND deleted_at IS NULL
         ORDER BY updated_at DESC`, [JSON.stringify([personaId])]);
            const vectorStoreFiles = await client.beta.vectorStores.files.list(config.vectorStoreId);
            const openaiFileIds = new Set(vectorStoreFiles.data.map(f => f.id));
            for (const doc of postgresDocuments) {
                const operation = {
                    type: doc.openai_file_id ? 'update' : 'upload',
                    documentId: doc.id,
                    documentTitle: doc.title,
                    status: 'pending',
                    message: '',
                    timestamp: new Date()
                };
                try {
                    const fileContent = `Title: ${doc.title}
Type: ${doc.document_type}
Category: ${doc.category}

${doc.content}`;
                    const buffer = Buffer.from(fileContent, 'utf-8');
                    if (doc.openai_file_id) {
                        try {
                            await client.beta.vectorStores.files.del(config.vectorStoreId, doc.openai_file_id);
                            await client.files.del(doc.openai_file_id);
                        }
                        catch (deleteError) {
                            console.warn(`Failed to delete old file ${doc.openai_file_id}:`, deleteError);
                        }
                    }
                    const file = await client.files.create({
                        file: new File([buffer], `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`, {
                            type: 'text/plain'
                        }),
                        purpose: 'assistants'
                    });
                    await client.beta.vectorStores.files.create(config.vectorStoreId, {
                        file_id: file.id
                    });
                    await db.execute('UPDATE training_documents SET openai_file_id = $1, updated_at = NOW() WHERE id = $2', [file.id, doc.id]);
                    operation.status = 'completed';
                    operation.openaiFileId = file.id;
                    operation.message = `Successfully ${operation.type}d to OpenAI`;
                    if (operation.type === 'upload') {
                        result.uploaded++;
                    }
                    else {
                        result.updated++;
                    }
                }
                catch (error) {
                    operation.status = 'error';
                    operation.message = `Failed to ${operation.type}: ${error.message}`;
                    result.errors.push(`${doc.title}: ${error.message}`);
                    result.success = false;
                }
                operations.push(operation);
            }
            for (const fileRef of vectorStoreFiles.data) {
                const dbDoc = await db.execute('SELECT id FROM training_documents WHERE openai_file_id = $1 AND deleted_at IS NULL', [fileRef.id]);
                if (dbDoc.length === 0) {
                    const operation = {
                        type: 'delete',
                        documentId: fileRef.id,
                        documentTitle: 'Orphaned OpenAI file',
                        status: 'pending',
                        message: '',
                        timestamp: new Date()
                    };
                    try {
                        await client.beta.vectorStores.files.del(config.vectorStoreId, fileRef.id);
                        await client.files.del(fileRef.id);
                        operation.status = 'completed';
                        operation.message = 'Removed orphaned file from OpenAI';
                        result.deleted++;
                    }
                    catch (error) {
                        operation.status = 'error';
                        operation.message = `Failed to delete: ${error.message}`;
                        result.errors.push(`Orphaned file ${fileRef.id}: ${error.message}`);
                    }
                    operations.push(operation);
                }
            }
            this.syncOperations.set(personaId, operations);
            return result;
        }
        catch (error) {
            console.error(`Full sync failed for ${personaId}:`, error);
            result.success = false;
            result.errors.push(`Full sync failed: ${error.message}`);
            return result;
        }
    }
    async performIncrementalSync(personaId, config) {
        const operations = [];
        const result = {
            success: true,
            uploaded: 0,
            updated: 0,
            deleted: 0,
            errors: [],
            operationDetails: operations
        };
        try {
            const client = getOpenAIClient(config.projectType);
            const unsyncedDocuments = await db.execute(`SELECT id, title, content, document_type, category, file_size
         FROM training_documents 
         WHERE assigned_personas @> $1 AND deleted_at IS NULL
         AND (openai_file_id IS NULL OR openai_file_id = '')
         ORDER BY updated_at DESC`, [JSON.stringify([personaId])]);
            for (const doc of unsyncedDocuments) {
                const operation = {
                    type: 'upload',
                    documentId: doc.id,
                    documentTitle: doc.title,
                    status: 'pending',
                    message: '',
                    timestamp: new Date()
                };
                try {
                    const fileContent = `Title: ${doc.title}
Type: ${doc.document_type}
Category: ${doc.category}

${doc.content}`;
                    const buffer = Buffer.from(fileContent, 'utf-8');
                    const file = await client.files.create({
                        file: new File([buffer], `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`, {
                            type: 'text/plain'
                        }),
                        purpose: 'assistants'
                    });
                    await client.beta.vectorStores.files.create(config.vectorStoreId, {
                        file_id: file.id
                    });
                    await db.execute('UPDATE training_documents SET openai_file_id = $1, updated_at = NOW() WHERE id = $2', [file.id, doc.id]);
                    operation.status = 'completed';
                    operation.openaiFileId = file.id;
                    operation.message = 'Successfully uploaded to OpenAI';
                    result.uploaded++;
                }
                catch (error) {
                    operation.status = 'error';
                    operation.message = `Upload failed: ${error.message}`;
                    result.errors.push(`${doc.title}: ${error.message}`);
                    result.success = false;
                }
                operations.push(operation);
            }
            this.syncOperations.set(personaId, operations);
            return result;
        }
        catch (error) {
            console.error(`Incremental sync failed for ${personaId}:`, error);
            result.success = false;
            result.errors.push(`Incremental sync failed: ${error.message}`);
            return result;
        }
    }
    async uploadAndSyncDocument(personaId, config, documentData) {
        try {
            const result = await db.execute(`INSERT INTO training_documents 
         (title, content, document_type, category, file_size, original_filename, assigned_personas, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id`, [
                documentData.title,
                documentData.content,
                documentData.document_type,
                documentData.category,
                documentData.file_size,
                documentData.original_filename,
                JSON.stringify([personaId])
            ]);
            const documentId = result[0].id;
            try {
                const client = getOpenAIClient(config.projectType);
                const fileContent = `Title: ${documentData.title}
Type: ${documentData.document_type}
Category: ${documentData.category}

${documentData.content}`;
                const buffer = Buffer.from(fileContent, 'utf-8');
                const file = await client.files.create({
                    file: new File([buffer], documentData.original_filename, {
                        type: 'text/plain'
                    }),
                    purpose: 'assistants'
                });
                await client.beta.vectorStores.files.create(config.vectorStoreId, {
                    file_id: file.id
                });
                await db.execute('UPDATE training_documents SET openai_file_id = $1 WHERE id = $2', [file.id, documentId]);
                return {
                    documentId,
                    openaiFileId: file.id,
                    success: true
                };
            }
            catch (syncError) {
                console.error('Failed to sync to OpenAI:', syncError);
                return {
                    documentId,
                    success: false,
                    error: `Document saved to PostgreSQL but sync to OpenAI failed: ${syncError.message}`
                };
            }
        }
        catch (error) {
            console.error('Failed to upload document:', error);
            return {
                documentId: '',
                success: false,
                error: `Failed to upload document: ${error.message}`
            };
        }
    }
    async deleteDocument(documentId, fromOpenAI = false) {
        try {
            if (fromOpenAI) {
                const openaiFileId = documentId;
                const doc = await db.execute('SELECT assigned_personas FROM training_documents WHERE openai_file_id = $1 AND deleted_at IS NULL', [openaiFileId]);
                if (doc.length > 0) {
                    const assignedPersonas = JSON.parse(doc[0].assigned_personas);
                    await db.execute('UPDATE training_documents SET openai_file_id = NULL WHERE openai_file_id = $1', [openaiFileId]);
                }
                return { success: true };
            }
            else {
                const doc = await db.execute('SELECT openai_file_id, assigned_personas FROM training_documents WHERE id = $1 AND deleted_at IS NULL', [documentId]);
                if (doc.length === 0) {
                    return { success: false, error: 'Document not found' };
                }
                await db.execute('UPDATE training_documents SET deleted_at = NOW() WHERE id = $1', [documentId]);
                return { success: true };
            }
        }
        catch (error) {
            console.error('Failed to delete document:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            return { success: false, error: `Failed to delete document: ${errorMessage}` };
        }
    }
    getSyncOperations(personaId) {
        return this.syncOperations.get(personaId) || [];
    }
}
export const personaDocumentSyncService = PersonaDocumentSyncService.getInstance();
