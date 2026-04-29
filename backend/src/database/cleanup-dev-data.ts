import 'dotenv/config';
import { Client as PgClient } from 'pg';
import { Client as MinioClient } from 'minio';

async function wipePostgres() {
  const pg = new PgClient({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  await pg.connect();
  try {
    await pg.query(
      'TRUNCATE TABLE "vehicle_documents", "vehicles", "loads" RESTART IDENTITY CASCADE',
    );
    console.log('[PG] vehicle_documents, vehicles, loads — очищены');
  } finally {
    await pg.end();
  }
}

async function wipeMinio() {
  const bucket = process.env.MINIO_BUCKET ?? 'logistics-docs';
  const client = new MinioClient({
    endPoint: process.env.MINIO_ENDPOINT ?? 'localhost',
    port: parseInt(process.env.MINIO_PORT ?? '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ROOT_USER ?? '',
    secretKey: process.env.MINIO_ROOT_PASSWORD ?? '',
  });

  const exists = await client.bucketExists(bucket).catch(() => false);
  if (!exists) {
    console.log(`[S3] Bucket ${bucket} не существует — нечего чистить`);
    return;
  }

  const keys: string[] = [];
  await new Promise<void>((resolve, reject) => {
    const stream = client.listObjectsV2(bucket, '', true);
    stream.on('data', (obj) => obj.name && keys.push(obj.name));
    stream.on('end', () => resolve());
    stream.on('error', (err) => reject(err));
  });

  if (keys.length === 0) {
    console.log('[S3] Bucket уже пуст');
    return;
  }

  await client.removeObjects(bucket, keys);
  console.log(`[S3] Удалено объектов: ${keys.length}`);
}

async function main() {
  console.log('=== DEV CLEANUP ===');
  await wipePostgres();
  await wipeMinio();
  console.log('=== Готово ===');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
