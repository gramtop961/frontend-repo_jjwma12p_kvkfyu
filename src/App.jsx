import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Navbar({ onNavigate, cartCount, user }) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="font-extrabold tracking-tight text-xl">BlueWear</div>
        <nav className="hidden md:flex gap-6 text-sm text-gray-600">
          <button onClick={() => onNavigate('home')} className="hover:text-black">Home</button>
          <button onClick={() => onNavigate('shop')} className="hover:text-black">Shop</button>
          <button onClick={() => onNavigate('orders')} className="hover:text-black">Orders</button>
          {user?.role === 'admin' && (
            <button onClick={() => onNavigate('admin')} className="hover:text-black">Manage</button>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('cart')} className="relative text-sm">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 grid place-content-center">{cartCount}</span>
            )}
          </button>
          <button onClick={() => onNavigate(user ? 'account' : 'login')} className="text-sm px-3 py-1.5 rounded bg-black text-white">
            {user ? user.name.split(' ')[0] : 'Login'}
          </button>
        </div>
      </div>
    </header>
  )
}

function ProductCard({ product, onAdd }) {
  return (
    <div className="group rounded-xl border p-4 hover:shadow-sm transition">
      <div className="aspect-[4/3] w-full rounded-lg bg-gray-100 overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-content-center text-gray-400 text-sm">No image</div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <div className="font-medium">{product.title}</div>
          <div className="text-gray-500 text-sm">${product.price.toFixed(2)}</div>
        </div>
        <button onClick={() => onAdd(product)} className="text-sm px-3 py-1.5 rounded bg-black text-white">Add</button>
      </div>
    </div>
  )
}

function Section({ title, children, actions }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  )
}

function Login({ onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      if (!res.ok) throw new Error((await res.json()).detail || 'Login failed')
      const data = await res.json()
      onLoggedIn(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="space-y-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full border rounded px-3 py-2" />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button disabled={loading} className="w-full bg-black text-white rounded py-2">{loading ? 'Loading...' : 'Login'}</button>
      </form>
      <p className="text-xs text-gray-500 mt-3">Tip: You can register an admin in the Manage tab or via API then login here.</p>
    </div>
  )
}

function Cart({ cart, onCheckout }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
      {cart.length === 0 ? (
        <div className="text-gray-500">Your cart is empty.</div>
      ) : (
        <div className="space-y-4">
          {cart.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between border rounded p-3">
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-gray-500 text-sm">${(item.price * item.quantity).toFixed(2)} ({item.quantity} x ${item.price.toFixed(2)})</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => item.onDec()} className="px-2 border rounded">-</button>
                <div className="w-8 text-center">{item.quantity}</div>
                <button onClick={() => item.onInc()} className="px-2 border rounded">+</button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-4">
            <div className="font-semibold">Subtotal</div>
            <div className="font-semibold">${subtotal.toFixed(2)}</div>
          </div>
          <button onClick={onCheckout} className="w-full bg-black text-white rounded py-2">Pay Now</button>
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600 mb-2">Scan to pay</div>
            <img src="https://images.unsplash.com/photo-1550482781-48d477e61c72?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxRUnxlbnwwfDB8fHwxNzYyODgyNjc4fDA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="QR" className="w-40 h-40" />
          </div>
        </div>
      )}
    </div>
  )
}

function Admin({ user }) {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ title: '', price: '', description: '', image_url: '' })
  const [orders, setOrders] = useState([])
  const [report, setReport] = useState(null)

  const load = async () => {
    const [p, o] = await Promise.all([
      fetch(`${API}/products`).then(r => r.json()),
      fetch(`${API}/orders`).then(r => r.json()),
    ])
    setProducts(p)
    setOrders(o)
  }

  useEffect(() => { load() }, [])

  const addProduct = async (e) => {
    e.preventDefault()
    const body = { ...form, price: parseFloat(form.price || '0') }
    await fetch(`${API}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setForm({ title: '', price: '', description: '', image_url: '' })
    load()
  }

  const delProduct = async (id) => {
    await fetch(`${API}/products/${id}`, { method: 'DELETE' })
    load()
  }

  const markPaid = async (orderId) => {
    await fetch(`${API}/orders/mark-paid`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId }) })
    load()
  }

  const getReport = async () => {
    const data = await fetch(`${API}/reports/monthly`).then(r => r.json())
    setReport(data)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <Section title="Add Product">
        <form onSubmit={addProduct} className="grid md:grid-cols-4 gap-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="border rounded px-3 py-2" />
          <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className="border rounded px-3 py-2" />
          <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Image URL" className="border rounded px-3 py-2" />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="border rounded px-3 py-2 md:col-span-4" />
          <button className="bg-black text-white rounded py-2 md:col-span-4">Add Product</button>
        </form>
      </Section>

      <Section title="Products">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="border rounded p-3">
              <div className="font-medium">{p.title}</div>
              <div className="text-gray-500 text-sm mb-2">${p.price?.toFixed ? p.price.toFixed(2) : p.price}</div>
              <div className="flex gap-2">
                <button onClick={() => delProduct(p.id)} className="px-3 py-1.5 border rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Orders">
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{o.customer_name} — ${o.subtotal?.toFixed ? o.subtotal.toFixed(2) : o.subtotal}</div>
                  <div className="text-xs text-gray-500">{o.items.length} items • {o.status}</div>
                </div>
                {o.status !== 'paid' && (
                  <button onClick={() => markPaid(o.id)} className="px-3 py-1.5 border rounded">Mark Paid</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Monthly Report" actions={<button onClick={getReport} className="px-3 py-1.5 border rounded">Refresh</button>}>
        {report ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border rounded p-4"><div className="text-sm text-gray-500">Total Orders</div><div className="text-2xl font-semibold">{report.total_orders}</div></div>
            <div className="border rounded p-4"><div className="text-sm text-gray-500">Total Revenue</div><div className="text-2xl font-semibold">${report.total_revenue}</div></div>
            {Object.entries(report.summary).map(([status, s]) => (
              <div key={status} className="border rounded p-4"><div className="text-sm text-gray-500">{status}</div><div className="text-lg font-semibold">{s.orders} orders • ${s.revenue}</div></div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">Click refresh to load report.</div>
        )}
      </Section>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('home')
  const [products, setProducts] = useState([])
  const [cartMap, setCartMap] = useState({})
  const [user, setUser] = useState(null)

  const cart = useMemo(() => Object.values(cartMap), [cartMap])

  const loadProducts = async () => {
    const data = await fetch(`${API}/products`).then(r => r.json())
    setProducts(data)
  }

  useEffect(() => { loadProducts() }, [])

  const addToCart = (p) => {
    setCartMap(m => {
      const existing = m[p.id]
      const quantity = existing ? existing.quantity + 1 : 1
      return { ...m, [p.id]: { ...p, quantity, onInc: () => addToCart(p), onDec: () => decFromCart(p.id) } }
    })
  }

  const decFromCart = (id) => {
    setCartMap(m => {
      const existing = m[id]
      if (!existing) return m
      const q = existing.quantity - 1
      if (q <= 0) {
        const { [id]: _, ...rest } = m
        return rest
      }
      return { ...m, [id]: { ...existing, quantity: q } }
    })
  }

  const checkout = async () => {
    if (cart.length === 0) return
    const payload = {
      customer_name: user?.name || 'Guest',
      customer_email: user?.email || 'guest@example.com',
      shipping_address: 'N/A',
      items: cart.map(c => ({ product_id: c.id, title: c.title, price: c.price, quantity: c.quantity }))
    }
    const res = await fetch(`${API}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    setCartMap({})
    alert('Order created. Use the QR to pay. Admin can mark paid in Manage.')
    setView('orders')
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-gray-900">
      <Navbar onNavigate={setView} cartCount={cart.length} user={user} />

      {view === 'home' && (
        <div>
          <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Minimal styles for everyday comfort.</h1>
              <p className="mt-4 text-gray-600">Discover clean cuts and timeless pieces. Designed with care, built to last.</p>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setView('shop')} className="px-5 py-2.5 rounded bg-black text-white">Shop now</button>
                <button onClick={() => setView('login')} className="px-5 py-2.5 rounded border">Sign in</button>
              </div>
            </div>
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200" />
          </section>
          <Section title="Featured">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.slice(0, 6).map(p => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          </Section>
        </div>
      )}

      {view === 'shop' && (
        <Section title="Shop">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        </Section>
      )}

      {view === 'cart' && <Cart cart={cart} onCheckout={checkout} />}
      {view === 'login' && <Login onLoggedIn={(u) => { setUser(u); setView('home') }} />}
      {view === 'admin' && user?.role === 'admin' && <Admin user={user} />}
      {view === 'orders' && (
        <Section title="Your Orders">
          <div className="text-gray-500 text-sm">After placing an order, admin can confirm payment in Manage.</div>
        </Section>
      )}
    </div>
  )
}
