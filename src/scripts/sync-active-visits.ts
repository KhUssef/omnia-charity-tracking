import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { VisitTasksService } from '../visit/visit-tasks.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const visitTasks = app.get(VisitTasksService);
    await visitTasks.runSyncActiveVisitsOnce();
    console.log('Active visits sync completed.');
  } catch (err) {
    console.error('Failed to sync active visits:', err);
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
