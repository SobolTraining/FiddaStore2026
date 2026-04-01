import { updateQuantity, removeFromCart } from './cart.js';

// 1. وظيفة عرض المنتجات في الصفحة (الـ Cards)
export function renderProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        // الالتزام بكلاس .product-card الموجود بالـ CSS تبعك
        card.className = 'product-card'; 
        
        card.innerHTML = `
            <div class="product-image">
                ${product.discount ? `<span class="discount-badge">خصم ${product.discount}%</span>` : ''}
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <div class="horizontal-info-row">
                    <div class="price-group">
                        ${product.oldPrice ? `<span class="old-price">$${product.oldPrice}</span>` : ''}
                        <span class="current-price">$${product.price}</span>
                    </div>
                    <div class="size-select-group">
                        <select class="size-select" id="size-${product.id}">
                            <option value="">المقاس</option>
                            ${product.sizes.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <button class="add-to-cart-btn" data-id="${product.id}">إضافة للسلة</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// 2. وظيفة عرض السلة (الـ Modal)
export function renderCart(cart, products) {
    const checkoutDetails = document.getElementById('checkout-details');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

    if (!checkoutDetails) return;
    checkoutDetails.innerHTML = '';

    let subtotal = 0;

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            const price = product.price;
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;

            // الالتزام بكلاسات السلة: checkout-item, item-info, item-actions, qty-btn, delete-btn
            const itemRow = document.createElement('div');
            itemRow.className = 'checkout-item';
            itemRow.innerHTML = `
                <div class="item-info">
                    <p><strong>${product.name}</strong></p>
                    <p>المقاس: ${item.size}</p>
                    <p>${item.quantity} x $${price} = $${itemTotal}</p>
                </div>
                <div class="item-actions">
                    <button class="qty-btn minus" data-id="${item.id}" data-size="${item.size}">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn plus" data-id="${item.id}" data-size="${item.size}">+</button>
                    <button class="delete-btn" data-id="${item.id}" data-size="${item.size}">حذف</button>
                </div>
            `;
            checkoutDetails.appendChild(itemRow);
        }
    });

    const shipping = 4.00; // ثابتة حسب الـ CSS والمنطق السابق
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${(subtotal + shipping).toFixed(2)}`;

    attachCartEvents();
}

function attachCartEvents() {
    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
        btn.onclick = () => updateQuantity(btn.dataset.id, btn.dataset.size, 1);
    });
    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
        btn.onclick = () => updateQuantity(btn.dataset.id, btn.dataset.size, -1);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = () => removeFromCart(btn.dataset.id, btn.dataset.size);
    });
}