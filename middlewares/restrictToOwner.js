const ApiError = require("../utils/apiError");
const Seller = require("../models/sellerModel");

/**
 * Restrict to owner of a specific resource
 * @param {Model} resourceModel - Mongoose model of the resource
 * @param {string} [idParam="id"] - name of the parameter to get the resource id from
 * @param {string} [ownerField="user"] - The role
 * @returns {Function} - middleware function to restrict access to owners
 */
const restrictToOwner = (resourceModel, idParam = "id", ownerField = "user") => {
    return async (req, res, next) => {
        const resource = await resourceModel.findById(req.params[idParam]);
        if (!resource) {
            return next(new ApiError(`${resourceModel.modelName} not found`, 404));
        }

        // Admin can access everything
        if (req.user.role === "admin") return next();

        // Special case: Product -> seller -> user
        if (ownerField === "seller") {
            const seller = await Seller.findById(resource.seller);
            if (!seller || seller.user.toString() !== req.user._id.toString()) {
                return next(new ApiError(`You do not own this ${resourceModel.modelName.toLowerCase()}`, 403));
            }
        } else {
            // Normal direct ownership check
            if (resource[ownerField].toString() !== req.user._id.toString()) {
                return next(new ApiError(`You do not own this ${resourceModel.modelName.toLowerCase()}`, 403));
            }
        }

        next();
    };
};
module.exports = restrictToOwner;
