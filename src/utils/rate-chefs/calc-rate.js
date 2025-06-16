import Meal from "../../DB/models/Meal/meal.model.js";

export const calcRate=({allChefs})=>{
const chefsWithRate = allChefs.map(async (chef) => {
    // Calculate the average rate for each chef
    console.log(chef.id);
    const mealsForChef =  await Meal.find({ chef: chef.id }); 
    const totalRate = mealsForChef.reduce((acc, meal) => {
      return acc + (meal.avgRating || 0);
    }, 0);
    console.log(totalRate);
    const avgRate = totalRate / mealsForChef.length || 0;
    return {
      ...chef.toObject(),
      avgRate,
    };
  });
  return chefsWithRate;
}