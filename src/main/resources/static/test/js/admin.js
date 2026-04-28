document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.querySelector('.sidebar');
  const sidebarBtn = document.querySelector('.sidebarBtn');
  const navLinks = document.querySelectorAll('.nav-links li a');

  // Toggle Sidebar
  if (sidebarBtn && sidebar) {
    sidebarBtn.onclick = function() {
      sidebar.classList.toggle('active');
      const icon = sidebarBtn.querySelector('i');
      if (icon) {
        if (sidebar.classList.contains('active')) {
          icon.classList.replace('bx-menu', 'bx-menu-alt-right');
        } else {
          icon.classList.replace('bx-menu-alt-right', 'bx-menu');
        }
      }
    };
  }

  // Active Link State
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navLinks.forEach(item => item.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Session Management
  const user = sessionStorage.getItem('loggedInUser');
  const adminName = document.getElementById('adminName');
  if (adminName && user) adminName.textContent = user;

  // --- Dynamic Island Notification System ---
  const island = document.getElementById('admin-island');
  const islandOrderId = document.getElementById('island-order-id');
  let lastOrderCount = 0;

  async function checkNewOrders() {
    try {
      const res = await fetch('/api/orders');
      const orders = await res.json();
      const currentRequestedOrders = orders.filter(o => o.status === 'REQUESTED');
      
      if (currentRequestedOrders.length > lastOrderCount) {
        // New order detected!
        const latestOrder = currentRequestedOrders[currentRequestedOrders.length - 1];
        if (islandOrderId) islandOrderId.innerText = `Order #${latestOrder.id} - ${latestOrder.customer.name}`;
        if (island) {
          island.classList.add('active');
          // Auto expand after a delay
          setTimeout(() => island.classList.add('expanded'), 800);
          // Hide after 8 seconds
          setTimeout(() => {
            island.classList.remove('expanded');
            setTimeout(() => island.classList.remove('active'), 600);
          }, 8000);
        }
      }
      lastOrderCount = currentRequestedOrders.length;
    } catch (err) {
      console.error("Notification poll error:", err);
    }
  }

  if (island) {
    island.addEventListener('click', () => {
      island.classList.toggle('expanded');
    });
  }

  // Poll every 5 seconds
  setInterval(checkNewOrders, 5000);
  checkNewOrders(); // Initial check
});