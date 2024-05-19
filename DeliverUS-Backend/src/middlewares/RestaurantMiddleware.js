import { Restaurant, Order } from '../models/models.js'
import { Sequelize } from 'sequelize'

const checkRestaurantOwnership = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId)
    if (req.user.id === restaurant.userId) {
      return next()
    }
    return res.status(403).send('Not enough privileges. This entity does not belong to you')
  } catch (err) {
    return res.status(500).send(err)
  }
}
const restaurantHasNoOrders = async (req, res, next) => {
  try {
    const numberOfRestaurantOrders = await Order.count({
      where: { restaurantId: req.params.restaurantId }
    })
    if (numberOfRestaurantOrders === 0) {
      return next()
    }
    return res.status(409).send('Some orders belong to this restaurant.')
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const checkStatus = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId)
    if (restaurant.status === 'closed' || restaurant.status === 'temporarily closed') {
      return res.status(409).send('A closed restaurant cannot change status')
    } else {
      const nonDeliveredOrders = await Order.count({
        where: { restaurantId: req.params.restaurantId, deliveredAt: { [Sequelize.Op.ne]: null } }
      })
      if (nonDeliveredOrders > 0) {
        return res.status(409).send('A restaurant with pending orders cannot change status')
      }
    }
    return next()
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

export { checkRestaurantOwnership, restaurantHasNoOrders, checkStatus }
