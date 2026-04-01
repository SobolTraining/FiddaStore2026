import { fetchProducts } from './api.js';
import { renderProducts } from './render.js';
import { renderCheckoutDetails, submitOrder } from './ui.js';
import { updateCartDisplay, cart } from './cart.js';

let currentCategory = 'AbayaEssentials';

async function init() {
    const products = await fetchProducts();
    const container = document.getElementById('products-container');
    const suggestContainer = document.getElementById('suggestion-items-container');

    // الرسم الأولي
    renderProducts(products, container, currentCategory);
    renderProducts(products, suggestContainer, currentCategory);

    // ربط التنقل بين الأقسام
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentCategory = e.target.dataset.category;
            renderProducts(products, container, currentCategory);
        });
    });

    // السلة والمودال
    document.getElementById('cart-btn').onclick = () => {
        renderCheckoutDetails();
        document.getElementById('checkout-modal').style.display = 'block';
    };

    document.querySelector('.close-btn').onclick = () => {
        document.getElementById('checkout-modal').style.display = 'none';
    };

    document.getElementById('checkout-form').onsubmit = submitOrder;
}

// دالة عالمية لتغيير الكمية من داخل المودال
window.updateQty = (key, action) => {
    if (action === 'increase') cart[key].quantity++;
    else {
        cart[key].quantity--;
        if (cart[key].quantity < 1) delete cart[key];
    }
    renderCheckoutDetails();
    updateCartDisplay();
};

init();