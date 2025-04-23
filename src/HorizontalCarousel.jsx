import React, { useEffect, useState } from 'react';
import './HorizontalCarousel.css'; // Asegúrate de crear y/o renombrar este archivo CSS
import { API_URL } from './config'; // Asumiendo que config.js está en el mismo nivel
import { IMAGES_URL } from './config'; // Asegúrate de que la URL de las imágenes esté correctamente configurada

export default function ImageGrid() {
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Estado para el mensaje de carga

    const fetchImages = async () => {
        console.log("Fetching images..."); // Log para depuración
        // Solicitamos exactamente 9 imágenes
        const query = `
            query {
                recentFutureViewings(page: 1, pageSize: 9) {
                    id
                    name
                    createdAt
                    age
                    imageUrl
                    content
                    status
                }
            }
        `;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            const data = await response.json();
            if (data.errors) {
                console.error("GraphQL Errors:", data.errors);
                setIsLoading(false); // Dejar de cargar incluso si hay error
                return;
            }

            if (data.data && data.data.recentFutureViewings) {
                const validImages = data.data.recentFutureViewings.filter(
                    item => item.status === 'COMPLETED' && item.imageUrl
                );

                console.log("Fetched valid images:", validImages.length); // Log para depuración

                // Actualizar solo si hay cambios reales para evitar re-renders innecesarios
                setImages(currentImages => {
                    const newImageIds = validImages.map(img => img.id).join(',');
                    const currentImageIds = currentImages.map(img => img.id).join(',');
                    if (newImageIds === currentImageIds) {
                        return currentImages; // No hay cambios
                    }
                    return validImages; // Actualizar con las nuevas imágenes
                });
            } else {
                console.log("No data received or structure unexpected");
            }

        } catch (err) {
            console.error('Error fetching images:', err);
        } finally {
            // Asegurarse de quitar el mensaje de carga una vez que se intenta cargar
            // incluso si no se obtuvieron imágenes.
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchImages(); // Carga inicial
        const refreshInterval = setInterval(fetchImages, 0.5 * 60 * 1000); // Refresco cada 2 minutos
        // Limpia el intervalo cuando el componente se desmonta
        return () => clearInterval(refreshInterval);
    }, []); // El array vacío asegura que esto se ejecute solo al montar y desmontar

    // Mostrar mensaje de carga mientras isLoading es true y no hay imágenes
    if (isLoading && images.length === 0) {
        return <p className="loading-message">Cargando imágenes...</p>;
    }

    // Mostrar mensaje si no hay imágenes después de cargar
    if (!isLoading && images.length === 0) {
        return <p className="loading-message">No hay imágenes para mostrar.</p>;
    }

    return (
        <div className="grid-container">
            {/* Aseguramos mostrar máximo 9 elementos */}
            {images.slice(0, 9).map((img) => (
                <div className="grid-item" key={img.id}>
                    <div className="image-container">
                        <img src={IMAGES_URL + img.imageUrl} alt={img.content || `Imagen de ${img.name}`} />
                    </div>
                    <div className="image-label">
                        <h3>{img.name}</h3>
                        <p>{img.age} años</p>
                    </div>
                </div>
            ))}
            {/* Rellenar celdas vacías si hay menos de 9 imágenes */}
            {Array.from({ length: Math.max(0, 9 - images.length) }).map((_, index) => (
                <div className="grid-item empty" key={`empty-${index}`}></div>
            ))}
        </div>
    );
}