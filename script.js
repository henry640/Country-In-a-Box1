// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId.startsWith('#') && targetId !== '#') {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
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

// Cart functionality
let cart = [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];

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
    // Calculate totals
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    const deliveryFee = 50;
    const total = subtotal + deliveryFee;
    
    // Generate simple order ID
    let nextOrderNumber = (localStorage.getItem('nextOrderNumber') || 1000);
    nextOrderNumber = parseInt(nextOrderNumber) + 1;
    localStorage.setItem('nextOrderNumber', nextOrderNumber);
    
    // Create order object
    const order = {
        id: nextOrderNumber,
        date: new Date().toISOString(),
        items: [...cart],
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        status: 'Active'
    };
    
    // Save order
    orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart and show confirmation
    document.getElementById('receipt-modal').classList.remove('active');
    document.getElementById('confirmation-modal').classList.add('active');
}

// Close confirmation
function closeConfirmation() {
    document.getElementById('confirmation-modal').classList.remove('active');
    cart = [];
    updateCart();
}

// Open My Orders modal
function openMyOrders() {
    updateOrdersList();
    document.getElementById('my-orders-modal').classList.add('active');
}

// Close My Orders modal
function closeMyOrders() {
    document.getElementById('my-orders-modal').classList.remove('active');
    // Stop the countdown when modal is closed
    if (ordersUpdateInterval) {
        clearInterval(ordersUpdateInterval);
        ordersUpdateInterval = null;
    }
}

// Update orders list
let ordersUpdateInterval = null;

function updateOrdersList(initialRender = true) {
    const ordersList = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '';
        if (ordersUpdateInterval) {
            clearInterval(ordersUpdateInterval);
            ordersUpdateInterval = null;
        }
        return;
    }
    
    let hasActiveOrders = false;
    
    // If initial render, create all HTML
    if (initialRender) {
        let html = '';
        orders.forEach((order, index) => {
            const orderDate = new Date(order.date);
            const now = new Date();
            const secondsPassed = Math.floor((now - orderDate) / 1000);
            const secondsLeft = (10 * 60) - secondsPassed;
            const canCancel = secondsLeft > 0 && order.status === 'Active';
            
            if (canCancel) hasActiveOrders = true;
            
            // Calculate minutes and seconds left
            const minsLeft = Math.floor(secondsLeft / 60);
            const secsLeft = secondsLeft % 60;
            
            let itemsList = '';
            order.items.forEach(item => {
                itemsList += `<li>${item.name} x${item.quantity} - ₱${(item.price * item.quantity).toFixed(2)}</li>`;
            });
            
            let statusBadge = '';
            if (order.status === 'Active') {
                statusBadge = '<span class="status-badge active">Active</span>';
            } else if (order.status === 'Cancelled') {
                statusBadge = '<span class="status-badge cancelled">Cancelled</span>';
            } else if (order.status === 'Delivered') {
                statusBadge = '<span class="status-badge delivered">Delivered</span>';
            }
            
            // Format date properly
            const formattedDate = orderDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
            const formattedTime = orderDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
            
            html += `
                <div class="order-card" data-order-index="${index}">
                    <div class="order-header">
                        <div class="order-info">
                            <h3>Order #${order.id}</h3>
                            <p class="order-date">📅 ${formattedDate} at ${formattedTime}</p>
                        </div>
                        ${statusBadge}
                    </div>
                    <div class="order-items">
                        <ul>${itemsList}</ul>
                    </div>
                    <div class="order-footer">
                        <div class="order-total">
                            <strong>Total:</strong> ₱${order.total.toFixed(2)}
                        </div>
                        ${canCancel ? `
                            <div class="cancel-section">
                                <p class="time-remaining">⏱️ Cancel within: <strong class="countdown-timer" data-order-index="${index}">${minsLeft}:${secsLeft.toString().padStart(2, '0')}</strong></p>
                                <button class="cancel-order-btn" onclick="cancelOrder(${index})">Cancel Order</button>
                            </div>
                        ` : ''}
                        ${!canCancel && order.status === 'Active' ? '<p class="expired-text">Cancellation window expired</p>' : ''}
                    </div>
                </div>
            `;
        });
        
        ordersList.innerHTML = html;
    } else {
        // Just update the countdown timers without re-rendering
        orders.forEach((order, index) => {
            const orderDate = new Date(order.date);
            const now = new Date();
            const secondsPassed = Math.floor((now - orderDate) / 1000);
            const secondsLeft = (10 * 60) - secondsPassed;
            const canCancel = secondsLeft > 0 && order.status === 'Active';
            
            if (canCancel) hasActiveOrders = true;
            
            const timerElement = document.querySelector(`.countdown-timer[data-order-index="${index}"]`);
            if (timerElement && canCancel) {
                const minsLeft = Math.floor(secondsLeft / 60);
                const secsLeft = secondsLeft % 60;
                timerElement.textContent = `${minsLeft}:${secsLeft.toString().padStart(2, '0')}`;
            } else if (timerElement && !canCancel) {
                // Time expired, need to refresh to show expired message
                updateOrdersList(true);
                return;
            }
        });
    }
    
    // Start live countdown if there are active orders
    if (hasActiveOrders && !ordersUpdateInterval) {
        ordersUpdateInterval = setInterval(() => updateOrdersList(false), 1000);
    } else if (!hasActiveOrders && ordersUpdateInterval) {
        clearInterval(ordersUpdateInterval);
        ordersUpdateInterval = null;
    }
}

// Cancel order
let orderToCancel = null;

function cancelOrder(index) {
    const order = orders[index];
    const orderDate = new Date(order.date);
    const now = new Date();
    const minutesPassed = Math.floor((now - orderDate) / 1000 / 60);
    
    if (minutesPassed >= 20) {
        document.getElementById('time-expired-modal').classList.add('active');
        return;
    }
    
    // Store index and show confirmation modal
    orderToCancel = index;
    document.getElementById('cancel-order-text').textContent = `Are you sure you want to cancel Order #${order.id}?`;
    document.getElementById('cancel-confirm-modal').classList.add('active');
}

// Confirm cancel order
function confirmCancelOrder() {
    if (orderToCancel !== null) {
        orders[orderToCancel].status = 'Cancelled';
        localStorage.setItem('orders', JSON.stringify(orders));
        orderToCancel = null;
        document.getElementById('cancel-confirm-modal').classList.remove('active');
        closeMyOrders();
        document.getElementById('cancel-success-modal').classList.add('active');
    }
}

// Close cancel confirmation modal
function closeCancelConfirm() {
    orderToCancel = null;
    document.getElementById('cancel-confirm-modal').classList.remove('active');
}

// Close cancel success modal
function closeCancelSuccess() {
    document.getElementById('cancel-success-modal').classList.remove('active');
}

// Close time expired modal
function closeTimeExpired() {
    document.getElementById('time-expired-modal').classList.remove('active');
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

// Initialize orders display on page load
window.addEventListener('load', function() {
    updateOrdersDisplay();
    window.dispatchEvent(new Event('scroll'));
});

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

// Animation on scroll for food cards
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

// Initialize on page load
window.addEventListener('load', function() {
    // Set animation ready state for food cards
    document.querySelectorAll('.food-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s, transform 0.5s';
    });
    
    // Trigger initial animation
    window.dispatchEvent(new Event('scroll'));
});
