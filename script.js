// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        targetSection.scrollIntoView({ behavior: 'smooth' });
    });
});

// Scroll to menu function
function scrollToMenu() {
    const menuSection = document.querySelector('#menu');
    menuSection.scrollIntoView({ behavior: 'smooth' });
}

// Cart functionality
let cart = [];

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.toggle('active');
}

// Update cart display
function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    // Update cart count
    cartCount.textContent = cart.length;
    
    // Calculate subtotal
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    cartSubtotal.textContent = '₱' + subtotal;
    
    // Display cart items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.5';
        checkoutBtn.style.cursor = 'not-allowed';
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.cursor = 'pointer';
        let cartHTML = '';
        cart.forEach((item, index) => {
            cartHTML += `
                <div class="cart-item">
                    <div class="cart-item-header">
                        <span class="cart-item-name">${item.name}</span>
                        <button class="remove-item" onclick="removeFromCart(${index})">Remove</button>
                    </div>
                    <div class="cart-item-details">
                        <div class="quantity-controls">
                            <button class="qty-btn" onclick="decreaseQuantity(${index})">-</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="qty-btn" onclick="increaseQuantity(${index})">+</button>
                        </div>
                        <span class="cart-item-price">₱${item.price * item.quantity}</span>
                    </div>
                </div>
            `;
        });
        cartItemsContainer.innerHTML = cartHTML;
    }
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Increase quantity
function increaseQuantity(index) {
    cart[index].quantity += 1;
    updateCart();
}

// Decrease quantity
function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }
    updateCart();
}

// Clear cart
function clearCart() {
    if (cart.length === 0) {
        return;
    }
    document.getElementById('clear-cart-modal').classList.add('active');
}

// Confirm clear cart
function confirmClearCart() {
    cart = [];
    updateCart();
    closeClearCartModal();
}

// Close clear cart modal
function closeClearCartModal() {
    document.getElementById('clear-cart-modal').classList.remove('active');
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        return;
    }
    
    // Calculate totals
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    const deliveryFee = 50;
    const total = subtotal + deliveryFee;
    
    // Build receipt items
    let receiptHTML = '';
    cart.forEach(item => {
        receiptHTML += `
            <div class="receipt-item">
                <span>${item.name} x${item.quantity}</span>
                <span>₱${item.price * item.quantity}</span>
            </div>
        `;
    });
    
    // Update receipt
    document.getElementById('receipt-items').innerHTML = receiptHTML;
    document.getElementById('receipt-subtotal').textContent = '₱' + subtotal.toFixed(2);
    document.getElementById('receipt-total').textContent = '₱' + total.toFixed(2);
    
    // Show receipt modal
    document.getElementById('receipt-modal').classList.add('active');
    toggleCart();
}

// Close receipt
function closeReceipt() {
    document.getElementById('receipt-modal').classList.remove('active');
}

// Place order
function placeOrder() {
    document.getElementById('receipt-modal').classList.remove('active');
    document.getElementById('confirmation-modal').classList.add('active');
}

// Close confirmation
function closeConfirmation() {
    document.getElementById('confirmation-modal').classList.remove('active');
    cart = [];
    updateCart();
}

// Print receipt
function printReceipt() {
    window.print();
}

// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#') && href !== '#') {
            e.preventDefault();
            const targetSection = document.querySelector(href);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Scroll to menu function
function scrollToMenu() {
    const menuSection = document.querySelector('#menu');
    menuSection.scrollIntoView({ behavior: 'smooth' });
}

// Add to cart functionality
document.querySelectorAll('.add-btn').forEach(button => {
    button.addEventListener('click', function() {
        const foodCard = this.parentElement;
        const foodName = foodCard.querySelector('h4').textContent;
        const priceText = foodCard.querySelector('.price').textContent;
        const price = parseInt(priceText.replace('₱', ''));
        
        // Check if item exists in cart
        const existingItem = cart.find(item => item.name === foodName);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name: foodName, price: price, quantity: 1 });
        }
        
        updateCart();
        
        // Visual feedback - button click effect
        this.style.transform = 'scale(0.95)';
        this.style.backgroundColor = '#45a049';
        
        setTimeout(() => {
            this.style.transform = 'scale(1)';
            this.style.backgroundColor = '#4CAF50';
        }, 200);
    });
});

// Form submission
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('contact-success-modal').classList.add('active');
    this.reset();
});

// Close contact success modal
function closeContactModal() {
    document.getElementById('contact-success-modal').classList.remove('active');
}

// Simple animation on scroll
window.addEventListener('scroll', function() {
    const elements = document.querySelectorAll('.food-card');
    
    elements.forEach(element => {
        const position = element.getBoundingClientRect();
        
        if (position.top < window.innerHeight && position.bottom >= 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
});

// Initialize cards with animation ready state
document.querySelectorAll('.food-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s, transform 0.5s';
});

// Trigger animation on page load
window.addEventListener('load', function() {
    window.dispatchEvent(new Event('scroll'));
});
