/* =========================================
   DAR FIDDA - FINAL MASTER SCRIPT (V1.0)
   Strictly matched with index.html & products.json
   ========================================= */

// --- 1. الإعدادات والمتغيرات الأساسية ---
const CURRENCY = '$';
const shippingFee = 4.00;
let allProducts = {}; // لتخزين البيانات الأصلية للوصول السريع
let cart = {}; 
let currentCategory = 'AbayaEssentials';

// --- 2. جلب البيانات من الملف الخارجي ---
async function fetchProducts() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();
        allProducts = data; // تخزين البيانات كـ Object (ID هو المفتاح)
        
        // تحويل البيانات لمصفوفة للعرض
        const productsArray = Object.entries(data).map(([id, product]) => ({
            itemID: id,
            ...product
        }));
        
        renderProducts(productsArray);
    } catch (error) {
        console.error("خطأ في تحميل ملف المنتجات:", error);
    }
}

// --- 3. عرض المنتجات في الصفحة الرئيسية ---
function renderProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;
    container.innerHTML = '';

    // تصفية المنتجات حسب القسم الحالي
    const filtered = products.filter(p => p.category === currentCategory);

    filtered.forEach(product => {
        const finalPrice = product.discountedPrice !== undefined ? product.discountedPrice : product.price;
        const hasDiscount = product.discountedPrice !== undefined && product.discountedPrice < product.price;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('id', `product-${product.itemID}`);

        // بناء قائمة المقاسات
        let optionsHTML = `<option value="" disabled selected>المقاس</option>`;
        if (product.availableSizes) {
            optionsHTML += product.availableSizes.map(size => `<option value="${size}">${size}</option>`).join('');
        }

        card.innerHTML = `
            <div class="product-image" onclick="openProductDetailsModal('${product.itemID}')">
                <img src="${product.imageURLs[0]}" alt="${product.nameAR}" loading="lazy">
                ${hasDiscount ? '<span class="discount-badge">خصم!</span>' : ''}
            </div>
            <div class="product-details">
                <h3 class="product-name">${product.nameAR}</h3>
                <div class="horizontal-info-row">
                    <div class="size-select-group">
                        <select id="size-${product.itemID}" class="size-select">${optionsHTML}</select>
                    </div>
                    <span class="view-details-link" onclick="openProductDetailsModal('${product.itemID}')">التفاصيل</span>
                    <div class="price-group">
                        <span class="new-price">${finalPrice.toFixed(2)}${CURRENCY}</span>
                        ${hasDiscount ? `<span class="old-price">${product.price.toFixed(2)}${CURRENCY}</span>` : ''}
                    </div>
                </div>
                <button class="add-to-cart-btn" onclick="handleAddToCart('${product.itemID}')">أضف للسلة</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- 4. إدارة السلة ---
window.handleAddToCart = (itemID) => {
    const sizeSelect = document.getElementById(`size-${itemID}`);
    
    if (sizeSelect && sizeSelect.value === "") {
    sizeSelect.classList.add('required-highlight');
    
    // تشغيل الصوت فوراً
    new Audio('notification.mp3').play().catch(() => {});
    
    // تأخير الـ Alert قليلاً جداً ليعمل الصوت والوميض
    setTimeout(() => {
        alert("من فضلكِ، اختاري المقاس أولاً ✨");
    }, 100);

    // إزالة الوميض بعد ثانية
    setTimeout(() => sizeSelect.classList.remove('required-highlight'), 1000);
    return;
}

    const size = sizeSelect ? sizeSelect.value : "N/A";
    const key = `${itemID}_${size}`;
    
    if (cart[key]) {
        cart[key].quantity++;
    } else {
        cart[key] = {
            product: allProducts[itemID],
            quantity: 1,
            selectedSize: size,
            itemID: itemID
        };
    }

    // صوت إشعار (اختياري)
    new Audio('notification.mp3').play().catch(() => {});
    updateCartCount();
};

function updateCartCount() {
    const count = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// --- 5. مودال تفاصيل المنتج (نسخة العرض فقط) ---
window.openProductDetailsModal = (itemID) => {
    const product = allProducts[itemID];
    if (!product) return;

    // تعبئة البيانات الأساسية في المودال
    const modalImg = document.getElementById('modal-product-image');
    const modalName = document.getElementById('modal-product-name');
    const modalDesc = document.getElementById('modal-product-description');
    const modalPrice = document.getElementById('modal-current-price');
    const modalOldPrice = document.getElementById('modal-old-price');

    if (modalImg) modalImg.src = product.imageURLs[0];
    if (modalName) modalName.textContent = product.nameAR;
    
    // استخدام innerHTML للسماح بتنسيق الوصف (مثل الأسطر الجديدة)
    if (modalDesc) modalDesc.innerHTML = product.descriptionAR || "الوصف سيتم إضافته قريباً.";

    // إدارة عرض السعر والخصم
    const finalPrice = product.discountedPrice || product.price;
    if (modalPrice) modalPrice.textContent = `${finalPrice.toFixed(2)}${CURRENCY}`;

    if (modalOldPrice) {
        if (product.discountedPrice) {
            modalOldPrice.textContent = `${product.price.toFixed(2)}${CURRENCY}`;
            modalOldPrice.style.display = 'inline';
        } else {
            modalOldPrice.style.display = 'none';
        }
    }

    // إظهار المودال النهائي
    const modal = document.getElementById('product-details-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
};

// --- 6. عرض محتويات السلة في المودال (Checkout) ---
function renderCheckoutDetails() {
    const container = document.getElementById('checkout-details');
    if (!container) return;
    container.innerHTML = '';

    let subtotal = 0;

    Object.entries(cart).forEach(([key, item]) => {
        const itemPrice = item.product.discountedPrice || item.product.price;
        const itemTotal = itemPrice * item.quantity;
        subtotal += itemTotal;

        const div = document.createElement('div');
        div.className = 'checkout-item';
        div.innerHTML = `
            <div class="item-info">
                <span class="item-name">${item.product.nameAR} (${item.selectedSize})</span>
                <span class="item-price">${itemPrice.toFixed(2)}${CURRENCY} x ${item.quantity}</span>
            </div>
            <div class="qty-controls">
                <button onclick="updateQty('${key}', 'decrease')">-</button>
                <button onclick="updateQty('${key}', 'increase')">+</button>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('subtotal').textContent = `${subtotal.toFixed(2)}${CURRENCY}`;
    document.getElementById('final-total').textContent = `${(subtotal + shippingFee).toFixed(2)}${CURRENCY}`;
}

window.updateQty = (key, action) => {
    if (action === 'increase') cart[key].quantity++;
    else {
        cart[key].quantity--;
        if (cart[key].quantity < 1) delete cart[key];
    }
    renderCheckoutDetails();
    updateCartCount();
};

// --- 7. إرسال الطلب عبر Formspree ---
document.getElementById('checkout-form').onsubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(cart).length === 0) return alert("السلة فارغة!");

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "جاري الإرسال...";

    const orderData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        region: document.getElementById('region-select').value,
        address: document.getElementById('address').value,
        notes: document.getElementById('notes').value,
        items: JSON.stringify(cart),
        total: document.getElementById('final-total').textContent
    };

    try {
        const response = await fetch("https://formspree.io/f/xkgyglrj", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            alert("تم إرسال طلبك بنجاح! شكراً لثقتك بدار فضة.");
            cart = {};
            updateCartCount();
            document.getElementById('checkout-modal').style.display = 'none';
            e.target.reset();
        } else {
            alert("حدث خطأ، يرجى المحاولة لاحقاً.");
        }
    } catch (err) {
        alert("فشل الاتصال بالسيرفر.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "إتمام الطلب الآن";
    }
};

// --- 8. التحكم بفتح وإغلاق المودالات ---
document.getElementById('cart-btn').onclick = () => {
    renderCheckoutDetails();
    document.getElementById('checkout-modal').style.display = 'block';
};

document.querySelectorAll('.close-btn, .close-modal-btn').forEach(btn => {
    btn.onclick = () => {
        document.getElementById('checkout-modal').style.display = 'none';
        document.getElementById('product-details-modal').style.display = 'none';
    };
});

// إغلاق المودال عند النقر خارجه
window.onclick = (event) => {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
};

// --- تشغيل التطبيق ---
fetchProducts();
