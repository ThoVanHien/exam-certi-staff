import { hashPassword } from "../utils/hash";

const plainPassword = process.argv[2];

if (!plainPassword) {
  console.error("Vui long truyen password. Vi du: npm run hash:password -- StrongPassword123");
  process.exit(1);
}

hashPassword(plainPassword)
  .then((passwordHash) => {
    console.log(passwordHash);
  })
  .catch((error) => {
    console.error("Khong the tao password hash:", error);
    process.exit(1);
  });
