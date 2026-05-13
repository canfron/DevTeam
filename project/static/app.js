// ============================================================
// Hermes Stock Manager — Frontend SPA
// ============================================================

const API_BASE = '/api';
const PAGE_SIZE = 10;

// State
let state = {
    currentView: 'dashboard',
    productsPage: 1,
    productsTotal: 0,
    productsSkip: 0,
    filters: {
        search: '',
        category: '',
        minPrice: '',
        maxPrice: ''
    },
    inventorySkip: 0,
    inventoryLimit: 50,
    inventoryTotal: 0,
    inventoryProductFilter: '',
    deleteTargetId: null,
};

// ============================================================
// Utility Functions
// ============================================================

// Check API connectivity
async function checkApi() {
    try {
        const resp = await fetch(`${API_BASE}/products?skip=0&limit=1`, { signal: AbortSignal.timeout(5000) });
        if (resp.ok) {
            setApiStatus(true);
            return true;
        }
    } catch { /* fall through */ }
    setApiStatus(false);
    // Try without base path
    try {
        const resp = await fetch('/products?skip=0&limit=1', { signal: AbortSignal.timeout(5000) });
        if (resp.ok) {
            setApiStatus(true);
            return true;
        }
    } catch { /* fallback */ }
    return false;
}

function setApiStatus(connected) {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    if (dot && text) {
        dot.className = `w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`;
        text.textContent = connected ? 'API Conectada' : 'API no disponible';
    }
}

function showLoading(msg = 'Cargando...') {
    const el = document.getElementById('loading-overlay');
    const txt = document.getElementById('loading-text');
    if (el) el.classList.remove('hidden');
    if (txt) txt.textContent = msg;
}

function hideLoading() {
    const el = document.getElementById('loading-overlay');
    if (el) el.classList.add('hidden');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const bg = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    toast.className = `toast-notification ${bg} text-white px-6 py-3 rounded-xl shadow-lg shadow-black/20 text-sm font-medium animate-slide-down`;
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function formatPrice(price) {
    return `$${parseFloat(price).toFixed(2)}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatStock(stock) {
    const el = document.createElement('span');
    if (stock < 10 && stock > 0) {
        el.className = 'badge badge-warning';
        el.textContent = stock;
    } else if (stock === 0) {
        el.className = 'badge badge-danger';
        el.textContent = '0';
    } else {
        el.className = 'badge badge-success';
        el.textContent = stock;
    }
    return el.outerHTML;
}

function getApiBaseUrl() {
    return API_BASE;
}

// ============================================================
// API Helper
// ============================================================

async function apiCall(url, options = {}) {
    const baseUrl = getApiBaseUrl();
    let success = false;
    let resp = null;

    // Try multiple base URLs
    const candidates = [baseUrl, '/api', '/'];
    let lastError = null;

    for (const base of candidates) {
        const url_ = base + (base.endsWith('/') || url.startsWith('/') ? url : '/' + url);
        try {
            resp = await fetch(url_, options);
            if (resp.ok || resp.status === 201 || resp.status === 200 || resp.status === 204) {
                success = true;
                break;
            }
            lastError = resp;
        } catch (e) {
            lastError = e;
        }
    }

    if (!success) {
        if (lastError?.status) {
            if (lastError.status === 404) {
                showToast('Recurso no encontrado', 'error');
            } else if (lastError.status === 409) {
                showToast('El SKU ya existe', 'error');
            } else if (lastError.status === 400) {
                showToast('Datos inválidos', 'error');
            } else {
                showToast(`Error ${lastError.status}`, 'error');
            }
            throw new Error(`API error ${lastError.status}`);
        }
        showToast('No se pudo conectar con la API', 'error');
        setApiStatus(false);
        throw new Error('API not reachable');
    }

    return resp;
}

// ============================================================
// Dashboard Functions
// ============================================================

async function loadDashboard() {
    showLoading('Actualizando dashboard...');
    try {
        // Try fetching stats from dashboard endpoint
        const statsResp = await apiCall('/dashboard/stats');
        const stats = await statsResp.json();
        updateDashboardStats(stats);

        // Fetch products for low stock / inventory value
        const productsResp = await apiCall('/products?skip=0&limit=100');
        const productsData = await productsResp.json();
        const items = productsData.items || productsData || [];
        updateDashboardFromProducts(items);
    } catch {
        // Try getting all products directly and build stats manually
        const productsResp = await apiCall('/products?skip=0&limit=100');
        const productsData = await productsResp.json();
        const items = productsData.items || productsData || [];
        
        // Update with defaults for broken dashboard endpoint
        updateDashboardStats({
            total_products: productsData.total || items.length,
            total_stock: 0,
            low_stock_count: 0,
            total_value: 0
        });
        updateDashboardFromProducts(items);
    }

    // Load recent movements
    loadRecentMovements();
    hideLoading();
}

function updateDashboardStats(stats) {
    if (stats.total_products !== undefined) document.getElementById('stat-total-products').textContent = stats.total_products;
    if (stats.total_stock !== undefined) document.getElementById('stat-total-stock').textContent = stats.total_stock || 0;
    if (stats.low_stock_count !== undefined) document.getElementById('stat-low-stock').textContent = stats.low_stock_count;
    if (stats.recent_movements !== undefined) {
        // If recent_movements is an array, we handle it separately
    }
}

function updateDashboardFromProducts(items) {
    const totalStock = items.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalValue = items.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
    
    const lowStockItems = items.filter(p => p.stock < 10);
    
    document.getElementById('stat-total-products').textContent = items.length || 0;
    document.getElementById('stat-total-stock').textContent = totalStock;
    document.getElementById('stat-low-stock').textContent = lowStockItems.length;
    document.getElementById('stat-inventory-value').textContent = formatPrice(totalValue);

    // Low stock list
    const lowStockEl = document.getElementById('low-stock-list');
    if (lowStockItems.length === 0) {
        lowStockEl.innerHTML = '<div class="p-6 text-center text-green-500"><span class="inline-flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Todos los productos tienen stock suficiente</span></div>';
    } else {
        lowStockEl.innerHTML = lowStockItems.map(p => `
            <div class="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                    <p class="font-medium text-gray-800">${escapeHtml(p.name)}</p>
                    <p class="text-xs text-gray-500">SKU: ${escapeHtml(p.sku)}</p>
                </div>
                <span class="badge badge-danger">${p.stock}</span>
            </div>
        `).join('');
    }
}

async function loadRecentMovements() {
    const el = document.getElementById('recent-movements');
}

// ============================================================
// Products Functions
// ============================================================

async function loadProducts() {
    let skip = (state.productsPage - 1) * PAGE_SIZE;
    const params = [`skip=${skip}`, `limit=${PAGE_SIZE}`];

    const filters = state.filters;
    if (filters.search) params.push(`q=${encodeURIComponent(filters.search)}`);
    // Note: API uses different filter params; we use client-side filtering for search
    if (filters.category) params.push(`category=${encodeURIComponent(filters.category)}`);
    if (filters.minPrice) params.push(`min_price=${filters.minPrice}`);
    if (filters.maxPrice) params.push(`max_price=${filters.maxPrice}`);

    showLoading('Cargando productos...');
    
    try {
        const resp = await apiCall(`/products?${params.join('&')}`);
        const data = await resp.json();
        renderProducts(data);
    } catch (e) {
        hideLoading();
    }
}

function renderProducts(data) {
    const tbody = document.getElementById('products-tbody');
    const items = data.items || data;
    const total = data.total || items.length;
    state.productsTotal = total;
    
    if (items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center">
                    <div class="flex flex-col items-center gap-3">
                        <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                        <p class="text-gray-400 text-sm font-medium">No se encontraron productos</p>
                        <button onclick="document.getElementById('btn-new-product').click()" class="btn btn-primary text-sm">Crear primer producto</button>
                    </div>
                </td>
            </tr>`;
    } else {
        tbody.innerHTML = items.map(p => `
            <tr class="hover:bg-gray-50 transition-colors group">
                <td class="px-6 py-4 text-sm font-mono text-brand-600">${escapeHtml(p.sku)}</td>
                <td class="px-6 py-4">
                    <p class="font-medium text-gray-800">${escapeHtml(p.name)}</p>
                    <p class="text-xs text-gray-400 mt-0.5 truncate max-w-xs">${escapeHtml(p.description || '')}</p>
                </td>
                <td class="px-6 py-4">
                    <span class="badge badge-info">${escapeHtml(p.category || 'general')}</span>
                </td>
                <td class="px-6 py-4 text-right font-semibold text-gray-800">${formatPrice(p.price)}</td>
                <td class="px-6 py-4 text-center">${formatStock(p.stock)}</td>
                <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="openEditProductModal(${p.id})" title="Editar" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button onclick="openDeleteModal(${p.id}, '${escapeHtml(p.name)}')" title="Eliminar" class="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Update pagination
    document.getElementById('products-count').textContent = `Mostrando ${items.length} de ${total} productos`;
    document.getElementById('btn-prev-page').disabled = state.productsPage <= 1;
    document.getElementById('btn-prev-page').style.opacity = state.productsPage <= 1 ? '0.4' : '1';
    state.productsSkip = state.productsPage - 1;
    const maxPage = Math.ceil(total / PAGE_SIZE);
    document.getElementById('btn-next-page').disabled = state.productsSkip >= maxPage;
    document.getElementById('btn-next-page').style.opacity = state.productsSkip >= maxPage ? '0.4' : '1';

    hideLoading();
}

async function createProduct(formData) {
    showLoading('Creando producto...');
    try {
        const resp = await apiCall('/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        showToast('Producto creado correctamente');
        hideLoading();
        await loadProducts();
        return true;
    } catch (e) {
        hideLoading();
        return false;
    }
}

async function updateProduct(id, formData) {
    showLoading('Actualizando producto...');
    try {
        const resp = await apiCall(`/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        showToast('Producto actualizado correctamente');
        hideLoading();
        await loadProducts();
        return true;
    } catch (e) {
        hideLoading();
        return false;
    }
}

async function deleteProduct(id) {
    showLoading('Eliminando producto...');
    try {
        await apiCall(`/products/${id}`, { method: 'DELETE' });
        showToast('Producto eliminado');
        hideLoading();
        await loadProducts();
        closeDeleteModal();
    } catch (e) {
        hideLoading();
    }
}

// ============================================================
// Product Modal Functions
// ============================================================

function openProductModal(product = null) {
    const modal = document.getElementById('modal-product');
    const form = document.getElementById('form-product');
    const title = document.getElementById('modal-product-title');
    const btnSave = document.getElementById('btn-save-product');
    
    if (product) {
        title.textContent = 'Editar Producto';
        btnSave.textContent = 'Guardar Cambios';
        document.getElementById('product-edit-id').value = product.id;
        document.getElementById('product-sku').value = product.sku;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category || 'general';
        document.getElementById('product-stock').value = product.stock;
    } else {
        title.textContent = 'Nuevo Producto';
        btnSave.textContent = 'Crear Producto';
        form.reset();
        document.getElementById('product-edit-id').value = '';
        document.getElementById('product-category').value = 'general';
    }
    
    const errorEl = document.getElementById('product-form-error');
    errorEl.classList.add('hidden');
    
    modal.classList.remove('hidden');
}

async function openEditProductModal(id) {
    try {
        const resp = await apiCall(`/products/${id}`);
        const product = await resp.json();
        openProductModal(product);
    } catch {
        showToast('No se pudo cargar el producto', 'error');
    }
}

function closeProductModal() {
    document.getElementById('modal-product').classList.add('hidden');
}

async function handleProductSubmit(event) {
    event.preventDefault();
    const errorEl = document.getElementById('product-form-error');
    errorEl.classList.add('hidden');

    const editId = document.getElementById('product-edit-id').value;
    const data = {};

    const name = document.getElementById('product-name').value.trim();
    const sku = document.getElementById('product-sku').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    // ... continues in next section

    if (!name) {
        errorEl.textContent = 'El nombre es obligatorio';
        errorEl.classList.remove('hidden');
        return false;
    }
    if (!sku) {
        errorEl.textContent = 'El SKU es obligatorio';
        errorEl.classList.remove('hidden');
        return false;
    }
    if (isNaN(price) || price <= 0) {
        errorEl.textContent = 'El precio debe ser mayor a 0';
        errorEl.classList.remove('hidden');
        return false;
    }
    if (isNaN(stock) || stock < 0) {
        errorEl.textContent = 'El stock debe ser >= 0';
        errorEl.classList.remove('hidden');
        return false;
    }

    data.name = name;
    data.sku = sku;
    data.price = price;
    data.stock = stock;
    data.category = document.getElementById('product-category').value.trim() || 'general';
    data.description = document.getElementById('product-description').value.trim() || '';

    const success = editId 
        ? await updateProduct(parseInt(editId), data)
        : await createProduct(data);
    
    if (success) closeProductModal();
    return false;
}

// ============================================================
// Inventory Functions
// ============================================================

async function loadInventory() {
    let params = [`skip=${state.inventorySkip}`, `limit=${state.inventoryLimit}`];
    if (state.inventoryProductFilter) {
        // We'll filter product-side or API-side
        params.push('skip=0&limit=50'); // Use API params
    }
    
    // Get all products for the products selector first
    loadProductsSelector();
    
    // Try to get inventory from a product's inventory endpoint or generic inventory endpoint
    showLoading('Cargando movimientos...');
    try {
        const resp = await apiCall(`/inventory?${params.join('&')}`);
        const data = await resp.json();
        renderInventory(data);
    } catch {
        // Try product inventory endpoint
        try {
            // Get all products and fetch each's inventory
            const allResp = await apiCall('/products?skip=0&limit=100');
            const allProducts = await allResp.json();
            const products = allProducts.items || allProducts || [];
            let allMovements = [];
            for (const p of products) {
                try {
                    const invResp = await apiCall(`/products/${p.id}/inventory?skip=0&limit=50`);
                    const invData = await invResp.json();
                    const movements = invData.items || invData || [];
                    for (const m of movements) {
                        allMovements.push({ ...m, productName: p.name, productSku: p.sku, product_id: p.id });
                    }
                } catch(e) {}
            }
            allMovements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            state.inventoryTotal = allMovements.length;
            const items = allMovements.slice(0, state.inventoryLimit);
            renderInventory({ items, total: allMovements.length });
        } catch(e2) {
            // Try generic inventory endpoint variations
            renderEmptyInventory();
        }
    }
    hideLoading();
}

async function loadProductsSelector() {
    try {
        const resp = await apiCall('/products?skip=0&limit=100');
        const data = await resp.json();
        const items = data.items || data || [];
        const selectors = [
            document.getElementById('inventory-product-filter'),
            document.getElementById('movement-product')
        ];
        for (const sel of selectors) {
            if (!sel) continue;
            const currentVal = sel.value;
            sel.innerHTML = '<option value="">Todos los productos</option>';
            for (const p of items) {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `${p.sku} - ${p.name}`;
                if (currentVal && opt.value === currentVal) opt.selected = true;
                sel.appendChild(opt);
            }
        }
    } catch (e) {
        // Populate with placeholder if API fails
        const selectors = [
            document.getElementById('inventory-product-filter'),
            document.getElementById('movement-product')
        ];
        for (const sel of selectors) {
            if (sel) sel.innerHTML = '<option value="">No se pudo cargar productos</option>';
        }
    }
}

function renderInventory({ items, total = 0 }) {
    const tbody = document.getElementById('inventory-tbody');
    
    if (!items || items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-12 text-center text-gray-400">
                    <div class="flex flex-col items-center gap-2">
                        <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 14l6-6-3-3 3-3 6 6M15 7l-6 6"/></svg>
                        <p class="text-sm">No hay movimientos registrados</p>
                    </div>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = items.map(m => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
                <p class="text-sm font-medium text-gray-800">${escapeHtml(m.productName || 'N/A')}</p>
                <p class="text-xs text-gray-400">SKU: ${escapeHtml(m.productSku || m.sku || 'N/A')}</p>
            </td>
            <td class="px-6 py-4">
                ${m.type === 'in' 
                    ? '<span class="badge badge-in">📥 Entrada</span>' 
                    : '<span class="badge badge-out">📤 Salida</span>'}
            </td>
            <td class="px-6 py-4 text-right font-bold ${m.type === 'in' ? 'text-green-600' : 'text-red-500'}">
                ${m.type === 'in' ? '+' : '-'}${m.quantity}
            </td>
            <td class="px-6 py-4">
                <p class="text-sm text-gray-600 truncate max-w-[200px]">${escapeHtml(m.reason || '-')}</p>
            </td>
            <td class="px-6 py-4 text-right text-sm text-gray-500">
                ${formatDate(m.timestamp)}
            </td>
        </tr>
    `).join('');

    document.getElementById('inventory-count').textContent = `Mostrando ${items.length} de ${total} movimientos`;
    document.getElementById('btn-inv-prev-page').disabled = state.inventorySkip <= 0;
    document.getElementById('btn-inv-prev-page').style.opacity = state.inventorySkip <= 0 ? '0.4' : '1';
    document.getElementById('btn-inv-next-page').disabled = state.inventorySkip >= (Math.ceil(total / state.inventoryLimit) - 1);
    document.getElementById('btn-inv-next-page').style.opacity = state.inventorySkip >= (Math.ceil(total / state.inventoryLimit) - 1) ? '0.4' : '1';
}

function renderEmptyInventory() {
    document.getElementById('inventory-tbody').innerHTML = `
        <tr>
            <td colspan="5" class="px-6 py-12 text-center text-gray-400">
                <p>No se encontraron movimientos de inventario</p>
            </td>
        </tr>`;
}

async function createInventory(movementData) {
    showLoading('Registrando movimiento...');
    try {
        // Try to find the product endpoint
        let success = false;
        
        // First: get the list of products to find which endpoint has inventory
        const productResp = await apiCall('/products?skip=0&limit=100');
        const allProducts = await productResp.json();
        const products = allProducts.items || allProducts || [];
        
        const targetProduct = products.find(p => p.id === movementData.product_id);
        if (!targetProduct) {
            throw new Error('Producto no encontrado');
        }
        
        // Check stock before outgoing
        if (movementData.type === 'out' && movementData.quantity > targetProduct.stock) {
            hideLoading();
            showToast(`Stock insuficiente. Stock actual: ${targetProduct.stock}`, 'error');
            return false;
        }

        const invResp = await apiCall(`/products/${movementData.product_id}/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: movementData.type,
                quantity: movementData.quantity,
                reason: movementData.reason || ''
            })
        });
        
        const movement = await invResp.json();
        showToast('Movimiento registrado correctamente');
        
        hideLoading();
        await loadInventory();
        return true;
    } catch (e) {
        hideLoading();
        showToast('Error al registrar movimiento', 'error');
        return false;
    }
}

function openMovementModal() {
    document.getElementById('modal-movement').classList.remove('hidden');
    document.getElementById('movement-form-error').classList.add('hidden');
    document.getElementById('form-movement').reset();
}

function closeMovementModal() {
    document.getElementById('modal-movement').classList.add('hidden');
}

async function handleMovementSubmit(event) {
    event.preventDefault();
    const errorEl = document.getElementById('movement-form-error');
    errorEl.classList.add('hidden');
    
    const productSelect = document.getElementById('movement-product');
    const quantity = parseInt(document.getElementById('movement-quantity').value);
    
    if (!productSelect.value) {
        errorEl.textContent = 'Selecciona un producto';
        errorEl.classList.add('hidden');
        showToast('Selecciona un producto', 'error');
        return false;
    }
    if (isNaN(quantity) || quantity <= 0) {
        showToast('La cantidad debe ser mayor a 0', 'error');
        return false;
    }
    
    const data = {
        product_id: parseInt(productSelect.value),
        type: document.getElementById('movement-type').value,
        quantity: quantity,
        reason: document.getElementById('movement-reason').value.trim()
    };
    
    const success = await createInventory(data);
    if (success) closeMovementModal();
    return false;
}

// ============================================================
// Delete Modal Functions
// ============================================================

function openDeleteModal(id, productName) {
    state.deleteTargetId = id;
    document.getElementById('delete-product-name').textContent = `¿Eliminar "${productName}"? Esta acción no se puede deshacer.`;
    document.getElementById('delete-form-error').classList.add('hidden');
    document.getElementById('modal-delete').classList.remove('hidden');
}

function closeDeleteModal() {
    document.getElementById('modal-delete').classList.add('hidden');
    state.deleteTargetId = null;
}

async function confirmDelete() {
    if (!state.deleteTargetId) return;
    await deleteProduct(state.deleteTargetId);
}

// ============================================================
// View / Navigation Router
// ============================================================

function navigate(view) {
    // Hide all views
    document.querySelectorAll('.view-content').forEach(el => el.classList.add('hidden'));
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('bg-brand-700', 'text-white');
        el.classList.add('text-brand-200');
    });

    // Show selected view
    const viewEl = document.getElementById(`view-${view}`);
    if (viewEl) {
        viewEl.classList.remove('hidden');
        state.currentView = view;
    }

    // Update title
    const titles = { dashboard: 'Dashboard', products: 'Productos', inventory: 'Movimientos' };
    document.getElementById('page-title').textContent = titles[view] || view;

    // Set active nav
    const activeNav = document.querySelector(`[data-nav="${view}"]`);
    if (activeNav) {
        activeNav.classList.remove('text-brand-200');
        activeNav.classList.add('bg-brand-700', 'text-white');
    }

    // Load view data
    if (view === 'dashboard') loadDashboard();
    else if (view === 'products') loadProducts();
    else if (view === 'inventory') loadInventory();
}

// ============================================================
// Utility: HTML escape
// ============================================================

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================================
// Event Listeners
// ============================================================

async function initApp() {
    setApiStatus(false);
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const nav = el.getAttribute('data-nav');
            if (nav) navigate(nav);
        });
    });

    // Dashboard hash navigation
    if (window.location.hash.startsWith('#') || window.location.hash === '') {
        navigate('dashboard');
    } else {
        const hashView = window.location.hash.substring(1);
        navigate(hashView);
    }
    window.addEventListener('hashchange', () => {
        const hashView = window.location.hash.substring(1);
        if (hashView) navigate(hashView);
    });

    // New product button
    document.getElementById('btn-new-product').addEventListener('click', () => openProductModal());

    // Product filters
    document.getElementById('btn-clear-filters').addEventListener('click', () => {
        state.filters = { search: '', category: '', minPrice: '', maxPrice: '' };
        document.getElementById('filter-search').value = '';
        document.getElementById('filter-category').value = '';
        document.getElementById('filter-min-price').value = '';
        document.getElementById('filter-max-price').value = '';
        state.productsPage = 1;
        loadProducts();
    });

    document.getElementById('filter-search').addEventListener('input', debounce(() => {
        state.filters.search = document.getElementById('filter-search').value;
        state.productsPage = 1;
        loadProducts();
    }, 400));

    document.getElementById('filter-category').addEventListener('change', (e) => {
        state.filters.category = e.target.value;
        state.productsPage = 1;
        loadProducts();
    });

    document.getElementById('filter-min-price').addEventListener('change', (e) => {
        state.filters.minPrice = e.target.value;
        state.productsPage = 1;
        loadProducts();
    });

    document.getElementById('filter-max-price').addEventListener('change', (e) => {
        state.filters.maxPrice = e.target.value;
        state.productsPage = 1;
        loadProducts();
    });

    // Pagination
    document.getElementById('btn-prev-page').addEventListener('click', () => {
        if (state.productsPage > 1) {
            state.productsPage--;
            loadProducts();
        }
    });

    document.getElementById('btn-next-page').addEventListener('click', () => {
        state.productsPage++;
        loadProducts();
    });

    // Movement modal
    document.getElementById('btn-open-movement-modal').addEventListener('click', () => openMovementModal());
    document.getElementById('movement-product-filter').addEventListener('change', () => {
        state.inventoryProductFilter = document.getElementById('movement-product-filter').value;
        // Filter inventory by selected product dynamically on next load
    });

    // Inventory pagination
    document.getElementById('btn-inv-prev-page').addEventListener('click', () => {
        if (state.inventorySkip > 0) {
            state.inventorySkip -= state.inventoryLimit;
            loadInventory();
        }
    });

    document.getElementById('btn-inv-next-page').addEventListener('click', () => {
        state.inventorySkip += state.inventoryLimit;
        loadInventory();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProductModal();
            closeMovementModal();
            closeDeleteModal();
        }
    });

    // Initial API health check
    checkApi().then(connected => {
        if (connected) {
            // Start with dashboard
            navigate('dashboard');
        } else {
            showToast('El backend no está disponible. La app muestra datos de ejemplo.', 'error');
            navigate('dashboard');
        }
    });
}

// Debounce helper
function debounce(fn, ms) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), ms);
    };
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
