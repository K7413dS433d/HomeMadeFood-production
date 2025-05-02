export const calcTotalPrice = function (next) {
    this.totalPrice = this.meals.reduce((sum, meal) => sum + (meal.quantity * meal.price), 0);
    return next();
}