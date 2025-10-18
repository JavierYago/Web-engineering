import Products, { Product } from '@/models/Product';
import connect from '@/lib/mongoose';
import { Types } from 'mongoose';
import Users, { User } from '@/models/User';

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