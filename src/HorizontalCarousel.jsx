import React, { useEffect, useState, useCallback, useRef } from 'react';
import './HorizontalCarousel.css';
import { API_URL, IMAGES_URL } from './config';

// --- Constantes (ajusta según necesidad) ---
// const FETCH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos
// const SHIFT_INTERVAL_MS = 3 * 60 * 1000; // 3 minutos
const FETCH_INTERVAL_MS = 15 * 1000; // 15 segundos (para pruebas)
const SHIFT_INTERVAL_MS = 10 * 1000; // 10 segundos (para pruebas)
const GRID_SIZE = 9;
const FETCH_PAGE_SIZE = 20;

export default function ImageGrid() {
    const [displayedImages, setDisplayedImages] = useState(() => Array(GRID_SIZE).fill(null));
    const [incomingImageQueue, setIncomingImageQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const queueRef = useRef(incomingImageQueue);
    useEffect(() => {
        queueRef.current = incomingImageQueue;
    }, [incomingImageQueue]);

    const displayRef = useRef(displayedImages);
    useEffect(() => {
        displayRef.current = displayedImages;
    }, [displayedImages]);

    // --- fetchImages (sin cambios respecto a la versión funcional anterior) ---
    const fetchImages = useCallback(async () => {
        console.log("FETCH: Buscando imágenes...");
        const query = `
            query {
                recentFutureViewings(page: 1, pageSize: ${FETCH_PAGE_SIZE}) {
                    id name createdAt age imageUrl content status
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
                console.error("FETCH Error (GraphQL):", data.errors);
                setError("Error al obtener datos de la API.");
                return;
            }
            const fetchedItems = data.data?.recentFutureViewings || [];
            const validImages = fetchedItems.filter(
                item => item.status === 'COMPLETED' && item.imageUrl
            );

            if (validImages.length > 0) {
                console.log(`FETCH OK: ${validImages.length} imágenes válidas recibidas.`);
                setIncomingImageQueue(prevQueue => {
                    const currentDisplayIds = new Set(displayRef.current.filter(img => img).map(img => img.id));
                    const currentQueueIds = new Set(prevQueue.map(img => img.id));
                    const imagesToAdd = validImages.filter(img =>
                        !currentDisplayIds.has(img.id) && !currentQueueIds.has(img.id)
                    );
                    if (imagesToAdd.length > 0) {
                        console.log(`FETCH QUEUE: Añadiendo ${imagesToAdd.length} imágenes realmente nuevas a la cola.`);
                        return [...prevQueue, ...imagesToAdd];
                    } else {
                        console.log(`FETCH QUEUE: No hay imágenes nuevas para añadir (ya mostradas o en cola).`);
                        return prevQueue;
                    }
                });
                setError(null);
            } else {
                console.log("FETCH: No se encontraron imágenes válidas en la respuesta.");
            }
        } catch (err) {
            console.error('FETCH Error (Network/JS):', err);
            setError("Error de conexión al obtener imágenes.");
        } finally {
            if (isLoading) {
                console.log("FETCH: Carga inicial completada.");
                setIsLoading(false);
            }
        }
    }, [isLoading]);

    // --- Función para desplazar las imágenes (MODIFICADA) ---
    const shiftImages = useCallback(() => {
        const currentQueue = queueRef.current;
        console.log(`SHIFT: Iniciando. Tamaño cola actual: ${currentQueue.length}`);

        // ******** INICIO DE LA MODIFICACIÓN ********
        // Si la cola está vacía, no hacer nada y salir.
        if (currentQueue.length === 0) {
            console.log("SHIFT: La cola está vacía. No se realizará ningún desplazamiento.");
            return; // Salir de la función aquí mismo
        }
        // ******** FIN DE LA MODIFICACIÓN ********

        // Si llegamos aquí, la cola NO está vacía. Procedemos como antes.
        const imageToShiftIn = currentQueue[0]; // Tomar la imagen más "vieja" de la cola
        console.log(`SHIFT: Se tomará la imagen ${imageToShiftIn.id} de la cola.`);

        // Actualizar la cola (quitar el elemento que vamos a mostrar)
        setIncomingImageQueue(prevQueue => {
            const newQueue = prevQueue.slice(1);
            console.log(`SHIFT QUEUE UPDATE: Imagen ${imageToShiftIn.id} eliminada. Nuevo tamaño cola: ${newQueue.length}`);
            return newQueue;
        });

        // Actualizar el array de display
        setDisplayedImages(prevDisplay => {
            console.log(`SHIFT DISPLAY UPDATE: Desplazando '${imageToShiftIn?.id ?? 'null'}' a la posición 0.`);
            const newDisplay = [imageToShiftIn, ...prevDisplay.slice(0, GRID_SIZE - 1)];
            return newDisplay;
            // Ya no necesitamos la comprobación compleja de si la imagen es la misma,
            // porque si la cola estaba vacía, ya habríamos salido antes.
        });

    }, []); // useCallback sin dependencias porque usa refs y setters

    // --- useEffect para intervalos (sin cambios) ---
    useEffect(() => {
        console.log("EFFECT: Montando componente y configurando intervalos.");
        fetchImages();
        const fetchTimer = setInterval(fetchImages, FETCH_INTERVAL_MS);
        const shiftTimer = setInterval(shiftImages, SHIFT_INTERVAL_MS);
        return () => {
            console.log("EFFECT: Desmontando componente y limpiando intervalos.");
            clearInterval(fetchTimer);
            clearInterval(shiftTimer);
        };
    }, [fetchImages, shiftImages]);

    // --- Renderizado (sin cambios) ---
    console.log(`RENDER: isLoading=${isLoading}, error=${error}, queueSize=${incomingImageQueue.length}, displayedImages[0]=${displayedImages[0]?.id ?? 'null'}`);
    // ... (resto del código de renderizado igual que antes)
    if (isLoading) {
        return <p className="loading-message">Cargando imágenes...</p>;
    }
    if (error && !displayedImages.some(Boolean)) {
        return <p className="loading-message">{error}</p>;
    }
    if (!error && !incomingImageQueue.length && !displayedImages.some(Boolean)) {
        return <p className="loading-message">Esperando nuevas imágenes...</p>;
    }
    return (
        <div className="grid-container">
            {displayedImages.map((img, index) => {
                const key = img ? `img-${img.id}` : `empty-${index}`;
                return (
                    <div className={`grid-item ${!img ? 'empty' : ''}`} key={key}>
                        {img ? (
                            <>
                                <div className="image-container">
                                    <img src={`${IMAGES_URL}${img.imageUrl}`} alt={img.content || `Imagen de ${img.name}`} />
                                </div>
                                <div className="image-label">
                                    <h3>{img.name}</h3>
                                    {img.age && <p>{img.age} años</p>}
                                </div>
                            </>
                        ) : (
                            null
                        )}
                    </div>
                );
            })}
        </div>
    );
}