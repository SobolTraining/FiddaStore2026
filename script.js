const CURRENCY = '$';
const productsContainer = document.getElementById('products-container');
const suggestionContainer = document.getElementById('suggestion-items-container');
const cartCountElement = document.getElementById('cart-count'); 
const cartButton = document.getElementById('cart-btn'); 
const checkoutModal = document.getElementById('checkout-modal');
const closeBtn = document.querySelector('.close-btn');
const checkoutDetails = document.getElementById('checkout-details');
const subtotalElement = document.getElementById('subtotal');
const discountElement = document.getElementById('discount-amount');
const finalTotalElement = document.getElementById('final-total');
const mainNavList = document.getElementById('main-nav-list');
const subCategoryList = document.getElementById('sub-category-list');
const shippingFee = 4.00; 
// المتغيرات الخاصة بمودال تفاصيل المنتج
const productDetailsModal = document.getElementById('product-details-modal');
const closeProductModalBtn = productDetailsModal.querySelector('.close-modal-btn');
const modalProductImage = document.getElementById('modal-product-image');
const modalProductName = document.getElementById('modal-product-name');
const modalProductDescription = document.getElementById('modal-product-description');
const modalCurrentPrice = document.getElementById('modal-current-price');
const modalOldPrice = document.getElementById('modal-old-price');
const modalStockStatus = document.getElementById('modal-stock-status');
const modalSizeSelect = document.getElementById('modal-size-select');
const modalAddToCartBtn = document.getElementById('modal-add-to-cart-btn');

// ==============================================
// دالة لملء وفتح مودال تفاصيل المنتج
// ==============================================

function openProductDetailsModal(productId) {
    // 1. العثور على المنتج بالـ ID
    const product = products.find(p => p.id === productId);

    if (!product) {
        console.error("Product not found with ID:", productId);
        return;
    }

    // 2. ملء البيانات في عناصر الـ HTML
    
    // الصورة والاسم والوصف
    //modalProductImage.src = product.image;
    modalProductImage.src = product.imageURLs && product.imageURLs.length > 0 ? product.imageURLs[0] : 'logo.png';
    //modalProductName.textContent = product.name;
    modalProductName.textContent = product.nameAR;
    //modalProductDescription.textContent = product.description;
    modalProductDescription.textContent = product.descriptionAR;
    
    // السعر
    modalCurrentPrice.textContent = `$ ${product.price.toFixed(2)}`;
    if (product.oldPrice) {
        modalOldPrice.textContent = `$ ${product.oldPrice.toFixed(2)}`;
        modalOldPrice.style.display = 'inline';
    } else {
        modalOldPrice.textContent = '';
        modalOldPrice.style.display = 'none';
    }

    // حالة المخزون
    modalStockStatus.textContent = product.stock;
    modalStockStatus.className = 'stock-status'; // إعادة تعيين الكلاس
    if (product.stock === 'In Stock') {
        modalStockStatus.classList.add('in-stock');
        modalAddToCartBtn.classList.remove('disabled');
        modalAddToCartBtn.textContent = 'أضف للسلة';
    } else if (product.stock === 'Few Left') {
        modalStockStatus.classList.add('few-left');
        modalAddToCartBtn.classList.remove('disabled');
        modalAddToCartBtn.textContent = 'أضف للسلة';
    } else if (product.stock === 'Out of Stock') {
        modalStockStatus.classList.add('out-of-stock');
        modalAddToCartBtn.classList.add('disabled');
        modalAddToCartBtn.textContent = 'نفذت الكمية';
    }

    // خيارات المقاس/النوع
    modalSizeSelect.innerHTML = '<option value="" disabled selected>--- اختر المقاس/النوع * ---</option>'; // تنظيف الخيارات القديمة
    if (product.options && product.options.length > 0) {
        product.options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            modalSizeSelect.appendChild(opt);
        });
        modalSizeSelect.style.display = 'block';
    } else {
        modalSizeSelect.style.display = 'none'; // إخفاء قائمة الاختيار إذا لم يكن هناك خيارات
    }

    // ربط زر الإضافة للسلة بمعرف المنتج الحالي
    modalAddToCartBtn.dataset.productId = productId;
    
    // 3. عرض المودال
    productDetailsModal.style.display = 'flex';
}

// دالة عامة لإغلاق أي مودال (يمكن أن تستخدم لغيره)
function closeModal(modalElement) {
    modalElement.style.display = 'none';
    // تنظيف أي إطارات تحذيرية
    modalSizeSelect.classList.remove('required-highlight');
}
// ==============================================
// 3. معالجة أحداث مودال تفاصيل المنتج
// ==============================================

// 1. ربط زر الإغلاق (X) في مودال تفاصيل المنتج
closeProductModalBtn.addEventListener('click', () => {
    closeModal(productDetailsModal);
});

// 2. إغلاق المودال عند النقر خارج النافذة
window.addEventListener('click', (event) => {
    if (event.target === productDetailsModal) {
        closeModal(productDetailsModal);
    }
});


// 3. ربط زر الإضافة للسلة داخل المودال
modalAddToCartBtn.addEventListener('click', (event) => {
    // التحقق من حالة الكمية (في حال 'نفذت الكمية')
    if (event.target.classList.contains('disabled')) {
        return; 
    }

    const productId = parseInt(event.currentTarget.dataset.productId);
    const selectedSize = modalSizeSelect.value;
    
    // التحقق من اختيار المقاس
    if (modalSizeSelect.style.display !== 'none' && selectedSize === "") {
        modalSizeSelect.classList.add('required-highlight');
        return;
    }

    // إزالة التحذير إذا تم الاختيار
    modalSizeSelect.classList.remove('required-highlight');

    // **استدعاء دالة إضافة المنتج للسلة الحقيقية**
    // (يجب أن يتم استبدال هذا السطر بالدالة الحقيقية لإضافة المنتجات لديكِ)
    addToCart(productId, selectedSize); 

    // إغلاق المودال
    closeModal(productDetailsModal);
});

let allProducts = {};
let cart = {}; 
let currentCategory = 'AbayaEssentials'; 

// =====================================
// 1. الوظائف الأساسية وعرض المنتجات
// =====================================

async function fetchProducts() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();
        
        const productsArray = Object.entries(data).map(([id, product]) => ({
            itemID: id,
            ...product
        }));
        
        allProducts = data; 
        
        return productsArray;
    } catch (error) {
        console.error("Failed to load products:", error);
        productsContainer.innerHTML = '<p class="error-message">عذراً، حدث خطأ أثناء تحميل بيانات المنتجات. يرجى التأكد من وجود ملف products.json.</p>';
        return [];
    }
}

function getStockStatus(stockLevel, itemId) {
    let statusText = '';
    let buttonHTML = '';
    let isAvailable = true;

    if (stockLevel === 0) {
        statusText = '<span style="color: #e74c3c; font-weight: bold;">نفذت الكمية (Out of Stock)</span>';
        buttonHTML = `<button class="add-to-cart-btn disabled" disabled data-id="${itemId}">نفذت الكمية</button>`;
        isAvailable = false;
    } else if (stockLevel > 0 && stockLevel <= 5) {
        statusText = '<span style="color: #f39c12; font-weight: bold;">كمية محدودة (Few Left!)</span>';
        buttonHTML = `<button class="add-to-cart-btn" data-id="${itemId}">أضف للسلة</button>`;
    } else {
        statusText = '<span style="color: #27ae60;">متوفر (In Stock)</span>';
        buttonHTML = `<button class="add-to-cart-btn" data-id="${itemId}">أضف للسلة</button>`;
    }

    return { statusText, buttonHTML, isAvailable };
}

// دالة جديدة لربط حدث النقر على "انقر للتفاصيل"

function renderProducts(products, targetContainer = productsContainer) {
    targetContainer.innerHTML = '';
    
    let displayProducts = products.filter(p => p.category === currentCategory || targetContainer !== productsContainer); 
    
    if (targetContainer !== productsContainer) {
        displayProducts = displayProducts.slice(0, 3);
    }

    if (displayProducts.length === 0 && targetContainer === productsContainer) {
        productsContainer.innerHTML = '<p class="no-results-message">لا توجد منتجات حالياً في هذا القسم.</p>';
        return;
    }

    /*/displayProducts.forEach(product => {
        const finalPrice = product.discountedPrice !== null ? product.discountedPrice : product.price;
        const card = document.createElement('div');
        card.className = 'product-card';
        // شلنا الـ parseInt كرمال الـ IDs مثل AB-001 تضل شغالة
        card.setAttribute('id', `product-${product.itemID}`);

        const stockInfo = getStockStatus(product.inStock ? 10 : 0, product.itemID);

        let sizeOptions = product.availableSizes || [];
        let optionsHTML = `<option value="" disabled selected>اختر</option>`;
        optionsHTML += sizeOptions.map(size => `<option value="${size}">${size}</option>`).join('');
        // توليد صور السلايدر
        const imagesHTML = product.imageURLs && product.imageURLs.length > 0
            ? product.imageURLs.map(url => `<img src="${url}" alt="${product.nameAR}" loading="lazy">`).join('')
            : `<img src="logo.png" alt="${product.nameAR}">`;

        // توليد النقاط (Dots) إذا وجد أكثر من صورة
        const dotsHTML = product.imageURLs && product.imageURLs.length > 1
            ? `<div class="slider-dots">${product.imageURLs.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('')}</div>`
            : '';

        const priceHTML = product.discountedPrice !== null
            ? `<div class="price-group">
                  <span class="new-price">${finalPrice.toFixed(2)} ${CURRENCY}</span>
                  <span class="old-price">${product.price.toFixed(2)} ${CURRENCY}</span>
               </div>`
            : `<span class="new-price">${product.price.toFixed(2)} ${CURRENCY}</span>`;

        // توليد النقاط (Dots) إذا وجد أكثر من صورة
        const dotsHTML = (product.imageURLs && product.imageURLs.length > 1) 
            ? `<div class="slider-dots">${product.imageURLs.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('')}</div>`
            : '';

        // بناء الـ HTML النهائي للكرت
        card.innerHTML = `
            <div class="product-image" onscroll="updateDots(this)">
                ${imagesHTML}
                ${dotsHTML}
                ${product.discountedPrice !== null ? '<span class="discount-badge">خصم!</span>' : ''}
            </div>
            <div class="product-details">
                <h3 class="product-name">${product.nameAR}</h3>
                <div class="horizontal-info-row">
                    <div class="size-select-group">
                        <select id="size-${product.itemID}" class="size-select" data-id="${product.itemID}">${optionsHTML}</select>
                    </div>
                    <span class="view-details-link" data-product-id="${product.itemID}">التفاصيل</span>                
                    <div class="price-group">
                        <span class="new-price">${finalPrice.toFixed(2)} $</span>
                        ${product.discountedPrice !== null ? `<span class="old-price">${product.price.toFixed(2)} $</span>` : ''}
                    </div>
                </div>
                <p class="stock-status-display">${stockInfo.statusText}</p>
                ${stockInfo.buttonHTML}
            </div>
        ;`

        // إضافة الكرت للحاوية
        targetContainer.appendChild(card);
                attachProductButtonsEvents();
        });*/
        displayProducts.forEach(product => {
        const finalPrice = product.discountedPrice !== null ? product.discountedPrice : product.price;
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('id', `product-${product.itemID}`);

        const stockInfo = getStockStatus(product.inStock ? 10 : 0, product.itemID);

        let sizeOptions = product.availableSizes || [];
        let optionsHTML = `<option value="" disabled selected>اختر</option>`;
        optionsHTML += sizeOptions.map(size => `<option value="${size}">${size}</option>`).join('');

        const imagesHTML = product.imageURLs && product.imageURLs.length > 0 
            ? product.imageURLs.map(url => `<img src="${url}" alt="${product.nameAR}" loading="lazy">`).join('')
            : `<img src="logo.png" alt="${product.nameAR}">`;

        const dotsHTML = (product.imageURLs && product.imageURLs.length > 1) 
            ? `<div class="slider-dots">${product.imageURLs.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('')}</div>`
            : '';

        const priceHTML = product.discountedPrice !== null
            ? `<div class="price-group">
                  <span class="new-price">${finalPrice.toFixed(2)} ${CURRENCY}</span>
                  <span class="old-price">${product.price.toFixed(2)} ${CURRENCY}</span>
               </div>`
            : `<span class="new-price">${product.price.toFixed(2)} ${CURRENCY}</span>`;

        card.innerHTML = `
            <div class="product-image" onscroll="updateDots(this)">
                ${imagesHTML}
                ${dotsHTML}
                ${product.discountedPrice !== null ? '<span class="discount-badge">خصم!</span>' : ''}
            </div>
            <div class="product-details">
                <h3 class="product-name">${product.nameAR}</h3>
                <div class="horizontal-info-row">
                    <div class="size-select-group">
                        <select id="size-${product.itemID}" class="size-select" data-id="${product.itemID}">${optionsHTML}</select>
                    </div>
                    <span class="view-details-link" data-product-id="${product.itemID}">التفاصيل</span>                
                    ${priceHTML}
                </div>
                <p class="stock-status-display">${stockInfo.statusText}</p>
                ${stockInfo.buttonHTML}
            </div>
        `;
        
        targetContainer.appendChild(card);
    }); // هيدي تسكيرة الـ forEach اللي كانت ناقصة

    attachProductButtonsEvents();
} // هيدي تسكيرة دالة renderProducts


/*******************************************************/







// دالة تحديث النقاط عند السحب
function updateDots(el) {

    const currentIndex = Math.round(Math.abs(el.scrollLeft) / el.offsetWidth);

    const dots = el.querySelectorAll('.dot');

    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));

} 

// دالة لتحديث النقاط عند سحب الص
function attachViewDetailsEvent() {
    document.querySelectorAll('.view-details-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault(); 
            e.stopPropagation(); 
            
            // 💥 التعديل الحاسم: نستخدم 'link' (وهو الـ <span> الذي ربطنا به الدالة)
            const productId = parseInt(link.getAttribute('data-product-id')); 
            
            // 💡 خطوة التحقق:
            console.log("Product ID read:", productId); 
            
            if (productId) {
                openProductDetailsModal(productId);
            } else {
                console.error("لم يتم العثور على ID المنتج في data-product-id.");
            }
        };
    });
}



// ... (بقية الملف) ...
// ... (بقية الملف) ...

// **دالة جديدة لإظهار التنبيه البصري المؤقت**
function highlightSizeSelector(element) {
    // 1. إضافة كلاس التنبيه الأحمر
    element.classList.add('required-highlight');
    
    // 2. تشغيل صوت التنبيه
    playNotificationSound(); 

    // 3. إزالة الكلاس بعد 1000 مللي ثانية (1 ثانية)
    setTimeout(() => {
        element.classList.remove('required-highlight');
    }, 1000);
}


function attachProductButtonsEvents() {
    // 1. ربط زر الإضافة للسلة
    document.querySelectorAll('.add-to-cart-btn:not(.disabled)').forEach(button => {
        button.onclick = (e) => {
            e.stopPropagation(); 
            const itemId = e.target.getAttribute('data-id');
            const sizeSelect = document.getElementById(`size-${itemId}`);
            const selectedSize = sizeSelect ? sizeSelect.value : null; // تغيير القيمة الافتراضية إلى null

            
            // **التحقق من صحة المقاس (Validation) الجديد**
            if (sizeSelect && selectedSize === "") {
                // بدلاً من alert() المزعج
                highlightSizeSelector(sizeSelect); 
                return; // إيقاف العملية
            }
            
            addToCart(itemId, selectedSize);
        };
    });

    // 2. ربط النقر على البطاقة بالكامل لفتح مودال تفاصيل المنتج
    [productsContainer, suggestionContainer].forEach(container => {
        container.querySelectorAll('.product-card').forEach(card => {
             card.addEventListener('click', (e) => {
                 // نتأكد من أن النقر لم يتم على الأزرار/الروابط التي لها إجراء خاص
                 // نستخدم closest لـ add-to-cart-btn لتكون قراءة النقر أدق
                 if (!e.target.closest('.add-to-cart-btn') && 
                     !e.target.classList.contains('size-select') && 
                     !e.target.classList.contains('view-details-link')) {
                      
                     // 1. استخراج الـ ID من البطاقة الأم عبر الـ ID الخاص بها
                     const cardId = card.getAttribute('id').replace('product-', '');
                     const productId = parseInt(cardId);
                     
                     // 2. الآن نستدعي دالة مودال التفاصيل
                     if (productId) {
                        openProductDetailsModal(productId);
                     }
                 }
             });
        });
    });
    
    // 3. منع النقر على قائمة المقاسات و زر التفاصيل من فتح المودال
    document.querySelectorAll('.size-select, .view-details-link').forEach(element => {
        element.addEventListener('click', (e) => {
            e.stopPropagation(); 
        });
    });
}

// ... (بقية الملف) ...

// ... (بقية الملف) ...

// **دالة جديدة لتشغيل صوت الإشعار**
function playNotificationSound() {
    const audio = new Audio('notification.mp3'); 
    audio.play().catch(error => {
        // غالباً ما تمنع المتصفحات التشغيل التلقائي للصوت
        console.error("Failed to play sound:", error); 
    });
}


function addToCart(itemID, size) {
    const key = `${itemID}_${size}`;
    const product = allProducts[itemID];

    if (cart[key]) {
        cart[key].quantity += 1;
    } else {
        cart[key] = {
            product: product,
            quantity: 1,
            selectedSize: size,
            key: key
        };
    }
    
    // **استبدال رسالة alert() بتشغيل الصوت**
    playNotificationSound(); 
    
    // يمكن إضافة تسجيل في الكونسول للتأكد من عمل الإضافة
    console.log(`تمت إضافة ${product.nameAR} (مقاس: ${size}) إلى السلة.`);
    updateCartDisplay();
}

// ... (بقية الملف) ...

// ... (بقية الملف) ...

function updateCartDisplay() {
    let totalItems = 0;
    
    for (const key in cart) {
        if (cart[key] && cart[key].quantity) {
             totalItems += cart[key].quantity;
        }
    }
    cartCountElement.textContent = totalItems;
}


// =====================================
// 2. إدارة السلة ونافذة الدفع (Modal)
// =====================================

function openCheckoutModal() {
    document.getElementById('shipping-fee').textContent = `${shippingFee.toFixed(2)} ${CURRENCY}`;
    renderCheckoutDetails();
    checkoutModal.style.display = 'block';
}

function closeCheckoutModal() {
    checkoutModal.style.display = 'none';
}

function renderCheckoutDetails() {
    let subtotal = 0;
    checkoutDetails.innerHTML = '';

    if (Object.keys(cart).length === 0) {
        checkoutDetails.innerHTML = '<p style="text-align: center; color: #777;">سلة التسوق فارغة.</p>';
        subtotalElement.textContent = '0.00 ' + CURRENCY;
        discountElement.textContent = '0.00 ' + CURRENCY;
        finalTotalElement.textContent = (shippingFee).toFixed(2) + ' ' + CURRENCY; 
        return;
    }

    for (const key in cart) {
        const item = cart[key];
        const finalPrice = item.product.discountedPrice !== null ? item.product.discountedPrice : item.product.price;
        const itemTotal = item.quantity * finalPrice;
        subtotal += itemTotal;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'checkout-item';
        // إضافة مؤشر للعرض
        itemDiv.style.cursor = 'pointer'; 
        
        itemDiv.innerHTML = `
            <div class="item-info">
                <p><strong>${item.product.nameAR}</strong></p>
                <p>المقاس: ${item.selectedSize}</p>
                <p>${item.quantity} x ${finalPrice.toFixed(2)} ${CURRENCY} = ${itemTotal.toFixed(2)} ${CURRENCY}</p>
            </div>
            <div class="item-actions">
                <button class="qty-btn" data-key="${key}" data-action="decrease">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" data-key="${key}" data-action="increase">+</button>
                <button class="delete-btn" data-key="${key}">حذف</button>
            </div>
        `;
        checkoutDetails.appendChild(itemDiv);
    }
    
    subtotalElement.textContent = subtotal.toFixed(2) + ' ' + CURRENCY;
    applyDiscount(subtotal);
    
    attachCheckoutEvents();
}

function applyDiscount(currentSubtotal) {
    let discountAmount = 0;
    
    discountElement.textContent = discountAmount.toFixed(2) + ' ' + CURRENCY;
    const finalTotal = currentSubtotal - discountAmount + shippingFee; 
    finalTotalElement.textContent = finalTotal.toFixed(2) + ' ' + CURRENCY;
}


function attachCheckoutEvents() {
    // 1. التحكم بالكمية (Plus/Minus)
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation(); 
            const key = e.target.getAttribute('data-key');
            const action = e.target.getAttribute('data-action');
            updateCartItemQuantity(key, action);
        };
    });

    // 2. حذف المنتج
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation(); 
            const key = e.target.getAttribute('data-key');
            delete cart[key];
            renderCheckoutDetails();
            updateCartDisplay();
        };
    });
    
    // 3. النقر على المنتج داخل نافذة الدفع (للعرض)
    document.querySelectorAll('.checkout-item').forEach(item => {
        item.onclick = (e) => {
            // هذا الشرط ضروري لضمان أن النقر لم يكن على أزرار التعديل والحذف
            if (e.target.closest('.item-actions')) {
                return;
            }
            
            const keyElement = item.querySelector('.qty-btn') || item.querySelector('.delete-btn');
            if (!keyElement) return;

            const key = keyElement.getAttribute('data-key');
            const itemID = key.split('_')[0];
            
            // إغلاق مودال الدفع
            closeCheckoutModal();
            
            alert(`تم إغلاق سلة الشراء. يمكنك الآن رؤية تفاصيل المنتج ${allProducts[itemID].nameAR} في الواجهة الرئيسية.`); 
            
            // *المنطق الذي يعيد العميل إلى عرض المنتج على الصفحة الرئيسية*
            const targetElement = document.getElementById(`product-${itemID}`); 
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                window.scrollTo(0, 0); 
            }
        };
    });
}

function updateCartItemQuantity(key, action) {
    if (!cart[key]) return;

    if (action === 'increase') {
        cart[key].quantity += 1;
    } else if (action === 'decrease') {
        cart[key].quantity -= 1;
        if (cart[key].quantity < 1) {
            delete cart[key];
        }
    }
    renderCheckoutDetails();
    updateCartDisplay();
}


// =====================================
// 3. إدارة التنقل والتصفية (Filtering)
// =====================================

function renderSubcategories() {
    subCategoryList.innerHTML = '';
    const allProductsArray = Object.values(allProducts);
    
    const subCategoriesSet = new Set();
    allProductsArray.forEach(p => {
        if (p.category === currentCategory && p.subCategory) {
            p.subCategory.forEach(sub => subCategoriesSet.add(sub));
        }
    });

    const allItem = document.createElement('li');
    allItem.className = 'filter-item active';
    allItem.textContent = 'عرض الكل';
    allItem.setAttribute('data-filter', 'all');
    subCategoryList.appendChild(allItem);

    subCategoriesSet.forEach(sub => {
        const item = document.createElement('li');
        item.className = 'filter-item';
        item.textContent = sub;
        item.setAttribute('data-filter', sub);
        subCategoryList.appendChild(item);
    });
    
    attachFilterEvents(allProductsArray);
}

function attachFilterEvents(allProductsArray) {
    document.querySelectorAll('.filter-item').forEach(item => {
        item.onclick = (e) => {
            document.querySelectorAll('.filter-item').forEach(li => li.classList.remove('active'));
            e.target.classList.add('active');
            
            const filterValue = e.target.getAttribute('data-filter');
            filterProducts(allProductsArray, filterValue);
        };
    });
}

function filterProducts(allProductsArray, subCategoryFilter) {
    const filteredByCat = allProductsArray.filter(p => p.category === currentCategory);
    
    if (subCategoryFilter === 'all') {
        renderProducts(filteredByCat, productsContainer);
        return;
    }
    
    const finalFiltered = filteredByCat.filter(p => 
        p.subCategory && p.subCategory.includes(subCategoryFilter)
    );
    
    renderProducts(finalFiltered, productsContainer);
}


function attachCategoryEvents(productsArray) {
    // تم التغيير من #main-nav-list .nav-item إلى .main-nav-list-ul .nav-item
    document.querySelectorAll('.main-nav-list-ul .nav-item').forEach(item => { 
        item.onclick = (e) => {
            // نحذف الفئة النشطة من كل الأقسام في كلتا المجموعتين
            document.querySelectorAll('.main-nav-list-ul .nav-item').forEach(li => li.classList.remove('active-category'));
            
            e.target.classList.add('active-category');
            
            currentCategory = e.target.getAttribute('data-category');
            
            renderProducts(productsArray, productsContainer);
            renderSubcategories();
        };
    });
    
    // تفعيل القسم الافتراضي (الصلاة)
    const defaultCategoryElement = document.querySelector('[data-category="AbayaEssentials"]');
    if (defaultCategoryElement) {
        defaultCategoryElement.classList.add('active-category');
    }
}


// ... (بقية الملف) ...

// =====================================
// 4. إرسال الطلب (Submit Order)
// =====================================

async function submitOrder(e) {
    e.preventDefault();

    if (Object.keys(cart).length === 0) {
        alert("لا يمكن إرسال طلب وسلة التسوق فارغة.");
        return;
    }

    const customerName = document.getElementById('name').value;
    const phoneNumber = document.getElementById('phone').value;
    const region = document.getElementById('region-select').value; 
    const address = document.getElementById('address').value;
    const notes = document.getElementById('notes').value;
    const promoCode = document.getElementById('promo-code-input').value;
    const phoneCode = document.querySelector('.country-code').textContent; 

    // **التحقق الإضافي في JavaScript**
    if (!customerName || !phoneNumber || region === "" || !address) {
        alert("يرجى ملء جميع الحقول الإلزامية (*) في نموذج الدفع (الاسم، الهاتف، المنطقة، والعنوان).");
        return;
    }
    
    // التحقق من أن رقم الهاتف يتكون من 8 أرقام فقط
    if (phoneNumber.length !== 8 || !/^\d+$/.test(phoneNumber)) {
        alert("يرجى إدخال رقم هاتف صحيح مكون من 8 أرقام فقط.");
        return;
    }
    
    const finalTotal = finalTotalElement.textContent;
    
    let orderDetailsText = `--- تفاصيل الطلب (${Object.keys(cart).length} منتج) ---\n`;
    
    for (const key in cart) {
        const item = cart[key];
        const finalPrice = item.product.discountedPrice !== null ? item.product.discountedPrice : item.product.price;
        orderDetailsText += `\n- ${item.product.nameAR} (${item.selectedSize})`;
        orderDetailsText += `\n  الكمية: ${item.quantity} | السعر: ${finalPrice.toFixed(2)} ${CURRENCY}`;
    }
    
    const formData = {
        "اسم العميل": customerName,
        "الهاتف": phoneCode + phoneNumber,
        "المنطقة": region, 
        "العنوان المفصل": address,
        "ملاحظات العميل": notes || "لا يوجد",
        "رمز الخصم المستخدم": promoCode || "لا يوجد",
        "المجموع النهائي": finalTotal,
        "تفاصيل الطلب": orderDetailsText
    };
    
    try {
        // يجب استبدال [YOUR_FORMSPREE_HASH] بالرابط الحقيقي
        // *تأكدي من استبدال [YOUR_FORMSPREE_HASH] بالرابط الخاص بكِ*
        const response = await fetch("https://formspree.io/f/xkgyglrj", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('تم تأكيد طلبك بنجاح! سيتم التواصل معك قريباً.');
            
            cart = {};
            updateCartDisplay();
            closeCheckoutModal();
            
            // العودة إلى أعلى الصفحة (Home Page)
            window.scrollTo(0, 0); 

        } else {
            alert('عذراً، حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً أو التواصل معنا مباشرة.');
        }
    } catch (error) {
        console.error('Submit error:', error);
        alert('حدث خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.');
    }
}


// =====================================
// 5. التهيئة والتشغيل (Initialization)
// =====================================

closeBtn.onclick = closeCheckoutModal;
window.onclick = function(event) {
    if (event.target == checkoutModal) {
        closeCheckoutModal();
    }
};

cartButton.onclick = openCheckoutModal;

document.getElementById('checkout-form').addEventListener('submit', submitOrder);


async function init() {
    const productsArray = await fetchProducts();
    if (productsArray.length > 0) {
        renderProducts(productsArray, productsContainer);
        renderProducts(productsArray.slice(0, 3), suggestionContainer);
        attachCategoryEvents(productsArray);
        renderSubcategories();
        updateCartDisplay();
    }
}

init();
