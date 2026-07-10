const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
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

// 2. Tao danh muc mac dinh
const createDefaultCategories = async (user_id) => {
    const defaultCategories = [
        { name: 'Mua sắm', icon_code_point: 0xe59c, type: 'expense' },
        { name: 'Đồ ăn', icon_code_point: 0xe25a, type: 'expense' },
        { name: 'Quần áo', icon_code_point: 0xf5d1, type: 'expense' },
        { name: 'Nhà ở', icon_code_point: 0xe318, type: 'expense' },
        { name: 'Sức khỏe', icon_code_point: 0xe25b, type: 'expense' },
        { name: 'Học tập', icon_code_point: 0xe0ef, type: 'expense' },
        { name: 'Du lịch', icon_code_point: 0xe295, type: 'expense' },
        { name: 'Giải trí', icon_code_point: 0xe6a1, type: 'expense' },
        { name: 'Sửa chữa', icon_code_point: 0xe0af, type: 'expense' },
        { name: 'Sắc đẹp', icon_code_point:0xeb4c, type: 'expense' },
        { name: 'Điện thoại', icon_code_point: 0xe4e2, type: 'expense' },
        { name: 'Cài đặt', icon_code_point: 0xe57f, type: 'expense' },

        { name: 'Lương', icon_code_point: 0xe227, type: 'income' },
        { name: 'Làm thêm', icon_code_point: 0xe8f9, type: 'income' },
        { name: 'Tiền thưởng', icon_code_point: 0xe263, type: 'income' },

    ];

    const categoriesWithUser = defaultCategories.map(cat => ({
        ...cat,
        user_id: new mongoose.Types.ObjectId(user_id),
        is_default: true
    }));

    return await Category.insertMany(categoriesWithUser);
};

// 3. Tạo danh mục mới
const createCategory = async (user_id, name, iconCodePoint, type) => {
    // Kiểm tra trùng tên
    name = name.trim();

    const existed = await Category.findOne({
        $or: [
            { user_id: new mongoose.Types.ObjectId(user_id) },
            { is_default: true }
        ],
        name,
        type
    });

    if (existed) {
        return {
            success: false,
            message: "Danh mục đã tồn tại."
        };
    }

    const newCategory = new Category({
        user_id: new mongoose.Types.ObjectId(user_id),
        name: name,
        icon_code_point: iconCodePoint,
         type: type,
        is_default: false
    });

    await newCategory.save();
    return {
       success: true
    };
};

// 4. Cập nhật danh mục (Chỉ cho phép sửa danh mục riêng của user)
const updateCategory = async (
    categoryId,
    user_id,
    name,
    iconCodePoint,
    type
) => {

    const category = await Category.findOne({
        _id: new mongoose.Types.ObjectId(categoryId),
        user_id: new mongoose.Types.ObjectId(user_id)
    });

    if (!category) {
        return {
            success: false,
            message: "Không tìm thấy danh mục."
        };
    }

    if (category.is_default) {
        return {
            success: false,
            message: "Danh mục mặc định không thể sửa."
        };
    }

    name = name.trim();

    const existed = await Category.findOne({
        _id: { $ne: category._id },
        $or: [
            { user_id: new mongoose.Types.ObjectId(user_id) },
            { is_default: true }
        ],
        name,
        type
    });

    if (existed) {
        return {
            success: false,
            message: "Danh mục đã tồn tại."
        };
    }

    category.name = name;
    category.icon_code_point = iconCodePoint;
    category.type = type;

    await category.save();

    return {
        success: true
    };
};

// 5. Kiểm tra danh mục đã có giao dịch hay chưa
const isCategoryUsed = async (categoryId) => {
    const transaction = await Transaction.findOne({
        category_id: new mongoose.Types.ObjectId(categoryId)
    });

    return transaction !== null;
};

// 6. Xóa danh mục
const deleteCategory = async (categoryId, user_id) => {

    // Lấy thông tin danh mục
    const category = await Category.findOne({
        _id: new mongoose.Types.ObjectId(categoryId),
        user_id: new mongoose.Types.ObjectId(user_id)
    });

    if (!category) {
        return {
            success: false,
            message: "Không tìm thấy danh mục."
        };
    }

    // Không cho xóa danh mục mặc định
    if (category.is_default) {
        return {
            success: false,
            message: "Danh mục mặc định không thể xóa."
        };
    }

    // Kiểm tra đã được dùng chưa
    const used = await isCategoryUsed(categoryId);

    if (used) {
        return {
            success: false,
            message: "Danh mục đã có giao dịch nên không thể xóa."
        };
    }

    await Category.deleteOne({
        _id: category._id
    });

    return {
        success: true
    };
};

module.exports = {
    getCategoriesByUser,
    createCategory,
    updateCategory,
    deleteCategory,
    isCategoryUsed
};