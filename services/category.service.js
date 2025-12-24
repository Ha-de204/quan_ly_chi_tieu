const Category = require('../models/Category');
const mongoose = require('mongoose');

// 1. Lấy danh mục mặc định và danh mục của user
const getCategoriesByUser = async (user_id) => {
    return await Category.find({
        $or: [
            { is_default: true },
            { user_id: new mongoose.Types.ObjectId(user_id) }
        ]
    }).sort({ is_default: -1, name: 1 });
};

// 2. Tạo danh mục mới
const createCategory = async (user_id, name, iconCodePoint) => {
    const newCategory = new Category({
        user_id: new mongoose.Types.ObjectId(user_id),
        name: name,
        icon_code_point: iconCodePoint,
        is_default: false
    });

    const result = await newCategory.save();
    return result._id;
};

// 3. Cập nhật danh mục (Chỉ cho phép sửa danh mục riêng của user)
const updateCategory = async (categoryId, user_id, name, iconCodePoint) => {
    const result = await Category.updateOne(
        {
            _id: new mongoose.Types.ObjectId(categoryId),
            user_id: new mongoose.Types.ObjectId(user_id),
            is_default: false
        },
        {
            name: name,
            icon_code_point: iconCodePoint
        }
    );

    return result.modifiedCount > 0;
};

// 4. Xóa danh mục
const deleteCategory = async (categoryId, user_id) => {
    const result = await Category.deleteOne({
        _id: new mongoose.Types.ObjectId(categoryId),
        user_id: new mongoose.Types.ObjectId(user_id),
        is_default: false
    });

    return result.deletedCount > 0;
};

module.exports = {
    getCategoriesByUser,
    createCategory,
    updateCategory,
    deleteCategory
};