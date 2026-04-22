import bcrypt from 'bcrypt';

const plain = process.argv[2];
if (!plain) {
  console.error('Usage: node scripts/hash-password.mjs <password>');
  process.exit(1);
}
console.log(bcrypt.hashSync(plain, 10));
