import Products, { Product } from '@/models/Product';
import Users, { User } from '@/models/User';
import Orders from '@/models/Order';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: `.env.local`, override: true });
const MONGODB_URI = process.env.MONGODB_URI;

const products: Product[] = [
  {
    name: 'Leche Entera',
    price: 1.20,
    img: 'https://ejemplo.com/img/leche.jpg',
    description: 'Leche fresca de vaca, 1L',
    category: 'Lácteos',
    brand: 'Central Lechera',
  },
  {
    name: 'Pan de Molde',
    price: 1.50,
    img: 'https://ejemplo.com/img/pan.jpg',
    description: 'Pan de molde blanco, 500g',
    category: 'Panadería',
    brand: 'Bimbo',
  },
  // Añade más productos típicos de supermercado
];

async function seed() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  const opts = { bufferCommands: false };
  const conn = await mongoose.connect(MONGODB_URI, opts);

  if (conn.connection.db) {
    await conn.connection.db.dropDatabase();
  } else {
    throw new Error('Database connection is undefined.');
  }

  await Products.createCollection();
  await Users.createCollection();
  await Orders.createCollection();

  const insertedProducts = await Products.insertMany(products);
  const user: User = {
    email: 'client@supermarket.com',
    password: '1234',
    name: 'Client',
    surname: 'Example',
    address: 'Calle Mayor 1, 28001 Madrid, España',
    birthdate: new Date('1990-01-01'),
    cartItems: [
      { product: insertedProducts[0]._id, qty: 2 },
      { product: insertedProducts[1]._id, qty: 1 },
    ],
    orders: [],
  };
  const res = await Users.create(user);
  console.log(JSON.stringify(res, null, 2));

  await conn.disconnect();
}

seed().catch(console.error);