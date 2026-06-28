import "reflect-metadata";
import { AppDataSource } from "../config/data-source";
import { Inspector } from "../entities/inspector.entity";
import { ExamResult } from "../entities/exam-result.entity";
import { Plant } from "../entities/plant.entity";

async function main() {
  await AppDataSource.initialize();
  console.log("Database initialized successfully!");

  const plants = await AppDataSource.getRepository(Plant).find();
  console.log("Plants:", plants.map(p => ({ id: p.id, code: p.code, name: p.name })));

  const inspectors = await AppDataSource.getRepository(Inspector).find();
  console.log("Inspectors count:", inspectors.length);

  const examResults = await AppDataSource.getRepository(ExamResult).find();
  console.log("Exam Results count:", examResults.length);

  await AppDataSource.destroy();
}

main().catch(err => {
  console.error("Error:", err);
});
