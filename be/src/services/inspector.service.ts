import { inspectorRepository } from "../repositories/inspector.repository";
import { AppDataSource } from "../config/data-source";
import { StaffNew } from "../entities/staff-new.entity";
import { In } from "typeorm";

export class InspectorService {
  static async getAllInspectors() {
    // 1. Fetch inspectors with relations
    const inspectors = await inspectorRepository.find({
      relations: [
        "plant",
        "process",
        "detailProcess",
        "examResults",
        "examResults.certificateResults",
        "examResults.approvalRequests"
      ],
      order: {
        id: "ASC"
      }
    });

    if (inspectors.length === 0) {
      return [];
    }

    // 2. Fetch staffs_new details for all found eids to get current HR info
    const eids = inspectors.map(ins => ins.eid);
    const staffNewRepo = AppDataSource.getRepository(StaffNew);
    const staffs = await staffNewRepo.find({
      where: {
        eid: In(eids)
      }
    });

    const staffMap = new Map(staffs.map(s => [s.eid, s]));

    // 3. Map inspectors + latest exam result/certificate + HR staffs_new info to the target model
    return inspectors.map(inspector => {
      const staff = staffMap.get(inspector.eid);

      // Sort exam results descending by id/created_at to get latest one
      const resultsHistory = (inspector.examResults || []).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      const latestResult = resultsHistory[0];
      const latestCert = latestResult && latestResult.certificateResults ? latestResult.certificateResults[0] : null;
      const latestApproval = latestResult && latestResult.approvalRequests ? latestResult.approvalRequests[0] : null;

      // Format certifications history list
      const certifications = resultsHistory.map(res => {
        const cert = res.certificateResults ? res.certificateResults[0] : null;
        const approval = res.approvalRequests ? res.approvalRequests[0] : null;
        
        return {
          examCode: res.examCodeSnapshot || "",
          trainingStartDate: res.trainingStartDate || "",
          trainingEndDate: res.trainingEndDate || "",
          examDate: res.examDate || "",
          examScore: res.score ? parseFloat(res.score) : null,
          passingScore: res.passingScoreSnapshot ? parseFloat(res.passingScoreSnapshot) : 95,
          approvalStatus: approval ? approval.approvalStatus : "DRAFT",
          certificateNo: cert ? (cert.certificateNo || "") : "",
          certificateDate: cert ? (cert.effectiveDate || "") : "",
          expireDate: cert ? (cert.expireDate || "") : "",
          approver: approval ? (approval.approvedBy || approval.requestedBy || "") : ""
        };
      });

      return {
        id: inspector.eid,
        knoxId: inspector.knoxId || staff?.knoxId || inspector.knoxId || "",
        name: staff?.fullName || inspector.nameSnapshot || "Unknown",
        department: staff?.department || inspector.partSnapshot || "Production",
        team: staff?.team || inspector.gbmSnapshot || "",
        plant: inspector.plant ? `[${inspector.plant.code}]${inspector.plant.name}` : "",
        product: staff?.product || inspector.productSnapshot || "",
        enterDate: inspector.enterDate || "",
        process: inspector.process ? inspector.process.code : "",
        detailProcess: inspector.detailProcess ? inspector.detailProcess.code : "",
        
        // Latest certification stats
        examCode: latestResult?.examCodeSnapshot || "",
        trainingStartDate: latestResult?.trainingStartDate || "",
        trainingEndDate: latestResult?.trainingEndDate || "",
        examDate: latestResult?.examDate || "",
        examScore: latestResult?.score ? parseFloat(latestResult.score) : null,
        passingScore: latestResult?.passingScoreSnapshot ? parseFloat(latestResult.passingScoreSnapshot) : 95,
        examResultStatus: latestResult?.resultStatus || "NOT_TAKEN",
        approvalStatus: latestApproval ? latestApproval.approvalStatus : "DRAFT",
        certificateNo: latestCert?.certificateNo || "",
        certificateDate: latestCert?.effectiveDate || "",
        expireDate: latestCert?.expireDate || "",
        certificateStatus: latestCert?.certificateStatus || "NOT_ISSUED",
        approver: latestApproval ? (latestApproval.approvedBy || latestApproval.requestedBy || "") : "",
        remark: latestResult?.remark || "",
        certifications
      };
    });
  }
}
