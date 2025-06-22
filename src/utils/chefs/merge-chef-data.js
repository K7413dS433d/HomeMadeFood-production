export const mergeChefData = ({ chefsWithRate, chefsWithDelivery }) => {
  // Merge by chef ID
  const mergedChefs = chefsWithRate.map((chefWithRate) => {
    const matchingDelivery = chefsWithDelivery.find(
      (chefWithDelivery) =>
        chefWithDelivery._id.toString() === chefWithRate._id.toString()
    );
    return {
      ...chefWithRate,
      delivers: matchingDelivery?.delivers,
    };
  });
  return mergedChefs;
};
