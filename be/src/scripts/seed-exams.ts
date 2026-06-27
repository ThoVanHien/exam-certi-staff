import "reflect-metadata";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user.entity";
import { Exam } from "../entities/exam.entity";
import { ExamQuestion } from "../entities/exam-question.entity";
import { hashPassword } from "../utils/hash";

async function main() {
  await AppDataSource.initialize();
  console.log("Database connected successfully for seeding!");

  const userRepository = AppDataSource.getRepository(User);
  const examRepository = AppDataSource.getRepository(Exam);
  const questionRepository = AppDataSource.getRepository(ExamQuestion);

  // 1. Seed employee user
  const employeeEmail = "employee@company.local";
  let employeeUser = await userRepository.findOne({ where: { email: employeeEmail } });
  
  if (!employeeUser) {
    const passwordHash = await hashPassword("employee");
    employeeUser = userRepository.create({
      name: "Nguyen Van Binh",
      email: employeeEmail,
      role: "employee",
      department: "Production",
      passwordHash: passwordHash,
      isActive: true
    });
    employeeUser = await userRepository.save(employeeUser);
    console.log("Seeded employee user:", employeeUser.email);
  } else {
    console.log("Employee user already exists.");
  }

  // Find admin user for Exam creator relationship
  const adminUser = await userRepository.findOne({ where: { role: "super_admin" } });
  const adminId = adminUser ? adminUser.id : null;

  // 2. Seed Exam 1: Forklift Operation Safety Assessment
  const exam1Title = "Forklift Operation Safety Assessment";
  let exam1 = await examRepository.findOne({ where: { title: exam1Title } });

  if (!exam1) {
    exam1 = examRepository.create({
      title: exam1Title,
      duration: 30,
      totalQuestions: 5,
      createdByUserId: adminId,
      department: "Production",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    exam1 = await examRepository.save(exam1);
    console.log("Seeded Exam 1:", exam1.title);

    const questions1 = [
      {
        question: "Khi nâng hàng bằng xe nâng, vị trí của càng nâng nên như thế nào so với mặt đất khi xe đang di chuyển?",
        options: [
          "A. Càng nâng nâng cao tối đa để tránh va chạm.",
          "B. Càng nâng cách mặt đất khoảng 15-20 cm và nghiêng về phía sau.",
          "C. Càng nâng để sát mặt đất.",
          "D. Càng nâng để tự do tùy ý người vận hành."
        ],
        correctAnswer: "B",
        orderNo: 1
      },
      {
        question: "Khi lái xe nâng xuống dốc có tải, người vận hành cần lưu ý điều gì?",
        options: [
          "A. Lái tiến xuống dốc bình thường.",
          "B. Tắt máy và để xe tự trôi xuống dốc.",
          "C. Đi lùi xuống dốc, tải hướng lên đỉnh dốc.",
          "D. Tăng tốc độ để vượt qua dốc nhanh chóng."
        ],
        correctAnswer: "C",
        orderNo: 2
      },
      {
        question: "Khi đỗ xe nâng, người vận hành KHÔNG được thực hiện hành động nào sau đây?",
        options: [
          "A. Hạ càng nâng xuống sát mặt đất.",
          "B. Kéo phanh tay và tắt động cơ.",
          "C. Để nguyên tải trọng trên càng nâng và rời khỏi xe.",
          "D. Rút chìa khóa khởi động."
        ],
        correctAnswer: "C",
        orderNo: 3
      },
      {
        question: "Tải trọng nâng tối đa của xe nâng được ghi ở đâu?",
        options: [
          "A. Trên lốp xe nâng.",
          "B. Trên bảng thông số kỹ thuật gắn trên xe (Load chart/Data plate).",
          "C. Trong sách hướng dẫn lái xe ô tô.",
          "D. Người vận hành tự ước lượng."
        ],
        correctAnswer: "B",
        orderNo: 4
      },
      {
        question: "Người vận hành xe nâng cần làm gì khi đi qua các góc khuất hoặc cửa ra vào nhà kho?",
        options: [
          "A. Giảm tốc độ, bấm còi cảnh báo và quan sát kỹ xung quanh.",
          "B. Tăng tốc nhanh chóng để tránh cản trở giao thông.",
          "C. Đi bình thường mà không cần phát tín hiệu.",
          "D. Dừng hẳn xe lại 5 phút rồi mới đi tiếp."
        ],
        correctAnswer: "A",
        orderNo: 5
      }
    ];

    for (const q of questions1) {
      await questionRepository.save(
        questionRepository.create({
          examId: exam1.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          orderNo: q.orderNo
        })
      );
    }
    console.log("Seeded questions for Exam 1");
  } else {
    console.log("Exam 1 already exists.");
  }

  // 3. Seed Exam 2: Safety Compliance Assessment
  const exam2Title = "Safety Compliance Assessment";
  let exam2 = await examRepository.findOne({ where: { title: exam2Title } });

  if (!exam2) {
    exam2 = examRepository.create({
      title: exam2Title,
      duration: 20,
      totalQuestions: 3,
      createdByUserId: adminId,
      department: "Production",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    exam2 = await examRepository.save(exam2);
    console.log("Seeded Exam 2:", exam2.title);

    const questions2 = [
      {
        question: "Phương tiện bảo vệ cá nhân (PPE) tối thiểu bắt buộc khi vào khu sản xuất SEHC bao gồm những gì?",
        options: [
          "A. Giày bảo hộ, mũ bảo hộ, quần áo bảo hộ và kính bảo hộ (nếu cần).",
          "B. Chỉ cần dép lê và mũ bảo hộ.",
          "C. Quần áo thể thao thoải mái.",
          "D. Không bắt buộc trang bị nào."
        ],
        correctAnswer: "A",
        orderNo: 1
      },
      {
        question: "Khi phát hiện sự cố rò rỉ hóa chất hoặc cháy nổ trong xưởng sản xuất, hành động đầu tiên cần làm là gì?",
        options: [
          "A. Tiếp tục hoàn thành công việc rồi mới báo cáo.",
          "B. Chụp ảnh đăng mạng xã hội.",
          "C. Kích hoạt hệ thống báo động gần nhất, hô hoán và di tản theo lối thoát hiểm.",
          "D. Tự mình đi tìm nguồn hóa chất để bịt lại mà không báo cho ai."
        ],
        correctAnswer: "C",
        orderNo: 2
      },
      {
        question: "Quy trình LOTO (Lockout/Tagout) được sử dụng nhằm mục đích gì?",
        options: [
          "A. Khóa cửa nhà kho chống trộm.",
          "B. Cô lập nguồn năng lượng nguy hiểm khi bảo trì, sửa chữa thiết bị.",
          "C. Đánh dấu vị trí đỗ xe nâng.",
          "D. Kiểm kê hàng tồn kho định kỳ."
        ],
        correctAnswer: "B",
        orderNo: 3
      }
    ];

    for (const q of questions2) {
      await questionRepository.save(
        questionRepository.create({
          examId: exam2.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          orderNo: q.orderNo
        })
      );
    }
    console.log("Seeded questions for Exam 2");
  } else {
    console.log("Exam 2 already exists.");
  }

  await AppDataSource.destroy();
  console.log("Seeding process completed!");
}

main().catch((err) => {
  console.error("Error during seeding:", err);
});
