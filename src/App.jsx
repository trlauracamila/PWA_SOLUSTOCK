import React, { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';

function App() {
  // Estado para controlar la vista activa: 'home', 'login', 'register', 'admin.html', 'user.html'
  const [currentView, setCurrentView] = useState('home');
  const [activeSession, setActiveSession] = useState(() => {
    const savedSession = localStorage.getItem('solustock_session');
    return savedSession ? JSON.parse(savedSession) : null;
  });

  // Base de datos local de usuarios con hashes generados con bcryptjs (Salt factor: 10)
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('solustock_users');
    return savedUsers ? JSON.parse(savedUsers) : [
      {
        email: 'admin@solustock.com',
        // Hash bcrypt para 'admin123'
        passwordHash: '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
        role: 'admin'
      },
      {
        email: 'user@solustock.com',
        // Hash bcrypt para 'user123'
        passwordHash: '$2a$10$R9h/212eI84Q4/0zK.N44uW/dYtA152.0K3sKjX5W94yU9u4a9k6.',
        role: 'user'
      }
    ];
  });

  // Estados del formulario de inicio de sesión
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rolusuario, setRolusuario] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados del formulario de registro
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('user');
  const [regSuccess, setRegSuccess] = useState('');

  // Estados del inventario con persistencia en localStorage (Soporte Offline)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('solustock_inventory');
    return saved ? JSON.parse(saved) : [
      { id: 1, code: 'P001', name: 'VINILO TP1 MASTER FINO BLANCO CUÑETE', category: 'Vinilo', stock: 25 },
      { id: 2, code: 'P002', name: 'VINILO TP1 MASTER FINO BLANCO GALON', category: 'Vinilo', stock: 40 }
    ];
  });

  const [newProduct, setNewProduct] = useState({ code: '', name: '', category: 'Vinilo', stock: '' });

  // Guardar en localStorage ante cambios
  useEffect(() => {
    localStorage.setItem('solustock_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('solustock_inventory', JSON.stringify(products));
  }, [products]);

  // Navegación con Protección de Rutas
  const navigateTo = (view) => {
    const protectedViews = ['admin.html', 'user.html'];
    if (protectedViews.includes(view) && !activeSession) {
      alert('Acceso denegado: Debe iniciar sesión con una cuenta autorizada.');
      setCurrentView('login');
      return;
    }
    setCurrentView(view);
  };

  // 1. Manejador de Registro de Nuevo Usuario con bcrypt.hash() 
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regEmail || !regPassword) return;

    const existingUser = users.find(u => u.email === regEmail);
    if (existingUser) {
      alert('El correo ya se encuentra registrado.');
      return;
    }

    // Generar Salt y Hash de forma asíncrona con bcryptjs 
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(regPassword, salt);

    const newUser = {
      email: regEmail,
      passwordHash: hashedPassword,
      role: regRole
    };

    setUsers([...users, newUser]);
    setRegSuccess('Usuario registrado exitosamente con algoritmo bcrypt.');
    setRegEmail('');
    setRegPassword('');
    setTimeout(() => {
      setRegSuccess('');
      setCurrentView('login');
    }, 1500);
  };

  // 2. Manejador de Inicio de Sesión usando bcrypt.compare()
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    const userFound = users.find(u => u.email === email);

    if (userFound) {
      // Comparar contraseña ingresada con el hash guardado usando bcrypt
      const isMatch = await bcrypt.compare(password, userFound.passwordHash);

      if (isMatch) {
        // Validar que el rol seleccionado en el dropdown coincida con el usuario
        if (rolusuario && userFound.role !== rolusuario) {
          setLoginError(`El rol seleccionado (${rolusuario}) no coincide con el rol asignado a este usuario.`);
          return;
        }

        const sessionData = { email: userFound.email, role: userFound.role };
        setActiveSession(sessionData);
        localStorage.setItem('solustock_session', JSON.stringify(sessionData));

        // Redirección por rol
        if (userFound.role === 'admin') {
          setCurrentView('admin.html');
        } else if (userFound.role === 'user') {
          setCurrentView('user.html');
        }
      } else {
        setLoginError('Credenciales incorrectas: Usuario o contraseña inválida.');
      }
    } else {
      setLoginError('Credenciales incorrectas: Usuario o contraseña inválida.');
    }
  };

  // Manejador de Cierre de Sesión
  const handleLogout = () => {
    setActiveSession(null);
    localStorage.removeItem('solustock_session');
    setCurrentView('home');
  };

  // Agregar Producto al Inventario
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.code || !newProduct.name || !newProduct.stock) return;

    const item = {
      id: Date.now(),
      code: newProduct.code,
      name: newProduct.name,
      category: newProduct.category,
      stock: parseInt(newProduct.stock, 10)
    };

    setProducts([...products, item]);
    setNewProduct({ code: '', name: '', category: 'Vinilo', stock: '' });
  };

  // Eliminar Producto
  const handleDeleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Determinar la vista del panel del usuario activo
  const getActiveUserView = () => {
    if (!activeSession) return 'login';
    return activeSession.role === 'admin' ? 'admin.html' : 'user.html';
  };

  return (
    <>
      {/* NAVEGACIÓN PRINCIPAL */}
      <header>
        <nav>
          <div 
  className="logo" 
  onClick={() => navigateTo('home')} 
  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
>
  <img 
    src="/icons/LOGO-192x192.png" 
    alt="Logo SoluStock" 
    style={{ width: '35px', height: '35px', borderRadius: '6px', objectFit: 'contain' }} 
  />
  <span>SoluStock</span>
</div>
          <ul className="nav-links">
            <li>
              <button 
                type="button"
                onClick={() => navigateTo('home')} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}
              >
                Inicio
              </button>
            </li>

            {activeSession && (
              <li>
                <button 
                  type="button"
                  onClick={() => navigateTo(getActiveUserView())} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}
                >
                  Inventario 
                </button>
              </li>
            )}

            {!activeSession ? (
              <>
                <li>
                  <button 
                    type="button" 
                    className="btn-login" 
                    onClick={() => navigateTo('login')}
                    style={{ cursor: 'pointer' }}
                  >
                    Iniciar Sesión
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => navigateTo('register')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}
                  >
                    Registrarse
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button 
                  type="button" 
                  className="btn-login" 
                  onClick={handleLogout} 
                  style={{ backgroundColor: '#4c4747', cursor: 'pointer' }}
                >
                  Cerrar Sesión
                </button>
              </li>
            )}
          </ul>
        </nav>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main>
        {/* HERO / BANNER PRINCIPAL */}
        {currentView === 'home' && (
          <section id="hero">
            <h1>Bienvenido a SoluStock</h1>
            <p>La mejor solución para la gestión de inventarios</p>
            <button 
              className="cta-button" 
              onClick={() => navigateTo(activeSession ? getActiveUserView() : 'login')}
            >
              {activeSession ? 'Ir al Inventario' : 'Comienza Ahora'}
            </button>
          </section>
        )}

        {/* FORMULARIO DE LOGIN */}
        {currentView === 'login' && (
          <section id="Contacto" style={{ padding: '3rem 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <img 
                src="/icons/LOGO-192x192.png" 
                alt="Logo SoluStock" 
                style={{ width: '90px', height: 'auto', borderRadius: '12px' }}
              />
            </div>

            <h2>Iniciar Sesión</h2>

            {loginError && (
              <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>
                {loginError}
              </p>
            )}

            <form onSubmit={handleLogin}>
              <select
                value={rolusuario}
                onChange={(e) => setRolusuario(e.target.value)}
                required
                className="custom-select"
              >
                <option value="" disabled hidden>
                  Rol de usuario
                </option>
                <option value="admin">Administrador</option>
                <option value="user">Usuario</option>
              </select>

              <input 
                type="email" 
                placeholder="Correo electrónico" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />

              <div className="login-links-extra">
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Se ha enviado un enlace de recuperación a tu correo electrónico.');
                  }}
                  className="forgot-password-link"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button type="submit" style={{ cursor: 'pointer' }}>
                Ingresar
              </button>

              <p className="register-text-extra" style={{ textAlign: 'center', marginTop: '1rem' }}>
                ¿Aún no tienes cuenta?{' '}
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('register');
                  }}
                >
                  Registrarse aquí
                </a>
              </p>
            </form>
          </section>
        )}

        {/* FORMULARIO DE REGISTRO */}
        {currentView === 'register' && (
          <section id="Contacto" style={{ padding: '3rem 1rem' }}>
            <h2>Crear Nueva Cuenta</h2>

            {regSuccess && (
              <p style={{ color: 'green', textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>
                {regSuccess}
              </p>
            )}

            <form onSubmit={handleRegister}>
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required 
              />
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required 
              />

              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                required
                className="custom-select"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>

              <button type="submit" style={{ cursor: 'pointer', marginTop: '1rem' }}>
                Registrar Cuenta
              </button>

              <p className="register-text-extra" style={{ textAlign: 'center', marginTop: '1rem' }}>
                ¿Ya tienes una cuenta?{' '}
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('login');
                  }}
                >
                  Iniciar sesión
                </a>
              </p>
            </form>
          </section>
        )}

        {/* RUTA PROTEGIDA 1: admin.html */}
        {currentView === 'admin.html' && (
          <section className="inventory-section" style={{ padding: '2rem 1rem' }}>
            <div style={{ background: '#e0f7fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '5px solid #00acc1' }}>
              <h2>Panel de Administración</h2>
              <p>Sesión activa como: <strong>{activeSession?.email}</strong> | Rol: <strong>{activeSession?.role}</strong></p>
            </div>

            <div className="card-form">
              <h3>Registrar Nuevo Producto</h3>
              <form onSubmit={handleAddProduct} className="inventory-form">
                <input 
                  type="text" 
                  placeholder="Código (Ej: P003)" 
                  value={newProduct.code}
                  onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Nombre del Producto" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required 
                />
                <select 
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="custom-select"
                >
                  <option value="Vinilo">Vinilo</option>
                  <option value="Esmaltes">Esmalte</option>
                  <option value="Anticorrosivos">Anticorrosivo</option>
                  <option value="Linea Madera">Linea Madera</option>
                  <option value="Linea Automotriz">Linea Automotriz</option>
                  <option value="Impermeabilizantes">Impermeabilizante</option>
                  <option value="Estucos">Estuco</option>
                </select>
                <input 
                  type="number" 
                  placeholder="Cantidad en Stock" 
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  required 
                />
                <button type="submit" style={{ cursor: 'pointer' }}>Agregar Producto</button>
              </form>
            </div>

            <div className="table-container">
              <h3>Existencias Actuales (Control Total)</h3>
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.id}>
                      <td>{item.code}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td><strong>{item.stock}</strong></td>
                      <td>
                        <button 
                          onClick={() => handleDeleteProduct(item.id)}
                          className="btn-delete"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* RUTA PROTEGIDA 2: user.html */}
        {currentView === 'user.html' && (
          <section className="inventory-section" style={{ padding: '2rem 1rem' }}>
            <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '5px solid #ff9800' }}>
              <h2>Panel de Usuario</h2>
              <p>Sesión activa como: <strong>{activeSession?.email}</strong> | Rol: <strong>{activeSession?.role}</strong></p>
            </div>

            <div className="card-form">
              <h3>Registrar Nuevo Producto</h3>
              <form onSubmit={handleAddProduct} className="inventory-form">
                <input 
                  type="text" 
                  placeholder="Código (Ej: P003)" 
                  value={newProduct.code}
                  onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Nombre del Producto" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required 
                />
                <select 
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="custom-select"
                >
                  <option value="Vinilo">Vinilo</option>
                  <option value="Esmaltes">Esmalte</option>
                  <option value="Anticorrosivos">Anticorrosivo</option>
                  <option value="Linea Madera">Linea Madera</option>
                  <option value="Linea Automotriz">Linea Automotriz</option>
                  <option value="Impermeabilizantes">Impermeabilizante</option>
                  <option value="Estucos">Estuco</option>
                </select>
                <input 
                  type="number" 
                  placeholder="Cantidad en Stock" 
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  required 
                />
                <button type="submit" style={{ cursor: 'pointer' }}>Agregar Producto</button>
              </form>
            </div>

            <div className="table-container">
              <h3>Consulta de Inventarios</h3>
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.id}>
                      <td>{item.code}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td><strong>{item.stock}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SECCIÓN ¿QUIÉNES SOMOS? (VISIBLE EN INICIO) */}
        {currentView === 'home' && (
          <section id="Quienes-somos">
            <h2>¿Quiénes somos?</h2>
            <div className="quienes-somos-container">
              <img src="/img/Quienes somos2.jpg" alt="Imagen de SoluStock" />
              <p>
                En SoluStock, nos especializamos en brindar soluciones de gestión de inventarios para empresas de todos los tamaños. Nuestro equipo de expertos trabaja arduamente para desarrollar herramientas innovadoras que ayuden a nuestros clientes a optimizar sus procesos y mejorar su eficiencia. Con años de experiencia en el sector, entendemos las necesidades únicas de cada negocio y nos esforzamos por ofrecer soluciones personalizadas que se adapten a sus requerimientos específicos.
              </p>
            </div>
          </section>
        )}

        {/* SECCIÓN CONTACTO (VISIBLE EN INICIO) */}
        {currentView === 'home' && (
          <section id="Contacto">
            <h2>Contacto</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Nombre" required />
              <input type="email" placeholder="Correo electrónico" required />
              <input type="tel" placeholder="Número de teléfono" required />
              <button type="submit">Enviar</button>
            </form>
          </section>
        )}
      </main>

      <footer>
        <p>&copy; 2026 SoluStock. Todos los derechos reservados.</p>
      </footer>
    </>
  );
}

export default App;