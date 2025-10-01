import mongoose, { Schema } from 'mongoose';

export interface ProductSnapshot {
  name: string;
  description: string;
  img: string;
  price: number;
  category?: string;
  brand?: string;
}

export interface OrderItem {
  product: ProductSnapshot;
  qty: number;
}

export interface Order {
  address: string;
  date: Date;
  cardHolder: string;
  cardNumber: string;
  orderItems: OrderItem[];
}

const ProductSnapshotSchema = new Schema<ProductSnapshot>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  img: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String },
  brand: { type: String },
}, { _id: false });

const OrderItemSchema = new Schema<OrderItem>({
  product: { type: ProductSnapshotSchema, required: true },
  qty: { type: Number, required: true, min: 1 },
}, { _id: false });

const OrderSchema = new Schema<Order>({
  address: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  cardHolder: { type: String, required: true },
  cardNumber: { type: String, required: true },
  orderItems: [OrderItemSchema],
});

export default mongoose.models.Order as mongoose.Model<Order> || mongoose.model<Order>('Order', OrderSchema);