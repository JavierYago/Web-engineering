import Products, { Product } from '@/models/Product';
import connect from '@/lib/mongoose';
import { Types } from 'mongoose';
import Users, { User } from '@/models/User';
import OrdersModel, { Order, ProductSnapshot } from '@/models/Order';
import bcrypt from 'bcrypt';

export interface GetProductsResponse {
  products: (Product & { _id: Types.ObjectId })[]
}


export interface ErrorResponse {
  error: string
  message: string
}

export interface CreateUserResponse {
  _id: Types.ObjectId
}

export interface GetUserResponse
  extends Pick<User, 'email' | 'name' | 'surname' | 'address' | 'birthdate'> {
  _id: Types.ObjectId
}

export async function getUser(
  userId: Types.ObjectId | string
): Promise<GetUserResponse | null> {
  await connect()

  const userProjection = {
    email: true,
    name: true,
    surname: true,
    address: true,
    birthdate: true,
  }
  const user = await Users.findById(userId, userProjection)

  return user
}

export async function createUser(user: {
  email: string;
  password: string;
  name: string;
  surname: string;
  address: string;
  birthdate: Date;
}): Promise<CreateUserResponse | null> {
  await connect();

  const prevUser = await Users.find({ email: user.email });

  if (prevUser.length !== 0) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(user.password, 10);

  const hash = await bcrypt.hash(user.password, 10)
  const doc: User = {
    ...user,
    password: hash,
    birthdate: new Date(user.birthdate),
    cartItems: [],
    orders: [],
  };

  const newUser = await Users.create(doc);

  return {
    _id: newUser._id,
  };
}

export async function getProducts(): Promise<GetProductsResponse> {
  await connect();
  const productsProjection = { __v: false };
  const products = await Products.find({}, productsProjection);
  return { products };
}

export interface GetProductResponse extends Product {
  _id: Types.ObjectId;
}

export async function getProduct(productId: Types.ObjectId | string): Promise<GetProductResponse | null> {
  await connect();
  if (!Types.ObjectId.isValid(productId)) return null;
  const product = await Products.findById(productId);
  if (product) {
    console.log(`Product found: ${JSON.stringify(product)}`);
  }
  return product;
}

export interface CartResponse {
  cartItems: {
    product: Product & { _id: Types.ObjectId };
    qty: number;
  }[];
}

export async function updateCartItem(
  userId: string,
  productId: string,
  qty: number
): Promise<{ cartItems: CartResponse['cartItems']; created: boolean } | null> {
  await connect();

  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId) || qty < 1) {
    return null;
  }

  const user = await Users.findById(userId);
  if (!user) return null;

  const productExists = await Products.exists({ _id: productId });
  if (!productExists) return null;

  let created = false;
  type CartItemPopulated = {
    product: Types.ObjectId | (Product & { _id: Types.ObjectId });
    qty: number;
  };
  const isPopulated = (
    p: CartItemPopulated['product']
  ): p is Product & { _id: Types.ObjectId } => {
    return typeof p === 'object' && !(p instanceof Types.ObjectId) && '_id' in p;
  };

  const existingItem = (user.cartItems as CartItemPopulated[]).find((item) => {
    const id = isPopulated(item.product)
      ? item.product._id.toString()
      : (item.product as Types.ObjectId).toString();
    return id === productId;
  });

  if (existingItem) {
    existingItem.qty = qty;
  } else {
    user.cartItems.push({product: new Types.ObjectId(productId), qty});
    created = true;
  }

  await user.save();

  const populatedUser = await Users.findById(userId).populate('cartItems.product');
  const cartItems = (populatedUser?.cartItems || []).map((item: CartItemPopulated) => ({
    product: item.product as Product & { _id: Types.ObjectId },
    qty: item.qty,
  }));

  return { cartItems, created };
}

export async function getUserCart(userId: string): Promise<CartResponse | null> {
  await connect();

  if (!Types.ObjectId.isValid(userId)) return null;

  const user = await Users.findById(userId).populate('cartItems.product');
  if (!user) return null;

  type CartItemPopulated = {
    product: Types.ObjectId | (Product & { _id: Types.ObjectId });
    qty: number;
  };

  const cartItems: CartResponse['cartItems'] = (user.cartItems as CartItemPopulated[]).map(
    (item) => ({
      product: item.product as Product & { _id: Types.ObjectId },
      qty: item.qty,
    })
  );

  return { cartItems };
}

type CartItemPopulated = {
  product: Types.ObjectId | (Product & { _id: Types.ObjectId });
  qty: number;
};
const isPopulated = (
  p: CartItemPopulated['product']
): p is Product & { _id: Types.ObjectId } =>
  typeof p === 'object' && !(p instanceof Types.ObjectId) && '_id' in p;

  export async function deleteCartItem(
  userId: string,
  productId: string
): Promise<CartResponse | null> {
  await connect();

  // Validaciones mínimas (la ruta también valida y para 400)
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
    return null;
  }

  const user = await Users.findById(userId);
  if (!user) return null;

  const productExists = await Products.exists({ _id: productId });
  if (!productExists) return null;

  // Filtra el carrito para quitar ese productId (soporta ObjectId o documento populateado)
  user.cartItems = (user.cartItems as CartItemPopulated[]).filter((item) => {
    const id = isPopulated(item.product)
      ? item.product._id.toString()
      : (item.product as Types.ObjectId).toString();
    return id !== productId;
  });

  await user.save();

  // Devuelve carrito populateado
  const populatedUser = await Users.findById(userId).populate('cartItems.product');
  const cartItems: CartResponse['cartItems'] = (populatedUser?.cartItems || []).map(
    (item: CartItemPopulated) => ({
      product: item.product as Product & { _id: Types.ObjectId },
      qty: item.qty,
    })
  );

  return { cartItems };
}

// Orders
export interface GetOrdersResponse {
  orders: Array<
    Pick<Order, 'address' | 'date' | 'cardHolder' | 'cardNumber' | 'orderItems'> & {
      _id: Types.ObjectId;
    }
  >;
}

export async function getUserOrders(userId: string): Promise<GetOrdersResponse | null> {
  await connect();

  if (!Types.ObjectId.isValid(userId)) return null;

  // Recupera el usuario (solo ids de órdenes)
  const user = await Users.findById(userId).select('orders');

  if (!user) return null;

  // Asegura una lista de ObjectIds (soporta si vinieran docs populateados accidentalmente)
  type OrderRef = Types.ObjectId | (Order & { _id: Types.ObjectId });
  const userOrders = (user.orders as unknown as OrderRef[]);
  const orderIds: Types.ObjectId[] = userOrders.map((o) =>
    o instanceof Types.ObjectId ? o : o._id
  );

  // Busca las órdenes por id (sin populate de productos; ya son snapshots)
  if (orderIds.length === 0) {
    return { orders: [] };
  }

  type OrderDocLean = Order & { _id: Types.ObjectId };
  const ordersDocs = (await OrdersModel.find({ _id: { $in: orderIds } })
    .select({ __v: false })
    .lean()) as OrderDocLean[];

  const orders: GetOrdersResponse['orders'] = ordersDocs.map((o: OrderDocLean) => ({
    _id: o._id,
    address: o.address,
    date: o.date,
    cardHolder: o.cardHolder,
    cardNumber: o.cardNumber,
    orderItems: o.orderItems as Array<{ product: ProductSnapshot; qty: number }>,
  }));

  return { orders };
}

// Crear orden a partir del carrito
export interface CreateOrderInput {
  address: string;
  cardHolder: string;
  cardNumber: string;
}

export type CreateOrderFromCartResult =
  | { ok: true; orderId: Types.ObjectId }
  | { ok: false; reason: 'invalid' | 'not-found' | 'empty-cart' };

export async function createOrderFromCart(
  userId: string,
  data: CreateOrderInput
): Promise<CreateOrderFromCartResult> {
  await connect();

  // Validaciones básicas
  if (!Types.ObjectId.isValid(userId)) {
    return { ok: false, reason: 'invalid' };
  }
  const { address, cardHolder, cardNumber } = data || ({} as CreateOrderInput);
  if (
    !address || typeof address !== 'string' || address.trim() === '' ||
    !cardHolder || typeof cardHolder !== 'string' || cardHolder.trim() === '' ||
    !cardNumber || typeof cardNumber !== 'string' || cardNumber.trim() === ''
  ) {
    return { ok: false, reason: 'invalid' };
  }

  // Cargamos usuario con carrito populateado para poder crear snapshots
  const user = await Users.findById(userId).populate('cartItems.product');
  if (!user) {
    return { ok: false, reason: 'not-found' };
  }

  // Si el carrito está vacío → 400
  if (!user.cartItems || user.cartItems.length === 0) {
    return { ok: false, reason: 'empty-cart' };
  }

  // Construimos los OrderItems con snapshot de producto
  type CartItemPop = { product: Types.ObjectId | (Product & { _id: Types.ObjectId }); qty: number };
  const orderItems: Array<{ product: ProductSnapshot; qty: number }> = (user.cartItems as CartItemPop[]).map((item) => {
    const p = item.product as Product & { _id: Types.ObjectId };
    const snapshot: ProductSnapshot = {
      name: p.name,
      description: p.description,
      img: p.img,
      price: p.price,
      category: p.category,
      brand: p.brand,
    };
    return { product: snapshot, qty: item.qty };
  });

  // Creamos la orden
  const orderDoc = await OrdersModel.create({
    address,
    cardHolder,
    cardNumber,
    orderItems,
    // date se autocompleta por el schema (default: now)
  });

  // Actualizamos usuario: añadimos la orden y vaciamos carrito
  user.orders.push(orderDoc._id as unknown as Types.ObjectId);
  user.cartItems = [];
  await user.save();

  return { ok: true, orderId: orderDoc._id as Types.ObjectId };
}

// Obtener una orden concreta de un usuario
export interface GetOrderResponse extends Order {
  _id: Types.ObjectId;
}

export async function getUserOrder(
  userId: string,
  orderId: string
): Promise<GetOrderResponse | null> {
  await connect();

  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(orderId)) {
    return null;
  }

  // Verifica que el usuario exista y que la orden pertenezca al usuario
  const user = await Users.findById(userId).select('orders');
  if (!user) return null;

  const belongs = (user.orders as Types.ObjectId[]).some(
    (oid) => oid.toString() === orderId
  );
  if (!belongs) return null;

  // Recupera la orden
  const order = await OrdersModel.findById(orderId).lean<Order & { _id: Types.ObjectId }>();
  if (!order) return null;

  return order as GetOrderResponse;
}

//Seminar 2

export interface CheckCredentialsResponse {
  _id: Types.ObjectId
}

export async function checkCredentials(
  email: string,
  password: string
): Promise<CheckCredentialsResponse | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await Users.findOne({ email: normalizedEmail }).select('+password');
  if (!user) return null;

  // Implement this...
  const match = await bcrypt.compare(password, user.password)
  if (!match) return null;

  return { _id: user._id as Types.ObjectId }
}