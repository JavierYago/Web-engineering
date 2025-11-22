import Products, { Product } from '@/models/Product';
import Users, { User } from '@/models/User';
import Orders from '@/models/Order';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: `.env.local`, override: true });
const MONGODB_URI = process.env.MONGODB_URI;

const products: Product[] = [
  { name: 'Leche Entera', price: 1.20, img: '/img/products/milk.jpg', description: 'Leche fresca de vaca, 1L', category: 'Lácteos', brand: 'Central Lechera' },
  { name: 'Pan de Molde', price: 1.50, img: '/img/products/bread.jpg', description: 'Pan de molde blanco, 500g', category: 'Panadería', brand: 'Bimbo' },
  { name: 'Plátanos de Canarias', price: 2.99, img: '/img/products/banana.jpg', description: 'Plátano dulce y sabroso, 1kg', category: 'Frutas', brand: 'Canarias' },
  { name: 'Manzanas Golden', price: 1.89, img: '/img/products/apple.jpg', description: 'Manzanas dulces y crujientes, 1kg', category: 'Frutas', brand: 'Golden' },
  { name: 'Pechuga de Pollo', price: 6.50, img: '/img/products/chicken.jpg', description: 'Filetes de pechuga de pollo, 500g', category: 'Carnicería', brand: 'Avícola' },
  { name: 'Arroz Redondo', price: 1.10, img: '/img/products/rice.jpg', description: 'Arroz ideal para paellas, 1kg', category: 'Despensa', brand: 'SOS' },
  { name: 'Aceite de Oliva Virgen', price: 8.50, img: '/img/products/oil.jpg', description: 'Aceite de oliva virgen extra, 1L', category: 'Despensa', brand: 'Carbonell' },
  { name: 'Detergente Líquido', price: 9.99, img: '/img/products/detergent.jpg', description: 'Detergente para lavadora, 40 lavados', category: 'Limpieza', brand: 'Ariel' },
  { name: 'Papel Higiénico', price: 4.50, img: '/img/products/paper.jpg', description: 'Papel higiénico 3 capas, 12 rollos', category: 'Hogar', brand: 'Scottex' },
  { name: 'Yogur Natural', price: 2.20, img: '/img/products/yogurt.jpg', description: 'Pack de 8 yogures naturales', category: 'Lácteos', brand: 'Danone' },
  { name: 'Pasta Macarrones', price: 0.95, img: '/img/products/pasta.jpg', description: 'Pasta de trigo duro, 500g', category: 'Despensa', brand: 'Gallo' },
  { name: 'Tomate Frito', price: 1.05, img: '/img/products/tomato.jpg', description: 'Salsa de tomate estilo casero, 350g', category: 'Despensa', brand: 'Orlando' },
  { name: 'Huevos L', price: 2.40, img: '/img/products/eggs.jpg', description: 'Huevos de gallinas camperas, docena', category: 'Huevos', brand: 'Granja' },
  { name: 'Champú Reparador', price: 3.80, img: '/img/products/shampoo.jpg', description: 'Champú para cabello dañado, 300ml', category: 'Higiene', brand: 'Pantene' },
  { name: 'Galletas María', price: 1.30, img: '/img/products/cookies.jpg', description: 'Galletas tradicionales, paquete 800g', category: 'Desayuno', brand: 'Fontaneda' },
  { name: 'Agua Mineral', price: 0.60, img: '/img/products/water.jpg', description: 'Agua mineral natural, 1.5L', category: 'Bebidas', brand: 'Bezoya' },
  { name: 'Cerveza Lata', price: 0.75, img: '/img/products/beer.jpg', description: 'Cerveza rubia clásica, 33cl', category: 'Bebidas', brand: 'Mahou' },
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
  const contra = '1234';
  const hashedPassword = await bcrypt.hash(contra, 10);
  const user: User = {
    email: 'client@supermarket.com',
    password: hashedPassword,
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