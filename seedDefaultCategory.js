const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("../models/Category");

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Category.deleteMany({ is_default: true });

        await Category.insertMany([
            { user_id: null, name: "Mua sắm", icon_code_point: 62335, type: "expense", is_default: true },
            { user_id: null, name: "Đồ ăn", icon_code_point: 57946, type: "expense", is_default: true },
            { user_id: null, name: "Quần áo", icon_code_point: 0xf5d1, type: "expense", is_default: true },
            { user_id: null, name: "Nhà ở", icon_code_point: 0xe318, type: "expense", is_default: true },
            { user_id: null, name: "Sức khỏe", icon_code_point: 0xe25b, type: "expense", is_default: true },
            { user_id: null, name: "Học tập", icon_code_point: 0xe0ef, type: "expense", is_default: true },
            { user_id: null, name: "Du lịch", icon_code_point: 0xe295, type: "expense", is_default: true },
            { user_id: null, name: "Giải trí", icon_code_point: 0xe6a1, type: "expense", is_default: true },
            { user_id: null, name: "Sửa chữa", icon_code_point: 0xe0af, type: "expense", is_default: true },
            { user_id: null, name: "Sắc đẹp", icon_code_point: 0xeb4c, type: "expense", is_default: true },
            { user_id: null, name: "Điện thoại", icon_code_point: 0xe4e2, type: "expense", is_default: true },

            { user_id: null, name: "Lương", icon_code_point: 0xe227, type: "income", is_default: true },
            { user_id: null, name: "Làm thêm", icon_code_point: 0xe8f9, type: "income", is_default: true },
            { user_id: null, name: "Tiền thưởng", icon_code_point: 0xe263, type: "income", is_default: true },
        ]);

        console.log("Seed thành công!");
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

seed();