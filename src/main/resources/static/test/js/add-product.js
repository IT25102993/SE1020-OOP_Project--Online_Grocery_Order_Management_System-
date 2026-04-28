(function() {
  const form = document.getElementById('productForm');
  const pImage = document.getElementById('pImage');
  const imgPreview = document.getElementById('imgPreview');
  const previewBox = document.getElementById('previewBox');
  const previewPlaceholder = document.getElementById('previewPlaceholder');

  // No preview on file select - only after upload (as per requirement)
  if (pImage) {
    pImage.addEventListener('change', function() {
      previewPlaceholder.style.display = 'block';
      imgPreview.style.display = 'none';
      imgPreview.src = '';
    });
  }

  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const productId = document.getElementById('pId').value.trim();
      const name = document.getElementById('pName').value.trim();
      const price = parseFloat(document.getElementById('pPrice').value) || 0;
      const category = document.getElementById('pCategory').value;
      const fileInput = document.getElementById('pImage');

      if (!productId || !name) {
        alert('Please fill Product ID and Name.');
        return;
      }
      if (!fileInput.files || !fileInput.files[0]) {
        alert('Please select an image to upload.');
        return;
      }

      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('name', name);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('image', fileInput.files[0]);

      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success && data.product) {
          previewPlaceholder.style.display = 'none';
          var path = data.product.imagePath || '';
          imgPreview.src = path.startsWith('/') ? path : '/' + path;
          imgPreview.style.display = 'block';
          imgPreview.onerror = function() { this.style.display = 'none'; previewPlaceholder.style.display = 'block'; };
          alert('Product added successfully! Preview is shown above.');
          var btn = form.querySelector('button[type="submit"]');
          btn.textContent = 'Go to Product List';
          btn.onclick = function() { window.location.href = 'product-list.html'; };
          btn.type = 'button';
        } else {
          alert(data.message || 'Failed to add product.');
        }
      } catch (err) {
        alert('Network error. Is the server running?');
      }
    });
  }
})();
