import "reflect-metadata";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user.entity";
import { Exam } from "../entities/exam.entity";
import { ExamResult } from "../entities/exam-result.entity";

async function main() {
  await AppDataSource.initialize();
  console.log("Database initialized successfully!");
  
  const users = await AppDataSource.getRepository(User).find();
  console.log("Users in database:", users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, department: u.department })));

  const exams = await AppDataSource.getRepository(Exam).find({ relations: ["questions"] });
  console.log("Exams in database:", exams.map(e => ({ id: e.id, title: e.title, questionsCount: e.questions.length })));

  const results = await AppDataSource.getRepository(ExamResult).find({ relations: ["exam", "user"] });
  console.log("Exam Results in database:", results.map(r => ({ id: r.id, userId: r.userId, userName: r.user?.name, examTitle: r.exam?.title, score: r.score, status: r.status, completedAt: r.completedAt })));
  
  await AppDataSource.destroy();
}

main().catch(err => {
  console.error("Error:", err);
});
