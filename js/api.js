export let allProducts = {};

export async function fetchProducts() {
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
        document.getElementById('products-container').innerHTML = 
            '<p class="error-message">عذراً، حدث خطأ أثناء تحميل بيانات المنتجات.</p>';
        return [];
    }
}