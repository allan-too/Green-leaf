// Order tracking functionality

/**
 * Show the order tracking modal
 */
function showTrackingModal() {
  const modal = document.getElementById('tracking-modal');
  
  if (!modal) return;
  
  // Clear previous results
  const resultDiv = document.getElementById('tracking-result');
  if (resultDiv) {
    resultDiv.innerHTML = '';
  }
  
  // Clear input
  const trackingInput = document.getElementById('tracking-id');
  if (trackingInput) {
    trackingInput.value = '';
  }
  
  // Show the modal
  modal.classList.add('active');
}

/**
 * Hide the tracking modal
 */
function hideTrackingModal() {
  const modal = document.getElementById('tracking-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Track an order by Bolt tracking ID
 * @param {string} trackingId - Bolt tracking ID
 */
async function trackOrder(trackingId) {
  const resultDiv = document.getElementById('tracking-result');
  
  if (!resultDiv) return;
  
  // Clear previous results
  resultDiv.innerHTML = '<p>Searching for your order...</p>';
  
  try {
    if (!trackingId) {
      resultDiv.innerHTML = '<p class="error-message">Please enter a tracking ID</p>';
      return;
    }
    
    // Query the database for the order
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('bolt_tracking_id', trackingId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No match
        resultDiv.innerHTML = '<p class="error-message">No order found with this tracking ID</p>';
      } else {
        throw error;
      }
      return;
    }
    
    // Order found, show details
    const orderDate = new Date(data.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Get random status based on order date
    const status = getOrderStatus(data.created_at);
    
    // Show tracking result
    resultDiv.innerHTML = `
      <div class="tracking-result-details">
        <h3>Order Found</h3>
        <div class="tracking-info">
          <div><strong>Tracking ID:</strong> ${data.bolt_tracking_id}</div>
          <div><strong>Order Date:</strong> ${orderDate}</div>
          <div><strong>Status:</strong> <span class="status-${status.toLowerCase().replace(' ', '-')}">${status}</span></div>
        </div>
        <div class="tracking-timeline">
          <div class="timeline-item ${status === 'Processing' || status === 'Shipped' || status === 'Delivered' ? 'active' : ''}">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h4>Processing</h4>
              <p>Your order has been received and is being processed</p>
            </div>
          </div>
          <div class="timeline-item ${status === 'Shipped' || status === 'Delivered' ? 'active' : ''}">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h4>Shipped</h4>
              <p>Your order has been shipped and is on its way</p>
            </div>
          </div>
          <div class="timeline-item ${status === 'Delivered' ? 'active' : ''}">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <h4>Delivered</h4>
              <p>Your order has been delivered</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add styles for the tracking result
    const style = document.createElement('style');
    style.textContent = `
      .tracking-result-details {
        background-color: var(--color-gray-100);
        padding: var(--spacing-md);
        border-radius: var(--border-radius-md);
        margin-top: var(--spacing-md);
      }
      
      .tracking-info {
        margin: var(--spacing-md) 0;
      }
      
      .status-processing {
        color: var(--color-warning);
        font-weight: bold;
      }
      
      .status-shipped {
        color: var(--color-info);
        font-weight: bold;
      }
      
      .status-delivered {
        color: var(--color-success);
        font-weight: bold;
      }
      
      .tracking-timeline {
        margin-top: var(--spacing-lg);
      }
      
      .timeline-item {
        display: flex;
        margin-bottom: var(--spacing-md);
        opacity: 0.5;
      }
      
      .timeline-item.active {
        opacity: 1;
      }
      
      .timeline-marker {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: var(--color-gray-400);
        margin-right: var(--spacing-md);
        position: relative;
      }
      
      .timeline-item.active .timeline-marker {
        background-color: var(--color-primary);
      }
      
      .timeline-marker::before {
        content: '';
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 2px;
        height: 30px;
        background-color: var(--color-gray-300);
      }
      
      .timeline-item:last-child .timeline-marker::before {
        display: none;
      }
      
      .timeline-content h4 {
        margin-bottom: var(--spacing-xs);
      }
      
      .timeline-content p {
        font-size: var(--font-size-sm);
        color: var(--color-gray-600);
      }
    `;
    
    document.head.appendChild(style);
    
  } catch (error) {
    console.error('Error tracking order:', error);
    resultDiv.innerHTML = '<p class="error-message">An error occurred while tracking your order. Please try again.</p>';
  }
}

/**
 * Get a simulated order status based on the order creation date
 * @param {string} createdAt - ISO date string when the order was created
 * @returns {string} Order status
 */
function getOrderStatus(createdAt) {
  const orderDate = new Date(createdAt);
  const now = new Date();
  const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 1) {
    return 'Processing';
  } else if (daysDiff < 3) {
    return 'Shipped';
  } else {
    return 'Delivered';
  }
}

/**
 * Initialize tracking event listeners
 */
function initTrackingEvents() {
  // Track order button in footer
  const trackOrderBtn = document.getElementById('track-order-btn');
  if (trackOrderBtn) {
    trackOrderBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showTrackingModal();
    });
  }
  
  // Track button in modal
  const trackBtn = document.getElementById('track-btn');
  if (trackBtn) {
    trackBtn.addEventListener('click', () => {
      const trackingId = document.getElementById('tracking-id').value;
      trackOrder(trackingId);
    });
  }
  
  // Enter key in tracking input
  const trackingInput = document.getElementById('tracking-id');
  if (trackingInput) {
    trackingInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        trackOrder(trackingInput.value);
      }
    });
  }
}