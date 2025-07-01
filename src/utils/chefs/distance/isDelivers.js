import Location from "../../../DB/models/Location/location.model.js";
import * as constants from "../../../common/constants/index.constant.js";
import { getDistanceFromLatLonInKm } from "./calc-distance.js";

export const isDelivers = async ({ userId, allChefs }) => {
  const location = await Location.findOne({ userId, default: true });
  const chefsWithDelivery = allChefs.map((chef) => {
    let delivers = "please enter your location";

    if (location) {
      const chefLat = parseFloat(chef.kitchenAddress.latitude);
      const chefLon = parseFloat(chef.kitchenAddress.longitude);
      const chefLocation = [chefLat, chefLon];
      const userLocation = [
        parseFloat(location.latitude),
        parseFloat(location.longitude),
      ];
      const distance = getDistanceFromLatLonInKm(chefLocation, userLocation);
      // console.log(`Distance: ${distance.toFixed(2)} km`);
      delivers = distance <= constants.deliversDistanceKM ? true : false; // true if within 10 km
    }

    return {
      ...chef.toObject(),
      delivers,
    };
  });
  return chefsWithDelivery;
};
