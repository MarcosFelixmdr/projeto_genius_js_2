// app/api/registers/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function GET() {
  try {
    const registers = await prisma.registers.findMany({
      orderBy: { id: 'asc' },
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
    const { name, points } = body;

    const created = await prisma.registers.create({
      data: { name, points },
    });

    

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

    const deleted = await prisma.registers.delete({
      where: { id },
    });

    return Response.json(deleted);
  } catch (error) {
    console.error(error);
    return new Response('Erro ao deletar registro', { status: 500 });
  }
}
