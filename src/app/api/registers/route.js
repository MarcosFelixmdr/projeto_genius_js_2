// app/api/registers/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function GET() {
  try {
    const registers = await prisma.register.findMany({
      orderBy: { points: 'desc' },
    });
    return Response.json(registers);
  } catch (error) {
    console.error(error);
    return new Response('Erro ao buscar registros', { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('BODY RECEBIDO:', body); // 👈 Adicione isso para debug
    const { name, points, mode } = body;

    if (!name || points === undefined || !mode) {
      console.error('Dados incompletos:', { name, points, mode });
      return new Response('Dados incompletos', { status: 400 });
    }

    const created = await prisma.register.create({
      data: { name, points, mode, date: new Date() }, // <-- salva data automaticamente
    });

    console.log('REGISTRO CRIADO:', created); // 👈 Debug do resultado

    return Response.json(created);
  } catch (error) {
    console.error(error);
    return new Response('Erro ao inserir no banco', { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return new Response('ID inválido', { status: 400 });
    }

    const deleted = await prisma.register.delete({
      where: { id, points },
    });

    return Response.json(deleted);
  } catch (error) {
    console.error(error);
    return new Response('Erro ao deletar registro', { status: 500 });
  }
}
