const createError = require('http-errors');
const ListProduct = require('../../models/product/list_product.model');
const InfoProduct = require('../../models/product/info_product.model');
const {
    error_missing
} = require('../../configs/response');

module.exports = {
    createItemProducts: async (req, res, next) => {
        try {
            let { name, price, link_image, type, status } = req.body;

            let product_id = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

            let key_search = product_id.split('-');
            key_search.push(type);

            const isExists = await ListProduct.findOne({
                name
            });

            if (isExists) {
                throw createError.Conflict(`${name} has existed`)
            };

            const newProduct = new ListProduct({
                name, price, link_image, type, status, product_id, key_search
            });

            const savedProduct = await newProduct.save();

            return res.status(200).json({
                status: true,
                elements: savedProduct
            });
        } catch (err) {
            next(err);
        }
    },

    getListProducts: async (req, res, next) => {
        try {
            const pipeline = [
                {
                    $group: {
                        _id: '$type',
                        list_item: { $push: '$$ROOT' },
                    },
                },
            ];
            const listProducts = await ListProduct.aggregate(pipeline);

            for (let i = 0; i < listProducts.length; i++) {
                listProducts[i].list_item.sort((itemA, itemB) => {
                    if (itemA.status === "old" && itemB.status === "new") {
                        return 1;
                    } else if (itemA.status === "new" && itemB.status === "old") {
                        return -1;
                    }
                    return 0;
                })
                let sliceList = listProducts[i].list_item.slice(0, 6);
                listProducts[i].list_item = sliceList;
            }


            // Ưu tiên Vinfast > Mercedes > Tesla > ...
            const priorityOrder = ['vinfast', 'mercedes', 'tesla'];
            listProducts.sort((a, b) => {
                const indexA = priorityOrder.indexOf(a._id);
                const indexB = priorityOrder.indexOf(b._id);

                if (indexA === -1 && indexB === -1) {
                    return 0; // Giữ nguyên vị trí nếu cả hai không nằm trong danh sách ưu tiên
                } else if (indexA === -1) {
                    return 1; // Đẩy phần tử không nằm trong danh sách ưu tiên xuống dưới
                } else if (indexB === -1) {
                    return -1; // Đẩy phần tử không nằm trong danh sách ưu tiên lên trên
                }

                return indexA - indexB; // Sắp xếp theo thứ tự ưu tiên
            });

            return res.status(200).json({
                status: true,
                data: listProducts
            })
        } catch (err) {
            next(err);
        }
    },

    getListProductsWithType: async (req, res, next) => {
        try {
            let { type } = req.params;

            if (!type) {
                return res.status(400).json(error_missing("type"))
            };

            const pipeline = [
                {
                    $match: {
                        type: type,
                    },
                },
            ];

            const listProducts = await ListProduct.aggregate(pipeline);

            return res.status(200).json({
                status: true,
                data: {
                    type,
                    list_products: listProducts
                }
            })
        } catch (err) {
            next(err);
        }
    },

    getDetailProduct: async (req, res, next) => {
        try {
            let { product_id } = req.params;
            const detailProduct = await ListProduct.findOne({
                product_id
            });

            return res.status(200).json({
                status: true,
                data: detailProduct
            })
        } catch (err) {
            next(err);
        }
    },

    searchProduct: async (req, res, next) => {
        try {
            let { key_search } = req.query;

            // if (!key_search) {
            //     return res.status(400).json(error_missing("key_search"))
            // };

            key_search = key_search.split(' ').filter(Boolean).reverse();

            let result = [];

            for (let i = 0; i < key_search.length; i++) {
                await ListProduct.find({
                    key_search: {
                        $elemMatch: {
                            $regex: new RegExp(key_search[i], "i") // Sử dụng RegExp để tìm kiếm không phân biệt chữ hoa và chữ thường
                        }
                    }
                }).sort('-createdAt')
                    .then((products) => {
                        //Sort status NEW
                        products.sort((itemA, itemB) => {
                            if (itemA.status === "new" && itemB.status !== "new") {
                                return -1
                            } else if ((itemA.status !== "new" && itemB.status === "new")) {
                                return 1
                            } else {
                                return 0
                            }
                        })
                        result = result.concat(products.splice(0, 6))
                    })
            }


            return res.status(200).json({
                status: true,
                data: result.splice(0, 6)
            })
        } catch (err) {
            next(err);
        }
    },

    createInfoProduct: async (req, res, next) => {
        try {
            let { product_id, content, content_en } = req.body;

            if (!product_id || !content) {
                return res.status(400).json(error_missing("product_id && content"))
            };

            const product = await ListProduct.findOne({
                product_id
            });

            if (!product) {
                return res.status(400).json({
                    status: false,
                    message: "Product not found !",
                })
            };

            const infoProduct = await InfoProduct.findOne({
                product_id
            });

            if (infoProduct) {
                return res.status(400).json({
                    status: false,
                    message: "Info of the product is exist !",
                })
            }

            let newInfo = new InfoProduct({
                product_id: product.product_id,
                content,
                content_en
            })
            await newInfo.save()
                .catch(err => {
                    return res.status(500).json({
                        status: false,
                        message: err.message
                    })
                })

            return res.status(200).json({
                status: true,
                data: newInfo
            })
        } catch (err) {
            next(err);
        }
    },

    getInfoProduct: async (req, res, next) => {
        try {
            let { product_id } = req.params;

            if (!product_id) {
                return res.status(400).json(error_missing("product_id"))
            };

            const product = await ListProduct.findOne({
                product_id
            });

            if (!product) {
                return res.status(400).json({
                    status: false,
                    message: "Product not found !",
                })
            };

            const infoProduct = await InfoProduct.findOne({
                product_id
            });

            if (!infoProduct) {
                return res.status(400).json({
                    status: false,
                    message: "Info of the product is not exist !",
                })
            }
            return res.status(200).json({
                status: true,
                data: infoProduct
            })
        } catch (err) {
            next(err);
        }
    },
}