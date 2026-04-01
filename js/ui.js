import { allProducts } from './api.js';
import { cart, CURRENCY, shippingFee, updateCartDisplay, addToCart, resetCart } from './cart.js';
import { renderProducts } from './render.js';

// عناصر المودال
const productModal = document.getElementById('product-details-modal');
const checkoutModal = document.getElementById('checkout-modal');

export function openProductDetailsModal(productId) {
    const product = Object.values(allProducts).find(p => p.id == productId || p.itemID == productId);
    if (!product) return;

    document.getElementById('modal-product-image').src = product.imageURLs?.[0] || 'logo.png';
    document.getElementById('modal-product-name').textContent = product.nameAR;
    document.getElementById('modal-product-description').textContent = product.descriptionAR;
    document.getElementById('modal-current-price').textContent = `${CURRENCY} ${product.price.toFixed(2)}`;
    
    const sizeSelect = document.getElementById('modal-size-select');
    sizeSelect.innerHTML = '<option value="" disabled selected>--- اختر المقاس ---</option>';
    (product.availableSizes || []).forEach(s => {
        const opt = document.createElement('option');
        opt.value = s; opt.textContent = s;
        sizeSelect.appendChild(opt);
    });

    document.getElementById('modal-add-to-cart-btn').onclick = () => {
        if (sizeSelect.value === "") {
            sizeSelect.classList.add('required-highlight');
            return;
        }
        addToCart(product.itemID || productId, sizeSelect.value);
        productModal.style.display = 'none';
    };

    productModal.style.display = 'flex';
}

export function renderCheckoutDetails() {
    const container = document.getElementById('checkout-details');
    let subtotal = 0;
    container.innerHTML = '';

    Object.values(cart).forEach(item => {
        const price = item.product.discountedPrice || item.product.price;
        const itemTotal = item.quantity * price;
        subtotal += itemTotal;

        const div = document.createElement('div');
        div.className = 'checkout-item';
        div.innerHTML = `
            <div class="item-info">
                <p><strong>${item.product.nameAR}</strong> (${item.selectedSize})</p>
                <p>${item.quantity} x ${price.toFixed(2)} = ${itemTotal.toFixed(2)} ${CURRENCY}</p>
            </div>
            <div class="item-actions">
                <button onclick="window.updateQty('${item.key}', 'decrease')">-</button>
                <span>${item.quantity}</span>
                <button onclick="window.updateQty('${item.key}', 'increase')">+</button>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('subtotal').textContent = `${subtotal.toFixed(2)} ${CURRENCY}`;
    document.getElementById('final-total').textContent = `${(subtotal + shippingFee).toFixed(2)} ${CURRENCY}`;
}

export async function submitOrder(e) {
    e.preventDefault();
    if (Object.keys(cart).length === 0) return alert("السلة فارغة");

    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        cart: JSON.stringify(cart),
        total: document.getElementById('final-total').textContent
    };

    const response = await fetch("https://formspree.io/f/xkgyglrj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    });

    if (response.ok) {
        alert("تم الطلب بنجاح");
        resetCart();
        checkoutModal.style.display = 'none';
    }
}