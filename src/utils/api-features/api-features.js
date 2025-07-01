class ApiFeatures {
  constructor(mongooseQuery, data) {
    this.mongooseQuery = mongooseQuery;
    this.data = data;
  }

  pagination() {
    let { page, limit } = this.data;
    if (!limit || limit <= 0) {
      limit = 4;
    }
    if (!page || page <= 0) {
      page = 1;
    }
    const skip = (Number(page) - 1) * Number(limit);
    this.mongooseQuery.limit(limit).skip(skip);
    return this;
  }

  sort() {
    if (this.data.sort) {
      this.mongooseQuery.sort(this.data.sort.replaceAll(",", " "));
      return this;
    }
    return this;
  }

  fields() {
    if (this.data.fields) {
      this.mongooseQuery.select(this.data.fields.replaceAll(",", " "));
      return this;
    }

    return this;
  }
  // search(field1, field2) {
  //   if (this.data?.search) {
  //     this.mongooseQuery.find({
  //       $or: [
  //         { [field1]: { $regex: this.data.search } },
  //         { [field2]: { $regex: this.data.search } },
  //       ],
  //     });
  //     return this;
  //   }

  //   return this;
  // }

  search(...fields) {
    if (this.data?.search && fields.length > 0) {
      const orConditions = fields.map((field) => {
        return { [field]: { $regex: this.data.search, $options: "i" } };
      });
      this.mongooseQuery.find({ $or: orConditions });
    }
    return this;
  }
  filter() {
  const { page = 1, limit = 4, sort, fields, search, ...filters } = this.data;
  if (filters) {
    const filtersAsString = JSON.stringify(filters);
    const replacedFilters = filtersAsString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );
    const parsedFilters = JSON.parse(replacedFilters);

    // Convert string numbers to actual numbers
    for (const key in parsedFilters) {
      const value = parsedFilters[key];
      if (typeof value === 'object') {
        for (const op in value) {
          const num = Number(value[op]);
          if (!isNaN(num)) value[op] = num;
        }
      }
    }
    this.mongooseQuery.find(parsedFilters);
  }
  return this;
}
}

export default ApiFeatures;
