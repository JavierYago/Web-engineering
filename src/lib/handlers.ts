import Products, { Product } from '@/models/Product';
import connect from '@/lib/mongoose';
import { Types } from 'mongoose';
import Users, {User, CartItem} from '@/models/User';
import Orders, {Order} from '@/models/Order';

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

  const doc: User = {
    ...user,
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
  return product;
}

export interface CartResponse {
  cartItems: {
    product: Product & { _id: Types.ObjectId };
    qty: number;
  }[];
}

export async function getUserCart(userId: string): Promise<CartResponse | null> {
  await connect();
  const user = await Users.findById(userId).populate('cartItems.product');
  if (!user) return null;

  // Define el tipo local para el mapeo
  type CartItemPopulated = {
    product: Types.ObjectId | (Product & { _id: Types.ObjectId });
    qty: number;
  };

  // Usa el tipo en el mapeo
  const cartItems = user.cartItems.map((item: CartItemPopulated) => {
    if (item.product && typeof item.product === 'object' && 'name' in item.product) {
      // Producto poblado
      return {
        product: item.product as Product & { _id: Types.ObjectId },
        qty: item.qty,
      };
    } else {
      // Producto no poblado (debería ser raro)
      return {
        product: {} as Product & { _id: Types.ObjectId },
        qty: item.qty,
      };
    }
  });

  return { cartItems };
}