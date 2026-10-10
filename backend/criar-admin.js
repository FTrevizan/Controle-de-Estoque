import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const [matricula, nome, setor, login, senha] = process.argv.slice(2);

if (!matricula || !nome || !setor || !login || !senha) {
  console.log(' node criar-admin.js <199366> "<Fernando T. Trevizan>" "<TI>" <admin> <masterkey>');
  process.exit(1);
}

try {
  const hash = await bcrypt.hash(senha, 10);
  const resultado = await pool.query(
    `INSERT INTO funcionario (matricula, nome, setor, login, senha_hash, perfil)
     VALUES ($1, $2, $3, $4, $5, 'ADMINISTRADOR')
     RETURNING id_funcionario`,
    [matricula, nome, setor, login, hash]
  );
  console.log(`Administrador criado! id ${resultado.rows[0].id_funcionario}, login: ${login}`);
} catch (erro) {
  console.error('Erro:', erro.message);
} finally {
  await pool.end();
}