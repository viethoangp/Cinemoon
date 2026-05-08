import bcrypt from 'bcryptjs';

async function generateHashes() {
  const passwords = {
    admin123: 'admin',
    customer123: 'customer1'
  };

  for (const [plain, user] of Object.entries(passwords)) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plain, salt);
    console.log(`Username: ${user}`);
    console.log(`Plain: ${plain}`);
    console.log(`Hash: ${hash}`);
    console.log('---');
  }
}

generateHashes();
