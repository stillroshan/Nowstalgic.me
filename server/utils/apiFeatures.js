class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'q'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Handle visibility filter
    if (queryObj.visibility && queryObj.visibility !== 'all') {
      queryObj.visibility = queryObj.visibility;
    } else {
      delete queryObj.visibility;
    }

    // Handle time range filter
    if (queryObj.timeRange && queryObj.timeRange !== 'all') {
      queryObj.createdAt = {
        $gte: new Date(Date.now() - this.getTimeRangeInMs(queryObj.timeRange))
      };
    }
    delete queryObj.timeRange;

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort;
      switch (sortBy) {
        case 'relevance':
          this.query = this.query.sort({ score: { $meta: 'textScore' } });
          break;
        case 'date':
          this.query = this.query.sort('-createdAt');
          break;
        case 'popularity':
          this.query = this.query.sort('-followersCount -createdAt');
          break;
        default:
          this.query = this.query.sort('-createdAt');
      }
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  search() {
    if (this.queryString.q) {
      const searchQuery = this.queryString.q;
      
      // Build search pipeline
      const searchStage = {
        $search: {
          index: this.getSearchIndex(),
          compound: {
            should: [
              {
                autocomplete: {
                  query: searchQuery,
                  path: this.getSearchPaths(),
                  fuzzy: {
                    maxEdits: 1
                  }
                }
              },
              {
                text: {
                  query: searchQuery,
                  path: this.getSearchPaths(),
                  fuzzy: {
                    maxEdits: 1
                  }
                }
              }
            ]
          }
        }
      };

      // Add search score
      const addFieldsStage = {
        $addFields: {
          score: { $meta: "searchScore" }
        }
      };

      this.query = this.query.aggregate([searchStage, addFieldsStage]);
    }
    return this;
  }

  getSearchIndex() {
    const modelName = this.query.model.modelName.toLowerCase();
    return `${modelName}_search`;
  }

  getSearchPaths() {
    const modelName = this.query.model.modelName.toLowerCase();
    switch (modelName) {
      case 'user':
        return ['username', 'displayName', 'bio'];
      case 'timeline':
        return ['title', 'description', 'tags'];
      case 'event':
        return ['title', 'description', 'location', 'tags.text'];
      default:
        return [];
    }
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  getTimeRangeInMs(range) {
    const ranges = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000
    };
    return ranges[range] || 0;
  }
}

export default APIFeatures; 