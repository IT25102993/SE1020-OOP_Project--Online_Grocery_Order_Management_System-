const API = '';

async function loadProducts() {
  const tbody = document.getElementById('productTableBody');
  try {
    const res = await fetch(API + '/api/products');
    const list = await res.json();
    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">No products. <a href="add-product.html">Add one</a>.</td></tr>';
      return;
    }
    tbody.innerHTML = list.map(p => {
      const imgSrc = p.imagePath ? (API + p.imagePath) : '';
      const placeholder = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><rect fill="#eee" width="50" height="50"/><text x="50%" y="50%" fill="#999" font-size="8" text-anchor="middle" dy=".3em">-</text></svg>');
      return `<tr data-id="${p.id}" data-pid="${p.productId}">
        <td><img class="thumb" src="${imgSrc || placeholder}" alt="" onerror="this.src='${placeholder}'"></td>
        <td>${p.productId}</td>
        <td>${p.name}</td>
        <td>${p.price != null ? p.price : ''}</td>
        <td>${p.category || ''}</td>
        <td>
          <button class="btn-sm btn-edit" onclick="openEdit(${p.id}, '${escapeAttr(p.productId)}', '${escapeAttr(p.name)}', ${p.price != null ? p.price : 0}, '${escapeAttr(p.category || '')}')">Edit</button>
          <button class="btn-sm btn-qty" onclick="openQty('${escapeAttr(p.productId)}')">Add Qty</button>
          <button class="btn-sm btn-remove" onclick="removeProduct(${p.id})">Remove</button>
        </td>
      </tr>`;
    }).join('');

    document.getElementById('searchInput').oninput = filterTable;
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6">Could not load products.</td></tr>';
  }
}

function escapeAttr(s) {
  if (s == null) return '';
  return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function filterTable() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  document.querySelectorAll('#productTableBody tr').forEach(tr => {
    if (!tr.dataset.pid) return;
    const text = (tr.dataset.pid + ' ' + tr.cells[2].textContent).toLowerCase();
    tr.style.display = text.includes(q) ? '' : 'none';
  });
}

function openEdit(id, productId, name, price, category) {
  document.getElementById('editId').value = id;
  document.getElementById('editProductId').value = productId;
  document.getElementById('editName').value = name;
  document.getElementById('editPrice').value = price;
  document.getElementById('editCategory').value = category;
  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

async function saveEdit() {
  const id = document.getElementById('editId').value;
  const productId = document.getElementById('editProductId').value.trim();
  const name = document.getElementById('editName').value.trim();
  const price = parseFloat(document.getElementById('editPrice').value) || 0;
  const category = document.getElementById('editCategory').value.trim();
  try {
    const res = await fetch(API + '/api/products/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, name, price, category })
    });
    const data = await res.json();
    if (data.success) {
      closeEditModal();
      loadProducts();
    } else alert(data.message || 'Update failed');
  } catch (e) {
    alert('Network error');
  }
}

let currentQtyProductId = '';
function openQty(productId) {
  currentQtyProductId = productId;
  document.getElementById('qtyProductId').textContent = productId;
  document.getElementById('qtyQuantity').value = '';
  document.getElementById('qtyWhereBought').value = '';
  document.getElementById('qtyModal').style.display = 'flex';
  loadQtyHistory(productId);
}

function closeQtyModal() {
  document.getElementById('qtyModal').style.display = 'none';
}

async function loadQtyHistory(productId) {
  const el = document.getElementById('qtyHistory');
  try {
    const res = await fetch(API + '/api/product-quantity/by-product/' + encodeURIComponent(productId));
    const list = await res.json();
    if (!list || list.length === 0) {
      el.innerHTML = '<p>No quantity entries yet.</p>';
      return;
    }
    el.innerHTML = '<strong>Recent entries:</strong>' + list.slice(0, 5).map(pq => {
      const dt = pq.createdAt ? new Date(pq.createdAt).toLocaleString() : '';
      return `<div>Qty: ${pq.quantity} | Where: ${pq.whereBought || '-'} | ${dt}</div>`;
    }).join('');
  } catch (e) {
    el.innerHTML = '';
  }
}

async function saveQuantity() {
  const quantity = parseInt(document.getElementById('qtyQuantity').value, 10) || 0;
  const whereBought = document.getElementById('qtyWhereBought').value.trim();
  if (!currentQtyProductId) return;
  if (quantity <= 0) {
    alert('Enter a valid quantity.');
    return;
  }
  try {
    const res = await fetch(API + '/api/product-quantity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: currentQtyProductId, quantity, whereBought })
    });
    const data = await res.json();
    if (data.success) {
      alert('Quantity added. Date & time saved automatically.');
      document.getElementById('qtyQuantity').value = '';
      document.getElementById('qtyWhereBought').value = '';
      loadQtyHistory(currentQtyProductId);
    } else alert(data.message || 'Failed');
  } catch (e) {
    alert('Network error');
  }
}

async function removeProduct(id) {
  if (!confirm('Remove this product?')) return;
  try {
    const res = await fetch(API + '/api/products/' + id, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      loadProducts();
    } else alert(data.message || 'Delete failed');
  } catch (e) {
    alert('Network error');
  }
}

document.addEventListener('DOMContentLoaded', loadProducts);
