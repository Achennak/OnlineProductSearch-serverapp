import * as  orderDao from '../../dao/order-dao.js';
import * as  userAddressDao from '../../dao/user-address-dao.js';
import * as  productDao from '../../dao/products-dao.js';
import { validateAuthToken } from '../../middleware/validateAuthToken.middleware.js';
import { getProductById } from '../../utils/product.utils.js';

const OrderController = (app) => {
    const getOrders = async (req, res) => {
        const { userName } = req;
        const orders = await orderDao.getOrdersByUserName(userName);
        const orderWithAddressAndProductDetails = await Promise.all(
            orders.map(async (order) => {
                const userAddress = await userAddressDao.findAddressesById(order.addressId);
                const product = await getProductById(order.productId);
                return {
                    ...order.toObject(),
                    userAddress,
                    product
                }
            }
            ))
        res.json(orderWithAddressAndProductDetails);
    }

    const createOrder = async (req, res) => {
        const { userName } = req;
        const createOrderRequest = {
            ...req.body,
            userName
        }
        const order = await orderDao.createOrder(createOrderRequest);
        res.json(order);
    }

    const cancelOrder = async (req, res) => {
        const { orderId } = req.body;
        await orderDao.cancelOrder(orderId);
        res.sendStatus(200);
    }

    app.get('/api/orders', validateAuthToken, getOrders);
    app.post('/api/orders', validateAuthToken, createOrder);
    app.post('/api/orders/cancel', validateAuthToken, cancelOrder);
}

export default OrderController;