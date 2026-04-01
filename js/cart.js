import { allProducts } from './api.js';

export const CURRENCY = '$';
export const shippingFee = 4.00;
export let cart = {};

export function playNotificationSound() {
    const audio = new Audio('notification.mp3'); 
    audio.play().catch(err => console.error("Sound play failed:", err));
}

export function updateCartDisplay() {
    let totalItems = 0;
    for (const key in cart) {
        if (cart[key]) totalItems += cart[key].quantity;
    }
    document.getElementById('cart-count').textContent = totalItems;
}

export function addToCart(itemID, size) {
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
    playNotificationSound();
    updateCartDisplay();
}

export function resetCart() {
    cart = {};
    updateCartDisplay();
}