import { AppDataSource } from "../config/data-source";
import { Certificate } from "../entities/certificate.entity";

export const certificateRepository = AppDataSource.getRepository(Certificate);
