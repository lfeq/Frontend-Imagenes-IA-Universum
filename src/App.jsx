import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import FutureViewingsList from './FutureViewingsList.jsx';
import FutureNote from './FutureNote.jsx';
import HorizontalCarousel from './HorizontalCarousel.jsx';
import './App.css';

function App() {
    const location = useLocation();
    const hideMenu = location.pathname === '/imagenes' || location.pathname === '/nota' || location.pathname === '/galeria-carrusel';
    const hideHeader = location.pathname === '/nota' || location.pathname === '/galeria-carrusel';

    return (
        <div className="App">
            {!hideHeader && (
                <header className="App-header">
                    <h1>
                        {location.pathname === '/imagenes'
                            ? 'Galería de Imágenes'
                            : 'Notas para mi yo futuro'}
                    </h1>

                    {!hideMenu && (
                        <nav>
                            <Link to="/" className="nav-link">Inicio</Link>
                            <Link to="/imagenes" className="nav-link">Galería</Link>
                            <Link to="/nota" className="nav-link">Nueva Nota</Link>
                            <Link to="/galeria-carrusel" className="nav-link">Galeria Rotatoria</Link>
                        </nav>
                    )}
                </header>
            )}
            <main>
                <Routes>
                    <Route path="/imagenes" element={<FutureViewingsList />} />
                    <Route path="/nota" element={<FutureNote />} />
                    <Route path="/galeria-carrusel" element={<HorizontalCarousel />} />
                    <Route path="/" element={
                        <div className="home-content">
                            <h2>Bienvenido</h2>
                            <p>Visita la sección de imágenes generadas o crea una nueva nota.</p>
                        </div>
                    } />
                </Routes>
            </main>
        </div>
    );
}


export default App;
