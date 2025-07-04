// app/api/items/route.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false, 
  },
});

export async function GET(request) {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY id');
    return Response.json(result.rows);
  } catch (err) {
    console.error(err);
    return new Response('Erro ao buscar os dados', { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return new Response('Nome é obrigatório', { status: 400 });
    }

    const result = await pool.query(
      'INSERT INTO items (name) VALUES ($1) RETURNING *',
      [name]
    );
    return Response.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return new Response('Erro ao criar o item', { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response('ID é obrigatório', { status: 400 });
    }

    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return new Response('Item não encontrado', { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return new Response('Erro ao deletar o item', { status: 500 });
  }
}
