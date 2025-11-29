/* ======================================================
   FARBER PANEL PRO - React SPA
   app.js (JSX con Babel)
   ====================================================== */

const { useState, useEffect, useMemo, createContext, useContext } = React;

/* ------------------------------------------------------
   UTILIDADES
------------------------------------------------------ */

function useLocalStorageState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue];
}

/* ------------------------------------------------------
   TOASTS
------------------------------------------------------ */

const ToastContext = createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const pushToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const api = useMemo(
    () => ({
      success: (msg) => pushToast(msg, "success"),
      error: (msg) => pushToast(msg, "error"),
    }),
    []
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast ${
              t.type === "error" ? "toast--error" : "toast--success"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  return useContext(ToastContext);
}

/* ------------------------------------------------------
   DATOS INICIALES
------------------------------------------------------ */

const INITIAL_PRODUCTS = [
  {
    id: "mostrador-basico",
    name: "Mostrador de recepción básico",
    category: "recepcion",
    description:
      "Mostrador compacto ideal para recepciones pequeñas. Frente liso y líneas simples.",
    baseColors: ["blanco", "negro", "madera"],
    fondoTypes: ["visto", "plus"],
    measures: ["1.20m", "1.50m", "1.80m"],
    price: 120000,
    images: {
      blanco: {
        visto: "img/mostrador-basico-blanco-visto.jpg",
        plus: "img/mostrador-basico-blanco-plus.jpg",
      },
      negro: {
        visto: "img/mostrador-basico-negro-visto.jpg",
        plus: "img/mostrador-basico-negro-plus.jpg",
      },
      madera: {
        visto: "img/mostrador-basico-madera-visto.jpg",
        plus: "img/mostrador-basico-madera-plus.jpg",
      },
    },
    tags: ["Recepción", "Compacto"],
  },
  {
    id: "mostrador-plus",
    name: "Mostrador de recepción Plus",
    category: "recepcion",
    description:
      "Mostrador con mayor capacidad de guardado, doble nivel y terminación premium.",
    baseColors: ["blanco", "madera"],
    fondoTypes: ["visto", "plus"],
    measures: ["1.50m", "1.80m", "2.00m"],
    price: 185000,
    images: {
      blanco: {
        visto: "img/mostrador-plus-blanco-visto.jpg",
        plus: "img/mostrador-plus-blanco-plus.jpg",
      },
      madera: {
        visto: "img/mostrador-plus-madera-visto.jpg",
        plus: "img/mostrador-plus-madera-plus.jpg",
      },
    },
    tags: ["Recepción", "Alta gama"],
  },
  {
    id: "mueble-archivador",
    name: "Módulo archivador lateral",
    category: "oficina",
    description:
      "Mueble auxiliar para documentos, carpetas y elementos de trabajo.",
    baseColors: ["blanco", "madera"],
    fondoTypes: ["visto"],
    measures: ["0.80m", "1.00m"],
    price: 65000,
    images: {
      blanco: {
        visto: "img/archivador-blanco-visto.jpg",
      },
      madera: {
        visto: "img/archivador-madera-visto.jpg",
      },
    },
    tags: ["Oficina"],
  },
];

const INITIAL_CLIENTS = [];
const INITIAL_BUDGETS = [];
const INITIAL_ORDERS = [];
const INITIAL_HISTORY = [];
const INITIAL_CONFIG = {
  empresaNombre: "Farber Muebles",
  sucursalNombre: "Casa Central",
  monedaSimbolo: "$",
};

/* ------------------------------------------------------
   CONTEXTO GLOBAL (STATE DE LA APP)
------------------------------------------------------ */

const AppContext = createContext(null);

function AppProvider({ children }) {
  const [section, setSection] = useState(() => {
    if (typeof window === "undefined") return "dashboard";
    const hash = window.location.hash.replace("#/", "");
    return hash || "dashboard";
  });

  const [products, setProducts] = useLocalStorageState(
    "farber_products_react",
    INITIAL_PRODUCTS
  );
  const [clients, setClients] = useLocalStorageState(
    "farber_clients_react",
    INITIAL_CLIENTS
  );
  const [budgets, setBudgets] = useLocalStorageState(
    "farber_budgets_react",
    INITIAL_BUDGETS
  );
  const [orders, setOrders] = useLocalStorageState(
    "farber_orders_react",
    INITIAL_ORDERS
  );
  const [history, setHistory] = useLocalStorageState(
    "farber_history_react",
    INITIAL_HISTORY
  );
  const [config, setConfig] = useLocalStorageState(
    "farber_config_react",
    INITIAL_CONFIG
  );

  // 👇 nuevo: qué pedido está seleccionado en Recepción
  const [receptionSelectedOrderId, setReceptionSelectedOrderId] = useState(null);

  // Router por hash
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#/", "") || "dashboard";
      setSection(hash);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (nextSection) => {
    window.location.hash = `#/${nextSection}`;
  };

  const value = {
    section,
    navigate,
    products,
    setProducts,
    clients,
    setClients,
    budgets,
    setBudgets,
    orders,
    setOrders,
    history,
    setHistory,
    config,
    setConfig,

    // 👇 lo agregamos al contexto
    receptionSelectedOrderId,
    setReceptionSelectedOrderId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function useApp() {
  return useContext(AppContext);
}

/* ------------------------------------------------------
   COMPONENTES LAYOUT
------------------------------------------------------ */

function Sidebar() {
  const { section, navigate } = useApp();

  const link = (id, label, icon) => (
    <button
      key={id}
      className={
        "nav-button" + (section === id ? " nav-button--active" : "")
      }
      onClick={() => navigate(id)}
    >
      <span className="icon">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar__brand">
          <div className="sidebar__logo">F</div>
          <div>
            <div className="sidebar__title">Farber Panel Pro</div>
            <div className="sidebar__subtitle">Gestión de mobiliario</div>
          </div>
        </div>

        <nav className="sidebar__nav">
          <div className="sidebar__section-label">General</div>
          {link("dashboard", "Dashboard", "🏠")}

          <div className="sidebar__section-label">Productos</div>
          {link("products", "Productos", "🗂️")}
          {link("configurator", "Configurador", "🎛️")}

          {/* 👇 Nuevo bloque de flujo comercial en el orden que querés */}
          <div className="sidebar__section-label">Flujo comercial</div>
          {link("budgets", "Presupuestos", "📄")}
          {link("orders", "Pedidos", "📦")}
          {link("reception", "Recepción", "🛎️")}

          <div className="sidebar__section-label">Datos</div>
          {link("clients", "Clientes", "👥")}
          {link("history", "Historial", "📚")}

          <div className="sidebar__section-label">Sistema</div>
          {link("config", "Configuración", "⚙️")}
        </nav>
      </div>

      <div className="sidebar__footer">
        Farber Panel Pro · React SPA<br />
        <span style={{ opacity: 0.7 }}>Flujo comercial: P → O → R</span>
      </div>
    </aside>
  );
}


function Topbar() {
  const { section, products } = useApp();
  const titleMap = {
    dashboard: "Dashboard",
    products: "Productos",
    configurator: "Configurador",
    reception: "Recepción",
    clients: "Clientes",
    budgets: "Presupuestos",
    orders: "Pedidos",
    history: "Historial",
    config: "Configuración",
  };

  const subtitleMap = {
    dashboard: "Resumen general del sistema",
    products: "Administrá tu catálogo de productos",
    configurator: "Configurá combinaciones con imagen en tiempo real",
    reception: "Productos pensados para áreas de recepción",
    clients: "Clientes y datos de contacto",
    budgets: "Gestión completa de presupuestos",
    orders: "Control de pedidos y entregas",
    history: "Historial de presupuestos y pedidos",
    config: "Datos generales del sistema",
  };

  return (
    <header className="topbar">
      <div>
        <div className="topbar__title">{titleMap[section] || "Panel"}</div>
        <div className="topbar__subtitle">
          {subtitleMap[section] || "Gestión de mobiliario Farber"}
        </div>
      </div>

      <div className="topbar__right">
        <span className="tag">Productos: {products.length}</span>
      </div>
    </header>
  );
}

/* ------------------------------------------------------
   VISTAS
------------------------------------------------------ */

function DashboardView() {
  const { products, budgets, orders, clients } = useApp();

  return (
    <div className="section-enter">
      <h1 className="section-title">Dashboard</h1>
      <p className="section-subtitle">
        Vista general rápida de tu operación diaria.
      </p>

      <div className="grid grid--three">
        <div className="card card--accent">
          <div className="card__header">
            <div>
              <div className="card__title">Productos activos</div>
              <div className="card__subtitle">Catálogo actual</div>
            </div>
            <div className="card__pill">Catálogo</div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
            {products.length}
          </div>
          <div className="text-muted">Centralizados en JSON</div>
        </div>

        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Presupuestos</div>
              <div className="card__subtitle">En sistema</div>
            </div>
            <div className="card__pill">Comercial</div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
            {budgets.length}
          </div>
          <div className="text-muted">Listos para seguimiento</div>
        </div>

        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Clientes</div>
              <div className="card__subtitle">Registrados</div>
            </div>
            <div className="card__pill">CRM</div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>
            {clients.length}
          </div>
          <div className="text-muted">Contactos centralizados</div>
        </div>
      </div>
    </div>
  );
}

/* ------- Productos: listado + filtro + import/export JSON ------- */

function ProductsView() {
  const { products, setProducts } = useApp();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [jsonBulk, setJsonBulk] = useState("");

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesCategory =
        category === "all" || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const handleAdd = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    if (!name) return;

    const newProduct = {
      id: "p_" + Date.now(),
      name,
      category: form.category.value.trim() || "sin-categoria",
      description: form.description.value.trim(),
      baseColors: ["blanco"],
      fondoTypes: ["visto"],
      measures: ["1.00m"],
      price: Number(form.price.value) || 0,
      images: {
        blanco: {
          visto: "img/default-product.jpg",
        },
      },
      tags: [],
    };

    setProducts((prev) => [...prev, newProduct]);
    form.reset();
    toast.success("Producto agregado");
  };

  const handleImportJson = () => {
    if (!jsonBulk.trim()) return;
    try {
      const parsed = JSON.parse(jsonBulk);
      if (!Array.isArray(parsed)) {
        toast.error("El JSON debe ser un array de productos");
        return;
      }
      setProducts(parsed);
      toast.success("Productos importados desde JSON");
    } catch (err) {
      toast.error("JSON inválido");
    }
  };

  const handleExportJson = () => {
    const text = JSON.stringify(products, null, 2);
    setJsonBulk(text);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    toast.success("Catálogo exportado a JSON");
  };

  return (
    <div className="section-enter">
      <h1 className="section-title">Productos</h1>
      <p className="section-subtitle">
        Catálogo centralizado, generado desde JSON, listo para crecer.
      </p>

      <div className="grid grid--two">
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Productos actuales</div>
              <div className="card__subtitle">
                Buscador y filtro por categoría
              </div>
            </div>
          </div>

          <div className="grid" style={{ gap: "8px", marginBottom: "8px" }}>
            <div className="field-group">
              <label>Buscar</label>
              <input
                className="input"
                placeholder="Nombre o descripción…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Categoría</label>
              <select
                className="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "Todas" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Colores base</th>
                  <th>Fondos</th>
                  <th>Medidas</th>
                  <th className="text-right">Precio</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{(p.baseColors || []).join(", ")}</td>
                    <td>{(p.fondoTypes || []).join(", ")}</td>
                    <td>{(p.measures || []).join(", ")}</td>
                    <td className="text-right">
                      {p.price ? `$ ${p.price.toLocaleString("es-AR")}` : "-"}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: 12 }}>
                      No hay productos que coincidan con el filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Nuevo producto rápido</div>
              <div className="card__subtitle">
                Podés ajustar detalles luego en el JSON.
              </div>
            </div>
          </div>

          <form onSubmit={handleAdd}>
            <div className="field-group">
              <label>Nombre</label>
              <input
                name="name"
                className="input"
                placeholder="Ej: Mostrador corner…"
                required
              />
            </div>
            <div className="field-group">
              <label>Categoría</label>
              <input
                name="category"
                className="input"
                placeholder="Ej: recepcion, oficina…"
              />
            </div>
            <div className="field-group">
              <label>Precio base</label>
              <input
                name="price"
                type="number"
                step="0.01"
                className="input"
                placeholder="0.00"
              />
            </div>
            <div className="field-group">
              <label>Descripción</label>
              <textarea
                name="description"
                className="textarea"
                placeholder="Detalles del producto…"
              />
            </div>

            <button type="submit" className="button">
              ➕ Agregar producto
            </button>
          </form>

          <hr style={{ margin: "14px 0", borderColor: "rgba(197,198,199,.3)" }} />

          <div className="field-group">
            <label>Importar / exportar productos (JSON)</label>
            <textarea
              className="textarea"
              value={jsonBulk}
              onChange={(e) => setJsonBulk(e.target.value)}
              placeholder='Pega aquí un array JSON de productos…'
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="button button--ghost"
              onClick={handleExportJson}
            >
              ⬇️ Exportar JSON
            </button>
            <button
              type="button"
              className="button"
              onClick={handleImportJson}
            >
              ⬆️ Importar JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------- Configurador: color, fondo, medida e imagen dinámica ------- */

function ConfiguratorView() {
  const { products } = useApp();
  const toast = useToast();

  const [productId, setProductId] = useState(
    products[0]?.id || "mostrador-basico"
  );
  const [color, setColor] = useState("blanco");
  const [fondo, setFondo] = useState("visto");
  const [medida, setMedida] = useState("1.20m");

  const product = useMemo(
    () => products.find((p) => p.id === productId) || products[0],
    [products, productId]
  );

  useEffect(() => {
    if (product) {
      setColor(product.baseColors?.[0] || "blanco");
      setFondo(product.fondoTypes?.[0] || "visto");
      setMedida(product.measures?.[0] || "1.00m");
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="section-enter">
        <h1 className="section-title">Configurador</h1>
        <p className="section-subtitle">
          Agregá al menos un producto para usar el configurador.
        </p>
      </div>
    );
  }

  const imgSrc =
    product.images?.[color]?.[fondo] ||
    product.images?.[color]?.visto ||
    "img/default-product.jpg";

  const handleCopyConfig = () => {
    const summary = `Producto: ${product.name}
Color base: ${color}
Fondo: ${fondo}
Medida: ${medida}
Precio base: ${product.price ? "$ " + product.price : "-"}
`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary).catch(() => {});
    }
    toast.success("Configuración copiada");
  };

  return (
    <div className="section-enter">
      <h1 className="section-title">Configurador de producto</h1>
      <p className="section-subtitle">
        Cambiá color, fondo y medida con previsualización en tiempo real.
      </p>

      <div className="configurator">
        <div className="configurator__preview">
          <div className="card__header">
            <div>
              <div className="card__title">{product.name}</div>
              <div className="card__subtitle">
                {product.description || "Producto sin descripción."}
              </div>
            </div>
            <div className="card__pill">Preview</div>
          </div>

          <div className="configurator__image-frame">
            <img src={imgSrc} alt={product.name} />
          </div>

          <div className="configurator__meta">
            <div className="configurator__meta-row">
              <span>Color base</span>
              <strong>{color}</strong>
            </div>
            <div className="configurator__meta-row">
              <span>Fondo</span>
              <strong>{fondo}</strong>
            </div>
            <div className="configurator__meta-row">
              <span>Medida</span>
              <strong>{medida}</strong>
            </div>
            <div className="configurator__meta-row">
              <span>Precio base</span>
              <strong>
                {product.price
                  ? `$ ${product.price.toLocaleString("es-AR")}`
                  : "-"}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="button button--ghost"
            onClick={handleCopyConfig}
          >
            📋 Copiar configuración
          </button>
        </div>

        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Opciones de configuración</div>
              <div className="card__subtitle">
                Parámetros técnicos del módulo seleccionado.
              </div>
            </div>
          </div>

          <div className="field-group">
            <label>Producto</label>
            <select
              className="select"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Color base</label>
            <div className="chip-group">
              {(product.baseColors || []).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={
                    "chip" + (c === color ? " chip--active" : "")
                  }
                  onClick={() => setColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label>Tipo de fondo</label>
            <div className="chip-group">
              {(product.fondoTypes || []).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={
                    "chip" + (f === fondo ? " chip--active" : "")
                  }
                  onClick={() => setFondo(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label>Medida</label>
            <select
              className="select"
              value={medida}
              onChange={(e) => setMedida(e.target.value)}
            >
              {(product.measures || []).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------- Recepción: productos filtrados ------- */

function ReceptionView() {
  const {
    orders,
    setOrders,
    receptionSelectedOrderId,
    setReceptionSelectedOrderId,
  } = useApp();
  const toast = useToast();

  const [itemDesc, setItemDesc] = useState("");
  const [itemQty, setItemQty] = useState(1);

  // Si cambian los pedidos y no hay ninguno seleccionado, usar el primero
  useEffect(() => {
    if (!orders.length) {
      setReceptionSelectedOrderId(null);
      return;
    }
    if (!receptionSelectedOrderId) {
      setReceptionSelectedOrderId(orders[0].id);
    }
  }, [orders, receptionSelectedOrderId, setReceptionSelectedOrderId]);

  const currentOrder = useMemo(
    () => orders.find((o) => o.id === receptionSelectedOrderId),
    [orders, receptionSelectedOrderId]
  );

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!currentOrder) return;
    const desc = itemDesc.trim();
    if (!desc) return;

    const qty = Number(itemQty) || 1;

    const newItem = {
      id: "oi_" + Date.now(),
      description: desc,
      quantity: qty,
      received: false,
    };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === currentOrder.id
          ? { ...o, items: [...(o.items || []), newItem] }
          : o
      )
    );

    setItemDesc("");
    setItemQty(1);
    toast.success("Producto agregado al pedido para recepción");
  };

  const toggleItemReceived = (orderId, itemId) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updatedItems = (o.items || []).map((it) =>
          it.id === itemId ? { ...it, received: !it.received } : it
        );

        const total = updatedItems.length;
        const receivedCount = updatedItems.filter((i) => i.received).length;

        let status = o.status || "Pendiente recepción";
        if (total === 0) {
          status = "Pendiente recepción";
        } else if (receivedCount === 0) {
          status = "Pendiente recepción";
        } else if (receivedCount === total) {
          status = "Recepción completa";
        } else {
          status = "Recepción parcial";
        }

        return {
          ...o,
          items: updatedItems,
          status,
        };
      })
    );
  };

  const markAllReceived = () => {
    if (!currentOrder) return;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== currentOrder.id) return o;
        const updatedItems = (o.items || []).map((it) => ({
          ...it,
          received: true,
        }));
        return {
          ...o,
          items: updatedItems,
          status: updatedItems.length
            ? "Recepción completa"
            : "Pendiente recepción",
        };
      })
    );
    toast.success("Todos los productos marcados como recibidos");
  };

  return (
    <div className="section-enter">
      <h1 className="section-title">Recepción</h1>
      <p className="section-subtitle">
        Flujo final: elegí un pedido, cargá los productos y marcá cada uno como
        recibido. El estado se actualiza automáticamente.
      </p>

      <div className="grid grid--two">
        {/* SUBMENÚ DE PEDIDOS */}
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Pedidos para recepcionar</div>
              <div className="card__subtitle">
                Paso 1 · Elegí el pedido con el que querés trabajar.
              </div>
            </div>
          </div>

          {orders.length === 0 && (
            <p className="text-muted">
              No hay pedidos generados. Primero aprobá un presupuesto desde
              <strong> Presupuestos</strong>.
            </p>
          )}

          <div className="chip-group">
            {orders.map((o) => (
              <button
                key={o.id}
                type="button"
                className={
                  "chip" +
                  (o.id === receptionSelectedOrderId ? " chip--active" : "")
                }
                onClick={() => setReceptionSelectedOrderId(o.id)}
              >
                {o.number} · {o.clientName}
              </button>
            ))}
          </div>
        </div>

        {/* DETALLE DEL PEDIDO SELECCIONADO */}
        <div className="card">
          {!currentOrder ? (
            <p className="text-muted">
              Seleccioná un pedido de la izquierda para ver y marcar la
              recepción de sus productos.
            </p>
          ) : (
            <>
              <div className="card__header">
                <div>
                  <div className="card__title">
                    Pedido {currentOrder.number}
                  </div>
                  <div className="card__subtitle">
  Paso 2 · Cargá los productos y marcá la recepción.
  <br />
  Cliente: {currentOrder.clientName} ·{" "}
  Estado:{" "}
  {currentOrder.status === "Recepción completa" ? (
    <span className="status-pill status-pill--recep-complete">
      {currentOrder.status}
    </span>
  ) : currentOrder.status === "Recepción parcial" ? (
    <span className="status-pill status-pill--recep-partial">
      {currentOrder.status}
    </span>
  ) : (
    <span className="status-pill status-pill--recep-pending">
      {currentOrder.status || "Pendiente recepción"}
    </span>
  )}
</div>

                </div>
                <span className="product-tag">
  {(() => {
    const total = currentOrder.items?.length || 0;
    const received = (currentOrder.items || []).filter(
      (it) => it.received
    ).length;
    return `Productos: ${received}/${total} recibidos`;
  })()}
</span>

              </div>

              {/* ALTA DE PRODUCTO EN EL PEDIDO */}
              <form onSubmit={handleAddItem} style={{ marginBottom: 12 }}>
                <div className="grid" style={{ gap: 8 }}>
                  <div className="field-group">
                    <label>Descripción del producto</label>
                    <input
                      className="input"
                      value={itemDesc}
                      onChange={(e) => setItemDesc(e.target.value)}
                      placeholder="Ej: Mostrador recepción Plus 1.80m"
                    />
                  </div>
                  <div className="field-group">
                    <label>Cantidad</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="button">
                  ➕ Agregar producto al pedido
                </button>
              </form>

              {/* LISTA DE PRODUCTOS + CHECK DE RECEPCIÓN */}
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cant.</th>
                      <th>Recibido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(currentOrder.items || []).map((it) => (
                      <tr key={it.id}>
                        <td>{it.description}</td>
                        <td>{it.quantity}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!it.received}
                            onChange={() =>
                              toggleItemReceived(currentOrder.id, it.id)
                            }
                          />{" "}
                          <span style={{ fontSize: "0.8rem" }}>
                            {it.received ? "Recibido" : "Pendiente"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!currentOrder.items ||
                      (currentOrder.items.length === 0 && (
                        <tr>
                          <td
                            colSpan="3"
                            style={{
                              padding: 10,
                              textAlign: "center",
                            }}
                          >
                            Todavía no agregaste productos a este pedido.
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                className="button button--ghost"
                style={{ marginTop: 10 }}
                onClick={markAllReceived}
              >
                ✅ Marcar todos los productos como recibidos
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


/* ------- Clientes (estructura lista) ------- */

function ClientsView() {
  const { clients, setClients } = useApp();
  const toast = useToast();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const needle = search.toLowerCase();
      return (
        !needle ||
        c.name.toLowerCase().includes(needle) ||
        (c.phone || "").toLowerCase().includes(needle) ||
        (c.email || "").toLowerCase().includes(needle)
      );
    });
  }, [clients, search]);

  const handleAdd = (e) => {
    e.preventDefault();
    const form = e.target;
    const client = {
      id: "c_" + Date.now(),
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      address: form.address.value.trim(),
      notes: form.notes.value.trim(),
      createdISO: new Date().toISOString(),
    };
    if (!client.name) return;
    setClients((prev) => [...prev, client]);
    form.reset();
    toast.success("Cliente guardado");
  };

  return (
    <div className="section-enter">
      <h1 className="section-title">Clientes</h1>
      <p className="section-subtitle">
        Base simple de clientes, lista para crecer.
      </p>

      <div className="grid grid--two">
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Listado</div>
              <div className="card__subtitle">
                Buscador rápido por nombre, teléfono o email.
              </div>
            </div>
          </div>

          <div className="field-group">
            <label>Buscar</label>
            <input
              className="input"
              placeholder="Buscar cliente…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Dirección</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{c.email}</td>
                    <td>{c.address}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: 12 }}>
                      No hay clientes cargados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Nuevo cliente</div>
              <div className="card__subtitle">
                Formulario rápido. Se guarda en localStorage.
              </div>
            </div>
          </div>

          <form onSubmit={handleAdd}>
            <div className="field-group">
              <label>Nombre</label>
              <input
                name="name"
                className="input"
                required
                placeholder="Nombre y apellido / empresa…"
              />
            </div>
            <div className="field-group">
              <label>Teléfono</label>
              <input name="phone" className="input" placeholder="Teléfono" />
            </div>
            <div className="field-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                className="input"
                placeholder="cliente@mail.com"
              />
            </div>
            <div className="field-group">
              <label>Dirección</label>
              <input name="address" className="input" placeholder="Dirección" />
            </div>
            <div className="field-group">
              <label>Notas</label>
              <textarea
                name="notes"
                className="textarea"
                placeholder="Notas adicionales…"
              />
            </div>
            <button type="submit" className="button">
              💾 Guardar cliente
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ------- Presupuestos, Pedidos, Historial, Config: esqueletos pro ------- */
function BudgetsView() {
  const {
    budgets,
    setBudgets,
    orders,
    setOrders,
    setReceptionSelectedOrderId,
    navigate,
  } = useApp();
  const toast = useToast();

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const needle = search.toLowerCase();
    return budgets.filter((b) => {
      if (!needle) return true;
      return (
        (b.number || "").toLowerCase().includes(needle) ||
        (b.clientName || "").toLowerCase().includes(needle)
      );
    });
  }, [budgets, search]);

  const handleCreateBudget = (e) => {
    e.preventDefault();
    const form = e.target;
    const number = form.number.value.trim();
    const clientName = form.clientName.value.trim();
    const date = form.date.value.trim();
    const total = Number(form.total.value) || 0;

    if (!number || !clientName) return;

    const newBudget = {
      id: "b_" + Date.now(),
      number,
      clientName,
      date: date || new Date().toISOString().slice(0, 10),
      total,
      status: "Pendiente",
    };

    setBudgets((prev) => [...prev, newBudget]);
    form.reset();
    toast.success("Presupuesto creado");
  };

  const handleApproveAndCreateOrder = (budget) => {
    if (budget.status === "Aprobado") {
      toast.success("Este presupuesto ya está aprobado");
      return;
    }

    // 1) Marcar presupuesto como aprobado
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === budget.id ? { ...b, status: "Aprobado" } : b
      )
    );

    // 2) Crear pedido a partir del presupuesto
    const nextNumber =
      "O-" + String(orders.length + 1).padStart(4, "0");

    const newOrder = {
      id: "o_" + Date.now(),
      number: nextNumber,
      budgetId: budget.id,
      clientName: budget.clientName,
      createdISO: new Date().toISOString().slice(0, 10),
      expectedISO: "",
      total: budget.total,
      status: "Pendiente recepción",
      items: [],
    };

    setOrders((prev) => [...prev, newOrder]);

    // 3) Dejar preseleccionado ese pedido en Recepción y navegar
    setReceptionSelectedOrderId(newOrder.id);
    navigate("reception");

    toast.success("Presupuesto aprobado y pedido enviado a Recepción");
  };

  return (
    <div className="section-enter">
      <h1 className="section-title">Presupuestos</h1>
      <p className="section-subtitle">
        Creá presupuestos, aprobálos y pasá al flujo de recepción en 1 click.
      </p>

      <div className="grid grid--two">
        {/* LISTADO */}
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Listado</div>
              <div className="card__subtitle">
                Buscador + acción de aprobar → pedido → recepción.
              </div>
            </div>
          </div>

          <div className="field-group">
            <label>Buscar</label>
            <input
              className="input"
              placeholder="N° de presupuesto o cliente…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th className="text-right">Total</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td>{b.number}</td>
                    <td>{b.clientName}</td>
                    <td>{b.date}</td>
                    <td className="text-right">
                      {b.total
                        ? `$ ${b.total.toLocaleString("es-AR")}`
                        : "-"}
                    </td>
                    <td>
  {b.status === "Aprobado" ? (
    <span className="status-pill status-pill--approved">
      {b.status}
    </span>
  ) : (
    <span className="status-pill status-pill--pending">
      {b.status || "Pendiente"}
    </span>
  )}
</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="button button--ghost"
                        onClick={() => handleApproveAndCreateOrder(b)}
                      >
                        ✅ Aprobar y enviar a Recepción
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", padding: 12 }}
                    >
                      Todavía no hay presupuestos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ALTA RÁPIDA */}
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Nuevo presupuesto</div>
              <div className="card__subtitle">
                Versión resumida. Luego podés detallar ítems aparte.
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateBudget}>
            <div className="field-group">
              <label>N° de presupuesto</label>
              <input
                name="number"
                className="input"
                placeholder="Ej: P-0001"
                required
              />
            </div>
            <div className="field-group">
              <label>Cliente</label>
              <input
                name="clientName"
                className="input"
                placeholder="Nombre del cliente…"
                required
              />
            </div>
            <div className="field-group">
              <label>Fecha</label>
              <input
                name="date"
                type="date"
                className="input"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="field-group">
              <label>Total</label>
              <input
                name="total"
                type="number"
                step="0.01"
                className="input"
                placeholder="0.00"
              />
            </div>

            <button type="submit" className="button">
              💾 Guardar presupuesto
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


function OrdersView() {
  const { orders, setReceptionSelectedOrderId, navigate } = useApp();

  return (
    <div className="section-enter">
      <h1 className="section-title">Pedidos</h1>
      <p className="section-subtitle">
        Pedidos generados a partir de presupuestos aprobados. Desde acá
        podés saltar directo a Recepción.
      </p>

      <div className="card">
        <div className="card__header">
          <div>
            <div className="card__title">Listado de pedidos</div>
            <div className="card__subtitle">
              Estado de recepción y acceso rápido al detalle.
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>N° pedido</th>
                <th>Cliente</th>
                <th>Presupuesto</th>
                <th>Creado</th>
                <th className="text-right">Total</th>
                <th>Estado recepción</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.number}</td>
                  <td>{o.clientName}</td>
                  <td>{o.budgetId || "-"}</td>
                  <td>{o.createdISO}</td>
                  <td className="text-right">
                    {o.total
                      ? `$ ${o.total.toLocaleString("es-AR")}`
                      : "-"}
                  </td>
                  <td>
  {o.status === "Recepción completa" ? (
    <span className="status-pill status-pill--recep-complete">
      {o.status}
    </span>
  ) : o.status === "Recepción parcial" ? (
    <span className="status-pill status-pill--recep-partial">
      {o.status}
    </span>
  ) : (
    <span className="status-pill status-pill--recep-pending">
      {o.status || "Pendiente recepción"}
    </span>
  )}
</td>

                  <td className="text-right">
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => {
                        setReceptionSelectedOrderId(o.id);
                        navigate("reception");
                      }}
                    >
                      📥 Ir a recepción
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    style={{ padding: 12, textAlign: "center" }}
                  >
                    Todavía no hay pedidos. Aprobá un presupuesto para
                    generar el primero.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


function HistoryView() {
  const { history } = useApp();

  return (
    <div className="section-enter">
      <h1 className="section-title">Historial</h1>
      <p className="section-subtitle">
        Pensado para unificar presupuestos confirmados, pedidos despachados,
        etc.
      </p>

      <div className="card">
        <div className="card__header">
          <div>
            <div className="card__title">Registros</div>
            <div className="card__subtitle">
              Historial exportable en futuras versiones.
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th className="text-right">Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>{h.number}</td>
                  <td>{h.clientName}</td>
                  <td>{h.date}</td>
                  <td className="text-right">{h.total}</td>
                  <td>{h.status}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: 12, textAlign: "center" }}>
                    Todavía no hay historial cargado en la versión React.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ConfigView() {
  const { config, setConfig } = useApp();
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    setConfig({
      empresaNombre: form.empresaNombre.value.trim(),
      sucursalNombre: form.sucursalNombre.value.trim(),
      monedaSimbolo: form.monedaSimbolo.value.trim(),
    });
    toast.success("Configuración actualizada");
  };

  return (
    <div className="section-enter">
      <h1 className="section-title">Configuración</h1>
      <p className="section-subtitle">
        Datos generales del sistema. Se guardan en localStorage.
      </p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid" style={{ gap: 14 }}>
            <div className="field-group">
              <label>Nombre de la empresa</label>
              <input
                name="empresaNombre"
                className="input"
                defaultValue={config.empresaNombre}
              />
            </div>
            <div className="field-group">
              <label>Nombre de la sucursal</label>
              <input
                name="sucursalNombre"
                className="input"
                defaultValue={config.sucursalNombre}
              />
            </div>
            <div className="field-group">
              <label>Símbolo de moneda</label>
              <input
                name="monedaSimbolo"
                className="input"
                defaultValue={config.monedaSimbolo}
              />
            </div>
          </div>

          <button type="submit" className="button" style={{ marginTop: 12 }}>
            💾 Guardar configuración
          </button>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------
   ROOT APP
------------------------------------------------------ */

function MainContent() {
  const { section } = useApp();

  switch (section) {
    case "dashboard":
      return <DashboardView />;
    case "products":
      return <ProductsView />;
    case "configurator":
      return <ConfiguratorView />;
    case "reception":
      return <ReceptionView />;
    case "clients":
      return <ClientsView />;
    case "budgets":
      return <BudgetsView />;
    case "orders":
      return <OrdersView />;
    case "history":
      return <HistoryView />;
    case "config":
      return <ConfigView />;
    default:
      return <DashboardView />;
  }
}

function App() {
  useEffect(() => {
    const loader = document.getElementById("appLoader");
    if (!loader) return;
    setTimeout(() => loader.classList.add("loader--hide"), 600);
  }, []);

  return (
    <ToastProvider>
      <AppProvider>
        <div className="app">
          <Sidebar />
          <main className="main">
            <Topbar />
            <div className="main__content">
              <MainContent />
            </div>
          </main>
        </div>
      </AppProvider>
    </ToastProvider>
  );
}

/* ------------------------------------------------------
   MONTAJE REACT
------------------------------------------------------ */

const rootEl = document.getElementById("root");
const root = ReactDOM.createRoot(rootEl);
root.render(<App />);

