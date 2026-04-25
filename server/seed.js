const User = require("./models/User");
const MenuItem = require("./models/MenuItem");

const DEFAULT_MENU = [
  { name: "Butter Chicken", description: "Creamy tomato curry, tender chicken", price: 320, category: "Mains", image: "🍛" },
  { name: "Paneer Tikka", description: "Smoky grilled cottage cheese", price: 240, category: "Starters", image: "🧀" },
  { name: "Garlic Naan", description: "Tandoor-baked, brushed with butter", price: 60, category: "Breads", image: "🫓" },
  { name: "Hyderabadi Biryani", description: "Aromatic basmati, slow-cooked", price: 280, category: "Mains", image: "🍚" },
  { name: "Masala Dosa", description: "Crisp crepe with spiced potato", price: 140, category: "South Indian", image: "🥞" },
  { name: "Gulab Jamun", description: "Warm, syrup-soaked dessert", price: 90, category: "Desserts", image: "🍮" },
  { name: "Mango Lassi", description: "Chilled yogurt smoothie", price: 110, category: "Drinks", image: "🥭" },
  { name: "Veg Thali", description: "Complete meal with sides", price: 350, category: "Mains", image: "🍱" },
];

module.exports = async function seed() {
  // Seed admin user
  const adminExists = await User.findOne({ email: "admin@restro.app" });
  if (!adminExists) {
    await User.create({
      name: "Admin",
      email: "admin@restro.app",
      password: "yokesh1290",
      role: "admin",
    });
    console.log("✅ Admin user seeded");
  }

  // Seed menu items
  const menuCount = await MenuItem.countDocuments();
  if (menuCount === 0) {
    await MenuItem.insertMany(DEFAULT_MENU);
    console.log("✅ Default menu seeded");
  }
};
